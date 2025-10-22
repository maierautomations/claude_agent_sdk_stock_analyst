# Stock Analyst Agent

AI-powered stock analysis agent built with Claude Agent SDK and Alpha Vantage API.

## 🎯 Current Status: Phase 3 Complete ✅

**Version:** v0.3.0

**Phase 3 Deliverables:**
- ✅ Extended Finance Tools MCP server to **5 tools**:
  - `get_stock_price` - Real-time quotes
  - `get_financial_metrics` - P/E, market cap, EPS, margins, ROE, beta
  - `calculate_technical_indicators` - SMA(50/200), RSI, MACD
  - `analyze_news_sentiment` - Recent news with sentiment analysis
  - `compare_stocks` - Side-by-side comparison of 2-5 stocks
- ✅ **4 Specialized Subagents:**
  - `fundamental-analyst` - Expert in company fundamentals & valuation
  - `technical-analyst` - Expert in price trends & technical indicators
  - `sentiment-analyst` - Expert in news sentiment & market psychology
  - `risk-analyst` - Expert in volatility & risk assessment
- ✅ News API integration with keyword-based sentiment analysis
- ✅ Multi-stock comparison with parallel fetching
- ✅ Request deduplication for parallel API calls
- ✅ Enhanced caching strategy (5min for prices, 15min for news)

**What works:** Ask "Should I buy Tesla? Give me a complete analysis with fundamentals, technicals, sentiment, and risk." and the agent delegates to all 4 specialized analysts for comprehensive multi-perspective analysis!

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 20+
- Alpha Vantage API key ([Get free key](https://www.alphavantage.co/support/#api-key))
- Anthropic API key ([Get key](https://console.anthropic.com/settings/keys))
- News API key ([Get free key](https://newsapi.org/register))

### 2. Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your API keys:
#   ANTHROPIC_API_KEY=your_key_here
#   ALPHA_VANTAGE_API_KEY=your_key_here
#   NEWS_API_KEY=your_key_here
```

### 3. Run

```bash
# Build TypeScript
npm run build

# Start the interactive agent
npm start
```

### 4. Example Usage

**Basic Query:**
```
🤖 Stock Analyst Agent v0.3.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ New: 4 specialized analysts (fundamental, technical, sentiment, risk)
📊 Tools: Stock quotes, financials, indicators, news, comparisons

💬 You: What is the price of AAPL?

🤔 Analyzing...

📈 **AAPL** - Stock Quote
**Price:** $247.66 | **Change:** +$2.39 (+0.97%)
...

💰 Query cost: $0.0042
```

**Advanced Multi-Subagent Query:**
```
💬 You: Should I buy Tesla? Give me a complete analysis with fundamentals, technicals, sentiment, and risk.

🤔 Analyzing...

[Agent delegates to fundamental-analyst]
📊 **Tesla Inc. (TSLA)** - Financial Metrics
- Market Cap: $1.12T
- P/E Ratio: 68.5
- ROE: 23.4%
...

[Agent delegates to technical-analyst]
📈 **TSLA** - Technical Indicators
- RSI(14): 62.8 (Neutral, slight bullish)
- SMA(50): $285.12 (Above - bullish trend)
- MACD: Bullish 📈
...

[Agent delegates to sentiment-analyst]
📰 **TSLA** - News Sentiment Analysis
- Overall Sentiment: POSITIVE 📈
- Sentiment Score: 0.42 (-1 to 1)
- Recent Headlines:
  1. ✅ Tesla Q4 Earnings Beat Expectations
  2. ✅ Electric Vehicle Sales Surge in 2025
...

[Agent delegates to risk-analyst]
⚠️ **TSLA** - Risk Assessment
- Beta: 2.03 (High volatility - 2x market movements)
- Price Volatility: High
- Downside Risk: Moderate
...

🤖 Agent:
Based on comprehensive analysis from all 4 specialists, here's my recommendation:

**BUY with Caution** - Tesla shows strong fundamentals with growing revenue
and profitability (fundamental analyst). Technical indicators are bullish with
RSI at 62.8 and MACD showing upward momentum (technical analyst). News sentiment
is positive driven by strong Q4 earnings (sentiment analyst). However, high beta
of 2.03 indicates significant volatility risk (risk analyst).

**Recommendation:** Suitable for growth-oriented investors with high risk tolerance.
Consider position sizing to manage volatility risk.

💰 Query cost: $0.0234
```

**Stock Comparison:**
```
💬 You: Compare Apple and Microsoft. Which is the better investment?

🤔 Analyzing...

📊 **Stock Comparison**

| Metric | AAPL | MSFT |
|--------|------|------|
| **Price** | $247.66 | $514.05 |
| **Change %** | +0.97% | +0.60% |
| **Market Cap** | $3.85T | $3.82T |
| **P/E Ratio** | 31.5 | 38.2 |
| **EPS** | $7.86 | $13.46 |
| **Profit Margin** | 25.3% | 35.7% |
| **Beta** | 1.29 | 0.89 |

[Agent synthesizes comparison across all dimensions...]

💰 Query cost: $0.0187
```

---

## 📁 Project Structure

```
claude_agent_sdk/
├── src/
│   ├── agent/
│   │   ├── main-agent.ts          # Main coordinating agent (v0.3)
│   │   └── subagents.ts           # 4 specialized subagent configs
│   ├── tools/
│   │   ├── api/
│   │   │   └── alpha-vantage.ts   # API client with caching & deduplication
│   │   └── finance-tools.ts       # MCP server with 5 tools (v0.3.0)
│   ├── types/
│   │   └── stock-data.ts          # TypeScript type definitions
│   └── index.ts                   # CLI entry point
├── docs/                          # Planning documents
├── ai_docs/                       # Claude Agent SDK documentation
├── .env                           # Environment variables (not in git)
├── package.json
└── tsconfig.json
```

---

## 🛠️ Implementation Details

### Alpha Vantage Client (Enhanced v0.3)

**Features:**
- 5 endpoint types: GLOBAL_QUOTE, OVERVIEW, SMA/RSI/MACD, NEWS (News API)
- Smart caching strategy:
  - Stock prices: 5min cache
  - Financial metrics: 5min cache
  - Technical indicators: 5min cache (individual indicators)
  - News sentiment: 15min cache (less volatile)
- **Request deduplication:** Prevents parallel duplicate API calls
- Rate limiting: 12s delay between Alpha Vantage calls (5 calls/min)
- Retry logic with exponential backoff (3 retries)
- Type-safe responses with comprehensive TypeScript types

**File:** [src/tools/api/alpha-vantage.ts](src/tools/api/alpha-vantage.ts)

### Finance Tools MCP Server (v0.3.0)

**5 Tools:**

1. **`get_stock_price`**
   - Real-time quotes with price, change%, volume, daily range
   - 5-minute cache

2. **`get_financial_metrics`**
   - Valuation: Market cap, P/E, PEG, Beta
   - Profitability: EPS, ROE, ROA, profit margins
   - Performance: 52-week high/low, analyst targets

3. **`calculate_technical_indicators`**
   - Moving averages: SMA(50), SMA(200)
   - Momentum: RSI(14) with overbought/oversold signals
   - Trend: MACD with bullish/bearish signals

4. **`analyze_news_sentiment`** (NEW in v0.3)
   - Fetches recent news articles (10-20 articles)
   - Keyword-based sentiment analysis (14 positive, 13 negative keywords)
   - Overall sentiment score (-1 to 1 range)
   - Shows top 5 headlines with sources

5. **`compare_stocks`** (NEW in v0.3)
   - Side-by-side comparison of 2-5 stocks
   - Parallel fetching for performance
   - 7 key metrics in markdown table format
   - Graceful handling of missing data

**File:** [src/tools/finance-tools.ts](src/tools/finance-tools.ts)

### Subagent System (4 Specialists)

**Coordinating Agent:**
- Delegates to specialized subagents based on query type
- Synthesizes insights from multiple analysts
- Provides comprehensive, actionable recommendations

**4 Specialist Subagents:**

1. **fundamental-analyst** (Sonnet)
   - Expert in company fundamentals & valuation
   - Tools: get_financial_metrics, get_stock_price
   - Focus: P/E ratios, financial health, growth potential

2. **technical-analyst** (Sonnet)
   - Expert in price trends & technical indicators
   - Tools: calculate_technical_indicators, get_stock_price
   - Focus: RSI, MACD, moving averages, trading signals

3. **sentiment-analyst** (Haiku - fast & cheap)
   - Expert in news sentiment & market psychology
   - Tools: analyze_news_sentiment, get_stock_price
   - Focus: News impact, media narratives, investor psychology

4. **risk-analyst** (Sonnet)
   - Expert in volatility & risk assessment
   - Tools: All 4 tools (indicators, metrics, price, compare)
   - Focus: Beta, volatility, downside risk, portfolio risk

**Files:**
- [src/agent/main-agent.ts](src/agent/main-agent.ts) - Coordinator
- [src/agent/subagents.ts](src/agent/subagents.ts) - Subagent configs

---

## 🔑 API Keys & Rate Limits

### Alpha Vantage (Free Tier)
- **Rate Limit:** 5 API calls per minute, 500 per day
- **Mitigation:** 5-minute cache + 12s delay + request deduplication
- **Get Key:** https://www.alphavantage.co/support/#api-key

### News API (Free Tier)
- **Rate Limit:** 100 requests per day
- **Mitigation:** 15-minute cache for news sentiment
- **Get Key:** https://newsapi.org/register

### Anthropic Claude
- **Models:**
  - Sonnet (main agent, fundamental, technical, risk analysts)
  - Haiku (sentiment analyst - faster & cheaper)
- **Cost:** ~$0.015-0.025 per comprehensive query (varies by complexity)
- **Get Key:** https://console.anthropic.com/settings/keys

---

## 📊 Testing the Agent

### Test Prompts by Complexity:

**Level 1: Single Tool (Basic)**
```
What is the price of AAPL?
Show me Tesla's financial metrics
What are the technical indicators for Nvidia?
```

**Level 2: Single Subagent (Intermediate)**
```
Is Apple undervalued based on fundamentals?
What do the technical indicators say about Tesla?
What is the market sentiment for Microsoft?
How risky is Nvidia as an investment?
```

**Level 3: Multi-Subagent (Advanced)**
```
Should I buy Tesla? Analyze fundamentals, technicals, sentiment, and risk.
Compare Apple and Microsoft. Which is the better investment?
```

**Level 4: Complex Analysis (Comprehensive)**
```
I want to invest $10,000. Should I put it in AAPL or split between AAPL and MSFT?
Analyze NVDA, AMD, and INTL. Which semiconductor stock is the best buy?
Compare the risk profiles of Tesla, Ford, and GM
```

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation MVP (COMPLETE)
- Alpha Vantage client with caching & retry
- Basic `get_stock_price` tool
- Interactive CLI agent
- Cost tracking

### ✅ Phase 2: Core Subagents (COMPLETE)
- Added `get_financial_metrics` and `calculate_technical_indicators` tools
- Implemented 2 subagents: fundamental-analyst, technical-analyst
- Request deduplication for parallel API calls
- Individual indicator caching

### ✅ Phase 3: Enhanced Features (COMPLETE)
- Added `analyze_news_sentiment` and `compare_stocks` tools
- Implemented 2 more subagents: sentiment-analyst, risk-analyst
- News API integration with keyword-based sentiment analysis
- Parallel stock comparison
- Enhanced caching strategy (5min/15min TTL)

### 🚧 Phase 4: Polish (NEXT)
- Enhanced cost tracking (breakdown by subagent)
- Session management (conversation history)
- Unit tests with Vitest
- Integration tests for API clients
- Comprehensive documentation
- Performance optimization

### 📅 Future: Web Application
- Next.js + React frontend
- Express.js backend API
- PostgreSQL database
- Portfolio management
- User authentication
- Agent integration with portfolio access

See [docs/web-app-architektur.md](docs/web-app-architektur.md) for web UI specifications.

---

## 🏗️ Technical Highlights

### Request Deduplication Pattern
```typescript
const inflightRequests = new Map<string, Promise<any>>();

const existingRequest = inflightRequests.get(cacheKey);
if (existingRequest) {
  return await existingRequest;  // Wait for in-flight request
}

const fetchPromise = (async () => {
  try {
    // Fetch logic
  } finally {
    inflightRequests.delete(cacheKey);
  }
})();

inflightRequests.set(cacheKey, fetchPromise);
return await fetchPromise;
```

**Benefit:** When both fundamental and technical analysts request the same stock price simultaneously, only one API call is made.

### Sentiment Analysis (Keyword-Based)
```typescript
// 14 positive keywords: surge, gain, profit, growth, bullish...
// 13 negative keywords: loss, decline, weak, bearish...
// Score normalized to -1 to 1 range
```

**Future Enhancement:** Can be upgraded to ML-based sentiment or Claude-based analysis.

### Parallel Stock Comparison
```typescript
await Promise.all(
  symbols.map(async (symbol) => {
    const [quote, financial] = await Promise.all([
      fetchStockQuote(symbol),
      fetchFinancialMetrics(symbol)
    ]);
    // Process...
  })
);
```

**Benefit:** Comparing 5 stocks fetches data in parallel rather than sequentially.

---

## 🤝 Contributing

This is a learning project based on the Claude Agent SDK. See [docs/mvp-implementation-plan.md](docs/mvp-implementation-plan.md) for detailed implementation notes and [CLAUDE.md](CLAUDE.md) for comprehensive codebase documentation.

---

## 📝 License

ISC

---

## 🔗 Resources

- [Claude Agent SDK Documentation](https://docs.claude.com/en/api/agent-sdk/overview)
- [Alpha Vantage API Docs](https://www.alphavantage.co/documentation/)
- [News API Documentation](https://newsapi.org/docs)
- [Project Planning Docs](docs/)
- [Agent SDK Reference](ai_docs/)
- [Codebase Guide (CLAUDE.md)](CLAUDE.md)

---

## 🎓 Learning Outcomes

This project demonstrates:

1. **Claude Agent SDK** - Building multi-agent systems with subagent delegation
2. **MCP Tools** - Creating custom tools with Zod schema validation
3. **API Integration** - Working with financial APIs, caching, rate limiting
4. **TypeScript** - Type-safe agent configurations and data structures
5. **Async Patterns** - Request deduplication, parallel fetching, retry logic
6. **Agent Design** - Coordinating multiple specialized agents for comprehensive analysis

Built as a practical implementation of the [Claude Agent SDK MVP Plan](docs/mvp-implementation-plan.md).