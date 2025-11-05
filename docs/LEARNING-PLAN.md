# Learning Plan: Building Pre-Sales & Research Agents with Claude Agent SDK

## Overview
This comprehensive 6-week learning plan will guide you through building sophisticated pre-sales and research agents using Claude's Agent SDK with TypeScript. Each phase builds upon the previous, progressing from basic concepts to production-ready systems.

## Prerequisites
- Node.js 18+ installed
- Basic TypeScript/JavaScript knowledge
- Familiarity with async/await patterns
- Understanding of REST APIs

---

## 📚 Phase 1: Foundation (Week 1)
**Goal:** Understand core concepts and set up development environment

### Day 1-2: Environment Setup & Basics
- [x] Install Node.js 18+ and TypeScript
- [x] Set up Claude Agent SDK: `npm install @anthropic-ai/claude-agent-sdk`
- [ ] Create first "Hello World" agent
- [ ] Understand the three-beat loop: Gather → Act → Verify
- [ ] Set up API key and environment variables

**Key Concepts:**
- Agent Loop Architecture
- System Prompts
- Tool Access Control
- Streaming vs Single-mode execution

### Day 3-4: Core Components
- [ ] Learn about System Prompts and how they define agent behavior
- [ ] Explore built-in tools (Read, Write, WebSearch, WebFetch)
- [ ] Practice tool permissions and access control
- [ ] Build a simple file reader agent

**Practice Exercise:**
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function basicAgent() {
  for await (const msg of query({
    prompt: "Read and summarize the README.md file",
    options: {
      model: "claude-3-5-sonnet-20241022",
      allowedTools: ['Read', 'Glob'],
      maxTurns: 5
    }
  })) {
    if (msg.type === "assistant") {
      console.log(msg.content);
    }
  }
}
```

### Day 5-7: TypeScript Fundamentals
- [ ] Study SDK TypeScript interfaces and types
- [ ] Implement basic query patterns with streaming
- [ ] Handle different message types (assistant, user, system, result)
- [ ] Create error handling patterns
- [ ] Build type-safe tool definitions

**Deliverable:** Basic agent that can read files and search the web

---

## 🔧 Phase 2: Research Agent Development (Week 2)
**Goal:** Build specialized research capabilities

### Day 8-10: Web Research Tools
- [ ] Master WebSearch and WebFetch tools
- [ ] Implement progressive search patterns (use results to inform next queries)
- [ ] Add citation tracking and source management
- [ ] Build domain filtering for trusted sources

**Example: Progressive Research Pattern**
```typescript
const researchAgent = {
  systemPrompt: `You are a research agent. When researching a topic:
  1. Start with a broad search
  2. Use initial results to identify key subtopics
  3. Conduct deeper searches on each subtopic
  4. Cross-reference and verify information
  5. Always cite sources`,

  allowedTools: ['WebSearch', 'WebFetch', 'Write'],
  maxTurns: 20
};
```

### Day 11-12: Document Analysis
- [ ] Create multi-document processing with parallel operations
- [ ] Implement semantic search capabilities
- [ ] Build information extraction patterns
- [ ] Add summarization and synthesis

**Key Techniques:**
- Parallel document processing (6.7x faster)
- Context window optimization (40% reduction)
- Semantic vs literal search strategies

### Day 13-14: Research Workflows
- [ ] Create Research Planner → Document Retriever → Information Extractor pipeline
- [ ] Implement memory system for storing insights
- [ ] Build citation manager for tracking sources
- [ ] Add confidence scoring for findings

**Research Agent Components:**
1. **Research Planner** - Maps research strategies
2. **Document Retriever** - Accesses relevant documents
3. **Information Extractor** - Pulls key information
4. **Synthesis Engine** - Combines into coherent narratives
5. **Insight Generator** - Identifies patterns, gaps, opportunities
6. **Citation Manager** - Tracks sources and references

**Deliverable:** Research agent that can analyze multiple sources and synthesize findings

---

## 💼 Phase 3: Pre-Sales Agent Development (Week 3)
**Goal:** Build sales-focused capabilities

### Day 15-17: CRM Integration
- [ ] Set up MCP (Model Context Protocol) for external tools
- [ ] Integrate with CRM systems (HubSpot/Salesforce via MCP)
- [ ] Build company lookup and contact retrieval tools
- [ ] Create customer profile builder

**MCP Setup Example:**
```typescript
import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const lookupCompany = tool(
  "lookup_company",
  "Retrieve company information from CRM",
  z.object({
    company_name: z.string(),
    include_contacts: z.boolean().optional()
  }),
  async ({ company_name, include_contacts }) => {
    // CRM API integration
    const response = await fetch(`${CRM_API}/companies/${company_name}`);
    return await response.json();
  }
);

const mcpServer = createSdkMcpServer({
  name: "crm-server",
  version: "1.0.0",
  tools: [lookupCompany]
});
```

### Day 18-19: Competitive Intelligence
- [ ] Build competitive analysis subagent
- [ ] Implement market research capabilities
- [ ] Create SWOT analysis generator
- [ ] Add pricing and feature comparison tools

**Competitive Analysis Workflow:**
```typescript
const competitiveAgent = {
  systemPrompt: `Analyze competitive landscape:
  - Identify key competitors
  - Compare features and pricing
  - Analyze market positioning
  - Identify differentiators
  - Generate SWOT analysis`,

  allowedTools: ['WebSearch', 'WebFetch', 'Write'],
  agents: {
    "market-researcher": { /* subagent config */ },
    "pricing-analyst": { /* subagent config */ }
  }
};
```

### Day 20-21: Document Generation
- [ ] Integrate with office skills (docx, pptx, xlsx)
- [ ] Build proposal generator
- [ ] Create presentation builder
- [ ] Implement report formatting

**Deliverable:** Pre-sales agent that can research companies and generate proposals

---

## 🚀 Phase 4: Advanced Features (Week 4)
**Goal:** Production-ready capabilities

### Day 22-23: Subagents & Delegation
- [ ] Create specialized subagents for specific tasks
- [ ] Implement delegation patterns
- [ ] Build agent orchestration
- [ ] Add task chaining and parallel execution

**Subagent Structure:**
```yaml
---
name: competitive-analyst
description: Analyzes competitive positioning. Use PROACTIVELY for market analysis.
tools: WebSearch, WebFetch, Write
model: sonnet
---

You are an expert competitive analyst focusing on:
- Market positioning
- Feature comparisons
- Pricing strategies
- SWOT analysis

Always provide data-driven insights with sources.
```

### Day 24-25: Memory & Context Management
- [ ] Implement hierarchical memory system
- [ ] Build CLAUDE.md configuration
- [ ] Add session persistence
- [ ] Create knowledge base management

**Memory Hierarchy:**
1. **Local** (`.claude/CLAUDE.md`) - Project-specific, not in git
2. **Project** (`.claude/CLAUDE.md`) - Shared via version control
3. **User** (`~/.claude/CLAUDE.md`) - Personal across projects
4. **System** - SDK defaults

### Day 26-28: Production Patterns
- [ ] Add hooks for monitoring and safety
- [ ] Implement audit logging
- [ ] Build permission controls
- [ ] Add rate limiting and error recovery

**Hook Implementation:**
```typescript
const productionConfig = {
  hooks: {
    PreToolUse: async (tool, input) => {
      // Validate and log
      console.log(`Executing: ${tool.name}`);
      if (tool.name === 'Write' && input.path.includes('sensitive')) {
        throw new Error('Blocked: sensitive file access');
      }
    },
    PostToolUse: async (tool, result) => {
      // Audit logging
      await auditLog.write({
        tool: tool.name,
        result,
        timestamp: Date.now()
      });
    }
  }
};
```

**Deliverable:** Production-ready agent system with monitoring

---

## 🎯 Phase 5: Business-Specific Implementation (Week 5)
**Goal:** Customize for your specific use cases

### Day 29-31: Custom Tools Development
- [ ] Build lead scoring tool
- [ ] Create opportunity analysis tool
- [ ] Implement ROI calculator
- [ ] Add custom data validators

**Custom Tool Example:**
```typescript
const scoreLeadTool = tool(
  "score_lead",
  "Calculate lead quality score based on multiple factors",
  z.object({
    company_size: z.number(),
    budget: z.number(),
    timeline: z.string(),
    engagement_level: z.number().min(0).max(10),
    use_case_fit: z.number().min(0).max(10)
  }),
  async (input) => {
    // Scoring algorithm
    const baseScore = (input.company_size * 0.2) +
                     (input.budget * 0.3) +
                     (input.engagement_level * 0.25) +
                     (input.use_case_fit * 0.25);

    const urgencyMultiplier = input.timeline === "immediate" ? 1.5 : 1.0;
    const finalScore = Math.min(100, baseScore * urgencyMultiplier);

    return {
      score: finalScore,
      recommendation: finalScore > 75 ? "High Priority" :
                     finalScore > 50 ? "Medium Priority" : "Low Priority",
      factors: {
        company_size: input.company_size,
        budget: input.budget,
        timeline: input.timeline,
        engagement: input.engagement_level,
        fit: input.use_case_fit
      }
    };
  }
);
```

### Day 32-33: Workflow Automation
- [ ] Build end-to-end research → analysis → report pipeline
- [ ] Create automated competitive monitoring
- [ ] Implement periodic market scanning
- [ ] Add alert system for opportunities

**Automated Workflow Example:**
```typescript
async function weeklyMarketScan() {
  const scanResults = [];

  // Step 1: Research competitors
  const competitorData = await researchAgent({
    prompt: "Analyze top 5 competitors in our market"
  });

  // Step 2: Identify opportunities
  const opportunities = await analysisAgent({
    prompt: "Identify market gaps from competitor analysis",
    context: competitorData
  });

  // Step 3: Generate report
  const report = await reportAgent({
    prompt: "Create executive summary",
    data: { competitors: competitorData, opportunities }
  });

  // Step 4: Send alerts if high-priority opportunities found
  if (opportunities.some(o => o.priority === 'high')) {
    await alertTeam(opportunities);
  }

  return report;
}
```

### Day 34-35: Integration & Testing
- [ ] Connect with existing business systems
- [ ] Build comprehensive test suite
- [ ] Implement performance monitoring
- [ ] Create backup and recovery procedures

**Deliverable:** Fully integrated business agents

---

## 📊 Phase 6: Optimization & Scaling (Week 6)
**Goal:** Optimize performance and scale

### Day 36-37: Performance Tuning
- [ ] Optimize context usage (40% reduction techniques)
- [ ] Implement caching strategies
- [ ] Use appropriate models (Haiku for simple, Opus for complex)
- [ ] Add batch processing

**Performance Optimization Strategies:**
```typescript
const optimizedConfig = {
  // Use Haiku for simple tasks
  model: complexity === 'low' ? 'claude-3-5-haiku-20241022' : 'claude-3-5-sonnet-20241022',

  // Limit context with smart pruning
  maxThinkingTokens: 5000,

  // Parallel processing for independent tasks
  agents: {
    "data-fetcher": { model: "haiku", allowedTools: ['Read'] },
    "analyzer": { model: "sonnet", allowedTools: ['Write'] },
    "reporter": { model: "haiku", allowedTools: ['Write'] }
  }
};
```

### Day 38-39: Multi-Agent Orchestration
- [ ] Build agent coordinator
- [ ] Implement workload distribution
- [ ] Create failure recovery patterns
- [ ] Add progress tracking

**Multi-Agent Architecture:**
```
Orchestrator Agent
├── Research Team
│   ├── Web Researcher (Haiku)
│   ├── Document Analyzer (Sonnet)
│   └── Data Extractor (Haiku)
├── Analysis Team
│   ├── Competitive Analyst (Sonnet)
│   ├── Market Analyst (Sonnet)
│   └── Opportunity Identifier (Opus)
└── Output Team
    ├── Report Generator (Haiku)
    ├── Presentation Builder (Sonnet)
    └── Executive Summarizer (Sonnet)
```

### Day 40-42: Deployment & Monitoring
- [ ] Set up production environment
- [ ] Implement comprehensive logging
- [ ] Create performance dashboards
- [ ] Build user feedback loop

**Monitoring Dashboard Metrics:**
- Agent response times
- Token usage by agent type
- Success/failure rates
- Cost per operation
- User satisfaction scores

**Deliverable:** Scalable, production-ready agent system

---

## 🎯 Practical Projects

### Project 1: Company Research Agent
**Objective:** Build an agent that takes a company name and produces comprehensive intelligence

**Requirements:**
- Company overview and history
- Key personnel and decision makers
- Recent news and developments
- Financial information (if public)
- Competitive positioning
- Technology stack (if applicable)
- Sales opportunities
- Risk factors

**Success Criteria:**
- Complete report in under 5 minutes
- 95% accuracy on verifiable facts
- Proper citation of all sources
- Executive summary under 500 words

### Project 2: Proposal Generator
**Objective:** Create an agent that generates customized sales proposals

**Requirements:**
- Gather requirements interactively
- Research client company and needs
- Generate customized value proposition
- Include relevant case studies
- Create pricing options
- Format in professional document
- Include implementation timeline

**Success Criteria:**
- Proposal ready in under 10 minutes
- Personalized to client needs
- Professional formatting
- Includes all required sections

### Project 3: Market Intelligence System
**Objective:** Develop an automated market monitoring system

**Requirements:**
- Monitor competitor activities daily
- Track industry trends weekly
- Identify new market opportunities
- Generate alerts for critical changes
- Produce weekly executive reports
- Maintain historical database

**Success Criteria:**
- 24/7 automated monitoring
- Less than 1 hour lag on critical updates
- 90% relevance in identified opportunities
- Zero missed major market events

---

## 📖 Key Resources

### Official Documentation
- **Main Docs:** [docs.claude.com](https://docs.claude.com)
- **Agent SDK:** [docs.claude.com/en/api/agent-sdk/overview](https://docs.claude.com/en/api/agent-sdk/overview)
- **TypeScript SDK:** [github.com/anthropics/claude-agent-sdk-typescript](https://github.com/anthropics/claude-agent-sdk-typescript)
- **Migration Guide:** [docs.claude.com/en/docs/claude-code/sdk/migration-guide](https://docs.claude.com/en/docs/claude-code/sdk/migration-guide)

### Community Resources
- **Discord:** Claude Developers Discord (official support)
- **Awesome Subagents:** [github.com/VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)
- **Blog:** [anthropic.com/engineering](https://anthropic.com/engineering)

### Learning Materials
- **DataCamp:** Claude Agent SDK Tutorial
- **Bind AI:** How to Create Agents with Claude SDK
- **Skywork AI:** Step-by-Step AI Agent Tutorial
- **Collabnix:** Claude API Integration Guide 2025

### MCP Servers for Business
- **CRM:** HubSpot, Salesforce, Pipedrive
- **Project Management:** Asana, Jira, Linear, Notion
- **Data Sources:** Airtable, PostgreSQL, Google Sheets
- **Communication:** Slack, Gmail, Microsoft Teams
- **Analytics:** Google Analytics, Mixpanel, Segment
- **Payments:** Stripe, PayPal, Square

---

## 🚦 Success Metrics

### Week 1 Milestones
- [ ] Successfully query and get responses from agent
- [ ] Build agent that can read local files
- [ ] Implement basic error handling
- [ ] Understand tool permissions

### Week 2 Milestones
- [ ] Process 10+ documents in under 5 minutes
- [ ] Implement citation tracking
- [ ] Build progressive search patterns
- [ ] Create research summaries with sources

### Week 3 Milestones
- [ ] Generate first automated proposal
- [ ] Connect to at least one external data source
- [ ] Build competitive analysis report
- [ ] Create customer profile from multiple sources

### Week 4 Milestones
- [ ] Deploy agent with 99% uptime
- [ ] Implement comprehensive logging
- [ ] Create at least 3 specialized subagents
- [ ] Build session persistence

### Week 5 Milestones
- [ ] Reduce research time by 70%
- [ ] Build 5+ custom tools
- [ ] Implement full automation pipeline
- [ ] Generate 10+ reports automatically

### Week 6 Milestones
- [ ] Handle 100+ concurrent research tasks
- [ ] Achieve 40% context reduction
- [ ] Deploy multi-agent system
- [ ] Complete performance dashboard

---

## 💡 Pro Tips & Best Practices

### Development Tips
1. **Start Simple:** Begin with single tools, then combine
2. **Test Often:** Use Haiku model for rapid testing (faster, cheaper)
3. **Version Control:** Track all agent configurations and prompts
4. **Document Everything:** Maintain clear documentation of agent behaviors
5. **Iterate Quickly:** Get basic version working, then optimize

### System Prompt Best Practices
```typescript
const effectivePrompt = `You are a [specific role] expert.

Your responsibilities:
1. [Clear task 1]
2. [Clear task 2]
3. [Clear task 3]

Guidelines:
- Always cite sources
- Prioritize accuracy over speed
- Ask for clarification when needed
- Provide confidence levels for findings

Output format:
- Use bullet points for clarity
- Include executive summary
- Cite all sources with links`;
```

### Error Handling Patterns
```typescript
try {
  for await (const msg of query({ prompt, options })) {
    if (msg.type === "result") {
      if (msg.result === "error_max_turns") {
        // Handle max turns - maybe break task into smaller parts
        await handleMaxTurns();
      } else if (msg.result === "error_during_execution") {
        // Handle execution error - retry with different approach
        await retryWithFallback();
      }
    }
  }
} catch (error) {
  // Log error, notify user, graceful degradation
  console.error('Agent error:', error);
  await fallbackBehavior();
}
```

### Cost Optimization
- Use Haiku 3.5 for simple tasks (fastest, most cost-effective)
- Use Sonnet 3.5 for balanced tasks (best overall value)
- Use Opus 3.5 only for complex reasoning (highest capability)
- Implement caching for repeated queries
- Batch similar operations

### Security Considerations
- Never expose API keys in code
- Implement rate limiting
- Validate all external inputs
- Use permission hooks for sensitive operations
- Maintain audit logs
- Implement data retention policies

---

## 🎓 Certification Path

### Level 1: Foundation (Week 1-2)
- Build basic file reading agent
- Implement web search agent
- Pass knowledge check on SDK components

### Level 2: Specialist (Week 3-4)
- Build complete research agent
- Create pre-sales automation
- Deploy production agent with monitoring

### Level 3: Expert (Week 5-6)
- Build multi-agent orchestration
- Achieve 70% automation of manual tasks
- Create custom MCP integration
- Contribute to community (share subagent)

---

## 📅 Daily Checklist Template

```markdown
## Day [X] - [Topic]

### Morning (Theory - 2 hours)
- [ ] Read documentation section: ___
- [ ] Watch tutorial/video: ___
- [ ] Review example code: ___

### Afternoon (Practice - 3 hours)
- [ ] Build component: ___
- [ ] Test functionality: ___
- [ ] Debug issues: ___

### Evening (Review - 1 hour)
- [ ] Document learnings
- [ ] Update progress tracker
- [ ] Prepare tomorrow's plan

### Blockers/Questions
-

### Key Insights
-
```

---

## 🚀 Next Steps After Completion

1. **Join the Community**
   - Claude Developers Discord
   - Share your agents on GitHub
   - Contribute to documentation

2. **Advanced Topics**
   - Build domain-specific agents (legal, medical, finance)
   - Create agent marketplaces
   - Develop agent training frameworks
   - Implement advanced memory systems

3. **Business Applications**
   - Sales automation platform
   - Research-as-a-Service
   - Competitive intelligence system
   - Customer success automation

4. **Open Source Contributions**
   - Share useful subagents
   - Create MCP servers
   - Build tool libraries
   - Write tutorials

---

## 📝 Notes Section

Use this space to track your progress, insights, and questions:

### Week 1 Notes
-

### Week 2 Notes
-

### Week 3 Notes
-

### Week 4 Notes
-

### Week 5 Notes
-

### Week 6 Notes
-

---

## 🎉 Conclusion

By the end of this 6-week journey, you'll have:
- Mastered the Claude Agent SDK
- Built production-ready agents
- Automated significant business processes
- Created a foundation for continued learning

Remember: The key to success is consistent practice and iteration. Start simple, test often, and gradually increase complexity.

**Happy building!** 🚀