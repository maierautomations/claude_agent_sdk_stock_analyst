# Stock Analyst Agent

AI-powered stock analysis agent built with Claude Agent SDK and Alpha Vantage API.

## 🎯 Current Status: Phase 1 MVP Complete ✅

**Phase 1 Deliverables:**
- ✅ Alpha Vantage API client with caching (5min TTL) and rate limiting (5 calls/min)
- ✅ Finance Tools MCP server with `get_stock_price` tool
- ✅ Main agent with cost tracking
- ✅ Interactive CLI interface

**What works:** Ask "What is the price of AAPL?" and get a real-time response!

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 20+
- Alpha Vantage API key ([Get free key](https://www.alphavantage.co/support/#api-key))
- Anthropic API key ([Get key](https://console.anthropic.com/settings/keys))

### 2. Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your API keys:
#   ANTHROPIC_API_KEY=your_key_here
#   ALPHA_VANTAGE_API_KEY=your_key_here
```

### 3. Run

```bash
# Start the interactive agent
npm run dev

# Test the Alpha Vantage client
npm run test:api

# Type check
npm run type-check
```

### 4. Example Usage

```
🤖 Stock Analyst Agent v0.1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ask me about any US stock! (Type "exit" to quit)

💬 You: What is the price of AAPL?

🤔 Analyzing...

📈 **AAPL** - Stock Quote

**Price:** $247.66
**Change:** +$2.39 (+0.97%)

**Daily Range:**
  - Open: $248.76
  - High: $249.45
  - Low: $246.58
  - Previous Close: $245.27

**Volume:** 35,445,621
**Last Updated:** 2025-01-14

💵 Query cost: $0.0042
```

---

## 📁 Project Structure

```
claude_agent_sdk/
├── src/
│   ├── agent/
│   │   └── main-agent.ts          # Main Stock Analyst Agent class
│   ├── tools/
│   │   ├── api/
│   │   │   └── alpha-vantage.ts   # Alpha Vantage API client
│   │   └── finance-tools.ts       # MCP Finance Tools server
│   ├── types/
│   │   └── stock-data.ts          # TypeScript type definitions
│   ├── index.ts                   # CLI entry point
│   └── test-alpha-vantage.ts      # API client tests
├── docs/                          # Planning documents
├── ai_docs/                       # Claude Agent SDK documentation
├── .env                           # Environment variables (not in git)
├── package.json
└── tsconfig.json
```

---

## 🛠️ Implementation Details

### Alpha Vantage Client

**Features:**
- 5-minute in-memory cache (reduces API calls)
- Rate limiting: 12s delay between calls (respects 5 calls/min limit)
- Retry logic with exponential backoff (3 retries)
- Type-safe responses with Zod schemas

**File:** [src/tools/api/alpha-vantage.ts](src/tools/api/alpha-vantage.ts)

### Finance Tools MCP Server

**Tool:** `get_stock_price`
- **Input:** Stock ticker symbol (e.g., AAPL, TSLA, MSFT)
- **Output:** Formatted quote with price, change, volume, daily range
- **Format:** Markdown-formatted text with emojis for visual clarity

**File:** [src/tools/finance-tools.ts](src/tools/finance-tools.ts)

### Main Agent

**Features:**
- Streaming query support (required for MCP tools)
- Real-time cost tracking ($0.003/1K input tokens, $0.015/1K output tokens)
- Automatic message aggregation
- Error handling with graceful degradation

**File:** [src/agent/main-agent.ts](src/agent/main-agent.ts)

---

## 🔑 API Keys & Rate Limits

### Alpha Vantage (Free Tier)
- **Rate Limit:** 5 API calls per minute, 500 per day
- **Mitigation:** 5-minute cache + 12s delay between calls
- **Get Key:** https://www.alphavantage.co/support/#api-key

### Anthropic Claude
- **Model:** Claude Sonnet (default)
- **Cost:** ~$0.003-0.005 per query (varies by complexity)
- **Get Key:** https://console.anthropic.com/settings/keys

---

## 📊 Phase 1 Test Results

```bash
$ npm run test:api

Test 1: Fetching AAPL...
✅ AAPL: $247.66 (+0.97%)

Test 2: Fetching AAPL again (should use cache)...
✅ AAPL (cached): $247.66

Test 3: Fetching MSFT...
✅ MSFT: $514.05 (+0.60%)

Test 4: Fetching invalid symbol...
✅ Correctly handled error

🎉 All tests passed!
```

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation MVP (COMPLETE)
- Alpha Vantage client with caching & retry
- Basic `get_stock_price` tool
- Interactive CLI agent
- Cost tracking

### 🚧 Phase 2: Core Subagents (Next)
- Add 2 more tools:
  - `get_financial_metrics` (P/E, market cap, revenue, etc.)
  - `calculate_technical_indicators` (RSI, MACD, etc.)
- Implement 2 subagents:
  - **Fundamental Analyst** - Company financials
  - **Technical Analyst** - Chart patterns & indicators
- Test delegation between agents

### 📅 Phase 3: Enhanced Features
- Complete toolset (4-5 more tools):
  - News sentiment analysis
  - Portfolio analysis
  - Stock screening
  - Watchlist management
- Add remaining subagents:
  - **Sentiment Analyst** - News & social media
  - **Risk Analyst** - Portfolio risk metrics
- Enhanced error handling
- Response caching

### 🏁 Phase 4: Polish
- Session management (conversation context)
- Comprehensive documentation
- Unit tests
- Performance optimization

---

## 🤝 Contributing

This is a learning project based on the Claude Agent SDK. See [docs/mvp-implementation-plan.md](docs/mvp-implementation-plan.md) for detailed implementation notes.

---

## 📝 License

ISC

---

## 🔗 Resources

- [Claude Agent SDK Documentation](https://docs.claude.com/en/api/agent-sdk/overview)
- [Alpha Vantage API Docs](https://www.alphavantage.co/documentation/)
- [Project Planning Docs](docs/)
- [Agent SDK Reference](ai_docs/)
