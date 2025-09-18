import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// load all embeddings from generated embeddings file
let embeddings: { text: string; embedding: number[] }[] = [];
try {
const embeddingsPath = path.join(process.cwd(), "src/app/data/embeddings.json");
embeddings = JSON.parse(fs.readFileSync(embeddingsPath, "utf-8"));
} catch (err){
  console.error("❌ Failed to load embeddings.json:", err);
  embeddings = [];
}

// cosine similarity to pull most relevant data for chatbot
function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ answer: "Prompt is missing" }, { status: 400 });
    }

    // get embedding for the user query
    const queryEmbeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: prompt,
    });
    const queryEmbedding = queryEmbeddingRes.data?.[0]?.embedding;
    if (!queryEmbedding) throw new Error("No query embedding returned");

    // compute similarity with all embeddings
    const similarities = embeddings.map((item) => ({
      ...item,
      similarity: cosineSimilarity(item.embedding, queryEmbedding),
    }));

    // retrieve top 4 contexts
    const topContexts = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4)
      .map((item) => item.text)
      .join("\n")
      .slice(0, 2000);

    // ask OpenAI chat with retrieved contexts
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
    return NextResponse.json({ answer });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("RAG API error:", err);
  
    return NextResponse.json(
      { answer: `Error in rout.ts: ${err.message}` },
      { status: 500 }
    );
  }
}
