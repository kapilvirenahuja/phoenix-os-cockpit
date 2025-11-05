# How to Run the Research Agent

## ✅ Your Setup Status
- **API Key**: Configured ✓
- **Models**: Updated to Claude 4.x series ✓
- **Whitelisted Domains**: Medium, McKinsey, Gartner, Forrester, Reddit, BuiltWith + more
- **MCP Servers**: Disabled (as requested)

## 🚀 Quick Start

### 1. Simple Test (Verify Everything Works)
```bash
cd ../phoenix-os-cockpit
npx tsx test-agent.ts
```

### 2. Interactive Menu
```bash
./run-research.sh
```
Then choose:
- 1: Test connection
- 2: Research a company
- 3: Analyze market/industry
- 4: Competitive analysis
- 5: Custom research

## 📊 Research Commands

### Research a Company
```bash
# Basic company research
npm run research company "Apple Inc"

# Or specific companies
npm run research company "OpenAI"
npm run research company "Microsoft"
npm run research company "Tesla"
```

### Analyze a Market
```bash
# Market/Industry analysis
npm run research market "Artificial Intelligence"
npm run research market "Electric Vehicles"
npm run research market "Cloud Computing"
npm run research market "Cybersecurity"
```

### Competitive Analysis
```bash
# Compare companies
npm run research competitive "OpenAI" "Anthropic" "Google DeepMind"
npm run research competitive "Apple" "Samsung" "Google"
```

## 🎯 Direct Usage Examples

### Using the Main Agent
```bash
# Ask any research question
npx tsx src/index.ts "What are the latest trends in AI?"
npx tsx src/index.ts "Research the history and impact of cloud computing"
```

### Custom Research Query
```bash
# Deep research on any topic
npx tsx src/index.ts "Provide a comprehensive analysis of the SaaS market including key players, trends, and future outlook"
```

## ⚙️ Configuration Options

The research agent supports three depth levels:

### Quick Research (Haiku 4.5)
- Fast, cost-effective
- 3-5 key points
- Best for quick overviews

### Standard Research (Sonnet 4.5)
- Balanced depth and speed
- 5-10 key findings
- Recommended for most uses

### Comprehensive Research (Opus 4.1)
- Deep, exhaustive analysis
- Multiple perspectives
- Best for critical decisions

## 📝 Output

Research reports are saved to:
- Console output (immediate viewing)
- `./reports/` directory (if configured)
- Format: Markdown with citations

## 💡 Tips

1. **Start with Haiku** for testing (cheapest)
2. **Use specific company/market names** for better results
3. **Reports include citations** from whitelisted sources
4. **Check your token usage** periodically

## 🔍 Trusted Sources

Your research will prioritize these domains:
- McKinsey, Gartner, Forrester (consulting)
- TechCrunch, Reuters, Bloomberg (news)
- Medium, Reddit (community insights)
- BuiltWith (tech stack analysis)
- HBR, MIT, Stanford (academic)

## 🛠️ Troubleshooting

### If you see "undefined" in output:
The Agent SDK is initializing. Try running the command again.

### If you get API errors:
1. Check your API key is correct
2. Verify you have credits in your account
3. Check rate limits

### To reduce debug output:
Add `2>/dev/null` to commands:
```bash
npm run research company "Apple" 2>/dev/null
```

## 📈 Cost Estimates

Per research task (approximate):
- **Quick**: ~$0.01-0.02
- **Standard**: ~$0.05-0.10
- **Comprehensive**: ~$0.20-0.50

## 🎓 Next Steps

1. Start with company research (easier)
2. Try market analysis
3. Experiment with competitive analysis
4. Customize the agent for your needs

Ready to research! 🚀