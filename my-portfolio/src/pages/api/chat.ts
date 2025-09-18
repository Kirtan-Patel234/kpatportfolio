// src/pages/api/chat.ts
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import type { NextApiRequest, NextApiResponse } from "next";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// load all embeddings from generated embeddings file
let embeddings: { text: string; embedding: number[] }[] = [];
try {
  const embeddingsPath = path.join(process.cwd(), "src/app/data/embeddings.json");
  embeddings = JSON.parse(fs.readFileSync(embeddingsPath, "utf-8"));
} catch (err) {
  console.error("❌ Failed to load embeddings.json:", err);
  embeddings = [];
}

// cosine similarity function
function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export default async function handler(req: NextApiRequest,
    res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ answer: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ answer: "Prompt is missing" });
    }

    const queryEmbeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: prompt,
    });
    const queryEmbedding = queryEmbeddingRes.data?.[0]?.embedding;
    if (!queryEmbedding) throw new Error("No query embedding returned");

    const similarities = embeddings.map((item) => ({
      ...item,
      similarity: cosineSimilarity(item.embedding, queryEmbedding),
    }));

    const topContexts = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4)
      .map((item) => item.text)
      .join("\n")
      .slice(0, 2000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant speaking to a recruiter or hiring manager.
          Answer all questions in a professional and concise way, highlighting relevant skills and experience.
          Use context from the user's profile and projects to give informed answers:\n${topContexts}`,
        },
        { role: "user", content: prompt },
      ],
    });

    const answer = completion.choices?.[0]?.message?.content ?? "No answer returned";
    res.status(200).json({ answer });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("RAG API error:", err);
    res.status(500).json({ answer: `Error in chat.ts: ${err.message}` });
  }
}
