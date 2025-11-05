# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Phoenix OS Cockpit is a TypeScript-based application that leverages the Anthropic Claude Agent SDK to create autonomous AI agents for pre-sales and research automation. The project focuses on building specialized agents that can gather, analyze, and synthesize information from multiple sources.

## Common Development Commands

```bash
# Development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm build

# Type checking only (no build)
npm run type-check

# Clean build artifacts
npm run clean

# Run research agent examples
npm run research company "Company Name"
npm run research market "Market Topic"
npm run research competitive "Company1" "Company2"

# Run presales agent example
npm run presales

# Interactive shell menu
./run-research.sh
```

## Development Mode Optimization

The project includes **automatic cost optimization** for development:

- **Activation**: When `NODE_ENV=development` (set in `.env`), agents automatically use cheaper models and reduced iterations
- **Settings**:
  - Model: Haiku 4.5 (vs. Sonnet/Opus in production)
  - Depth: Always 'quick' (vs. as-requested)
  - Max iterations: 5 (vs. 10-40)
  - Estimated cost savings: **95%+**

To use production settings: `NODE_ENV=production npm run [command]`

See `DEV-MODE-INFO.md` for detailed cost comparisons.

## Architecture & Key Concepts

### Core Agent Types

1. **ResearchAgent** (`examples/research-agent.ts`)
   - Performs web searches and information synthesis
   - Configurable depth: 'quick', 'standard', 'comprehensive'
   - Supports different output formats: 'summary', 'detailed', 'executive'
   - Uses WebSearch, WebFetch, Read, Write, Grep tools
   - Development mode forces 'quick' depth and 'summary' format

2. **PresalesAgent** (`examples/presales-agent.ts`)
   - Specialized for pre-sales workflows
   - Handles proposal generation and competitive intelligence

3. **MainAgent** (`src/index.ts`)
   - Accepts free-form prompts from command line
   - Used as a general-purpose agent with limited tool set (Read, Write, Glob, Grep)

### Agent Configuration Pattern

Agents inherit from a base configuration that accepts:
- `prompt`: Input question or task
- `options.model`: Model selection (current: claude-sonnet-4-5-20250929)
- `options.systemPrompt`: Custom system instructions
- `options.allowedTools`: Array of tools the agent can use
- `options.maxTurns`: Conversation limit to prevent runaway costs
- `options.settingSources`: Configuration sources ('project', 'user')

Development mode automatically overrides model and depth settings at runtime.

### Tool Availability

The project leverages Anthropic's tool ecosystem:
- **Web Tools**: WebSearch, WebFetch
- **File Tools**: Read, Write, Glob, Grep
- **Memory/State**: Context persistence between tool calls

## Project Structure

```
src/
└── index.ts              # Main entry point (general-purpose agent)

examples/
├── research-agent.ts     # Specialized research agent implementation
└── presales-agent.ts     # Pre-sales workflow agent

config/                   # Configuration files
tests/                    # Test suite directory
docs/                     # Documentation
```

## Key Files for Understanding

- **README.md**: High-level feature overview and setup instructions
- **HOW-TO-RUN.md**: Detailed examples and command reference
- **DEV-MODE-INFO.md**: Cost optimization and development workflow details
- **package.json**: Dependencies, scripts, and project metadata
- **tsconfig.json**: Strict TypeScript configuration with source maps and type checking enabled

## Model Selection

The project targets Claude 4.x series models:
- **Haiku 4.5**: Development/testing (fastest, cheapest)
- **Sonnet 4.5**: Balanced general use
- **Opus 4.1**: Deep analysis/complex tasks

Development mode automatically selects Haiku 4.5 regardless of configuration.

## Dependencies

- **@anthropic-ai/claude-agent-sdk**: Core agent framework
- **dotenv**: Environment variable loading
- **zod**: Data validation (available for schema definition)
- **tsx**: TypeScript execution for development
- **typescript**: Language and compiler

## TypeScript Configuration

Strict mode enabled with:
- No unused locals/parameters
- Implicit returns enforced
- Source maps for debugging
- Declaration files generated

## Environment Setup

Required environment variables (see `.env.example`):
- `ANTHROPIC_API_KEY`: Claude API credentials
- `NODE_ENV`: Set to 'development' for cost-optimized testing

## Development Notes

1. **Cost Management**: Always use development mode during testing. Switch to production mode only for final quality research
2. **Iteration Limits**: maxTurns is set to prevent runaway API costs; adjust based on complexity
3. **Tool Limitations**: Only whitelisted tools are available to agents; add to `allowedTools` as needed
4. **System Prompts**: Customize agent behavior through systemPrompt; consider depth/model when designing prompts
5. **Research Commands**: The research agent supports piped arguments for topic, depth, and output format
