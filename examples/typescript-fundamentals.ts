/**
 * Phase 1, Day 5-7: TypeScript Fundamentals
 *
 * This file demonstrates:
 * 1. SDK TypeScript interfaces and types
 * 2. Basic query patterns with streaming
 * 3. Handling different message types (assistant, user, system, result)
 * 4. Error handling patterns
 * 5. Type-safe patterns
 */

import {
  query,
  type SDKMessage,
  type SDKAssistantMessage,
  type SDKResultMessage,
  type SDKSystemMessage,
  type SDKUserMessage,
  type Options,
  type Query
} from "@anthropic-ai/claude-agent-sdk";
import dotenv from "dotenv";

dotenv.config();

// ============================================================================
// 1. SDK TYPESCRIPT INTERFACES AND TYPES
// ============================================================================

/**
 * Understanding the core SDK types:
 * - SDKMessage: Union type of all possible message types
 * - SDKAssistantMessage: Messages from the AI agent
 * - SDKUserMessage: Messages from the user
 * - SDKSystemMessage: System initialization and metadata
 * - SDKResultMessage: Final execution result with success/error info
 * - Query: The async generator returned by query()
 * - Options: Configuration options for the agent
 */

interface AgentStats {
  totalMessages: number;
  assistantMessages: number;
  userMessages: number;
  systemMessages: number;
  resultMessages: number;
  errors: string[];
  duration: number;
}

// ============================================================================
// 2. BASIC QUERY PATTERNS WITH STREAMING
// ============================================================================

/**
 * Example 1: Basic streaming pattern
 * Demonstrates the fundamental async iteration pattern
 */
async function basicStreamingExample(): Promise<void> {
  console.log("\n=== Example 1: Basic Streaming ===\n");

  try {
    // The query() function returns a Query object which is an AsyncGenerator
    const stream: Query = query({
      prompt: "Count from 1 to 5 and explain what you're doing.",
      options: {
        model: "claude-haiku-4-5-20251001",
        maxTurns: 5,
        systemPrompt: "You are a helpful assistant demonstrating streaming responses."
      }
    });

    // Use for await...of to iterate through the async generator
    for await (const message of stream) {
      // Each message is of type SDKMessage
      console.log(`📨 Message Type: ${message.type}`);

      // We'll handle specific types in later examples
      if (message.type === "assistant") {
        const assistantMsg = message as SDKAssistantMessage;
        console.log(`   Session: ${assistantMsg.session_id}`);
      }
    }

  } catch (error) {
    console.error("Error in streaming:", error);
  }
}

// ============================================================================
// 3. HANDLING DIFFERENT MESSAGE TYPES
// ============================================================================

/**
 * Example 2: Comprehensive message type handling
 * Shows how to properly handle each message type with TypeScript
 */
async function handleAllMessageTypes(): Promise<void> {
  console.log("\n=== Example 2: Handling All Message Types ===\n");

  const stats: AgentStats = {
    totalMessages: 0,
    assistantMessages: 0,
    userMessages: 0,
    systemMessages: 0,
    resultMessages: 0,
    errors: [],
    duration: 0
  };

  const startTime = Date.now();

  try {
    const stream = query({
      prompt: "Explain what TypeScript is in one sentence.",
      options: {
        model: "claude-haiku-4-5-20251001",
        maxTurns: 3
      }
    });

    for await (const message of stream) {
      stats.totalMessages++;

      // Type-safe message handling using discriminated unions
      switch (message.type) {
        case "assistant": {
          // TypeScript now knows this is SDKAssistantMessage
          const assistantMsg = message as SDKAssistantMessage;
          stats.assistantMessages++;

          console.log("\n🤖 ASSISTANT MESSAGE:");
          console.log(`   UUID: ${assistantMsg.uuid}`);
          console.log(`   Session: ${assistantMsg.session_id}`);

          // Extract text content from the message
          const content = assistantMsg.message.content;
          if (Array.isArray(content)) {
            content.forEach((block) => {
              if (block.type === "text") {
                console.log(`   Text: ${block.text}`);
              } else if (block.type === "tool_use") {
                console.log(`   Tool Use: ${block.name}`);
                console.log(`   Input: ${JSON.stringify(block.input, null, 2)}`);
              }
            });
          }
          break;
        }

        case "user": {
          // TypeScript now knows this is SDKUserMessage
          const userMsg = message as SDKUserMessage;
          stats.userMessages++;

          console.log("\n👤 USER MESSAGE:");
          console.log(`   Session: ${userMsg.session_id}`);
          console.log(`   Synthetic: ${userMsg.isSynthetic || false}`);
          break;
        }

        case "system": {
          // TypeScript now knows this is SDKSystemMessage
          const systemMsg = message as SDKSystemMessage;
          stats.systemMessages++;

          if (systemMsg.subtype === "init") {
            console.log("\n⚙️  SYSTEM INIT:");
            console.log(`   Model: ${systemMsg.model}`);
            console.log(`   Tools: ${systemMsg.tools.join(", ")}`);
            console.log(`   CWD: ${systemMsg.cwd}`);
            console.log(`   Permission Mode: ${systemMsg.permissionMode}`);
          }
          break;
        }

        case "result": {
          // TypeScript now knows this is SDKResultMessage
          const resultMsg = message as SDKResultMessage;
          stats.resultMessages++;

          console.log("\n✅ RESULT MESSAGE:");
          console.log(`   Subtype: ${resultMsg.subtype}`);
          console.log(`   Duration: ${resultMsg.duration_ms}ms`);
          console.log(`   API Time: ${resultMsg.duration_api_ms}ms`);
          console.log(`   Turns: ${resultMsg.num_turns}`);
          console.log(`   Cost: $${resultMsg.total_cost_usd.toFixed(6)}`);
          console.log(`   Is Error: ${resultMsg.is_error}`);

          // Handle different result subtypes
          if (resultMsg.subtype === "success") {
            console.log(`   Result: ${resultMsg.result}`);
          } else if (resultMsg.subtype === "error_during_execution" ||
                     resultMsg.subtype === "error_max_turns" ||
                     resultMsg.subtype === "error_max_budget_usd") {
            console.log(`   Errors: ${resultMsg.errors.join(", ")}`);
            stats.errors.push(...resultMsg.errors);
          }

          // Display token usage
          console.log("\n   Token Usage:");
          console.log(`   - Input: ${resultMsg.usage.input_tokens}`);
          console.log(`   - Output: ${resultMsg.usage.output_tokens}`);
          console.log(`   - Cache Read: ${resultMsg.usage.cache_read_input_tokens || 0}`);
          console.log(`   - Cache Creation: ${resultMsg.usage.cache_creation_input_tokens || 0}`);
          break;
        }

        case "stream_event": {
          // These are partial streaming events (usually hidden unless requested)
          console.log("\n📡 STREAM EVENT (partial message)");
          break;
        }

        case "tool_progress": {
          // Tool execution progress updates
          const progressMsg = message as any;
          console.log(`\n⏳ TOOL PROGRESS: ${progressMsg.tool_name} (${progressMsg.elapsed_time_seconds}s)`);
          break;
        }

        default: {
          // Exhaustive check - TypeScript will error if we miss a case
          const _exhaustive: never = message;
          console.log(`\n❓ UNKNOWN MESSAGE TYPE: ${(message as any).type}`);
        }
      }
    }

    stats.duration = Date.now() - startTime;

  } catch (error) {
    console.error("\n❌ CAUGHT ERROR:", error);
    stats.errors.push(error instanceof Error ? error.message : String(error));
  }

  // Display statistics
  console.log("\n" + "=".repeat(60));
  console.log("📊 STATISTICS:");
  console.log(`   Total Messages: ${stats.totalMessages}`);
  console.log(`   - Assistant: ${stats.assistantMessages}`);
  console.log(`   - User: ${stats.userMessages}`);
  console.log(`   - System: ${stats.systemMessages}`);
  console.log(`   - Result: ${stats.resultMessages}`);
  console.log(`   Duration: ${stats.duration}ms`);
  if (stats.errors.length > 0) {
    console.log(`   Errors: ${stats.errors.length}`);
    stats.errors.forEach(err => console.log(`     - ${err}`));
  }
  console.log("=".repeat(60));
}

// ============================================================================
// 4. ERROR HANDLING PATTERNS
// ============================================================================

/**
 * Example 3: Robust error handling
 * Demonstrates how to handle different error scenarios
 */
async function errorHandlingPatterns(): Promise<void> {
  console.log("\n=== Example 3: Error Handling Patterns ===\n");

  // Test Case 1: Handle max turns error
  console.log("\n--- Test 1: Max Turns Error ---");
  await handleMaxTurnsError();

  // Test Case 2: Handle execution errors
  console.log("\n--- Test 2: Graceful Error Recovery ---");
  await handleExecutionError();

  // Test Case 3: Handle network errors
  console.log("\n--- Test 3: Network Error Handling ---");
  await handleNetworkError();
}

async function handleMaxTurnsError(): Promise<void> {
  try {
    const stream = query({
      prompt: "Search for information about TypeScript, then JavaScript, then Python, then Ruby, then Go. Research each one thoroughly.",
      options: {
        model: "claude-haiku-4-5-20251001",
        maxTurns: 2, // Intentionally low to trigger error
        allowedTools: ["WebSearch"],
        systemPrompt: "You must research each language separately. Use web search for each one."
      }
    });

    for await (const message of stream) {
      if (message.type === "result") {
        const result = message as SDKResultMessage;

        if (result.subtype === "error_max_turns") {
          console.log("⚠️  Detected max turns error");
          console.log(`   Completed ${result.num_turns} turns before limit`);
          console.log(`   This is expected - task requires more iterations`);
          console.log("   Strategy: Increase maxTurns or break task into smaller parts");
        } else {
          console.log(`⚠️  Unexpected result: ${result.subtype}`);
          console.log(`   Turns: ${result.num_turns}, Cost: $${result.total_cost_usd.toFixed(6)}`);
          if (result.is_error && "errors" in result) {
            console.log(`   Errors: ${result.errors.join(", ")}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

async function handleExecutionError(): Promise<void> {
  try {
    const stream = query({
      prompt: "Read the file at /nonexistent/path/file.txt",
      options: {
        model: "claude-haiku-4-5-20251001",
        allowedTools: ["Read"],
        maxTurns: 3
      }
    });

    for await (const message of stream) {
      if (message.type === "result") {
        const result = message as SDKResultMessage;

        if (result.subtype === "error_during_execution") {
          console.log("⚠️  Execution error detected");
          console.log("   Errors:", result.errors);
          console.log("   Strategy: Validate inputs, provide fallback behavior");
        } else if (result.subtype === "success") {
          console.log("✅ Task completed successfully (unexpected)");
        }
      }
    }
  } catch (error) {
    console.error("❌ Caught execution error:", error);
  }
}

async function handleNetworkError(): Promise<void> {
  // Simulate abort controller usage
  const controller = new AbortController();

  try {
    // Set timeout to abort after 5 seconds
    setTimeout(() => controller.abort(), 5000);

    const options: Options = {
      model: "claude-haiku-4-5-20251001",
      maxTurns: 3,
      abortController: controller
    };

    const stream = query({
      prompt: "Say hello!",
      options
    });

    for await (const message of stream) {
      if (message.type === "assistant") {
        console.log("✅ Got response before timeout");
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("⚠️  Request aborted (timeout or user cancellation)");
      console.log("   Strategy: Retry with exponential backoff");
    } else {
      console.error("❌ Network error:", error);
    }
  }
}

// ============================================================================
// 5. TYPE-SAFE PATTERNS
// ============================================================================

/**
 * Example 4: Type-safe agent configuration
 * Shows how to build type-safe wrappers around the SDK
 */

// Type-safe agent configuration builder
interface AgentConfig {
  name: string;
  model: "haiku" | "sonnet" | "opus";
  tools: string[];
  maxTurns: number;
  systemPrompt: string;
}

class TypeSafeAgent {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  // Type-safe model resolution
  private resolveModel(): string {
    const modelMap = {
      haiku: "claude-haiku-4-5-20251001",
      sonnet: "claude-sonnet-4-5-20250929",
      opus: "claude-opus-4-1-20250514"
    };
    return modelMap[this.config.model];
  }

  // Type-safe execution with proper error handling
  async execute(prompt: string): Promise<AgentResult> {
    const result: AgentResult = {
      success: false,
      response: "",
      error: null,
      stats: {
        turns: 0,
        costUSD: 0,
        durationMs: 0
      }
    };

    try {
      const options: Options = {
        model: this.resolveModel(),
        allowedTools: this.config.tools,
        maxTurns: this.config.maxTurns,
        systemPrompt: this.config.systemPrompt
      };

      const stream = query({ prompt, options });

      for await (const message of stream) {
        if (message.type === "assistant") {
          const assistantMsg = message as SDKAssistantMessage;
          const textBlocks = assistantMsg.message.content.filter(
            (block): block is { type: "text"; text: string } => block.type === "text"
          );
          result.response += textBlocks.map(b => b.text).join("\n");
        }

        if (message.type === "result") {
          const resultMsg = message as SDKResultMessage;
          result.stats.turns = resultMsg.num_turns;
          result.stats.costUSD = resultMsg.total_cost_usd;
          result.stats.durationMs = resultMsg.duration_ms;

          if (resultMsg.subtype === "success") {
            result.success = true;
          } else {
            result.error = "errors" in resultMsg ? resultMsg.errors.join(", ") : "Unknown error";
          }
        }
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  }
}

interface AgentResult {
  success: boolean;
  response: string;
error: string | null;
  stats: {
    turns: number;
    costUSD: number;
    durationMs: number;
  };
}

async function typeSafeAgentExample(): Promise<void> {
  console.log("\n=== Example 4: Type-Safe Agent ===\n");

  const agent = new TypeSafeAgent({
    name: "TypeScriptTutor",
    model: "haiku",
    tools: [],
    maxTurns: 5,
    systemPrompt: "You are a TypeScript expert who explains concepts clearly and concisely."
  });

  const result = await agent.execute("What are the benefits of using TypeScript?");

  console.log("\n📋 RESULT:");
  console.log(`   Success: ${result.success}`);
  console.log(`   Response: ${result.response}`);
  console.log(`   Error: ${result.error || "None"}`);
  console.log("\n📊 STATS:");
  console.log(`   Turns: ${result.stats.turns}`);
  console.log(`   Cost: $${result.stats.costUSD.toFixed(6)}`);
  console.log(`   Duration: ${result.stats.durationMs}ms`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const examples = [
    { name: "basic", fn: basicStreamingExample },
    { name: "messages", fn: handleAllMessageTypes },
    { name: "errors", fn: errorHandlingPatterns },
    { name: "typesafe", fn: typeSafeAgentExample }
  ];

  const command = process.argv[2] || "all";

  if (command === "all") {
    console.log("\n🚀 Running All TypeScript Fundamentals Examples\n");
    for (const example of examples) {
      await example.fn();
    }
  } else {
    const example = examples.find(e => e.name === command);
    if (example) {
      await example.fn();
    } else {
      console.log(`
TypeScript Fundamentals Examples
=================================

Usage:
  npm run ts-fundamentals [example]

Examples:
  npm run ts-fundamentals basic      # Basic streaming patterns
  npm run ts-fundamentals messages   # Message type handling
  npm run ts-fundamentals errors     # Error handling patterns
  npm run ts-fundamentals typesafe   # Type-safe agent wrapper
  npm run ts-fundamentals all        # Run all examples (default)

Direct execution:
  tsx examples/typescript-fundamentals.ts basic
  tsx examples/typescript-fundamentals.ts messages
  tsx examples/typescript-fundamentals.ts errors
  tsx examples/typescript-fundamentals.ts typesafe
      `);
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export {
  basicStreamingExample,
  handleAllMessageTypes,
  errorHandlingPatterns,
  typeSafeAgentExample,
  TypeSafeAgent
};
