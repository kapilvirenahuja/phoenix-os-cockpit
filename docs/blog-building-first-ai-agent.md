# Building My First AI Agent: A Learning Journey with Claude Agent SDK

## Introduction: Why I Started This Journey

As a developer exploring the world of AI agents, I wanted to move beyond simple API calls and build truly autonomous systems that could use tools, make decisions, and accomplish complex tasks. The Claude Agent SDK promised exactly that—but where do you start?

This is the story of my first week building AI agents, from "Hello World" to web-searching research assistants. If you're curious about agent development, this guide will walk you through the fundamentals with real code examples.

---

## Day 1: Understanding the Foundation

### The Three-Beat Loop

The first concept that clicked for me was the **three-beat loop**—the heart of every agent:

```
1. GATHER → 2. ACT → 3. VERIFY
```

- **GATHER**: The agent receives input and context
- **ACT**: It processes, thinks, and takes actions (using tools if needed)
- **VERIFY**: Results are returned and validated

This simple pattern underlies everything from chatbots to complex research systems.

### Setting Up the Environment

First, I set up the project:

```bash
npm install @anthropic-ai/claude-agent-sdk dotenv typescript
```

Created a `.env` file with my API key:

```bash
ANTHROPIC_API_KEY=your_key_here
NODE_ENV=development  # For cost-effective testing
```

**Pro tip**: Always use `NODE_ENV=development` during learning to use cheaper models (Haiku 4.5) and reduced iterations. This saved me 95%+ on API costs!

---

## Day 2: My First Agent - "Hello World"

### The Basic Pattern

Here's the simplest possible agent:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import dotenv from "dotenv";

dotenv.config();

async function helloWorldAgent() {
  for await (const message of query({
    prompt: "Say hello and explain what you can do in one sentence.",
    options: {
      model: "claude-haiku-4-5-20251001",  // Fast and cheap for testing
      maxTurns: 1,                          // Single exchange
      allowedTools: [],                     // No tools yet
      systemPrompt: "You are a helpful AI assistant."
    }
  })) {

    if (message.type === "assistant") {
      const msg = message.message;
      const textContent = msg?.content?.find(c => c.type === 'text');
      if (textContent?.text) {
        console.log("🤖 Agent:", textContent.text);
      }
    }
  }
}
```

### What I Learned

1. **Async Streaming**: The `for await...of` pattern streams responses in real-time
2. **Message Types**: Agents return different message types (system, assistant, result)
3. **Model Selection**: Use Haiku for testing, Sonnet for production, Opus for complex tasks
4. **Turn Management**: Each turn = one exchange. Simple tasks need 1, complex tasks need 20+

**Breakthrough moment**: The agent just worked! No complex setup, no middleware—just import and query.

---

## Day 3: Adding Tools - File Reading

The magic of agents isn't just conversation—it's tool use. I wanted my agent to read files autonomously.

### Agent with File Access

```typescript
async function agentWithTools() {
  for await (const message of query({
    prompt: "Read the package.json file and tell me the project name and version.",
    options: {
      model: "claude-haiku-4-5-20251001",
      allowedTools: ['Read', 'Glob'],  // Grant file access
      maxTurns: 10,                     // More turns for tool use
      systemPrompt: "You are a helpful assistant that can read and analyze files."
    }
  })) {
    // Handle messages...
  }
}
```

### The Revelation: Tool Autonomy

Here's what blew my mind: **I never told the agent which file to read or how to read it.**

The agent:
1. Understood it needed to find and read `package.json`
2. Used the `Read` tool autonomously
3. Parsed the JSON
4. Extracted the relevant information
5. Formatted a clean response

Output:
```
🤖 Agent: Based on the package.json file:

**Project Name:** phoenix-os-cockpit
**Version:** 1.0.0
**Description:** A TypeScript-based application leveraging Claude's Agent SDK...
```

**Key insight**: You provide tools and goals. The agent figures out the "how."

### Why More Turns?

With 5 turns, the agent failed with `error_max_turns`. With 10 turns, it succeeded. Why?

Because tool usage requires multiple turns:
- Turn 1-2: Understand the task
- Turn 3-5: Use Read tool, get results
- Turn 6-8: Parse and analyze
- Turn 9-10: Format and respond

**Rule of thumb**:
- Conversation only: 1-5 turns
- File operations: 5-10 turns
- Web research: 15-20 turns

---

## Day 4: Web Search - The Power Unlocked

The real power of agents is accessing external information. I wanted to build something that could search the web.

### Enabling Web Permissions

First, I had to enable WebSearch permissions. This tripped me up initially—agents need explicit permission to access the web.

I created `~/.claude/projects/[project-path]/settings.json`:

```json
{
  "allowedTools": [
    "WebSearch",
    "WebFetch"
  ],
  "webSearch": {
    "enabled": true
  },
  "webFetch": {
    "enabled": true,
    "allowedDomains": [
      "medium.com",
      "techcrunch.com",
      "bloomberg.com",
      "reuters.com"
    ]
  }
}
```

### Building the Web Search Agent

```typescript
async function agentWithWebSearch() {
  for await (const message of query({
    prompt: "Search for information about League of Legends Worlds 2025 championship and tell me the key details.",
    options: {
      model: "claude-haiku-4-5-20251001",
      allowedTools: ['WebSearch', 'WebFetch'],
      maxTurns: 20,  // Web ops need more turns!
      systemPrompt: "You are an expert web researcher. Search the internet for current information, verify facts from multiple sources, and provide clear summaries."
    }
  })) {
    // Handle messages...
  }
}
```

### The Result

```
🤖 Agent: ## League of Legends Worlds 2025 - Key Information

**Tournament Details:**
- **Dates:** October 14 - November 9, 2025
- **Location:** China (Beijing, Shanghai, Chengdu)
- **Teams:** 17 teams from all regions

**Grand Finals:**
- **Teams:** T1 vs. kt Rolster
- **Date:** November 9, 2025
- **Location:** Chengdu, China

**Notable Facts:**
- T1 is searching for their third consecutive World Championship title
- KT Rolster is making their first-ever Worlds final appearance
...
```

**Mind = Blown**: The agent:
- Formulated search queries
- Executed multiple searches
- Cross-referenced information
- Found current, real-time data (Nov 2025)
- Formatted it beautifully

All from a single prompt.

---

## The Three Agents: A Progression

By Day 4, I had built three increasingly complex agents:

### 1. Basic Agent (Conversation)
```typescript
{
  model: "claude-haiku-4-5-20251001",
  maxTurns: 1,
  allowedTools: []
}
```
**Speed**: Instant | **Cost**: $0.001 | **Capability**: Q&A

### 2. Tools Agent (File Access)
```typescript
{
  model: "claude-haiku-4-5-20251001",
  maxTurns: 10,
  allowedTools: ['Read', 'Glob']
}
```
**Speed**: 3-5 sec | **Cost**: $0.005 | **Capability**: File analysis

### 3. Search Agent (Web Research)
```typescript
{
  model: "claude-haiku-4-5-20251001",
  maxTurns: 20,
  allowedTools: ['WebSearch', 'WebFetch']
}
```
**Speed**: 10-20 sec | **Cost**: $0.01-0.02 | **Capability**: Real-time research

---

## Key Lessons Learned

### 1. Start Simple, Add Complexity

Don't jump straight to multi-agent systems. Build:
1. Basic conversation agent
2. Add one tool (Read)
3. Add web search
4. Then combine tools

### 2. Turn Management is Critical

```typescript
// Too few turns = error_max_turns
maxTurns: 1  // ❌ Fails for tool usage

// Just right
maxTurns: 10  // ✅ File operations work

// Too many = wasted cost
maxTurns: 50  // 💸 Expensive overkill for simple tasks
```

### 3. Model Selection Matters

```typescript
// Development (testing)
model: "claude-haiku-4-5-20251001"    // Fast, cheap

// Production (balanced)
model: "claude-sonnet-4-5-20250929"   // Recommended

// Complex reasoning
model: "claude-opus-4-1-20250805"     // Use sparingly
```

**Cost comparison** (approximate):
- Haiku: $0.001 per agent call
- Sonnet: $0.01 per agent call
- Opus: $0.05 per agent call

### 4. System Prompts Define Behavior

```typescript
// ❌ Vague
systemPrompt: "You are helpful."

// ✅ Specific
systemPrompt: `You are an expert web researcher.

Your methodology:
1. Formulate precise search queries
2. Cross-reference multiple sources
3. Verify controversial claims
4. Cite all sources with URLs

Always prioritize accuracy over speed.`
```

### 5. Agent Autonomy is Real

You don't micromanage agents. You provide:
- **Tools** (what they can use)
- **Goals** (what you want)
- **Context** (relevant information)

The agent figures out:
- Which tools to use
- When to use them
- How to combine results
- How to format output

---

## Debugging Tips I Wish I Knew

### Issue 1: Agent Response Shows "undefined"

**Problem**: Message structure changed in SDK updates.

**Solution**: Extract text properly:
```typescript
const msg = (message as any).message;
const textContent = msg?.content?.find(c => c.type === 'text');
if (textContent?.text) {
  console.log(textContent.text);
}
```

### Issue 2: Debug Messages Flooding Console

**Problem**: `[DEBUG]` messages everywhere.

**Solution**: Suppress stderr:
```bash
npm run agent 2>/dev/null
```

Or in package.json:
```json
{
  "scripts": {
    "agent": "tsx src/agent.ts 2>/dev/null"
  }
}
```

### Issue 3: WebSearch Not Working

**Problem**: Permission denied.

**Solution**: Create project settings:
```bash
~/.claude/projects/[your-project-path]/settings.json
```

Enable tools explicitly:
```json
{
  "allowedTools": ["WebSearch", "WebFetch"],
  "webSearch": { "enabled": true }
}
```

### Issue 4: Rate Limits Hit

**Problem**: Testing too aggressively.

**Solution**:
1. Wait 1-2 minutes between tests
2. Use Haiku model (cheaper tier)
3. Set `NODE_ENV=development` for automatic optimization

---

## Cost Optimization Strategy

Here's my development setup that saves 95% on costs:

**.env file:**
```bash
NODE_ENV=development  # Automatically uses cheaper settings
```

**Development mode automatically:**
- Uses Haiku 4.5 (not Sonnet/Opus)
- Limits iterations to 5 (not 20-40)
- Uses 'quick' depth (not 'comprehensive')

**Cost comparison** (company research example):

| Mode | Model | Iterations | Cost |
|------|-------|------------|------|
| Production | Opus 4.1 | 40 | $0.50-1.00 |
| Development | Haiku 4.5 | 5 | $0.01-0.02 |

**Savings: 95-98%** 🎉

---

## The "Aha!" Moments

### Moment 1: It Just Works
No complex middleware, no prompt engineering wizardry. Import, configure, run. It worked the first time.

### Moment 2: True Autonomy
The agent reading `package.json` without being told the path or how to parse JSON—that's when I understood "autonomous."

### Moment 3: Real-Time Information
Watching the agent search for League of Legends Worlds 2025 and return current, accurate data—that's when I saw the potential.

### Moment 4: Tool Composition
Realizing I could give an agent BOTH file access AND web search, and it would decide which to use based on the task—mind-blowing.

---

## What I Built in 4 Days

Starting from zero knowledge of agent development, I built:

1. ✅ **Basic conversation agent** (Day 1)
2. ✅ **File reading agent** (Day 2-3)
3. ✅ **Web search agent** (Day 4)
4. ✅ **Modular CLI** with three modes
5. ✅ **Permission system** for web access
6. ✅ **Cost optimization** strategy
7. ✅ **Documentation** (CLAUDE.md)
8. ✅ **Learning plan** tracking

**Line count**: ~200 lines of TypeScript
**Investment**: 4 days, ~$2 in API costs
**Skills gained**: Agent architecture, tool usage, async patterns

---

## Next Steps in My Journey

I'm now ready for:

### Week 2: Research Agent Development
- Progressive search patterns
- Multi-document analysis
- Citation tracking
- Information synthesis

### Week 3: Pre-Sales Agent
- CRM integration via MCP
- Competitive intelligence
- Proposal generation
- Document automation

### Week 4: Advanced Features
- Subagents and delegation
- Memory management
- Production patterns
- Performance optimization

---

## Code Repository

All the code from this journey is available on GitHub:
**Repository**: [phoenix-os-cockpit](https://github.com/kapilvirenahuja/phoenix-os-cockpit)

Key files:
- `examples/hello-world-agent.ts` - The three agents (basic, tools, search)
- `CLAUDE.md` - Project documentation
- `docs/LEARNING-PLAN.md` - 6-week learning roadmap

---

## For Developers Starting Their Journey

If you're just starting with AI agents, here's my advice:

### 1. Start with the Basics
Don't skip "Hello World." Understanding the core loop is essential.

### 2. Use Development Mode
Set `NODE_ENV=development` and test fearlessly without cost worries.

### 3. Follow the Progression
```
Conversation → File Tools → Web Search → Combine
```

### 4. Read the Errors
Agents tell you what they need. `error_max_turns`? Add more turns. Permission denied? Check settings.

### 5. Experiment Freely
The best way to learn is to modify prompts, add tools, and see what happens.

### 6. Track Your Progress
Use a learning plan. Document your journey. It helps retention and provides reference.

---

## Practical Patterns to Copy

### Pattern 1: The Basic Query
```typescript
for await (const message of query({ prompt, options })) {
  if (message.type === "assistant") {
    // Handle response
  }
}
```

### Pattern 2: Message Extraction
```typescript
const msg = (message as any).message;
const textContent = msg?.content?.find(c => c.type === 'text');
const text = textContent?.text || '';
```

### Pattern 3: Error Handling
```typescript
try {
  // Agent logic
} catch (error) {
  console.error("Error:", error);
  // Fallback behavior
}
```

### Pattern 4: Cost-Effective Testing
```typescript
const model = process.env.NODE_ENV === 'development'
  ? 'claude-haiku-4-5-20251001'
  : 'claude-sonnet-4-5-20250929';
```

---

## Resources That Helped Me

### Official Documentation
- [Claude Agent SDK Docs](https://docs.claude.com/en/api/agent-sdk/overview)
- [Migration Guide](https://docs.claude.com/en/docs/claude-code/sdk/migration-guide)

### Community
- Claude Developers Discord
- [Awesome Subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)

### My Learning Plan
- 6-week structured curriculum
- Progressive complexity
- Practical projects
- Available in my repo

---

## Conclusion: The Journey Continues

Four days ago, I knew nothing about building AI agents. Today, I have working agents that can:
- Converse naturally
- Read and analyze files
- Search the web for real-time information
- Make autonomous decisions about tool usage

The Claude Agent SDK made this accessible. No PhD required, no complex infrastructure, no weeks of setup.

**The key insight**: Agents aren't just smarter APIs. They're autonomous systems that combine reasoning with tool use. You provide the tools and goals; they figure out the how.

**What's next**: I'm now building specialized research and pre-sales agents. In a few weeks, I'll have a system that can automate company research, competitive analysis, and proposal generation.

The future of software is agentic. And that future is accessible today.

---

## Running the Code

Want to try it yourself?

```bash
# Clone the repo
git clone https://github.com/kapilvirenahuja/phoenix-os-cockpit.git
cd phoenix-os-cockpit

# Install dependencies
npm install

# Set up your API key
cp .env.example .env
# Add your ANTHROPIC_API_KEY

# Run the agents
npm run hello          # Basic conversation
npm run hello tools    # File reading
npm run hello search   # Web search
```

**Start building. The agents are waiting.**

---

## About This Journey

This blog post documents my actual learning journey through November 2025, building AI agents with the Claude Agent SDK. All code is real, all examples actually ran, and all insights came from hands-on development.

**Follow my progress**: [GitHub Repository](https://github.com/kapilvirenahuja/phoenix-os-cockpit)

**Questions?** Open an issue in the repo. I'm learning too, and we can figure it out together.

---

*Published: November 2025*
*Tech Stack: Claude Agent SDK, TypeScript, Node.js*
*Learning Phase: 1 of 6 (Foundation)*
