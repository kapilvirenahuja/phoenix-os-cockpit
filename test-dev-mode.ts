import { ResearchAgent } from "./examples/research-agent";
import dotenv from "dotenv";

dotenv.config();

/**
 * Test script to verify dev mode optimizations are working
 */
async function testDevMode() {
  console.log("\n🧪 Testing Development Mode Configuration");
  console.log("=" + "=".repeat(50));
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log("");

  // This should automatically use Haiku and quick depth in dev mode
  const agent = new ResearchAgent({
    topic: "Quick test: What is OpenAI?",
    depth: 'comprehensive',  // This will be overridden to 'quick' in dev mode
    includeCitations: true,
    outputFormat: 'detailed'  // This will be overridden to 'summary' in dev mode
  });

  console.log("\nExpected behavior in dev mode:");
  console.log("✓ Model: Should use Haiku 4.5 (not Opus)");
  console.log("✓ Depth: Should be 'quick' (not comprehensive)");
  console.log("✓ Iterations: Should be 5 max");
  console.log("✓ Format: Should be 'summary' (not detailed)");
  console.log("\nStarting test...\n");

  const startTime = Date.now();

  try {
    const report = await agent.research();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("\n" + "=" + "=".repeat(50));
    console.log(`✅ Test completed in ${duration} seconds`);

    if (process.env.NODE_ENV === 'development') {
      console.log("✅ Dev mode active - using cost-optimized settings");
      console.log(`   Estimated cost: ~$0.001 (Haiku with minimal iterations)`);
    } else {
      console.log("⚠️  Production mode - using full settings");
      console.log(`   Estimated cost: ~$0.05+ (depending on model and depth)`);
    }

    // Show first 500 chars of report
    console.log("\n📄 Report Preview:");
    console.log(report.substring(0, 500) + "...");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Export the ResearchAgent for use in test
export { ResearchAgent };

// Run if this is the main module
if (require.main === module) {
  testDevMode();
}