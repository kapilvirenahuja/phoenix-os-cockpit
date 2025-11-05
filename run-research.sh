#!/bin/bash

# Phoenix OS Cockpit - Research Agent Runner
# This script helps you run the research agent easily

echo "🚀 Phoenix OS Cockpit - Research Agent"
echo "======================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your ANTHROPIC_API_KEY"
    echo "   Get your key from: https://console.anthropic.com"
    exit 1
fi

# Check if API key is set
if grep -q "your_api_key_here" .env; then
    echo "❌ API Key not configured!"
    echo ""
    echo "Please:"
    echo "1. Get your API key from https://console.anthropic.com"
    echo "2. Edit the .env file"
    echo "3. Replace 'your_api_key_here' with your actual API key"
    echo ""
    echo "Example:"
    echo "  ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx"
    exit 1
fi

# Display menu
echo "Choose an option:"
echo "1. Test connection (quick & cheap)"
echo "2. Research a company"
echo "3. Analyze a market/industry"
echo "4. Competitive analysis"
echo "5. Custom research query"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "🧪 Testing agent connection..."
        npx tsx test-agent.ts
        ;;
    2)
        read -p "Enter company name: " company
        echo "🔍 Researching $company..."
        npx tsx examples/research-agent.ts company "$company"
        ;;
    3)
        read -p "Enter market/industry: " market
        echo "📊 Analyzing $market market..."
        npx tsx examples/research-agent.ts market "$market"
        ;;
    4)
        read -p "Enter your company name: " ourcompany
        read -p "Enter competitor names (comma-separated): " competitors
        echo "⚔️ Running competitive analysis..."
        npx tsx examples/research-agent.ts competitive "$ourcompany" $competitors
        ;;
    5)
        read -p "Enter your research query: " query
        echo "🔬 Researching: $query"
        npx tsx src/index.ts "Research the following topic comprehensively: $query"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac