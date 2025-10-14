# Stock Analyst Agent - MVP Implementation Plan

> **Reality-Checked** implementation plan based on Claude Agent SDK capabilities and best practices

## Executive Summary

After thorough analysis of the Claude Agent SDK documentation and your original implementation plans, here's an **honest, achievable plan** to build a working stock analysis agent.

**Bottom Line:** Yes, this is absolutely buildable! But we need to be strategic and incremental.

---

## Honest Assessment

### ✅ What Makes This Achievable

1. **Perfect SDK Match**
   - Claude Agent SDK is designed exactly for this use case
   - Native tool support, streaming, subagents, cost tracking - all built-in
   - Well-documented with clear examples

2. **Right Technology Choices**
   - TypeScript is optimal (native SDK support, type safety, async/await)
   - Finance APIs are simple HTTP REST calls
   - MCP tool system is straightforward

3. **Solid Architecture**
   - Main agent + specialized subagents is the SDK's design pattern
   - Your subagent breakdown (fundamental, technical, sentiment, risk) is excellent
   - Tool organization is logical

### ⚠️ Reality Checks

1. **Original Plan Too Ambitious for MVP**
   - 4 weeks → Let's get MVP in 10-12 hours
   - 8 tools → Start with 2-3, add incrementally
   - 5 subagents → Start with 2, prove the pattern works

2. **API Constraints Will Be Real**
   - Alpha Vantage free tier: 5 calls/minute, 500/day
   - Need caching from day 1, not "phase 3"
   - Rate limit handling is critical, not optional

3. **SDK Patterns Are Simpler Than Expected**
   - Your examples use more abstraction than needed
   - Direct function calls work fine for MVP
   - Over-engineering can wait

### 🎯 Strategic Approach

**Build in Phases, Each Phase Works:**
- Phase 1: Prove the concept (1 tool, basic agent)
- Phase 2: Prove subagents work (2 subagents, 3 tools)
- Phase 3: Complete the vision (all tools, all subagents)
- Phase 4: Production polish

**You'll have something demonstrable in 2-3 hours, not 2-3 weeks.**

---

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────┐
│                   CLI Interface                      │
│            (Interactive Chat Session)                │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              Main Stock Analyst Agent                │
│  - Orchestrates subagents                            │
│  - Manages conversation flow                         │
│  - Aggregates analysis results                       │
└───────┬─────────────────────────────────────────────┘
        │
        ├──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │Fundament.│  │Technical │  │Sentiment │  │   Risk   │
    │ Analyst  │  │ Analyst  │  │ Analyst  │  │ Analyst  │
    └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘
          └─────────────┴──────────────┴──────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │  Finance Tools MCP   │
                    │  - get_stock_price   │
                    │  - get_metrics       │
                    │  - get_indicators    │
                    │  - analyze_sentiment │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    ▼                      ▼
            ┌──────────────┐      ┌──────────────┐
            │ Alpha Vantage│      │   News API   │
            │     API      │      │              │
            └──────────────┘      └──────────────┘
```

### Technology Stack

**Core:**
- `@anthropic-ai/claude-agent-sdk` - Agent framework
- TypeScript - Type safety and development speed
- Node.js 20+ - Runtime

**Validation & APIs:**
- Zod - Schema validation for tools
- Axios - HTTP client for finance APIs
- dotenv - Environment configuration

**Development:**
- tsx - TypeScript execution
- Vitest - Testing framework
- Winston - Logging

---

## Phase 1: Foundation MVP (v0.1)

**Time Estimate:** 2-3 hours
**Goal:** Working agent that can fetch and display stock prices

### Task 1.1: Project Setup (30 min)

**What to Build:**
```bash
stock-analyst-agent/
├── src/
│   ├── index.ts
│   ├── agent/
│   │   └── main-agent.ts
│   ├── tools/
│   │   ├── finance-tools.ts
│   │   └── api/
│   │       └── alpha-vantage.ts
│   └── types/
│       └── stock-data.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

**Steps:**
1. Initialize project: `npm init -y`
2. Install dependencies:
   ```bash
   npm install @anthropic-ai/claude-agent-sdk zod dotenv axios
   npm install -D typescript @types/node tsx
   ```
3. Configure TypeScript (esm modules, strict mode)
4. Create .env.example with required API keys
5. Add start script: `"dev": "tsx src/index.ts"`

**Success Criteria:**
- ✅ `npm run dev` executes without errors
- ✅ TypeScript compilation works
- ✅ Can import Claude Agent SDK

---

### Task 1.2: Alpha Vantage API Client (60 min)

**File:** `src/tools/api/alpha-vantage.ts`

**What to Build:**
```typescript
// Simple, focused client - just stock quotes for now
export async function fetchStockQuote(symbol: string): Promise<StockQuote>
```

**Key Features:**
- Fetch real-time quote data
- Basic error handling (API errors, network failures)
- Response caching (5 minute TTL)
- Rate limit awareness (5 calls/minute)

**Testing:**
```typescript
// Manual test
const quote = await fetchStockQuote('AAPL');
console.log(quote); // Should show current price
```

**Success Criteria:**
- ✅ Successfully fetches AAPL quote
- ✅ Handles invalid symbols gracefully
- ✅ Caches responses (second call is instant)
- ✅ Respects rate limits

---

### Task 1.3: Finance Tools MCP Server (60 min)

**File:** `src/tools/finance-tools.ts`

**What to Build:**
Single MCP server with ONE tool:

```typescript
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

export const financeToolsServer = createSdkMcpServer({
  name: "finance-tools",
  version: "0.1.0",
  tools: [
    tool(
      "get_stock_price",
      "Fetches current stock price and basic quote data",
      {
        symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA)")
      },
      async (args) => {
        const quote = await fetchStockQuote(args.symbol);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(quote, null, 2)
          }]
        };
      }
    )
  ]
});
```

**Success Criteria:**
- ✅ Tool definition is valid
- ✅ MCP server can be instantiated
- ✅ Tool can be called programmatically

---

### Task 1.4: Main Agent & CLI (60 min)

**File:** `src/agent/main-agent.ts`

**What to Build:**
Basic streaming agent with finance tools:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import { financeToolsServer } from "../tools/finance-tools";

export class StockAnalystAgent {
  async analyze(userPrompt: string) {
    async function* streamingInput() {
      yield {
        type: "user" as const,
        message: {
          role: "user" as const,
          content: userPrompt
        }
      };
    }

    const result = await query(streamingInput(), {
      mcpServers: {
        "finance-tools": financeToolsServer
      },
      systemPrompt: {
        preset: "claude_code",
        extensions: [
          "You are a professional stock analyst.",
          "Use the finance tools to fetch real-time market data.",
          "Provide clear, concise analysis."
        ]
      }
    });

    return result;
  }
}
```

**File:** `src/index.ts`

**What to Build:**
Simple interactive CLI:

```typescript
import readline from "readline";
import { StockAnalystAgent } from "./agent/main-agent";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log("🤖 Stock Analyst Agent v0.1\n");

  const agent = new StockAnalystAgent();

  const ask = () => {
    rl.question("You: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        process.exit(0);
      }

      console.log("\nAgent: ");
      await agent.analyze(input);
      console.log("\n");
      ask();
    });
  };

  ask();
}

main();
```

**Success Criteria:**
- ✅ CLI starts and prompts for input
- ✅ Can query "What is the price of AAPL?"
- ✅ Agent calls get_stock_price tool
- ✅ Displays formatted response
- ✅ Can exit gracefully

---

### Phase 1 Deliverable

**Working Demo:**
```
$ npm run dev

🤖 Stock Analyst Agent v0.1

You: What is the current price of AAPL?

Agent: Let me fetch the current stock price for Apple Inc. (AAPL).

[Agent calls get_stock_price tool]

Apple Inc. (AAPL) is currently trading at $180.50.
- Open: $179.20
- High: $181.30
- Low: $178.90
- Volume: 45.2M shares

You: exit
```

**What Works:**
- ✅ Interactive CLI agent
- ✅ Real-time stock price fetching
- ✅ Tool integration working
- ✅ Basic error handling

**What's Missing (Phase 2+):**
- No subagents yet
- Only 1 tool
- No cost tracking
- No session management

---

## Phase 2: Core Subagents (v0.2)

**Time Estimate:** 3-4 hours
**Goal:** Specialized analysis with subagent delegation

### Task 2.1: Expand Finance Tools (90 min)

**Add 2 More Tools:**

1. **get_financial_metrics**
   ```typescript
   tool(
     "get_financial_metrics",
     "Fetches company fundamentals (P/E, market cap, EPS, etc.)",
     {
       symbol: z.string().describe("Stock ticker symbol")
     },
     async (args) => { /* implementation */ }
   )
   ```

2. **calculate_technical_indicators**
   ```typescript
   tool(
     "calculate_technical_indicators",
     "Calculates technical indicators (RSI, MACD, SMA)",
     {
       symbol: z.string(),
       indicators: z.array(z.enum(["RSI", "MACD", "SMA_50", "SMA_200"]))
     },
     async (args) => { /* implementation */ }
   )
   ```

**Key Additions:**
- Alpha Vantage OVERVIEW endpoint (fundamentals)
- Technical indicators calculation
- Enhanced caching (cache by endpoint type)
- Retry logic with exponential backoff

**Success Criteria:**
- ✅ Both tools work independently
- ✅ Caching reduces API calls
- ✅ Retry logic handles transient failures

---

### Task 2.2: Implement Subagents (90 min)

**File:** `src/agent/config.ts`

**What to Build:**
Subagent configurations:

```typescript
export const agentConfigs = {
  'fundamental-analyst': {
    description: 'Expert in fundamental analysis - balance sheets, P/E ratios, company valuation',
    prompt: `You are a fundamental analyst specializing in:
- Financial statement analysis
- Valuation metrics (P/E, P/B, PEG ratios)
- Company fundamentals and growth
- Industry comparisons

Provide thorough fundamental analysis using available financial data.`,
    tools: [
      'mcp__finance-tools__get_financial_metrics',
      'mcp__finance-tools__get_stock_price'
    ],
    model: 'sonnet'
  },

  'technical-analyst': {
    description: 'Expert in technical analysis - chart patterns, indicators, trends',
    prompt: `You are a technical analyst specializing in:
- Technical indicators (RSI, MACD, Moving Averages)
- Trend identification
- Support and resistance levels
- Trading signals

Analyze price action and technical indicators to identify trading opportunities.`,
    tools: [
      'mcp__finance-tools__calculate_technical_indicators',
      'mcp__finance-tools__get_stock_price'
    ],
    model: 'sonnet'
  }
};
```

**Update Main Agent:**
```typescript
const result = await query(streamingInput(), {
  mcpServers: {
    "finance-tools": financeToolsServer
  },
  agents: agentConfigs,  // Add subagents
  systemPrompt: {
    preset: "claude_code",
    extensions: [
      "You are a professional stock analyst coordinating specialized subagents.",
      "Delegate fundamental analysis to the fundamental-analyst.",
      "Delegate technical analysis to the technical-analyst.",
      "Synthesize their insights into comprehensive recommendations."
    ]
  }
});
```

**Success Criteria:**
- ✅ Main agent recognizes when to delegate
- ✅ Subagents are invoked correctly
- ✅ Each subagent uses appropriate tools
- ✅ Results are aggregated coherently

---

### Task 2.3: Integration Testing (60 min)

**Test Scenarios:**

1. **Fundamental Analysis Query:**
   ```
   User: "Give me a fundamental analysis of Tesla (TSLA)"
   Expected: Delegates to fundamental-analyst, uses get_financial_metrics
   ```

2. **Technical Analysis Query:**
   ```
   User: "What's the technical picture for Apple?"
   Expected: Delegates to technical-analyst, uses calculate_technical_indicators
   ```

3. **Comprehensive Analysis:**
   ```
   User: "Should I buy Microsoft (MSFT)? Give me both fundamental and technical analysis."
   Expected: Delegates to BOTH subagents, synthesizes results
   ```

**Manual Testing Checklist:**
- [ ] Fundamental analysis works
- [ ] Technical analysis works
- [ ] Comprehensive analysis works
- [ ] Subagent delegation is visible in logs
- [ ] Tool calls are correct
- [ ] Error handling works for each scenario

**Success Criteria:**
- ✅ All 3 test scenarios pass
- ✅ Subagents execute in parallel when appropriate
- ✅ Main agent synthesizes results well

---

### Phase 2 Deliverable

**Enhanced Demo:**
```
You: Analyze Tesla (TSLA) from both fundamental and technical perspectives

Agent: I'll analyze Tesla using both fundamental and technical analysis.

[Delegates to fundamental-analyst]
Fundamental Analysis for TSLA:
- Market Cap: $850B
- P/E Ratio: 75.3 (high, growth premium)
- Revenue Growth: 24% YoY
- Valuation: Expensive but justified by growth

[Delegates to technical-analyst]
Technical Analysis for TSLA:
- RSI: 62 (neutral, slight overbought)
- MACD: Bullish crossover detected
- 50-day SMA: $235.20 (price above, bullish)
- Trend: Strong uptrend since October

Synthesis:
Tesla shows strong growth fundamentals with premium valuation. Technical
indicators suggest continued momentum. Consider entry on pullbacks to SMA support.
```

---

## Phase 3: Enhanced Features (v0.3)

**Time Estimate:** 2-3 hours
**Goal:** Full toolset and production-ready features

### Task 3.1: Additional Tools (60 min)

**Add 2 More Tools:**

1. **analyze_news_sentiment**
   - Fetch recent news articles
   - Sentiment scoring
   - Key headline extraction

2. **compare_stocks**
   - Side-by-side comparison
   - Relative valuation
   - Performance comparison

**Success Criteria:**
- ✅ News sentiment tool works
- ✅ Stock comparison tool works
- ✅ Tools integrate with existing agent

---

### Task 3.2: Additional Subagents (60 min)

**Add 2 More Subagents:**

1. **Sentiment Analyst**
   - Analyzes news and market sentiment
   - Uses analyze_news_sentiment tool
   - Model: haiku (faster, cheaper)

2. **Risk Analyst**
   - Assesses portfolio and stock risk
   - Volatility analysis
   - Model: opus (complex calculations)

**Success Criteria:**
- ✅ 4 subagents working together
- ✅ Each has distinct expertise
- ✅ Main agent delegates appropriately

---

### Task 3.3: Error Handling & Caching (60 min)

**Implement:**

1. **Response Caching**
   ```typescript
   class CacheManager {
     private cache = new Map<string, CachedResponse>();

     get(key: string, maxAge: number): any | null
     set(key: string, value: any): void
     clear(): void
   }
   ```

2. **Retry Logic**
   ```typescript
   async function retryWithBackoff<T>(
     fn: () => Promise<T>,
     maxRetries: number = 3
   ): Promise<T>
   ```

3. **Error Messages**
   - API rate limit: "API rate limit reached. Please wait..."
   - Invalid symbol: "Invalid stock symbol: XYZ"
   - Network error: "Network error. Retrying..."

**Success Criteria:**
- ✅ Cache reduces API calls by 80%+
- ✅ Transient failures auto-retry
- ✅ User sees clear error messages

---

### Phase 3 Deliverable

**Production Features:**
- ✅ 5 finance tools operational
- ✅ 4 specialized subagents
- ✅ Comprehensive error handling
- ✅ Response caching
- ✅ Rate limit management
- ✅ Retry logic

---

## Phase 4: Polish & Documentation (v1.0)

**Time Estimate:** 2 hours
**Goal:** Production-ready MVP

### Task 4.1: Cost Tracking (30 min)

**File:** `src/utils/cost-tracker.ts`

**Implementation:**
```typescript
export class CostTracker {
  private processedMessageIds = new Set<string>();
  private stepUsages: Array<StepUsage> = [];

  processMessage(message: any): void
  getTotalCost(): number
  getDetailedUsage(): UsageReport
}
```

**Integration:**
```typescript
const costTracker = new CostTracker();

const result = await query(streamingInput(), {
  onMessage: (message) => {
    costTracker.processMessage(message);
  }
});

console.log(`\nTotal Cost: $${costTracker.getTotalCost().toFixed(4)}`);
```

**Success Criteria:**
- ✅ Cost tracking accurate
- ✅ Displayed after each query
- ✅ Prevents double-counting

---

### Task 4.2: Session Management (30 min)

**Feature:** Resume conversations

```typescript
export class StockAnalystAgent {
  private sessionId?: string;

  async analyze(userPrompt: string) {
    const result = await query(streamingInput(), {
      resume: this.sessionId,  // Resume if exists
      onMessage: (message) => {
        if (message.type === 'system' && message.subtype === 'init') {
          this.sessionId = message.session_id;
        }
      }
    });
  }
}
```

**Success Criteria:**
- ✅ Sessions persist across queries
- ✅ Context maintained in conversation
- ✅ Session ID captured and reused

---

### Task 4.3: Documentation (30 min)

**Create:**

1. **README.md** - Setup and usage
2. **TOOLS.md** - Tool documentation
3. **EXAMPLES.md** - Example queries

**README.md Contents:**
- Installation steps
- Environment setup
- Running the agent
- Example queries
- Troubleshooting

**Success Criteria:**
- ✅ New user can setup in 5 minutes
- ✅ All tools documented
- ✅ Examples cover common scenarios

---

### Task 4.4: Testing (30 min)

**Test Suite:**

```typescript
// tests/integration.test.ts
describe('Stock Analyst Agent', () => {
  it('should fetch stock prices', async () => {
    // Test implementation
  });

  it('should delegate to subagents', async () => {
    // Test implementation
  });

  it('should handle errors gracefully', async () => {
    // Test implementation
  });
});
```

**Manual Test Checklist:**
- [ ] Can analyze any US stock
- [ ] Subagent delegation works
- [ ] All tools functional
- [ ] Error handling robust
- [ ] Cost tracking accurate
- [ ] Sessions work across queries

**Success Criteria:**
- ✅ All integration tests pass
- ✅ Manual testing complete
- ✅ Edge cases handled

---

## Final Deliverable: Production MVP

### What You Get

**A fully functional CLI stock analyst agent that can:**

✅ **Analyze any US stock:**
```
You: Analyze AAPL
Agent: [Provides comprehensive analysis using all subagents]
```

✅ **Delegate to specialists:**
- Fundamental analyst for company analysis
- Technical analyst for chart patterns
- Sentiment analyst for news/social media
- Risk analyst for volatility/risk metrics

✅ **Use real-time data:**
- Current stock prices
- Financial metrics (P/E, market cap, etc.)
- Technical indicators (RSI, MACD, etc.)
- News sentiment

✅ **Handle production concerns:**
- Error handling and retries
- API rate limiting
- Response caching
- Cost tracking
- Session management

✅ **Maintain conversations:**
```
You: Analyze TSLA
Agent: [Analysis]

You: How does that compare to Ford?
Agent: [Uses context from previous analysis]
```

---

## Success Metrics

### Technical Metrics
- ✅ Agent responds within 5-10 seconds
- ✅ Tool success rate > 95%
- ✅ API calls reduced by 80% via caching
- ✅ Error recovery rate > 90%
- ✅ Cost per query < $0.01

### Functionality Metrics
- ✅ Can analyze any valid US stock symbol
- ✅ Correctly delegates to appropriate subagents
- ✅ Provides actionable insights
- ✅ Maintains conversation context
- ✅ Handles errors gracefully

### User Experience Metrics
- ✅ Clear, concise responses
- ✅ Transparent about limitations
- ✅ Provides risk disclaimers
- ✅ Easy to use CLI interface
- ✅ Helpful error messages

---

## Timeline Summary

| Phase | Time | Deliverable |
|-------|------|-------------|
| **Phase 1** | 2-3 hours | Basic agent with stock price tool |
| **Phase 2** | 3-4 hours | 2 subagents, 3 tools, delegation working |
| **Phase 3** | 2-3 hours | Full toolset, 4 subagents, error handling |
| **Phase 4** | 2 hours | Cost tracking, sessions, docs, tests |
| **Total** | **9-12 hours** | Production-ready CLI agent |

---

## Next Steps After MVP

Once the CLI agent is working, you can:

1. **Add Web Interface** (using your `web-app-architektur.md` plan)
   - Frontend: Next.js + React
   - Backend: Express API
   - Database: PostgreSQL for portfolio storage

2. **Enhance Analysis**
   - More sophisticated indicators
   - Backtesting capabilities
   - Portfolio optimization
   - Multi-timeframe analysis

3. **Add Features**
   - Email alerts
   - Scheduled analysis
   - Batch processing
   - Export to PDF/Excel

4. **Scale Up**
   - Add more data sources
   - Implement ML predictions
   - Real-time streaming data
   - Multi-user support

---

## Final Thoughts

### Why This Plan Works

1. **Incremental Progress** - Each phase delivers value
2. **Realistic Scope** - Based on actual SDK capabilities
3. **Proven Patterns** - Uses SDK recommended approaches
4. **Testable Milestones** - Clear success criteria
5. **Room to Grow** - Foundation for full vision

### Key Learnings from SDK Analysis

1. **Streaming input is required for MCP tools** - Not optional
2. **Subagents are simpler than expected** - Just config objects
3. **Tool definitions are straightforward** - Zod makes it easy
4. **Cost tracking is built-in** - No custom tracking needed
5. **Sessions are automatic** - Just capture the ID

### Common Pitfalls to Avoid

❌ **Don't:** Try to build everything at once
✅ **Do:** Build incrementally, test each phase

❌ **Don't:** Over-engineer early
✅ **Do:** Start simple, refactor when needed

❌ **Don't:** Ignore API rate limits
✅ **Do:** Cache aggressively from day 1

❌ **Don't:** Skip error handling
✅ **Do:** Handle errors from the start

❌ **Don't:** Forget to track costs
✅ **Do:** Monitor token usage early

---

## Let's Build This! 🚀

This plan is **realistic**, **achievable**, and **production-ready**.

Start with Phase 1, get something working in 2-3 hours, then build from there.

**The SDK gives us everything we need. Let's use it!**