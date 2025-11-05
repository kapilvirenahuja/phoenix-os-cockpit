import { query } from "@anthropic-ai/claude-agent-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Basic example agent that demonstrates core Claude Agent SDK functionality
 */
async function main() {
  const prompt = process.argv[2] || "Hello! Can you help me understand how to use the Claude Agent SDK?";

  console.log("🚀 Starting Phoenix OS Cockpit Agent");
  console.log("📝 Prompt:", prompt);
  console.log("=" + "=".repeat(50));

  try {
    // Create a query with basic configuration
    for await (const message of query({
      prompt,
      options: {
        // Model selection - using Sonnet 4.5 for balanced performance
        model: "claude-sonnet-4-5-20250929",

        // System prompt defines agent behavior
        systemPrompt: `You are a helpful AI assistant built with the Claude Agent SDK.
        You are part of the Phoenix OS Cockpit system designed for pre-sales and research tasks.

        Your capabilities include:
        - Answering questions about the Claude Agent SDK
        - Demonstrating tool usage
        - Explaining best practices
        - Helping with TypeScript/JavaScript code

        Always be concise, accurate, and helpful.`,

        // Allowed tools - start with basic set
        allowedTools: [
          'Read',     // Read files
          'Write',    // Write files
          'Glob',     // Find files
          'Grep',     // Search in files
        ],

        // Limit conversation turns to prevent runaway costs
        maxTurns: 10,

        // Settings sources for configuration
        settingSources: ['project', 'user'],

        // Working directory
        cwd: process.cwd(),
      }
    })) {
      // Handle different message types
      switch (message.type) {
        case "assistant":
          // Agent's response
          console.log("\n🤖 Agent:", message.content);
          break;

        case "user":
          // User input (in interactive mode)
          console.log("\n👤 User:", message.content);
          break;

        case "system":
          // System messages
          console.log("\n⚙️ System:", message.content);
          break;

        case "result":
          // Final result
          console.log("\n✅ Result:", message.result);
          break;

        default:
          // Other message types
          console.log("\n📋 Message:", message);
      }
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }

  console.log("\n" + "=" + "=".repeat(50));
  console.log("✨ Agent session completed");
}

// Run the main function
main().catch(console.error);