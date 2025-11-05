import { query } from "@anthropic-ai/claude-agent-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Hello World Agent - Your first agent demonstrating the three-beat loop:
 * 1. GATHER - Receive input and context
 * 2. ACT - Process and take actions
 * 3. VERIFY - Return results
 */
async function helloWorldAgent() {
  console.log("🚀 Starting Hello World Agent");
  console.log("=" + "=".repeat(50));

  try {
    // The basic query pattern - this is the foundation of all agents
    for await (const message of query({
      // GATHER: Provide the prompt/task
      prompt: "Search the web for league of legends, worlds 2025.",

      options: {
        // Use Haiku for fast, cost-effective testing
        model: "claude-haiku-4-5-20251001",

        // Limit to 1 turn for simple interactions
        maxTurns: 20,

        // No tools needed for basic conversation
        allowedTools: [WebSearch],

        // Simple system prompt
        systemPrompt: "You are a helpful AI assistant demonstrating basic agent capabilities."
      }
    })) {

      // ACT & VERIFY: Handle different message types
      switch (message.type) {
        case "assistant":
          // The agent's response - extract text from message.content array
          const msg = (message as any).message;
          if (msg?.content) {
            const textContent = msg.content.find((c: any) => c.type === 'text');
            if (textContent?.text) {
              console.log("\n🤖 Agent Response:");
              console.log(textContent.text);
            }
          }
          break;

        case "result":
          // Final result status
          const status = (message as any).subtype || (message as any).result || 'completed';
          console.log("\n✅ Status:", status);
          break;

        case "system":
          // Skip system messages for cleaner output
          if (message.subtype === 'init') {
            console.log("📡 Agent initialized with model:", message.model);
          }
          break;

        default:
          // Other message types (user, etc.)
          console.log("\n📋 Message type:", message.type);
      }
    }

    console.log("\n" + "=" + "=".repeat(50));
    console.log("✨ Agent completed successfully!");

  } catch (error) {
    console.error("\n❌ Error:", error);
    console.error("\nPossible issues:");
    console.error("1. Invalid API key");
    console.error("2. Network connectivity");
    console.error("3. Rate limits exceeded");
  }
}

/**
 * Advanced example: Agent with tools
 * Demonstrates the GATHER → ACT → VERIFY loop with file operations
 */
async function agentWithTools() {
  console.log("\n\n🔧 Starting Agent with Tools");
  console.log("=" + "=".repeat(50));

  try {
    for await (const message of query({
      // GATHER: Task that requires using tools
      prompt: "Read the package.json file and tell me the project name and version.",

      options: {
        model: "claude-haiku-4-5-20251001",

        // ACT: Tools the agent can use
        allowedTools: ['Read', 'Glob'],

        maxTurns: 10,  // Increased for tool usage

        systemPrompt: "You are a helpful assistant that can read and analyze files."
      }
    })) {

      // VERIFY: Monitor what the agent is doing
      if (message.type === "assistant") {
        const msg = (message as any).message;
        if (msg?.content) {
          const textContent = msg.content.find((c: any) => c.type === 'text');
          if (textContent?.text) {
            console.log("\n🤖 Agent:", textContent.text);
          }
        }
      }

      if (message.type === "result" && 'subtype' in message) {
        console.log("\n✅ Completed:", message.subtype);
      }
    }

    console.log("\n" + "=" + "=".repeat(50));
    console.log("✨ Tool-enabled agent completed!");

  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

/**
 * Advanced example: Agent with web search
 * TODO(human): Implement this function to demonstrate web search capabilities
 */
async function agentWithWebSearch() {
  console.log("\n\n🌐 Starting Agent with Web Search");
  console.log("=" + "=".repeat(50));

  try {
    for await (const message of query({
      prompt: "search for league of legends worlds 2025.",
      options: {
        model: "claude-haiku-4-5-20251001",
        allowedTools: ['WebSearch', 'WebFetch'],
        maxTurns: 20,
        systemPrompt: "you are an expert researcher using web."
      }
    })) {
      
      // VERIFY: Monitor what the agent is doing
      if (message.type === "assistant") {
        const msg = (message as any).message;
        if (msg?.content) {
          const textContent = msg.content.find((c: any) => c.type === 'text');
          if (textContent?.text) {
            console.log("\n🤖 Agent:", textContent.text);
          }
        }
      }

      if (message.type === "result" && 'subtype' in message) {
        console.log("\n✅ Completed:", message.subtype);
      }
    }

    console.log("⚠️  Not implemented yet - this is your task!");

  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

// Main execution
async function main() {
  const command = process.argv[2] || 'basic';

  switch (command) {
    case 'basic':
      await helloWorldAgent();
      break;

    case 'tools':
      await agentWithTools();
      break;

    case 'search':
      await agentWithWebSearch();
      break;

    default:
      console.log(`
Phoenix OS Hello World Agent
=============================

Usage:
  npm run hello              # Basic hello world
  npm run hello tools        # Agent with file reading tools
  npm run hello search       # Agent with web search (YOU IMPLEMENT THIS!)

Examples:
  tsx examples/hello-world-agent.ts
  tsx examples/hello-world-agent.ts basic
  tsx examples/hello-world-agent.ts tools
  tsx examples/hello-world-agent.ts search
      `);
  }
}

// Run the agent
if (require.main === module) {
  main().catch(console.error);
}

export { helloWorldAgent, agentWithTools, agentWithWebSearch };
