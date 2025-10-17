# Stock Analyst Agent

AI-powered stock analysis agent built with Claude Agent SDK and Alpha Vantage API.

## 🎯 Current Status: Phase 2 Core Subagents Complete ✅

**Phase 2 Deliverables:**
- ✅ Extended Alpha Vantage client with financial metrics & technical indicators
- ✅ Finance Tools MCP server with 3 tools:
  - `get_stock_price` - Real-time quotes
  - `get_financial_metrics` - P/E, market cap, EPS, margins, ROE, etc.
  - `calculate_technical_indicators` - SMA(50/200), RSI, MACD
- ✅ **Subagent delegation:**
  - `fundamental-analyst` - Expert in company fundamentals & valuation
  - `technical-analyst` - Expert in price trends & technical indicators
- ✅ Main coordinating agent with intelligent subagent delegation
- ✅ Permission bypass for automatic tool calls

**What works:** Ask "Should I buy AAPL?" and the agent delegates to both fundamental and technical analysts for comprehensive analysis!

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

**Basic Query:**
```
🤖 Stock Analyst Agent v0.2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ New: Subagent delegation for fundamental & technical analysis

💬 You: What is the price of AAPL?

🤔 Analyzing...

📈 **AAPL** - Stock Quote
**Price:** $247.66 | **Change:** +$2.39 (+0.97%)
...

💰 Total cost: $0.0042
```

**Advanced Query with Subagents:**
```
💬 You: Should I buy AAPL? Give me fundamental and technical analysis.

🤔 Analyzing...

[Agent delegates to fundamental-analyst]
📊 **Apple Inc. (AAPL)** - Financial Metrics
- Market Cap: $3.85T
- P/E Ratio: 31.5
- ROE: 147.4%
...

[Agent delegates to technical-analyst]
📈 **AAPL** - Technical Indicators
- RSI(14): 58.3 (Neutral)
- SMA(50): $235.12
- MACD: Bullish 📈
...

💰 Total cost: $0.0156
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
- 3 endpoints: GLOBAL_QUOTE, OVERVIEW, SMA/RSI/MACD
- 5-minute in-memory cache (separate caches per endpoint)
- Rate limiting: 12s delay between calls (respects 5 calls/min limit)
- Retry logic with exponential backoff (3 retries)
- Type-safe responses with comprehensive TypeScript types

**File:** [src/tools/api/alpha-vantage.ts](src/tools/api/alpha-vantage.ts)

### Finance Tools MCP Server (v0.2.0)

**3 Tools:**

1. **`get_stock_price`**
   - Real-time quotes with price, change%, volume, daily range

2. **`get_financial_metrics`** (NEW)
   - Valuation: Market cap, P/E, PEG, Beta
   - Profitability: EPS, ROE, ROA, profit margins
   - Performance: 52-week high/low, analyst targets

3. **`calculate_technical_indicators`** (NEW)
   - Moving averages: SMA(50), SMA(200)
   - Momentum: RSI(14) with overbought/oversold signals
   - Trend: MACD with bullish/bearish signals

**File:** [src/tools/finance-tools.ts](src/tools/finance-tools.ts)

### Subagent System

**Coordinating Agent:**
- Delegates to specialized subagents based on query type
- Synthesizes insights from multiple analysts
- Provides comprehensive, actionable recommendations

**2 Specialist Subagents:**

1. **fundamental-analyst**
   - Expert in company fundamentals & valuation
   - Tools: get_financial_metrics, get_stock_price
   - Focus: P/E ratios, financial health, growth potential

2. **technical-analyst**
   - Expert in price trends & technical indicators
   - Tools: calculate_technical_indicators, get_stock_price
   - Focus: RSI, MACD, moving averages, trading signals

**Files:**
- [src/agent/main-agent.ts](src/agent/main-agent.ts) - Coordinator
- [src/agent/subagents.ts](src/agent/subagents.ts) - Subagent configs

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
