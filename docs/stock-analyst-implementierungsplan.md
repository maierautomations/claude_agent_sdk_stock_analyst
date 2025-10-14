# Stock Analyst Agent - Implementierungsplan

> Detaillierter Plan zum Aufbau eines Stock Analyst Agents mit dem Claude Agent SDK

## Inhaltsverzeichnis

1. [Projekt-Übersicht](#projekt-übersicht)
2. [TypeScript vs Python Entscheidung](#typescript-vs-python-entscheidung)
3. [Entwicklung mit Claude Code](#entwicklung-mit-claude-code)
4. [Projekt-Setup](#projekt-setup)
5. [Architektur-Design](#architektur-design)
6. [Implementierungs-Roadmap](#implementierungs-roadmap)
7. [Code-Struktur](#code-struktur)
8. [Testing-Strategie](#testing-strategie)
9. [Deployment & Production](#deployment--production)
10. [Nächste Schritte](#nächste-schritte)

---

## Projekt-Übersicht

### Was bauen wir?

Ein intelligenter **Stock Analyst Agent** der:

✅ **Aktienanalysen durchführt** (fundamental, technisch, sentiment)
✅ **Portfolio Management** bietet (tracking, optimization, risk analysis)
✅ **Multi-Agent System** nutzt (spezialisierte Sub-Agenten)
✅ **Real-time Daten** verarbeitet (streaming mode)
✅ **Sicher operiert** (permission system für sensible Operationen)
✅ **Kosten-effizient** ist (cost tracking & optimization)

### Technologie-Stack

**Core:**

- Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`)
- TypeScript / Node.js
- Model Context Protocol (MCP) für Tools

**Finance APIs:**

- Alpha Vantage (Stock Data)
- Yahoo Finance API (Historical Data)
- News API (Sentiment Analysis)
- Optional: Polygon.io, IEX Cloud

**Development:**

- Claude Code (Anthropic's AI Coding Agent)
- VS Code / Cursor
- Git für Version Control

---

## TypeScript vs Python Entscheidung

### Detaillierter Vergleich für Stock Analyst Agent

| Kriterium                    | TypeScript ⭐⭐⭐              | Python ⭐⭐                          |
| ---------------------------- | ------------------------------ | ------------------------------------ |
| **Claude Agent SDK Support** | Native, vollständig            | Vollständig                          |
| **Finance Libraries**        | Limitiert (axios, node-fetch)  | Exzellent (pandas, yfinance, ta-lib) |
| **API Integration**          | Sehr gut (native HTTP)         | Sehr gut (requests)                  |
| **Performance**              | Schneller (V8 Engine)          | Langsamer für I/O                    |
| **Async/Streaming**          | Native async/await, Generators | async/await, async generators        |
| **Type Safety**              | Exzellent (TypeScript)         | Gut (Type Hints, Pydantic)           |
| **Development Speed**        | Schnell mit Claude Code        | Schnell mit Claude Code              |
| **Production Deployment**    | Node.js (einfach)              | Python Server (einfach)              |
| **Community & Tools**        | Groß für Web/Node              | Groß für Data Science                |
| **Debugging**                | Sehr gut                       | Sehr gut                             |

### Empfehlung: **TypeScript**

**Gründe für TypeScript:**

1. **✅ Native Claude SDK Support**: TypeScript ist die primäre Sprache für das Claude Agent SDK
2. **✅ Bessere Streaming Performance**: Node.js ist optimal für real-time streaming
3. **✅ Type Safety**: Compile-time Fehlerprüfung für komplexe Agent-Konfigurationen
4. **✅ MCP Tool Ecosystem**: Wachsendes TypeScript MCP Ökosystem
5. **✅ Web Integration**: Einfacher um später Web-UI hinzuzufügen
6. **✅ Single Language Stack**: Frontend + Backend in TypeScript möglich
7. **✅ Moderne Async Patterns**: Native Generators für streaming input

**Wann Python besser wäre:**

- Du machst heavy numerical analysis / backtesting
- Du brauchst pandas / numpy für komplexe Berechnungen
- Du hast bereits Python-basierte ML-Modelle
- Dein Team ist Python-spezialisiert

### API vs SDK Unterschied

**Important:** TypeScript vs Python ist hier **NUR die SDK Wahl**, die Finance-APIs sind HTTP-basiert und funktionieren mit beiden!

---

## Entwicklung mit Claude Code

### Was ist Claude Code?

Claude Code ist Anthropic's AI-Powered Coding Agent, der:

- Kompletten Code schreibt und refactoriert
- Multiple Files gleichzeitig editiert
- Tests schreibt und ausführt
- Git-Operationen durchführt
- Package Management handled

### Workflow mit Claude Code

#### 1. **Iteratives Prototyping**

```
Du → Claude Code: "Erstelle den Finance Tools MCP Server mit Stock Price Tool"
↓
Claude Code schreibt kompletten Code
↓
Du testest und gibst Feedback
↓
Claude Code iteriert und verbessert
```

#### 2. **Chunk-weise Entwicklung**

**Best Practice:** Entwickle in logischen Chunks, nicht alles auf einmal!

**Phase 1: Core Setup (Session 1)**

```
"Erstelle ein TypeScript Projekt für den Stock Analyst Agent.
- package.json mit Claude Agent SDK dependency
- TypeScript config
- Basis-Verzeichnisstruktur
- README mit Setup-Anweisungen"
```

**Phase 2: Finance Tools (Session 2)**

```
"Implementiere den Finance Tools MCP Server mit:
- Stock Price Tool (Alpha Vantage API)
- Financial Metrics Tool (Yahoo Finance)
- Basis Error Handling"
```

**Phase 3: Main Agent (Session 3)**

```
"Erstelle den Main Agent mit:
- Streaming Input Generator
- MCP Server Integration
- Basic System Prompt
- Console Logging"
```

**Phase 4: Subagenten (Session 4)**

```
"Füge Subagenten hinzu:
- Fundamental Analyst
- Technical Analyst
- Agent Configuration"
```

#### 3. **Claude Code Commands nutzen**

**Wichtige Commands:**

```bash
# Projekt initialisieren
@terminal npm init -y && npm install @anthropic-ai/claude-agent-sdk

# Tests ausführen
@terminal npm test

# Code formatieren
@terminal npm run format

# Linting
@terminal npm run lint
```

**File Operations:**

```
# Multiple Files gleichzeitig erstellen
"Erstelle folgende Files:
- src/tools/finance-tools.ts
- src/agents/main-agent.ts
- src/types/stock-data.ts"

# Code Review anfragen
"Review den Finance Tools Code auf:
- Error Handling
- Type Safety
- API Rate Limiting"
```

#### 4. **Testing mit Claude Code**

```
"Schreibe Tests für:
- Stock Price Tool (mit Mock API Responses)
- Error Cases (API Failure, Invalid Symbol)
- Edge Cases (Market Holidays, After Hours)"
```

#### 5. **Debugging mit Claude Code**

```
"Der Stock Price Tool gibt undefined zurück.
- Analysiere den Code
- Füge Debug Logging hinzu
- Identifiziere das Problem
- Fixe es"
```

### Pro-Tips für Claude Code

**✅ DO:**

- Gib klare, spezifische Anweisungen
- Teile große Tasks in kleinere Chunks
- Lass Claude Code Tests schreiben
- Nutze `@file` für Kontext-Injection
- Bitte um Code Reviews

**❌ DON'T:**

- Versuche nicht alles auf einmal zu bauen
- Vergiss nicht Error Handling zu erwähnen
- Überspringe keine Tests
- Ignoriere Linter Warnings nicht

---

## Projekt-Setup

### Verzeichnisstruktur

```
stock-analyst-agent/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── agent/
│   │   ├── main-agent.ts           # Main orchestrator agent
│   │   ├── subagents/
│   │   │   ├── fundamental.ts      # Fundamental analyst
│   │   │   ├── technical.ts        # Technical analyst
│   │   │   ├── sentiment.ts        # Sentiment analyst
│   │   │   ├── risk.ts             # Risk analyst
│   │   │   └── portfolio.ts        # Portfolio manager
│   │   └── config.ts               # Agent configurations
│   ├── tools/
│   │   ├── finance-tools.ts        # MCP Finance Tools Server
│   │   ├── api/
│   │   │   ├── alpha-vantage.ts    # Alpha Vantage client
│   │   │   ├── yahoo-finance.ts    # Yahoo Finance client
│   │   │   └── news-api.ts         # News API client
│   │   └── utils/
│   │       ├── cache.ts            # API response caching
│   │       └── rate-limiter.ts     # Rate limiting
│   ├── types/
│   │   ├── stock-data.ts           # Stock data types
│   │   ├── agent-config.ts         # Agent config types
│   │   └── api-responses.ts        # API response types
│   ├── utils/
│   │   ├── logger.ts               # Logging utility
│   │   ├── cost-tracker.ts         # Token cost tracking
│   │   └── session-manager.ts      # Session management
│   └── cli/
│       └── interactive.ts          # CLI interface
├── tests/
│   ├── tools/
│   │   └── finance-tools.test.ts
│   ├── agent/
│   │   └── main-agent.test.ts
│   └── fixtures/
│       └── mock-responses.ts
├── config/
│   ├── .env.example                # Environment variables template
│   └── agent-config.json           # Agent configuration
├── docs/
│   ├── API.md                      # API documentation
│   └── USAGE.md                    # Usage guide
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

### Initial Setup Commands

```bash
# 1. Projekt initialisieren
mkdir stock-analyst-agent
cd stock-analyst-agent
npm init -y

# 2. Dependencies installieren
npm install @anthropic-ai/claude-agent-sdk zod dotenv

# TypeScript & Dev Dependencies
npm install -D typescript @types/node ts-node tsx nodemon

# Testing
npm install -D vitest @vitest/ui

# API Clients
npm install axios node-fetch

# Utilities
npm install chalk ora winston

# 3. TypeScript konfigurieren
npx tsc --init

# 4. Git initialisieren
git init
echo "node_modules\n.env\n*.log" > .gitignore

# 5. Verzeichnisse erstellen
mkdir -p src/{agent/{subagents},tools/{api,utils},types,utils,cli} tests/{tools,agent,fixtures} config docs
```

### package.json Configuration

```json
{
  "name": "stock-analyst-agent",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^1.0.0",
    "zod": "^3.22.0",
    "dotenv": "^16.3.0",
    "axios": "^1.6.0",
    "chalk": "^5.3.0",
    "ora": "^7.0.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "ts-node": "^10.9.0",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

### tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Environment Variables (.env)

```bash
# Claude API
ANTHROPIC_API_KEY=your_api_key_here

# Finance APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
YAHOO_FINANCE_API_KEY=optional
NEWS_API_KEY=your_news_api_key

# Configuration
NODE_ENV=development
LOG_LEVEL=info

# Rate Limiting
API_RATE_LIMIT=5
API_RATE_WINDOW=60000

# Cache
CACHE_TTL=300000
```

---

## Architektur-Design

### System-Architektur

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│              (CLI / Future: Web Interface)               │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Main Agent                             │
│  - Orchestrates subagents                                │
│  - Manages conversation flow                             │
│  - Coordinates analysis pipeline                         │
└───────────┬─────────────────────────────────────────────┘
            │
            ├──────────────┬──────────────┬──────────────┐
            ▼              ▼              ▼              ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Fundamental │ │  Technical  │ │  Sentiment  │ │    Risk     │
    │   Analyst   │ │   Analyst   │ │   Analyst   │ │   Analyst   │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │               │
           └───────────────┴───────────────┴───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │   Finance Tools MCP Server   │
                    │  - get_stock_price           │
                    │  - get_financial_metrics     │
                    │  - calculate_indicators      │
                    │  - analyze_sentiment         │
                    │  - analyze_portfolio         │
                    └──────────┬───────────────────┘
                               │
                    ┌──────────┴───────────┐
                    ▼                      ▼
            ┌──────────────┐      ┌──────────────┐
            │  Alpha       │      │   News       │
            │  Vantage API │      │   API        │
            └──────────────┘      └──────────────┘
```

### Data Flow

```
1. User Input
   ↓
2. Main Agent receives query
   ↓
3. Main Agent decides which subagents to invoke
   ↓
4. Subagents call Finance Tools
   ↓
5. Finance Tools fetch data from APIs
   ↓
6. Tools process and return data
   ↓
7. Subagents analyze data
   ↓
8. Main Agent aggregates insights
   ↓
9. Response to user
```

### Agent Configuration Structure

```typescript
interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  model: 'haiku' | 'sonnet' | 'opus';
  maxTokens?: number;
  temperature?: number;
}

const agentConfigs: Record<string, AgentConfig> = {
  'fundamental-analyst': {
    name: 'Fundamental Analyst',
    description: 'Expert in company fundamentals, financial statements, and valuation',
    systemPrompt: `...`,
    tools: ['mcp__finance-tools__get_financial_metrics', ...],
    model: 'sonnet'
  },
  // ... more agents
};
```

---

## Implementierungs-Roadmap

### Phase 1: Foundation (Woche 1)

**Ziel:** Basis-Setup und erste Tools

#### Sprint 1.1: Projekt-Setup (Tag 1-2)

```
Claude Code Prompt:
"Erstelle ein TypeScript Projekt für einen Stock Analyst Agent mit:
- package.json mit allen Dependencies
- TypeScript Configuration
- Verzeichnisstruktur wie spezifiziert
- .env.example mit allen benötigten API Keys
- README mit Setup-Anweisungen"
```

**Deliverables:**

- ✅ Projekt initialisiert
- ✅ Dependencies installiert
- ✅ TypeScript konfiguriert
- ✅ Git Repository erstellt

#### Sprint 1.2: API Clients (Tag 3-4)

```
Claude Code Prompt:
"Implementiere API Clients für:
1. Alpha Vantage Client in src/tools/api/alpha-vantage.ts
   - fetchStockPrice(symbol, period)
   - fetchFinancialData(symbol)
   - Mit Error Handling und Rate Limiting

2. News API Client in src/tools/api/news-api.ts
   - fetchNews(symbol, timeframe)
   - analyzeSentiment(articles)

Include:
- TypeScript types für alle Responses
- Axios für HTTP requests
- dotenv für API Keys
- Basic caching"
```

**Deliverables:**

- ✅ Alpha Vantage Client mit Stock Price fetching
- ✅ News API Client mit Sentiment Analysis
- ✅ Error Handling & Rate Limiting
- ✅ Unit Tests für API Clients

#### Sprint 1.3: Finance Tools MCP Server (Tag 5-7)

```
Claude Code Prompt:
"Erstelle den Finance Tools MCP Server in src/tools/finance-tools.ts mit:

Tools:
1. get_stock_price
   - Input: symbol (string), period (enum)
   - Output: price data with timestamps

2. get_financial_metrics
   - Input: symbol (string), metrics (array)
   - Output: financial ratios and data

3. analyze_news_sentiment
   - Input: symbol (string), timeframe (string)
   - Output: sentiment score and top headlines

Verwende:
- createSdkMcpServer() für Server-Setup
- tool() für Tool-Definition
- Zod für Schema-Validation
- Die erstellten API Clients

Include comprehensive error handling und logging."
```

**Deliverables:**

- ✅ MCP Server mit 3 Base Tools
- ✅ Zod Schemas für Validation
- ✅ Integration mit API Clients
- ✅ Tests für alle Tools

### Phase 2: Agent System (Woche 2)

#### Sprint 2.1: Main Agent (Tag 1-3)

```
Claude Code Prompt:
"Erstelle den Main Agent in src/agent/main-agent.ts:

1. Streaming Input Generator Funktion
2. query() Setup mit:
   - Finance Tools MCP Server Integration
   - System Prompt Configuration
   - Streaming Input/Output
   - onMessage callback für Logging

3. Session Management:
   - Session ID capturing
   - Session resumption

4. Cost Tracking:
   - Implementiere CostTracker class
   - Track token usage per conversation

Include CLI interface in src/cli/interactive.ts für Testing."
```

**Deliverables:**

- ✅ Main Agent implementiert
- ✅ Streaming Input/Output funktional
- ✅ Session Management
- ✅ Cost Tracking
- ✅ CLI Interface für Testing

#### Sprint 2.2: Subagenten (Tag 4-7)

```
Claude Code Prompt:
"Implementiere Subagenten in src/agent/subagents/:

1. fundamental.ts - Fundamental Analyst
   System Prompt: Focus auf Balance Sheets, P/E Ratios, DCF
   Tools: get_financial_metrics, get_stock_price
   Model: sonnet

2. technical.ts - Technical Analyst
   System Prompt: Chart patterns, RSI, MACD, Support/Resistance
   Tools: calculate_technical_indicators, get_stock_price
   Model: sonnet

3. sentiment.ts - Sentiment Analyst
   System Prompt: News analysis, social sentiment, market mood
   Tools: analyze_news_sentiment
   Model: haiku (cost-effective)

4. risk.ts - Risk Analyst
   System Prompt: Portfolio risk, VaR, volatility, correlations
   Tools: analyze_portfolio
   Model: opus (complex calculations)

Erstelle auch src/agent/config.ts mit allen Agent-Konfigurationen."
```

**Deliverables:**

- ✅ 4 Subagenten implementiert
- ✅ Agent Configurations
- ✅ Integration mit Main Agent
- ✅ Tests für Subagent Delegation

### Phase 3: Advanced Features (Woche 3)

#### Sprint 3.1: Additional Tools (Tag 1-3)

```
Claude Code Prompt:
"Erweitere finance-tools.ts mit:

4. calculate_technical_indicators
   - RSI, MACD, Bollinger Bands
   - Moving Averages

5. analyze_portfolio
   - Risk metrics (VaR, Sharpe Ratio)
   - Diversification analysis
   - Performance attribution

6. compare_stocks
   - Side-by-side comparison
   - Relative valuation

7. screen_stocks
   - Criteria-based filtering
   - Market scanning

Implementiere auch technische Indikatoren in src/tools/utils/indicators.ts
mit Libraries wie ta.js oder eigene Implementierung."
```

**Deliverables:**

- ✅ 4 zusätzliche Tools
- ✅ Technical Indicators Library
- ✅ Portfolio Analysis Functions
- ✅ Tests

#### Sprint 3.2: Permission System (Tag 4-5)

```
Claude Code Prompt:
"Implementiere Permission System in src/utils/permission-handler.ts:

1. canUseTool Callback
   - Approve/Deny Logic
   - User Prompting für kritische Operations

2. Hooks System
   - PreToolUse Hook für Logging
   - PostToolUse Hook für Auditing
   - Block gefährliche Operations

3. Permission Modes
   - Development: 'bypassPermissions'
   - Production: 'default' with user prompts

Integriere in Main Agent."
```

**Deliverables:**

- ✅ Permission Handler
- ✅ Hooks Implementation
- ✅ Safety Checks
- ✅ Audit Logging

#### Sprint 3.3: Caching & Optimization (Tag 6-7)

```
Claude Code Prompt:
"Optimiere Performance:

1. API Response Caching in src/tools/utils/cache.ts
   - In-Memory Cache (Map-based)
   - TTL Support
   - Cache Invalidation

2. Rate Limiting in src/tools/utils/rate-limiter.ts
   - Token Bucket Algorithm
   - Per-API Limits

3. Batch API Requests wo möglich

4. Implement retry logic mit exponential backoff"
```

**Deliverables:**

- ✅ Caching System
- ✅ Rate Limiter
- ✅ Retry Logic
- ✅ Performance Benchmarks

### Phase 4: Production Ready (Woche 4)

#### Sprint 4.1: Testing Suite (Tag 1-3)

```
Claude Code Prompt:
"Erstelle comprehensive Testing Suite in tests/:

1. Unit Tests
   - Alle Tools isoliert testen
   - Mock API Responses verwenden
   - Edge Cases abdecken

2. Integration Tests
   - Agent-Tool Interaktionen
   - Subagent Delegation
   - Session Management

3. E2E Tests
   - Komplette User Journeys
   - Multi-turn Conversations
   - Error Scenarios

Verwende Vitest und fixtures in tests/fixtures/."
```

**Deliverables:**

- ✅ Unit Tests (>80% Coverage)
- ✅ Integration Tests
- ✅ E2E Tests
- ✅ Mock Data Fixtures

#### Sprint 4.2: Documentation (Tag 4-5)

```
Claude Code Prompt:
"Erstelle vollständige Documentation in docs/:

1. API.md - API Reference
   - Alle Tools dokumentieren
   - Input/Output Schemas
   - Beispiele

2. USAGE.md - Usage Guide
   - Getting Started
   - Common Use Cases
   - Configuration Options

3. README.md - Project Overview
   - Features
   - Installation
   - Quick Start
   - Architecture Diagram

Include JSDoc Comments in Code."
```

**Deliverables:**

- ✅ API Documentation
- ✅ Usage Guide
- ✅ Updated README
- ✅ Code Comments

#### Sprint 4.3: Deployment Setup (Tag 6-7)

```
Claude Code Prompt:
"Prepare für Production:

1. Build Pipeline
   - npm run build Script
   - Bundle Optimization
   - Source Maps

2. Docker Setup (Optional)
   - Dockerfile
   - docker-compose.yml

3. Deployment Config
   - Environment Variables
   - Logging Configuration
   - Monitoring Setup (optional)

4. CI/CD (Optional)
   - GitHub Actions
   - Automated Testing
   - Deployment Automation"
```

**Deliverables:**

- ✅ Production Build
- ✅ Deployment Scripts
- ✅ Environment Config
- ✅ CI/CD (optional)

---

## Code-Struktur

### Core Implementation Patterns

#### 1. Finance Tools MCP Server

```typescript
// src/tools/finance-tools.ts
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { fetchStockPrice } from "./api/alpha-vantage.js";
import { logger } from "../utils/logger.js";

export const financeToolsServer = createSdkMcpServer({
  name: "finance-tools",
  version: "1.0.0",
  tools: [
    tool(
      "get_stock_price",
      "Fetches current and historical stock prices",
      {
        symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA)"),
        period: z
          .enum(["1d", "1w", "1m", "3m", "1y", "5y"])
          .describe("Time period"),
        interval: z.enum(["1m", "5m", "1h", "1d"]).default("1d"),
      },
      async (args) => {
        try {
          logger.info(`Fetching stock price for ${args.symbol}`);

          const data = await fetchStockPrice(
            args.symbol,
            args.period,
            args.interval
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } catch (error) {
          logger.error(`Error fetching stock price: ${error}`);
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      }
    ),

    // More tools...
  ],
});
```

#### 2. Main Agent Implementation

```typescript
// src/agent/main-agent.ts
import { query } from "@anthropic-ai/claude-agent-sdk";
import { financeToolsServer } from "../tools/finance-tools.js";
import { agentConfigs } from "./config.js";
import { CostTracker } from "../utils/cost-tracker.js";
import { logger } from "../utils/logger.js";

export class StockAnalystAgent {
  private sessionId?: string;
  private costTracker = new CostTracker();

  async analyze(userPrompt: string) {
    // Streaming input generator
    async function* streamingInput() {
      yield {
        type: "user" as const,
        message: {
          role: "user" as const,
          content: userPrompt,
        },
      };
    }

    try {
      const result = await query(streamingInput(), {
        mcpServers: {
          "finance-tools": financeToolsServer,
        },
        systemPrompt: {
          preset: "claude_code",
          extensions: [
            "You are a professional stock analyst.",
            "Use fundamental, technical, and sentiment analysis.",
            "Delegate to specialized subagents when appropriate.",
            "Provide clear, actionable recommendations with risk disclaimers.",
          ],
        },
        agents: agentConfigs,
        permissionMode: "default",
        onMessage: (message) => {
          // Cost tracking
          if (message.type === "assistant" && message.usage) {
            this.costTracker.processMessage(message);
          }

          // Logging
          if (message.type === "system" && message.subtype === "init") {
            this.sessionId = message.session_id;
            logger.info(`Session started: ${this.sessionId}`);
          }

          // Output streaming
          if (message.type === "assistant" && message.content) {
            console.log(message.content);
          }
        },
      });

      return {
        result,
        cost: this.costTracker.getTotalCost(),
        sessionId: this.sessionId,
      };
    } catch (error) {
      logger.error(`Analysis failed: ${error}`);
      throw error;
    }
  }

  async continueConversation(prompt: string) {
    if (!this.sessionId) {
      throw new Error("No active session");
    }

    async function* streamingInput() {
      yield {
        type: "user" as const,
        message: {
          role: "user" as const,
          content: prompt,
        },
      };
    }

    return await query(streamingInput(), {
      resume: this.sessionId,
      onMessage: (message) => {
        if (message.type === "assistant" && message.usage) {
          this.costTracker.processMessage(message);
        }
      },
    });
  }
}
```

#### 3. Agent Configuration

```typescript
// src/agent/config.ts
import { AgentConfig } from "../types/agent-config.js";

export const agentConfigs: Record<string, AgentConfig> = {
  "fundamental-analyst": {
    description: "Expert in fundamental analysis of companies",
    prompt: `You are a fundamental analyst specialized in:
    - Balance sheet analysis
    - Income statements and cash flow
    - Valuation models (DCF, Comparable Analysis)
    - Industry comparisons
    
    Analyze companies thoroughly and assess their intrinsic value.`,
    tools: [
      "mcp__finance-tools__get_financial_metrics",
      "mcp__finance-tools__get_stock_price",
      "mcp__finance-tools__compare_stocks",
    ],
    model: "sonnet",
  },

  "technical-analyst": {
    description: "Expert in technical analysis and chart patterns",
    prompt: `You are a technical analyst specialized in:
    - Chart pattern recognition
    - Technical indicators (RSI, MACD, Bollinger Bands)
    - Support and resistance levels
    - Volume analysis
    - Trend identification
    
    Identify trading signals and short-term market movements.`,
    tools: [
      "mcp__finance-tools__calculate_technical_indicators",
      "mcp__finance-tools__get_stock_price",
    ],
    model: "sonnet",
  },

  "sentiment-analyst": {
    description: "Expert in market sentiment through news and social media",
    prompt: `You are a sentiment analyst who:
    - Analyzes news articles
    - Identifies social media trends
    - Evaluates analyst ratings
    - Quantifies market sentiment
    
    Assess overall market mood and identify sentiment shifts.`,
    tools: ["mcp__finance-tools__analyze_news_sentiment"],
    model: "haiku",
  },

  "risk-analyst": {
    description: "Expert in risk assessment and portfolio exposure",
    prompt: `You are a risk analyst focused on:
    - Portfolio risk assessment (VaR, CVaR)
    - Diversification analysis
    - Correlation studies
    - Volatility metrics
    - Stress testing
    
    Identify risks and suggest mitigation strategies.`,
    tools: [
      "mcp__finance-tools__analyze_portfolio",
      "mcp__finance-tools__get_financial_metrics",
    ],
    model: "opus",
  },
};
```

#### 4. Cost Tracker Utility

```typescript
// src/utils/cost-tracker.ts
export class CostTracker {
  private processedMessageIds = new Set<string>();
  private stepUsages: Array<{
    messageId: string;
    timestamp: string;
    usage: any;
    costUSD: number;
  }> = [];

  processMessage(message: any) {
    if (message.type !== "assistant" || !message.usage) return;
    if (this.processedMessageIds.has(message.id)) return;

    this.processedMessageIds.add(message.id);

    const cost = this.calculateCost(message.usage);

    this.stepUsages.push({
      messageId: message.id,
      timestamp: new Date().toISOString(),
      usage: message.usage,
      costUSD: cost,
    });
  }

  private calculateCost(usage: any): number {
    // Claude Sonnet 4 pricing (example)
    const inputCost = usage.input_tokens * 0.000003; // $3 per 1M tokens
    const outputCost = usage.output_tokens * 0.000015; // $15 per 1M tokens
    const cacheReadCost = (usage.cache_read_input_tokens || 0) * 0.0000003;

    return inputCost + outputCost + cacheReadCost;
  }

  getTotalCost(): number {
    return this.stepUsages.reduce((sum, step) => sum + step.costUSD, 0);
  }

  getDetailedUsage() {
    return {
      steps: this.stepUsages,
      totalCost: this.getTotalCost(),
      totalTokens: this.stepUsages.reduce(
        (sum, step) => sum + step.usage.input_tokens + step.usage.output_tokens,
        0
      ),
    };
  }
}
```

#### 5. CLI Interface

```typescript
// src/cli/interactive.ts
import { StockAnalystAgent } from "../agent/main-agent.js";
import readline from "readline";
import chalk from "chalk";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log(chalk.blue.bold("\n🤖 Stock Analyst Agent\n"));
  console.log(chalk.gray("Type your question or 'exit' to quit\n"));

  const agent = new StockAnalystAgent();

  const askQuestion = () => {
    rl.question(chalk.green("You: "), async (input) => {
      if (input.toLowerCase() === "exit") {
        const usage = agent.costTracker.getDetailedUsage();
        console.log(
          chalk.yellow(`\nTotal Cost: $${usage.totalCost.toFixed(4)}`)
        );
        console.log(chalk.yellow(`Total Tokens: ${usage.totalTokens}`));
        rl.close();
        process.exit(0);
      }

      try {
        console.log(chalk.blue("\nAgent: "));
        await agent.analyze(input);
        console.log("\n");
        askQuestion();
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        askQuestion();
      }
    });
  };

  askQuestion();
}

main();
```

---

## Testing-Strategie

### 1. Unit Tests

```typescript
// tests/tools/finance-tools.test.ts
import { describe, it, expect, vi } from "vitest";
import { financeToolsServer } from "../../src/tools/finance-tools";
import * as alphaVantage from "../../src/tools/api/alpha-vantage";

describe("Finance Tools", () => {
  it("should fetch stock price", async () => {
    // Mock API response
    vi.spyOn(alphaVantage, "fetchStockPrice").mockResolvedValue({
      symbol: "AAPL",
      price: 180.5,
      change: 2.3,
      changePercent: 1.29,
    });

    const tool = financeToolsServer.tools.find(
      (t) => t.name === "get_stock_price"
    );
    const result = await tool.handler({
      symbol: "AAPL",
      period: "1d",
      interval: "1d",
    });

    expect(result.content[0].text).toContain("AAPL");
    expect(result.content[0].text).toContain("180.5");
  });

  it("should handle API errors", async () => {
    vi.spyOn(alphaVantage, "fetchStockPrice").mockRejectedValue(
      new Error("API rate limit exceeded")
    );

    const tool = financeToolsServer.tools.find(
      (t) => t.name === "get_stock_price"
    );
    const result = await tool.handler({
      symbol: "INVALID",
      period: "1d",
      interval: "1d",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error");
  });
});
```

### 2. Integration Tests

```typescript
// tests/agent/main-agent.test.ts
import { describe, it, expect } from "vitest";
import { StockAnalystAgent } from "../../src/agent/main-agent";

describe("Main Agent", () => {
  it("should analyze a stock", async () => {
    const agent = new StockAnalystAgent();
    const result = await agent.analyze("Analyze AAPL");

    expect(result.sessionId).toBeDefined();
    expect(result.cost).toBeGreaterThan(0);
  });

  it("should continue conversation", async () => {
    const agent = new StockAnalystAgent();

    await agent.analyze("Analyze AAPL");
    const result = await agent.continueConversation(
      "What about technical analysis?"
    );

    expect(result).toBeDefined();
  });
});
```

### 3. Test mit Claude Code

```
"Schreibe Tests für den Stock Analyst Agent:

1. Unit Tests für alle Tools mit Mocks
2. Integration Tests für Agent-Tool Interaktionen
3. E2E Test für komplette Analyse-Journey
4. Edge Cases: API Failures, Rate Limiting, Invalid Symbols
5. Performance Tests: Response Time, Token Usage

Verwende Vitest und erstelle Mock Fixtures."
```

---

## Deployment & Production

### Build für Production

```bash
# 1. Build
npm run build

# 2. Test Production Build
node dist/index.js

# 3. Environment Check
# Stelle sicher alle API Keys sind gesetzt
cat .env

# 4. Run in Production Mode
NODE_ENV=production node dist/index.js
```

### Docker Setup (Optional)

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY .env.example ./.env

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: "3.8"

services:
  stock-analyst:
    build: .
    env_file: .env
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

### Monitoring & Logging

```typescript
// src/utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

---

## Nächste Schritte

### Sofort Starten

**1. Mit Claude Code beginnen:**

```
Öffne Claude Code und sage:

"Ich möchte einen Stock Analyst Agent mit dem Claude Agent SDK bauen.
Bitte erstelle das Basis-Projekt gemäß diesem Implementierungsplan:
[Link zu diesem Dokument]

Starte mit Phase 1, Sprint 1.1: Projekt-Setup"
```

**2. Erste Erfolge:**

Nach 2-3 Stunden solltest du haben:

- ✅ Funktionierendes TypeScript Projekt
- ✅ Alpha Vantage API Client
- ✅ Erstes Finance Tool (get_stock_price)
- ✅ Basis Main Agent

**3. Iterativ erweitern:**

Folge der Roadmap Sprint für Sprint, teste nach jedem Sprint!

### Erweiterte Features (Nach Phase 4)

**Möglich:**

- 📊 Web UI (React + TypeScript)
- 📈 Real-time Dashboard
- 💾 Datenbank für Portfolio Tracking
- 📧 Email Alerts
- 📱 Mobile App
- 🔄 Automated Trading (mit Vorsicht!)
- 🤖 Multi-User Support
- 📊 Advanced Charting

### Ressourcen

**Documentation:**

- Claude Agent SDK Docs: https://docs.claude.com/en/api/agent-sdk
- Alpha Vantage API: https://www.alphavantage.co/documentation/
- MCP Protocol: https://modelcontextprotocol.io

**Community:**

- Claude Discord
- GitHub Discussions
- Stack Overflow

### Support

Bei Fragen oder Problemen:

1. Check die Claude Agent SDK Docs
2. Frag Claude Code um Hilfe
3. Review diesen Implementierungsplan
4. Suche in GitHub Issues

---

## Zusammenfassung

### Warum dieser Approach?

✅ **Strukturiert**: Klarer Plan, Schritt für Schritt
✅ **Iterativ**: Frühe Erfolge, kontinuierliche Verbesserung  
✅ **Mit Claude Code**: AI-Powered Development für schnellere Umsetzung
✅ **Production-Ready**: Tests, Documentation, Deployment von Anfang an
✅ **Erweiterbar**: Solide Basis für zukünftige Features

### Quick Start

```bash
# 1. Repository klonen/erstellen
mkdir stock-analyst-agent && cd stock-analyst-agent

# 2. Sage Claude Code:
"Starte Phase 1, Sprint 1.1 aus dem Implementierungsplan"

# 3. Nach jedem Sprint:
"Continue mit nächstem Sprint [Sprint-Number]"

# 4. Testing:
npm test

# 5. Laufen lassen:
npm run dev
```

### Geschätzter Zeitaufwand

- **Minimum Viable Product (MVP)**: 1-2 Wochen
- **Production Ready**: 3-4 Wochen
- **Mit Advanced Features**: 6-8 Wochen

**Mit Claude Code wird's deutlich schneller!** 🚀

---

**Viel Erfolg beim Bauen deines Stock Analyst Agents! 📈🤖**
