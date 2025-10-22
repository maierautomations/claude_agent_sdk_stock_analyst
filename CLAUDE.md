# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a **working Stock Analyst Agent** built with the Claude Agent SDK. The agent analyzes US stocks using real-time financial data, with 4 specialized subagents for different types of analysis (fundamental, technical, sentiment, risk).

**Current Status**: ✅ **Phase 3 Complete** - Fully functional CLI agent with comprehensive analysis capabilities.

**Version**: v0.3.0 (Last Updated: 2025-10-22)

## Implementation Status

### ✅ Phase 1 - Foundation (COMPLETE)
- TypeScript project setup with Claude Agent SDK
- Basic Alpha Vantage API client with caching
- Single tool: `get_stock_price`
- Minimal CLI agent with interactive prompt
- **Deliverable**: Agent answers "What is the price of AAPL?"

### ✅ Phase 2 - Core Subagents (COMPLETE)
- Added `get_financial_metrics` and `calculate_technical_indicators` tools
- Implemented 2 subagents: fundamental-analyst, technical-analyst
- Request deduplication for parallel API calls
- Individual indicator caching (SMA, RSI, MACD)
- **Deliverable**: Agent delegates to specialist subagents

### ✅ Phase 3 - Enhanced Features (COMPLETE)
- Added `analyze_news_sentiment` and `compare_stocks` tools
- Implemented 2 more subagents: sentiment-analyst, risk-analyst
- News API integration with keyword-based sentiment analysis
- Parallel stock comparison for performance
- **Deliverable**: Comprehensive multi-perspective stock analysis

### 🚧 Phase 4 - Polish (PENDING)
- Enhanced cost tracking and reporting
- Session management
- Unit tests with Vitest
- Comprehensive documentation

## Repository Structure

```
claude_agent_sdk/
├── src/                        # Source code (TypeScript)
│   ├── agent/                  # Agent configuration
│   │   ├── main-agent.ts      # Main coordinating agent
│   │   └── subagents.ts       # 4 specialized subagent configs
│   ├── tools/                  # MCP Tools
│   │   ├── api/
│   │   │   └── alpha-vantage.ts    # API client with caching
│   │   └── finance-tools.ts        # MCP tool server (5 tools)
│   ├── types/                  # TypeScript type definitions
│   │   └── stock-data.ts      # All data types
│   └── index.ts               # CLI entry point
├── dist/                       # Compiled JavaScript (generated)
├── ai_docs/                    # Claude Agent SDK reference docs
│   ├── README.md              # List of documentation URLs
│   └── *.md                   # Scraped SDK documentation (auto-generated)
├── docs/                       # Project planning & specifications
│   ├── aktien-analyst-agent-konzept.md        # German: Original concept
│   ├── stock-analyst-implementierungsplan.md  # German: 4-week plan
│   ├── mvp-implementation-plan.md             # English: MVP plan (FOLLOWED)
│   └── web-app-architektur.md                 # German: Future web UI spec
├── .claude/                    # Claude Code configuration
│   ├── agents/                 # Custom agent definitions
│   │   ├── docs-scraper.md    # Documentation scraping agent
│   │   └── research-docs-fetcher.md
│   └── commands/               # Custom slash commands
│       ├── load_ai_docs.md    # Command to refresh SDK docs
│       └── update_claudemd.md # Command to update this file
├── .env                        # API keys (gitignored)
├── package.json                # Node.js dependencies
├── tsconfig.json               # TypeScript configuration
└── README_STOCK_AGENT.md       # User-facing README
```

## Architecture Overview

### Implemented System Design

```
User (CLI) → Main Stock Analyst Agent (v0.3)
                ├─→ Fundamental Analyst (subagent, sonnet)
                │     └─→ get_financial_metrics, get_stock_price
                ├─→ Technical Analyst (subagent, sonnet)
                │     └─→ calculate_technical_indicators, get_stock_price
                ├─→ Sentiment Analyst (subagent, haiku)
                │     └─→ analyze_news_sentiment, get_stock_price
                └─→ Risk Analyst (subagent, sonnet)
                      └─→ All 4 tools (indicators, metrics, price, compare)
                        ↓
                Finance Tools MCP Server (v0.3.0)
                ├─→ get_stock_price
                ├─→ get_financial_metrics
                ├─→ calculate_technical_indicators (SMA, RSI, MACD)
                ├─→ analyze_news_sentiment
                └─→ compare_stocks
                        ↓
                External Finance APIs
                ├─→ Alpha Vantage (stock data, fundamentals, technicals)
                └─→ News API (news articles for sentiment)
```

### Technology Stack

**Core:**
- `@anthropic-ai/claude-agent-sdk` v1.0.0 - Agent framework
- TypeScript 5.x - Type safety and SDK compatibility
- Node.js 20+ - Runtime

**APIs & Libraries:**
- Zod - Schema validation for MCP tools
- Axios - HTTP client for API calls
- dotenv - Environment configuration

**Development:**
- tsx - TypeScript execution
- tsc - TypeScript compiler
- Vitest - Testing framework (not yet implemented)

**External APIs:**
- Alpha Vantage API (free tier: 5 calls/min, 500/day)
- News API (news articles for sentiment analysis)

## Key Implementation Files

### Main Agent System

**[src/agent/main-agent.ts](src/agent/main-agent.ts)**
- `StockAnalystAgent` class - Main coordinating agent
- Delegates to 4 specialized subagents based on query type
- Aggregates insights into comprehensive recommendations
- Tracks token costs per query

**[src/agent/subagents.ts](src/agent/subagents.ts)**
- `fundamental-analyst`: Company fundamentals, valuation metrics (P/E, EPS, ROE)
- `technical-analyst`: Price trends, technical indicators (RSI, MACD, SMA)
- `sentiment-analyst`: News sentiment analysis, market psychology
- `risk-analyst`: Volatility, risk assessment, portfolio risk

### MCP Tools

**[src/tools/finance-tools.ts](src/tools/finance-tools.ts)** - MCP Server v0.3.0
- 5 tools registered with Claude Agent SDK
- Zod schema validation for all tool parameters
- Formatted markdown responses with emojis
- Error handling with graceful failures

**[src/tools/api/alpha-vantage.ts](src/tools/api/alpha-vantage.ts)** - API Client
- `fetchStockQuote()` - Real-time stock prices (5min cache)
- `fetchFinancialMetrics()` - Company fundamentals (5min cache)
- `fetchTechnicalIndicators()` - SMA, RSI, MACD indicators (5min cache)
- `fetchNewsSentiment()` - News articles with sentiment (15min cache)
- `compareStocks()` - Parallel multi-stock comparison
- Request deduplication: Prevents parallel duplicate API calls
- Rate limiting: 12s delay between Alpha Vantage calls
- Retry logic with exponential backoff

### Type Definitions

**[src/types/stock-data.ts](src/types/stock-data.ts)**
- `StockQuote` - Real-time price data
- `FinancialMetrics` - Company fundamentals
- `TechnicalIndicators` - SMA, RSI, MACD data
- `NewsSentiment` - News articles with sentiment scores
- `StockComparison` - Multi-stock comparison metrics
- Alpha Vantage API response types
- News API response types

### CLI Interface

**[src/index.ts](src/index.ts)**
- Interactive readline interface
- Continuous conversation loop
- Cost tracking display after each query
- Error handling and validation

## Development Workflow

### Setup & Installation

```bash
# Install dependencies
npm install

# Create .env file with API keys
echo "ANTHROPIC_API_KEY=your_key" > .env
echo "ALPHA_VANTAGE_API_KEY=your_key" >> .env
echo "NEWS_API_KEY=your_key" >> .env

# Build TypeScript
npm run build

# Start agent
npm start
```

### Development Commands

```bash
npm run build       # Compile TypeScript to dist/
npm start           # Run compiled agent
npm test            # Run tests (not yet implemented)
```

### Testing the Agent

**Start interactive CLI:**
```bash
npm start
```

**Test prompts by complexity:**

1. **Single tool** (basic):
   - "What is the price of AAPL?"
   - "Show me Tesla's financial metrics"

2. **Single subagent** (intermediate):
   - "Is Apple undervalued based on fundamentals?"
   - "What do the technical indicators say about Nvidia?"

3. **Multi-subagent** (advanced):
   - "Should I buy Tesla? Analyze fundamentals, technicals, sentiment, and risk."
   - "Compare Apple and Microsoft. Which is the better investment?"

4. **Complex analysis** (comprehensive):
   - "I want to invest $10,000. Should I put it in AAPL or split between AAPL and MSFT?"
   - "Analyze NVDA, AMD, and INTL. Which semiconductor stock is the best buy?"

## Custom Slash Commands

### `/load_ai_docs`

Refreshes Claude Agent SDK documentation from official sources.

**How it works:**
1. Reads `ai_docs/README.md` for list of documentation URLs
2. Checks existing docs (skips if <24h old, deletes if older)
3. Launches parallel `@agent-docs-scraper` tasks for each URL
4. Saves properly formatted markdown files to `ai_docs/`

**When to use:** When SDK documentation may be outdated (>24h old) or when you need latest API reference.

### `/update_claudemd`

Updates this CLAUDE.md file based on recent git changes.

**How it works:**
1. Analyzes git history and recent commits
2. Detects new files, modified files, and structural changes
3. Updates CLAUDE.md sections accordingly
4. Preserves important existing content

**When to use:** After major implementation milestones or significant codebase changes.

## Custom Agents

### `@agent-docs-scraper`

Specialized agent for fetching and formatting documentation from URLs.

**Tools:** mcp_firecrawl-mcp_firecrawl_scrape, WebFetch, Write, Edit

**Purpose:** Converts web documentation to clean, properly formatted markdown files for offline reference.

## Important Implementation Patterns

### Tool Definition Pattern
```typescript
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

export const financeToolsServer = createSdkMcpServer({
  name: "finance-tools",
  version: "0.3.0",
  tools: [
    tool(
      "get_stock_price",
      "Fetches current stock price",
      {
        symbol: z.string().describe("Stock ticker")
      },
      async (args) => {
        const quote = await fetchStockQuote(args.symbol);
        return {
          content: [{ type: "text", text: formattedResponse }]
        };
      }
    )
  ]
});
```

### Subagent Configuration Pattern
```typescript
export const subagentConfigs = {
  'fundamental-analyst': {
    description: 'Expert in fundamental analysis',
    prompt: 'You are a fundamental analyst...',
    tools: [
      'mcp__finance-tools__get_financial_metrics',
      'mcp__finance-tools__get_stock_price'
    ],
    model: 'sonnet' as const
  }
};
```

### Query Pattern (NO Streaming Input Required)
```typescript
const result = query({
  prompt: userPrompt,
  options: {
    mcpServers: { "finance-tools": financeToolsServer },
    agents: subagentConfigs,
    permissionMode: 'bypassPermissions'
  }
});

for await (const message of result) {
  if (message.type === 'assistant') {
    // Process assistant response
  }
}
```

**Note:** The SDK documentation incorrectly states streaming input is required. It works with simple prompt strings.

### Caching Strategy

**Quote Cache (5min TTL):**
- Stock prices change frequently
- Short TTL ensures relatively fresh data
- Prevents duplicate calls within conversation

**Metrics Cache (5min TTL):**
- Fundamentals don't change intraday
- Individual indicator caching for flexibility

**News Cache (15min TTL):**
- News is less volatile than prices
- Longer TTL acceptable for sentiment analysis

**Request Deduplication:**
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

## Environment Setup

Required API keys (create `.env` file):
```bash
ANTHROPIC_API_KEY=your_claude_api_key        # Required
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key # Required
NEWS_API_KEY=your_news_api_key               # Required for sentiment
```

**Getting API Keys:**
- **Anthropic API**: https://console.anthropic.com/
- **Alpha Vantage**: https://www.alphavantage.co/support/#api-key (free tier)
- **News API**: https://newsapi.org/register (free tier)

## Recent Updates (Updated: 2025-10-22)

### Phase 3 Implementation (Commit: 55d51b1)

**New Features:**
- ✅ News sentiment analysis with keyword-based scoring
- ✅ Multi-stock comparison tool (2-5 stocks)
- ✅ Sentiment analyst subagent (haiku model for speed)
- ✅ Risk analyst subagent (comprehensive risk assessment)

**Technical Details:**
- 428 lines of new TypeScript code
- Keyword-based sentiment: 14 positive words, 13 negative words
- Sentiment score normalized to -1 to 1 range
- Parallel stock fetching in `compareStocks()` for performance
- Graceful error handling for missing comparison data

**Files Changed:**
- `src/types/stock-data.ts` (+52 lines): News and comparison types
- `src/tools/api/alpha-vantage.ts` (+178 lines): News and comparison fetchers
- `src/tools/finance-tools.ts` (+145 lines): 2 new MCP tools
- `src/agent/subagents.ts` (+53 lines): 2 new subagent configs
- `src/agent/main-agent.ts`: Updated system prompt for 4 analysts
- `src/index.ts`: Updated CLI version to v0.3.0

### Phase 2 Implementation (Commit: 91e2d36)

**New Features:**
- ✅ Financial metrics tool (P/E, EPS, ROE, margins, beta)
- ✅ Technical indicators tool (SMA, RSI, MACD)
- ✅ Fundamental analyst subagent
- ✅ Technical analyst subagent
- ✅ Request deduplication for parallel API calls

**Technical Details:**
- 723 lines of new code
- Individual indicator caching for flexibility
- Request deduplication prevents parallel duplicate API calls
- Retry logic with exponential backoff

### Phase 1 Implementation (Commit: 5ec9f5f)

**New Features:**
- ✅ TypeScript project setup
- ✅ Claude Agent SDK integration
- ✅ Basic Alpha Vantage API client
- ✅ Stock quote tool with 5min caching
- ✅ Interactive CLI interface
- ✅ Cost tracking

## Key Technical Decisions

### TypeScript over Python
- Native Claude SDK support (SDK is TypeScript-first)
- Better streaming performance
- Type safety for complex agent configurations
- Easier web integration later (Next.js/React)
- Finance APIs work equally well with both

### Streaming Input Mode
**Discovery:** SDK documentation states streaming input is required for MCP tools, but simple prompt strings work fine:
```typescript
// Documentation says this is required:
async function* streamingInput() {
  yield { type: "user", message: { role: "user", content: prompt } };
}
const result = query(streamingInput(), options);

// But this actually works:
const result = query({ prompt: userPrompt, options });
```

### API Considerations
- **Alpha Vantage free tier**: 5 calls/min, 500/day
- **Caching from day 1**: Essential for rate limits
- **Request deduplication**: Prevents parallel duplicate API calls
- **Retry logic**: Exponential backoff for transient failures
- **Rate limiting**: 12s delay between Alpha Vantage calls

### Subagent Model Selection
- **fundamental-analyst**: sonnet (complex calculations)
- **technical-analyst**: sonnet (technical analysis requires reasoning)
- **sentiment-analyst**: haiku (fast & cheap for keyword analysis)
- **risk-analyst**: sonnet (sophisticated risk calculations)

## Common Pitfalls to Avoid

❌ **Don't:** Try to build everything at once
✅ **Do:** Build incrementally, test each phase

❌ **Don't:** Ignore API rate limits
✅ **Do:** Cache aggressively and implement request deduplication

❌ **Don't:** Skip error handling until later
✅ **Do:** Handle errors from the start (API failures are common)

❌ **Don't:** Forget to track token costs
✅ **Do:** Implement cost tracking (SDK provides this automatically)

❌ **Don't:** Make parallel duplicate API calls
✅ **Do:** Use request deduplication pattern

## Language & Documentation Notes

**Mixed Language Documentation:**
- Core planning docs are in German (aktien-analyst-agent-konzept.md, stock-analyst-implementierungsplan.md, web-app-architektur.md)
- MVP plan is in English (mvp-implementation-plan.md) - **This was followed for implementation**
- AI docs are in English (official SDK documentation)
- **All code is in English** (comments, variables, types, functions)

## Next Steps

### Phase 4 - Polish (Remaining Work)

**Tasks:**
1. ✅ Cost tracking (already implemented via SDK)
2. 🚧 Enhanced cost reporting (detailed breakdown by subagent)
3. 🚧 Session management (conversation history)
4. 🚧 Unit tests with Vitest
5. 🚧 Integration tests for API clients
6. 🚧 Error handling improvements
7. 🚧 Comprehensive README documentation
8. 🚧 Example queries and expected outputs

**Estimated Time**: 2-3 hours

### Future: Web Application Phase

Once Phase 4 is complete, `web-app-architektur.md` provides complete specifications for:
- Next.js + React frontend
- Express.js backend API
- PostgreSQL database schema
- Portfolio management system
- Agent integration (read-only access to user portfolios)
- Complete API reference

**Key principle:** Agent has READ-ONLY access to user portfolios for analysis, cannot modify data.

## AI Documentation (ai_docs/)

**Claude Agent SDK reference documentation** (auto-scraped from official docs):

- `agent-sdk-overview.md` - SDK introduction & key features
- `typescript-agent-sdk-reference.md` - Complete TypeScript API reference
- `python-agent-sdk-reference.md` - Complete Python API reference
- `custom-tools.md` - Creating MCP tools for the agent
- `subagents.md` - Implementing specialized subagents
- `streaming-vs-single-mode.md` - Input mode options
- `permissions.md` - Permission system & safety
- `mcp-in-sdk.md` - Model Context Protocol integration
- `cost-tracking.md` - Token usage & billing
- `sessions.md` - Session management
- Additional SDK documentation files...

**To refresh these docs**, use: `/load_ai_docs`

## Important Notes for Developers

1. **Agent is fully functional**: Phases 1-3 are complete. You can use the agent right now with `npm start`.

2. **5 tools available**: get_stock_price, get_financial_metrics, calculate_technical_indicators, analyze_news_sentiment, compare_stocks

3. **4 subagents**: fundamental-analyst, technical-analyst, sentiment-analyst, risk-analyst

4. **Caching is critical**: Alpha Vantage free tier has strict rate limits (5 calls/min)

5. **Request deduplication works**: Parallel queries for same data share a single API call

6. **Cost tracking included**: SDK automatically tracks token usage per query

7. **News API required**: The sentiment analyst won't work without NEWS_API_KEY in .env

8. **Model selection matters**: Haiku for simple tasks (sentiment), Sonnet for complex (risk/technical)

9. **Error handling**: API failures are gracefully handled with user-friendly error messages

10. **Next phase**: Web UI implementation using specifications in web-app-architektur.md