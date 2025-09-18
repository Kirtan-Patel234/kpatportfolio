import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const data = JSON.parse(fs.readFileSync("src/app/data/data.json", "utf-8"));

// Function to split text into chunks of ~200 tokens (rough approximation)
function splitText(text, maxLength = 200) {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks = [];
  let chunk = "";

  for (const sentence of sentences) {
    if ((chunk + sentence).length > maxLength) {
      if (chunk) chunks.push(chunk.trim());
      chunk = sentence;
    } else {
      chunk += " " + sentence;
    }
  }
  if (chunk) chunks.push(chunk.trim());
  return chunks;
}

async function main() {
  const chunksData = [];

  for (const item of data) {
    const chunks = splitText(item.text, 200);
    for (const chunk of chunks) {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });
      chunksData.push({
        id: item.id,
        text: chunk,
        embedding: response.data[0].embedding,
      });
    }
  }

  fs.writeFileSync(
    "src/app/data/embeddings.json",
    JSON.stringify(chunksData, null, 2)
  );
  console.log("Embeddings split and saved!");
}

main();
