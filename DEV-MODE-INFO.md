# Development Mode Optimization

## 🎯 What's Changed

The research agent now automatically detects when running in development mode (`NODE_ENV=development`) and uses cost-optimized settings for testing.

## ⚡ Dev Mode Settings

When `NODE_ENV=development` (which is currently set in your `.env` file):

| Setting | Production | Development | Savings |
|---------|------------|-------------|---------|
| **Model** | Auto (Sonnet/Opus) | Haiku 4.5 only | ~95% cost reduction |
| **Depth** | As requested | Always 'quick' | Faster results |
| **Iterations** | 10-40 | Max 5 | 50-87% fewer API calls |
| **Output** | As requested | Summary format | Shorter responses |

## 💰 Cost Comparison

### Example: Company Research

**Production Mode** (comprehensive):
- Model: Opus 4.1
- Iterations: 40
- Estimated cost: $0.50-1.00

**Development Mode**:
- Model: Haiku 4.5
- Iterations: 5
- Estimated cost: $0.01-0.02

**Savings: ~95-98%** 🎉

## 🚀 How to Use

### In Development (current):
```bash
# Automatically uses dev mode settings
npm run research company "Apple Inc"

# You'll see this message:
# ⚠️  Development Mode: Using Haiku model with quick depth for cost-effective testing
```

### In Production:
```bash
# Set NODE_ENV to production
NODE_ENV=production npm run research company "Apple Inc"

# Or update .env file:
# NODE_ENV=production
```

## 🧪 Testing Commands

### Quick Test
```bash
# Test dev mode is working
npx tsx test-dev-mode.ts
```

### Company Research (Dev Mode)
```bash
npm run research company "OpenAI"
# Uses: Haiku, 5 iterations, quick depth
```

### Market Analysis (Dev Mode)
```bash
npm run research market "AI"
# Uses: Haiku, 5 iterations, quick depth
```

## 📊 What You See in Dev Mode

1. **Console Output**:
   ```
   ⚠️  Development Mode: Using Haiku model with quick depth for cost-effective testing
   🧪 DEV MODE ACTIVE - Using cost-optimized settings
   🔍 Research topic: [your topic]
   ⚡ Model: Haiku 4.5 (fastest/cheapest)
   📊 Depth: quick (5 iterations max)
   ```

2. **Report Header**:
   ```
   RESEARCH REPORT [DEV MODE - LIMITED DEPTH]
   Model: Haiku 4.5 (Dev Mode)
   ```

## ✅ Benefits

1. **Cost Savings**: 95%+ reduction in API costs during development
2. **Faster Testing**: Results in 5-10 seconds vs 30-60 seconds
3. **Safe Experimentation**: Test freely without worrying about costs
4. **Automatic**: No need to remember to change settings

## 🔄 Switching Modes

### For Testing (Dev Mode):
```bash
# Already set in .env
NODE_ENV=development
```

### For Production:
```bash
# Option 1: Inline
NODE_ENV=production npm run research company "Tesla"

# Option 2: Update .env
# Change NODE_ENV=development to NODE_ENV=production
```

## 📝 Note

Development mode is perfect for:
- Testing your setup
- Learning the system
- Debugging issues
- Quick prototypes

For production-quality research with deep analysis, switch to production mode.