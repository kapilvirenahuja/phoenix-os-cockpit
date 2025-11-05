import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

/**
 * Pre-Sales Agent - Specialized for sales automation, proposal generation,
 * lead qualification, and customer engagement
 */

// Lead scoring schema
const LeadSchema = z.object({
  company_name: z.string(),
  company_size: z.number(),
  industry: z.string(),
  budget: z.number().optional(),
  timeline: z.enum(['immediate', 'quarter', 'year', 'exploring']),
  pain_points: z.array(z.string()),
  decision_makers: z.array(z.object({
    name: z.string(),
    title: z.string(),
    email: z.string().email().optional()
  })),
  engagement_level: z.number().min(0).max(10)
});

type Lead = z.infer<typeof LeadSchema>;

/**
 * Custom tool for lead scoring
 */
const scoreLeadTool = tool(
  "score_lead",
  "Calculate lead quality score based on multiple factors",
  z.object({
    company_size: z.number(),
    budget: z.number().optional(),
    timeline: z.string(),
    engagement_level: z.number().min(0).max(10),
    pain_point_match: z.number().min(0).max(10),
    decision_maker_access: z.boolean()
  }),
  async (input) => {
    // Scoring algorithm
    let score = 0;

    // Company size score (max 20 points)
    if (input.company_size > 1000) score += 20;
    else if (input.company_size > 100) score += 15;
    else if (input.company_size > 10) score += 10;
    else score += 5;

    // Budget score (max 25 points)
    if (input.budget) {
      if (input.budget > 100000) score += 25;
      else if (input.budget > 50000) score += 20;
      else if (input.budget > 10000) score += 15;
      else score += 10;
    } else {
      score += 5; // Unknown budget
    }

    // Timeline score (max 20 points)
    switch (input.timeline) {
      case 'immediate': score += 20; break;
      case 'quarter': score += 15; break;
      case 'year': score += 10; break;
      case 'exploring': score += 5; break;
    }

    // Engagement score (max 15 points)
    score += (input.engagement_level / 10) * 15;

    // Pain point match (max 15 points)
    score += (input.pain_point_match / 10) * 15;

    // Decision maker access (max 5 points)
    if (input.decision_maker_access) score += 5;

    // Calculate final score and recommendation
    const finalScore = Math.min(100, Math.round(score));
    let recommendation: string;

    if (finalScore >= 80) recommendation = "🔥 Hot Lead - Immediate Action Required";
    else if (finalScore >= 60) recommendation = "✨ Warm Lead - High Priority";
    else if (finalScore >= 40) recommendation = "📊 Qualified Lead - Standard Follow-up";
    else recommendation = "❄️ Cold Lead - Nurture Campaign";

    return {
      score: finalScore,
      recommendation,
      factors: {
        company_size: input.company_size,
        budget: input.budget || 'unknown',
        timeline: input.timeline,
        engagement: input.engagement_level,
        pain_point_match: input.pain_point_match,
        decision_maker_access: input.decision_maker_access
      }
    };
  }
);

/**
 * Pre-Sales Agent Class
 */
class PreSalesAgent {
  private mcpServer: any;

  constructor() {
    // Create MCP server with custom tools
    this.mcpServer = createSdkMcpServer({
      name: "presales-tools",
      version: "1.0.0",
      tools: [scoreLeadTool]
    });
  }

  /**
   * Research and qualify a lead
   */
  async qualifyLead(companyName: string): Promise<any> {
    console.log(`🎯 Qualifying lead: ${companyName}`);

    const systemPrompt = `You are an expert pre-sales specialist with deep knowledge of B2B sales processes.

Your responsibilities:
1. Research companies thoroughly using web search
2. Identify key decision makers and their roles
3. Understand their business model and pain points
4. Assess budget and timeline indicators
5. Calculate lead scores based on findings
6. Generate qualification reports with recommendations

Research methodology:
- Search for company website, news, and press releases
- Look for funding information and growth indicators
- Identify technology stack and current solutions
- Find information about competitors they work with
- Assess company culture and values alignment

Always provide data-driven insights with confidence levels.`;

    const results = [];

    for await (const message of query({
      prompt: `Research and qualify ${companyName} as a potential customer. Include:
1. Company overview and size
2. Industry and market position
3. Recent news and developments
4. Potential pain points our solution could address
5. Key decision makers
6. Budget indicators
7. Technology stack
8. Competitor solutions they might be using`,

      options: {
        model: 'claude-sonnet-4-5-20250929',
        systemPrompt,
        allowedTools: ['WebSearch', 'WebFetch', 'Write'],
        mcpServers: {
          "presales": this.mcpServer
        },
        maxTurns: 20
      }
    })) {
      if (message.type === "assistant") {
        results.push(message.content);
      }
    }

    return this.formatQualificationReport(companyName, results);
  }

  /**
   * Generate a proposal
   */
  async generateProposal(lead: Lead, requirements: string[]): Promise<string> {
    console.log(`📄 Generating proposal for: ${lead.company_name}`);

    const systemPrompt = `You are an expert proposal writer specializing in B2B software sales.

Create compelling, personalized proposals that:
1. Address specific customer pain points
2. Highlight unique value propositions
3. Include relevant case studies
4. Provide clear pricing options
5. Define implementation timeline
6. Show ROI calculations
7. Include social proof

Proposal structure:
- Executive Summary
- Understanding Your Challenges
- Our Solution
- Why Choose Us
- Implementation Plan
- Investment & ROI
- Next Steps

Use persuasive but professional language. Focus on benefits over features.`;

    const proposalContent = [];

    for await (const message of query({
      prompt: `Generate a detailed sales proposal for ${lead.company_name}.

Company details:
- Industry: ${lead.industry}
- Size: ${lead.company_size} employees
- Timeline: ${lead.timeline}
- Pain points: ${lead.pain_points.join(', ')}

Requirements:
${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Decision makers:
${lead.decision_makers.map(dm => `- ${dm.name} (${dm.title})`).join('\n')}

Create a compelling proposal that addresses their specific needs and demonstrates clear value.`,

      options: {
        model: 'claude-sonnet-4-5-20250929',
        systemPrompt,
        allowedTools: ['Write'],
        maxTurns: 10
      }
    })) {
      if (message.type === "assistant") {
        proposalContent.push(message.content);
      }
    }

    return this.formatProposal(lead, proposalContent);
  }

  /**
   * Create follow-up sequence
   */
  async createFollowUpSequence(lead: Lead): Promise<any> {
    console.log(`📧 Creating follow-up sequence for: ${lead.company_name}`);

    const systemPrompt = `You are an expert sales engagement specialist.

Create personalized follow-up sequences that:
1. Are tailored to the lead's industry and role
2. Provide value in each interaction
3. Build relationship progressively
4. Include multiple touchpoints (email, LinkedIn, phone)
5. Have clear calls to action

Follow-up principles:
- Persistence without annoyance
- Value-first approach
- Social proof integration
- Urgency without pressure
- Personal but scalable

Generate 5-7 touchpoints over 2-3 weeks.`;

    const sequence = [];

    for await (const message of query({
      prompt: `Create a follow-up sequence for ${lead.company_name}.

Lead context:
- Industry: ${lead.industry}
- Timeline: ${lead.timeline}
- Engagement level: ${lead.engagement_level}/10
- Key contact: ${lead.decision_makers[0]?.name} (${lead.decision_makers[0]?.title})

Generate a multi-touch follow-up sequence with specific messages for each touchpoint.`,

      options: {
        model: 'claude-haiku-4-5-20251001',  // Use faster model for templates
        systemPrompt,
        allowedTools: ['Write'],
        maxTurns: 10
      }
    })) {
      if (message.type === "assistant") {
        sequence.push(message.content);
      }
    }

    return this.formatFollowUpSequence(lead, sequence);
  }

  /**
   * Competitive battle card
   */
  async createBattleCard(competitor: string): Promise<string> {
    console.log(`⚔️ Creating battle card against: ${competitor}`);

    const systemPrompt = `You are a competitive intelligence analyst specializing in B2B software.

Create comprehensive battle cards that:
1. Highlight our competitive advantages
2. Address competitor strengths honestly
3. Provide talk tracks for objections
4. Include pricing comparisons
5. Show feature differentiators
6. Provide win/loss insights

Be factual and balanced while positioning our solution favorably.`;

    const battleCardContent = [];

    for await (const message of query({
      prompt: `Create a competitive battle card comparing our solution against ${competitor}.

Include:
1. Company overview comparison
2. Feature comparison matrix
3. Pricing comparison
4. Strengths and weaknesses (both sides)
5. Common objections and responses
6. Win strategies
7. Customer switching points
8. Proof points and case studies`,

      options: {
        model: 'claude-sonnet-4-5-20250929',
        systemPrompt,
        allowedTools: ['WebSearch', 'WebFetch', 'Write'],
        maxTurns: 15
      }
    })) {
      if (message.type === "assistant") {
        battleCardContent.push(message.content);
      }
    }

    return this.formatBattleCard(competitor, battleCardContent);
  }

  // Formatting helpers
  private formatQualificationReport(company: string, results: string[]): string {
    const timestamp = new Date().toISOString();
    return `
# Lead Qualification Report
**Company:** ${company}
**Date:** ${timestamp}

---

${results.join('\n\n')}

---
*Generated by Phoenix OS Pre-Sales Agent*`;
  }

  private formatProposal(lead: Lead, content: string[]): string {
    const date = new Date().toLocaleDateString();
    return `
# Proposal for ${lead.company_name}

**Date:** ${date}
**Prepared for:** ${lead.decision_makers[0]?.name || 'Decision Maker'}
**Valid until:** ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}

---

${content.join('\n\n')}

---

## Acceptance

By signing below, you agree to the terms outlined in this proposal.

_____________________
Signature

_____________________
Date

---
*Confidential - Phoenix OS Solutions*`;
  }

  private formatFollowUpSequence(lead: Lead, sequence: string[]): object {
    return {
      lead: lead.company_name,
      created: new Date().toISOString(),
      touchpoints: sequence.map((content, index) => ({
        number: index + 1,
        day: Math.floor(index * 3) + 1,  // Spread over days
        channel: index % 3 === 0 ? 'email' : index % 3 === 1 ? 'linkedin' : 'phone',
        content
      }))
    };
  }

  private formatBattleCard(competitor: string, content: string[]): string {
    return `
# Competitive Battle Card: vs ${competitor}

**Last Updated:** ${new Date().toLocaleDateString()}
**Confidential - Internal Use Only**

---

${content.join('\n\n')}

---

## Quick Reference

### Elevator Pitch
"Unlike ${competitor}, we provide [unique value prop]"

### Key Differentiators
1. [Differentiator 1]
2. [Differentiator 2]
3. [Differentiator 3]

### Objection Handling
**"${competitor} is cheaper"**
→ Response: [Value-based response]

**"${competitor} has more features"**
→ Response: [Quality over quantity response]

---
*Phoenix OS Competitive Intelligence*`;
  }
}

// Example usage functions
async function main() {
  const agent = new PreSalesAgent();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'qualify':
      if (!args[0]) {
        console.error("Usage: npm run presales qualify <company-name>");
        break;
      }
      const qualReport = await agent.qualifyLead(args.join(' '));
      console.log(qualReport);
      break;

    case 'proposal':
      // Example proposal generation
      const exampleLead: Lead = {
        company_name: args[0] || "Example Corp",
        company_size: 500,
        industry: "Technology",
        budget: 50000,
        timeline: "quarter",
        pain_points: ["Manual processes", "Lack of integration", "Scalability issues"],
        decision_makers: [{
          name: "John Smith",
          title: "CTO",
          email: "john@example.com"
        }],
        engagement_level: 7
      };

      const proposal = await agent.generateProposal(
        exampleLead,
        ["Automated workflow solution", "API integration", "24/7 support"]
      );
      console.log(proposal);
      break;

    case 'battlecard':
      if (!args[0]) {
        console.error("Usage: npm run presales battlecard <competitor-name>");
        break;
      }
      const battleCard = await agent.createBattleCard(args.join(' '));
      console.log(battleCard);
      break;

    case 'followup':
      // Example follow-up sequence
      const followUpLead: Lead = {
        company_name: args[0] || "Target Company",
        company_size: 200,
        industry: "Finance",
        timeline: "immediate",
        pain_points: ["Compliance", "Reporting"],
        decision_makers: [{
          name: "Jane Doe",
          title: "VP of Operations"
        }],
        engagement_level: 8
      };

      const sequence = await agent.createFollowUpSequence(followUpLead);
      console.log(JSON.stringify(sequence, null, 2));
      break;

    default:
      console.log(`
Phoenix OS Pre-Sales Agent
==========================

Commands:
  qualify <company>      - Research and qualify a lead
  proposal <company>     - Generate a sales proposal
  battlecard <competitor> - Create competitive battle card
  followup <company>     - Generate follow-up sequence

Examples:
  npm run presales qualify "Acme Corp"
  npm run presales proposal "Tech Startup Inc"
  npm run presales battlecard "Competitor X"
  npm run presales followup "Potential Customer LLC"
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { PreSalesAgent, scoreLeadTool, LeadSchema };