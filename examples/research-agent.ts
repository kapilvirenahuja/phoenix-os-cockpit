import { query } from "@anthropic-ai/claude-agent-sdk";
import dotenv from "dotenv";

dotenv.config();

/**
 * Research Agent - Specialized for gathering and analyzing information
 * from multiple sources, synthesizing findings, and generating reports
 */

interface ResearchConfig {
  topic: string;
  depth: 'quick' | 'standard' | 'comprehensive';
  includeCitations: boolean;
  outputFormat: 'summary' | 'detailed' | 'executive';
}

class ResearchAgent {
  private config: ResearchConfig;

  constructor(config: ResearchConfig) {
    this.config = config;
  }

  /**
   * Main research execution
   */
  async research(): Promise<string> {
    const results: string[] = [];

    console.log(`🔍 Starting research on: ${this.config.topic}`);
    console.log(`📊 Depth: ${this.config.depth}`);
    console.log(`📝 Format: ${this.config.outputFormat}`);

    const searchIterations = this.getSearchIterations();
    const systemPrompt = this.buildSystemPrompt();

    for await (const message of query({
      prompt: this.buildResearchPrompt(),
      options: {
        model: this.getModelByDepth(),
        systemPrompt,
        allowedTools: [
          'WebSearch',  // Search the web
          'WebFetch',   // Fetch specific URLs
          'Read',       // Read local files
          'Write',      // Save findings
          'Grep',       // Search within files
        ],
        maxTurns: searchIterations,
        settingSources: ['project'],
      }
    })) {
      if (message.type === "assistant") {
        results.push(message.content);
        console.log("\n📄 Finding:", message.content.substring(0, 200) + "...");
      }
    }

    return this.formatResults(results);
  }

  /**
   * Build the system prompt based on configuration
   */
  private buildSystemPrompt(): string {
    return `You are an expert research analyst specializing in comprehensive information gathering and synthesis.

Your research methodology:

1. **Information Gathering Phase**
   - Start with broad searches to understand the landscape
   - Identify authoritative sources and key subtopics
   - Use progressive search refinement based on initial findings
   - Cross-reference information from multiple sources

2. **Analysis Phase**
   - Extract key facts, statistics, and insights
   - Identify patterns, trends, and relationships
   - Note conflicting information and assess credibility
   - Score confidence levels for each finding

3. **Synthesis Phase**
   - Organize information into logical categories
   - Create a narrative that connects findings
   - Highlight key insights and implications
   - Generate actionable recommendations

Research Quality Standards:
- ${this.config.includeCitations ? 'ALWAYS cite sources with URLs' : 'Summarize without citations'}
- Prioritize recent information (last 2 years when possible)
- Focus on authoritative sources
- Verify controversial or surprising claims
- Acknowledge limitations and gaps in available information

Output Format: ${this.config.outputFormat}
${this.getFormatInstructions()}`;
  }

  /**
   * Build the research prompt
   */
  private buildResearchPrompt(): string {
    const depthInstructions = {
      quick: "Provide a quick overview with 3-5 key points.",
      standard: "Conduct a standard research with 5-10 key findings and supporting details.",
      comprehensive: "Perform deep research with exhaustive coverage, multiple perspectives, and detailed analysis."
    };

    return `Research Topic: ${this.config.topic}

${depthInstructions[this.config.depth]}

Please follow the research methodology and quality standards defined in your instructions.`;
  }

  /**
   * Get format-specific instructions
   */
  private getFormatInstructions(): string {
    const formats = {
      summary: `
Format as a concise summary:
- Executive overview (2-3 sentences)
- Key findings (bullet points)
- Conclusion (1-2 sentences)`,

      detailed: `
Format as a detailed report:
- Executive Summary
- Background & Context
- Key Findings (with subsections)
- Analysis & Implications
- Recommendations
- Appendix (if needed)`,

      executive: `
Format for executive audience:
- One-page overview
- Top 3 insights
- Business implications
- Recommended actions
- Risk factors`
    };

    return formats[this.config.outputFormat];
  }

  /**
   * Determine model based on depth
   */
  private getModelByDepth(): string {
    switch (this.config.depth) {
      case 'quick':
        return 'claude-haiku-4-5-20251001';  // Fast, cost-effective
      case 'standard':
        return 'claude-sonnet-4-5-20250929';  // Balanced
      case 'comprehensive':
        return 'claude-opus-4-1-20250805';  // Most capable
      default:
        return 'claude-sonnet-4-5-20250929';
    }
  }

  /**
   * Get number of search iterations based on depth
   */
  private getSearchIterations(): number {
    switch (this.config.depth) {
      case 'quick': return 10;
      case 'standard': return 20;
      case 'comprehensive': return 40;
      default: return 20;
    }
  }

  /**
   * Format the final results
   */
  private formatResults(results: string[]): string {
    const timestamp = new Date().toISOString();
    const divider = "=".repeat(60);

    return `
${divider}
RESEARCH REPORT
Topic: ${this.config.topic}
Generated: ${timestamp}
Depth: ${this.config.depth}
${divider}

${results.join("\n\n")}

${divider}
END OF REPORT
${divider}`;
  }
}

/**
 * Example: Company Research
 */
async function researchCompany(companyName: string) {
  const agent = new ResearchAgent({
    topic: `${companyName} - company analysis including history, products, market position, financials, recent news, and competitive landscape`,
    depth: 'comprehensive',
    includeCitations: true,
    outputFormat: 'detailed'
  });

  const report = await agent.research();

  // Save report to file
  const fs = require('fs').promises;
  const fileName = `./reports/${companyName.replace(/\s+/g, '_')}_${Date.now()}.md`;
  await fs.writeFile(fileName, report);

  console.log(`\n✅ Report saved to: ${fileName}`);
  return report;
}

/**
 * Example: Market Analysis
 */
async function analyzeMarket(industry: string) {
  const agent = new ResearchAgent({
    topic: `${industry} industry analysis - trends, key players, growth projections, challenges, and opportunities`,
    depth: 'standard',
    includeCitations: true,
    outputFormat: 'executive'
  });

  return await agent.research();
}

/**
 * Example: Competitive Intelligence
 */
async function competitiveAnalysis(ourCompany: string, competitors: string[]) {
  const agent = new ResearchAgent({
    topic: `Competitive analysis comparing ${ourCompany} with ${competitors.join(', ')} - features, pricing, market share, strengths, weaknesses`,
    depth: 'comprehensive',
    includeCitations: true,
    outputFormat: 'detailed'
  });

  return await agent.research();
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'company':
      if (!args[1]) {
        console.error("Usage: npm run research company <company-name>");
        break;
      }
      await researchCompany(args.slice(1).join(' '));
      break;

    case 'market':
      if (!args[1]) {
        console.error("Usage: npm run research market <industry>");
        break;
      }
      await analyzeMarket(args.slice(1).join(' '));
      break;

    case 'competitive':
      if (args.length < 3) {
        console.error("Usage: npm run research competitive <our-company> <competitor1> [competitor2] ...");
        break;
      }
      await competitiveAnalysis(args[1], args.slice(2));
      break;

    default:
      console.log(`
Phoenix OS Research Agent
========================

Usage:
  npm run research company <company-name>
  npm run research market <industry>
  npm run research competitive <our-company> <competitor1> [competitor2] ...

Examples:
  npm run research company "Apple Inc"
  npm run research market "AI and Machine Learning"
  npm run research competitive "Our Company" "Competitor A" "Competitor B"
      `);
  }
}

// Run if this is the main module
if (require.main === module) {
  main().catch(console.error);
}

export { ResearchAgent, researchCompany, analyzeMarket, competitiveAnalysis };