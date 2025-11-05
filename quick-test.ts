import { query } from "@anthropic-ai/claude-agent-sdk";
import dotenv from "dotenv";

dotenv.config();

/**
 * Quick test of research capabilities
 */
async function quickResearch() {
  console.log("🔍 Quick Research Test - OpenAI");
  console.log("=" + "=".repeat(40));

  const startTime = Date.now();

  const response = query({
    prompt: `Provide a brief company overview of OpenAI including:
    1. Founded (year and founders)
    2. Mission
    3. Key products (GPT, DALL-E, etc.)
    4. Recent major developments
    Keep it under 200 words.`,
    options: {
      model: "claude-haiku-4-5-20251001",  // Fast model for quick test
      maxTurns: 1,
      allowedTools: [],  // No tools for quick overview
    }
  });

  for await (const message of response) {
    if (message.type === "assistant" && message.content) {
      console.log("\n" + message.content);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n" + "=" + "=".repeat(40));
  console.log(`✅ Completed in ${duration} seconds`);
  console.log("\nFor full research capabilities, run:");
  console.log("  npm run research company 'Company Name'");
}

quickResearch().catch(console.error);