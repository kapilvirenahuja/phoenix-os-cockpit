import { query } from "@anthropic-ai/claude-agent-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Simple test to verify the Claude Agent SDK is working
 */
async function testAgent() {
  // Check if API key is configured
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
    console.error(`
❌ API Key not configured!

Please follow these steps:
1. Get your API key from https://console.anthropic.com
2. Edit the .env file in this directory
3. Replace 'your_api_key_here' with your actual API key
4. Save the file and run this test again

Example:
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
    `);
    process.exit(1);
  }

  console.log("✅ API Key detected");
  console.log("🧪 Testing Claude Agent SDK...\n");

  try {
    const response = await query({
      prompt: "Say hello and confirm you're working. Keep your response under 20 words.",
      options: {
        model: "claude-haiku-4-5-20251001", // Using Haiku for testing (cheapest)
        maxTurns: 1,
        allowedTools: [], // No tools needed for basic test
      }
    });

    console.log("🤖 Agent Response:");
    for await (const message of response) {
      if (message.type === "assistant") {
        console.log(message.content);
      }
    }

    console.log("\n✨ Success! The Claude Agent SDK is working correctly.");
    console.log("\nYou can now run:");
    console.log("  npm run research company 'Apple Inc'");
    console.log("  npm run research market 'AI and Machine Learning'");

  } catch (error) {
    console.error("❌ Error:", error);
    console.error("\nPossible issues:");
    console.error("1. Invalid API key");
    console.error("2. No credits in your account");
    console.error("3. Network connectivity issues");
  }
}

testAgent();