# Phoenix OS Cockpit

A TypeScript-based application leveraging Claude's Agent SDK to build intelligent pre-sales and research agents.

## Overview

Phoenix OS Cockpit is designed to create autonomous AI agents for business intelligence, competitive research, and pre-sales automation using Anthropic's Claude Agent SDK.

## Features

- **Research Agents**: Automated web research, document analysis, and information synthesis
- **Pre-Sales Agents**: CRM integration, proposal generation, and competitive intelligence
- **Multi-Agent Orchestration**: Coordinate multiple specialized agents for complex workflows
- **Memory Management**: Persistent context and knowledge base management

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **AI Framework**: Claude Agent SDK (@anthropic-ai/claude-agent-sdk)
- **Models**: Claude Haiku 4.5 / Claude Sonnet 4.5 / Claude Opus 4.1

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run the agent
npm run start
```

## Project Structure

```
phoenix-os-cockpit/
├── src/
│   ├── agents/        # Agent definitions
│   ├── tools/         # Custom tools
│   ├── memory/        # Memory management
│   └── workflows/     # Multi-agent workflows
├── config/            # Configuration files
├── tests/             # Test suites
└── docs/              # Documentation
```

## License

MIT

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.