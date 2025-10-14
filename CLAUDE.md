# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains planning documentation and AI-scraped reference docs for building a **Stock Analyst Agent** using the Claude Agent SDK. The project aims to create an intelligent AI agent that can analyze US stocks using real-time financial data, with specialized subagents for different types of analysis (fundamental, technical, sentiment, risk).

**Current Status**: Planning & documentation phase. No implementation code exists yet.

## Repository Structure

```
claude_agent_sdk/
├── ai_docs/                    # Claude Agent SDK reference documentation
│   ├── README.md              # List of documentation URLs
│   └── *.md                   # Scraped SDK documentation (auto-generated)
├── docs/                       # Project planning & specifications
│   ├── aktien-analyst-agent-konzept.md        # German: Original concept doc
│   ├── stock-analyst-implementierungsplan.md  # German: 4-week implementation plan
│   ├── mvp-implementation-plan.md             # English: Reality-checked MVP plan
│   └── web-app-architektur.md                 # German: Full web app architecture
└── .claude/                    # Claude Code configuration
    ├── agents/                 # Custom agent definitions
    │   └── docs-scraper.md    # Documentation scraping agent
    └── commands/               # Custom slash commands
        └── load_ai_docs.md    # Command to refresh SDK docs
```

## Key Documentation Files

### Planning Documents (docs/)

**Read these to understand the project vision:**

1. **mvp-implementation-plan.md** - **START HERE**: Reality-checked, actionable MVP plan
   - Honest assessment of feasibility
   - 4 incremental phases (9-12 hours total)
   - Phase 1: Foundation MVP (2-3h) - Basic agent with stock price tool
   - Phase 2: Core subagents (3-4h) - Fundamental & technical analysts
   - Phase 3: Enhanced features (2-3h) - Full toolset & error handling
   - Phase 4: Polish (2h) - Cost tracking, docs, tests
   - **This is the recommended implementation path**

2. **stock-analyst-implementierungsplan.md** - Original 4-week implementation plan (German)
   - More comprehensive but longer timeline
   - TypeScript vs Python analysis (TypeScript recommended)
   - Detailed sprint breakdowns
   - Development workflows with Claude Code

3. **aktien-analyst-agent-konzept.md** - Original concept document (German)
   - Feature requirements and capabilities
   - Tool definitions for finance APIs
   - Subagent architecture (5 specialized agents)
   - SDK vs LangChain/LangGraph comparison

4. **web-app-architektur.md** - Full web application specification (German)
   - **Future phase**: Web UI on top of CLI agent
   - Next.js + React frontend
   - Node.js + Express backend
   - PostgreSQL database schema
   - Complete API specifications

### AI Documentation (ai_docs/)

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

## Architecture Overview

### Planned System Design

```
User (CLI) → Main Stock Analyst Agent
                ├─→ Fundamental Analyst (subagent)
                ├─→ Technical Analyst (subagent)
                ├─→ Sentiment Analyst (subagent)
                └─→ Risk Analyst (subagent)
                        ↓
                Finance Tools MCP Server
                ├─→ get_stock_price
                ├─→ get_financial_metrics
                ├─→ calculate_technical_indicators
                └─→ analyze_news_sentiment
                        ↓
                External Finance APIs
                ├─→ Alpha Vantage
                ├─→ Yahoo Finance
                └─→ News API
```

### Technology Stack (from MVP plan)

**Core:**
- `@anthropic-ai/claude-agent-sdk` - Agent framework
- TypeScript - Type safety and SDK compatibility
- Node.js 20+ - Runtime

**APIs & Libraries:**
- Zod - Schema validation for tools
- Axios - HTTP client
- dotenv - Environment configuration

**Development:**
- tsx - TypeScript execution
- Vitest - Testing framework

## Custom Slash Commands

### `/load_ai_docs`

Refreshes Claude Agent SDK documentation from official sources.

**How it works:**
1. Reads `ai_docs/README.md` for list of documentation URLs
2. Checks existing docs (skips if <24h old, deletes if older)
3. Launches parallel `@agent-docs-scraper` tasks for each URL
4. Saves properly formatted markdown files to `ai_docs/`

**When to use:** When SDK documentation may be outdated (>24h old) or when you need latest API reference.

## Custom Agents

### `@agent-docs-scraper`

Specialized agent for fetching and formatting documentation from URLs.

**Tools:** mcp_firecrawl-mcp_firecrawl_scrape, WebFetch, Write, Edit

**Purpose:** Converts web documentation to clean, properly formatted markdown files for offline reference.

## Development Approach

### Starting Implementation

**Recommended approach** (from mvp-implementation-plan.md):

1. **Phase 1 - Foundation (2-3h)**: Get something working fast
   - Setup TypeScript project
   - Create basic Alpha Vantage API client
   - Implement single tool: `get_stock_price`
   - Build minimal CLI agent
   - **Deliverable:** Agent answers "What is the price of AAPL?"

2. **Phase 2 - Core Subagents (3-4h)**: Prove the pattern
   - Add 2 more tools (metrics, indicators)
   - Implement 2 subagents (fundamental, technical)
   - Test delegation
   - **Deliverable:** Agent delegates to specialists

3. **Phase 3 - Enhanced (2-3h)**: Production features
   - Complete toolset (4-5 more tools)
   - Add remaining subagents (sentiment, risk)
   - Error handling & caching
   - **Deliverable:** Robust analysis capabilities

4. **Phase 4 - Polish (2h)**: Ship-ready
   - Cost tracking
   - Session management
   - Documentation
   - Tests

### Key Technical Decisions

**TypeScript over Python** (from implementation plan analysis):
- Native Claude SDK support
- Better streaming performance
- Type safety for complex configs
- Easier web integration later
- Finance APIs work with both

**Streaming Input Mode Required:**
- Custom MCP tools require streaming input
- Use async generators: `async function* streamingInput()`
- NOT optional for this use case

**API Considerations:**
- Alpha Vantage free tier: 5 calls/min, 500/day
- Implement caching from day 1 (not phase 3)
- Retry logic with exponential backoff
- Rate limit handling is critical

## Important Patterns from SDK Documentation

### Tool Definition Pattern
```typescript
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const financeTools = createSdkMcpServer({
  name: "finance-tools",
  version: "1.0.0",
  tools: [
    tool(
      "get_stock_price",
      "Fetches current stock price",
      {
        symbol: z.string().describe("Stock ticker")
      },
      async (args) => {
        // Implementation
        return {
          content: [{ type: "text", text: result }]
        };
      }
    )
  ]
});
```

### Subagent Configuration Pattern
```typescript
const agentConfigs = {
  'fundamental-analyst': {
    description: 'Expert in fundamental analysis',
    prompt: 'You are a fundamental analyst...',
    tools: ['mcp__finance-tools__get_financial_metrics'],
    model: 'sonnet'
  }
};
```

### Streaming Query Pattern
```typescript
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
  mcpServers: { "finance-tools": financeTools },
  agents: agentConfigs
});
```

## Environment Setup

Required API keys (create `.env` file):
```bash
ANTHROPIC_API_KEY=your_claude_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_news_api_key  # optional
```

## Common Pitfalls to Avoid

❌ **Don't:** Try to build everything at once
✅ **Do:** Build incrementally, test each phase

❌ **Don't:** Use single message input mode with MCP tools
✅ **Do:** Always use streaming input for MCP tools (it's required)

❌ **Don't:** Ignore API rate limits
✅ **Do:** Cache aggressively from day 1

❌ **Don't:** Skip error handling until later
✅ **Do:** Handle errors from the start

❌ **Don't:** Forget to track token costs
✅ **Do:** Implement cost tracking early (SDK provides this)

## Language & Documentation Notes

**Mixed Language Documentation:**
- Core planning docs are in German (aktien-analyst-agent-konzept.md, stock-analyst-implementierungsplan.md, web-app-architektur.md)
- MVP plan is in English (mvp-implementation-plan.md) - **recommended starting point**
- AI docs are in English (official SDK documentation)
- Code examples throughout use English

**When implementing:** Use English for all code, comments, and variable names for consistency with SDK and broader developer community.

## Next Steps for Implementation

1. Read `mvp-implementation-plan.md` fully - it's reality-checked and achievable
2. Create project directory: `stock-analyst-agent/`
3. Follow Phase 1 setup (30min task breakdown provided)
4. Reference `ai_docs/` for SDK usage patterns
5. Build incrementally - each phase should be functional
6. After CLI agent works, optionally implement web UI from `web-app-architektur.md`

## Future: Web Application Phase

Once CLI agent is working, `web-app-architektur.md` provides complete specifications for:
- Next.js + React frontend
- Express.js backend API
- PostgreSQL database schema
- Portfolio management system
- Agent integration (read-only access to user portfolios)
- Complete API reference

**Key principle:** Agent has READ-ONLY access to user portfolios for analysis, cannot modify data.
