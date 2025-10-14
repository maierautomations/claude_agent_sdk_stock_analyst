# Stock Analyst Agent mit Claude Agent SDK

## Inhaltsverzeichnis
1. [Übersicht](#übersicht)
2. [Ist das Baubar?](#ist-das-baubar)
3. [Architektur des Stock Analyst Agents](#architektur-des-stock-analyst-agents)
4. [Features & Fähigkeiten](#features--fähigkeiten)
5. [Tools für den Stock Analyst](#tools-für-den-stock-analyst)
6. [Subagenten-Architektur](#subagenten-architektur)
7. [Implementierungs-Beispiel](#implementierungs-beispiel)
8. [Vergleich: Claude Agent SDK vs. LangChain/LangGraph](#vergleich-claude-agent-sdk-vs-langchainlanggraph)
9. [Empfehlung](#empfehlung)

---

## Übersicht

Ein **Stock Analyst Agent** mit dem Claude Agent SDK ist absolut machbar und würde ein leistungsstarkes System zur Aktienanalyse darstellen. Das Claude Agent SDK bietet alle notwendigen Komponenten für einen professionellen KI-Agenten mit Multi-Tool-Unterstützung, Subagenten und erweiterten Permissions.

## Ist das Baubar?

**Ja, absolut!** Das Claude Agent SDK ist perfekt für einen Stock Analyst Agenten geeignet, weil:

✅ **Native Tool-Integration**: Einfache Einbindung von Finanz-APIs (Yahoo Finance, Alpha Vantage, etc.)
✅ **Subagenten-Unterstützung**: Spezialisierte Agenten für verschiedene Analyseaufgaben
✅ **Streaming-Modus**: Echtzeit-Updates bei Marktveränderungen
✅ **Permission System**: Kontrolle über Trading-Operationen und API-Zugriffe
✅ **Session Management**: Kontinuierliche Konversationen über Portfolio-Tracking
✅ **MCP Support**: Integration externer Finanz-Services
✅ **Custom Tools**: Eigene Analyse-Tools und Indikatoren

---

## Architektur des Stock Analyst Agents

### Haupt-Agent (Main Stock Analyst)
Der Hauptagent orchestriert alle Subagenten und koordiniert die Analyse-Pipeline.

```typescript
const mainStockAnalyst = query({
  prompt: generatePrompt(),
  options: {
    systemPrompt: {
      preset: 'claude_code',
      extensions: [
        'Du bist ein professioneller Aktienanalyst mit Expertise in:',
        '- Fundamentalanalyse',
        '- Technische Analyse',
        '- Makroökonomische Bewertung',
        '- Portfolio-Optimierung',
        'Nutze deine Subagenten für spezialisierte Aufgaben.'
      ]
    },
    agents: {
      'fundamental-analyst': fundamentalAnalystConfig,
      'technical-analyst': technicalAnalystConfig,
      'sentiment-analyst': sentimentAnalystConfig,
      'risk-analyst': riskAnalystConfig
    },
    mcpServers: {
      'finance-tools': financeToolsServer
    },
    permissionMode: 'default'
  }
});
```

---

## Features & Fähigkeiten

### 1. **Echtzeit-Marktdaten**
- Live Stock Prices
- Historische Preisdaten
- Volumen & Trading-Aktivitäten
- Marktindizes (S&P 500, NASDAQ, etc.)

### 2. **Fundamentalanalyse**
- Bilanzanalyse (Balance Sheet)
- Gewinn- und Verlustrechnungen (Income Statements)
- Cashflow-Analyse
- KPIs: P/E, P/B, ROE, Debt-to-Equity, etc.

### 3. **Technische Analyse**
- Chart-Muster Erkennung
- Technische Indikatoren (RSI, MACD, Bollinger Bands)
- Support & Resistance Levels
- Trend-Analyse

### 4. **Sentiment-Analyse**
- News-Aggregation und Analyse
- Social Media Sentiment (Twitter, Reddit)
- Analystenbewertungen
- Earnings Call Transcripts

### 5. **Portfolio-Management**
- Portfolio-Tracking
- Diversifikations-Analyse
- Rebalancing-Empfehlungen
- Performance-Attribution

### 6. **Risiko-Management**
- Value at Risk (VaR)
- Beta-Berechnung
- Volatilitäts-Analyse
- Korrelations-Matrizen

### 7. **Reporting & Visualisierung**
- Automatische Reports
- Chart-Generierung
- PDF/Excel Exports
- Custom Dashboards

---

## Tools für den Stock Analyst

### Custom MCP Tools (TypeScript)

```typescript
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const financeToolsServer = createSdkMcpServer({
  name: "finance-tools",
  version: "1.0.0",
  tools: [
    // 1. Stock Price Tool
    tool(
      "get_stock_price",
      "Ruft aktuelle und historische Aktienkurse ab",
      {
        symbol: z.string().describe("Aktien-Symbol (z.B. AAPL, TSLA)"),
        period: z.enum(["1d", "1w", "1m", "3m", "1y", "5y"]).describe("Zeitraum"),
        interval: z.enum(["1m", "5m", "1h", "1d"]).default("1d")
      },
      async (args) => {
        const data = await fetchStockData(args.symbol, args.period);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
          }]
        };
      }
    ),

    // 2. Financial Metrics Tool
    tool(
      "get_financial_metrics",
      "Holt fundamentale Finanzkennzahlen eines Unternehmens",
      {
        symbol: z.string().describe("Aktien-Symbol"),
        metrics: z.array(z.enum([
          "pe_ratio", "market_cap", "revenue", "earnings", 
          "debt_to_equity", "roe", "dividend_yield"
        ])).describe("Gewünschte Kennzahlen")
      },
      async (args) => {
        const metrics = await fetchFinancialMetrics(args.symbol, args.metrics);
        return {
          content: [{
            type: "text",
            text: formatMetrics(metrics)
          }]
        };
      }
    ),

    // 3. Technical Indicators Tool
    tool(
      "calculate_technical_indicators",
      "Berechnet technische Indikatoren für eine Aktie",
      {
        symbol: z.string(),
        indicators: z.array(z.enum([
          "rsi", "macd", "bollinger_bands", "moving_average",
          "stochastic", "adx", "fibonacci"
        ])),
        period: z.number().default(14)
      },
      async (args) => {
        const indicators = await calculateIndicators(
          args.symbol, 
          args.indicators, 
          args.period
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(indicators, null, 2)
          }]
        };
      }
    ),

    // 4. News & Sentiment Tool
    tool(
      "analyze_news_sentiment",
      "Analysiert News-Sentiment für eine Aktie",
      {
        symbol: z.string(),
        timeframe: z.enum(["24h", "7d", "30d"]).default("7d"),
        sources: z.array(z.string()).optional()
      },
      async (args) => {
        const sentiment = await analyzeNewsSentiment(
          args.symbol, 
          args.timeframe
        );
        return {
          content: [{
            type: "text",
            text: `Sentiment Score: ${sentiment.score}\n` +
                  `Positive: ${sentiment.positive}%\n` +
                  `Negative: ${sentiment.negative}%\n` +
                  `Neutral: ${sentiment.neutral}%\n\n` +
                  `Top Headlines:\n${sentiment.topHeadlines.join('\n')}`
          }]
        };
      }
    ),

    // 5. Portfolio Analysis Tool
    tool(
      "analyze_portfolio",
      "Analysiert ein Portfolio auf Risiko und Performance",
      {
        positions: z.array(z.object({
          symbol: z.string(),
          quantity: z.number(),
          purchase_price: z.number()
        })),
        analysis_type: z.enum([
          "risk", "performance", "diversification", "rebalancing"
        ])
      },
      async (args) => {
        const analysis = await analyzePortfolio(
          args.positions, 
          args.analysis_type
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(analysis, null, 2)
          }]
        };
      }
    ),

    // 6. Comparison Tool
    tool(
      "compare_stocks",
      "Vergleicht mehrere Aktien anhand verschiedener Metriken",
      {
        symbols: z.array(z.string()).min(2).max(5),
        comparison_metrics: z.array(z.string())
      },
      async (args) => {
        const comparison = await compareStocks(
          args.symbols, 
          args.comparison_metrics
        );
        return {
          content: [{
            type: "text",
            text: formatComparison(comparison)
          }]
        };
      }
    ),

    // 7. Screening Tool
    tool(
      "screen_stocks",
      "Screent Aktien nach bestimmten Kriterien",
      {
        criteria: z.object({
          min_market_cap: z.number().optional(),
          max_pe_ratio: z.number().optional(),
          min_dividend_yield: z.number().optional(),
          sector: z.string().optional(),
          country: z.string().optional()
        }),
        limit: z.number().default(50)
      },
      async (args) => {
        const results = await screenStocks(args.criteria, args.limit);
        return {
          content: [{
            type: "text",
            text: formatScreeningResults(results)
          }]
        };
      }
    ),

    // 8. Alert/Watchlist Tool
    tool(
      "manage_watchlist",
      "Verwaltet Watchlists und Price Alerts",
      {
        action: z.enum(["add", "remove", "list", "check_alerts"]),
        symbol: z.string().optional(),
        alert_conditions: z.object({
          price_above: z.number().optional(),
          price_below: z.number().optional(),
          volume_spike: z.boolean().optional()
        }).optional()
      },
      async (args) => {
        const result = await manageWatchlist(
          args.action, 
          args.symbol, 
          args.alert_conditions
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    )
  ]
});
```

### Verwendung mit Streaming Input

```typescript
async function* streamingPrompt() {
  yield "Analysiere die Aktie AAPL und gib mir eine umfassende Bewertung";
}

const result = await query(streamingPrompt(), {
  mcpServers: {
    "finance-tools": financeToolsServer
  },
  allowedTools: [
    "mcp__finance-tools__get_stock_price",
    "mcp__finance-tools__get_financial_metrics",
    "mcp__finance-tools__calculate_technical_indicators",
    "mcp__finance-tools__analyze_news_sentiment"
  ]
});
```

---

## Subagenten-Architektur

### 1. Fundamental Analyst Subagent

```typescript
const fundamentalAnalystConfig = {
  description: 'Spezialisiert auf Fundamentalanalyse von Unternehmen',
  prompt: `Du bist ein Fundamental-Analyst mit Expertise in:
    - Bilanzanalyse (Balance Sheets, Income Statements, Cash Flow)
    - Bewertungsmodelle (DCF, Comparable Analysis)
    - Branchenvergleiche
    - Geschäftsmodell-Bewertung
    
    Analysiere Unternehmen gründlich und bewerte deren intrinsischen Wert.`,
  tools: [
    'mcp__finance-tools__get_financial_metrics',
    'mcp__finance-tools__get_stock_price',
    'mcp__finance-tools__compare_stocks',
    'Read',
    'Grep'
  ],
  model: 'sonnet' // Claude Sonnet für komplexe Analysen
};
```

### 2. Technical Analyst Subagent

```typescript
const technicalAnalystConfig = {
  description: 'Führt technische Analyse und Chart-Pattern-Erkennung durch',
  prompt: `Du bist ein technischer Analyst spezialisiert auf:
    - Chart-Pattern Erkennung (Head & Shoulders, Double Top/Bottom, etc.)
    - Technische Indikatoren (RSI, MACD, Bollinger Bands)
    - Support & Resistance Levels
    - Volumen-Analyse
    - Trend-Identifikation
    
    Identifiziere Trading-Signale und kurzfristige Marktbewegungen.`,
  tools: [
    'mcp__finance-tools__calculate_technical_indicators',
    'mcp__finance-tools__get_stock_price',
    'Read'
  ],
  model: 'sonnet'
};
```

### 3. Sentiment Analyst Subagent

```typescript
const sentimentAnalystConfig = {
  description: 'Analysiert Marktstimmung durch News und Social Media',
  prompt: `Du bist ein Sentiment-Analyst der:
    - News-Artikel analysiert
    - Social Media Trends identifiziert
    - Analystenbewertungen auswertet
    - Markt-Sentiment quantifiziert
    
    Bewerte die allgemeine Marktstimmung und identifiziere Sentiment-Shifts.`,
  tools: [
    'mcp__finance-tools__analyze_news_sentiment',
    'WebFetch',
    'Read',
    'Grep'
  ],
  model: 'haiku' // Claude Haiku für schnellere, kostengünstigere Analysen
};
```

### 4. Risk Management Subagent

```typescript
const riskAnalystConfig = {
  description: 'Bewertet Risiken und Portfolio-Exposition',
  prompt: `Du bist ein Risiko-Analyst fokussiert auf:
    - Portfolio-Risiko-Bewertung (VaR, CVaR)
    - Diversifikations-Analyse
    - Korrelations-Studien
    - Volatilitäts-Metriken
    - Stress-Testing
    
    Identifiziere Risiken und schlage Mitigation-Strategien vor.`,
  tools: [
    'mcp__finance-tools__analyze_portfolio',
    'mcp__finance-tools__get_financial_metrics',
    'mcp__finance-tools__calculate_technical_indicators'
  ],
  model: 'opus' // Claude Opus für komplexe Risiko-Modellierung
};
```

### 5. Portfolio Manager Subagent

```typescript
const portfolioManagerConfig = {
  description: 'Verwaltet und optimiert Portfolios',
  prompt: `Du bist ein Portfolio-Manager der:
    - Portfolio-Performance tracked
    - Rebalancing-Empfehlungen gibt
    - Asset-Allokation optimiert
    - Tax-Loss Harvesting identifiziert
    
    Optimiere Portfolios für Rendite-Risiko-Verhältnis.`,
  tools: [
    'mcp__finance-tools__analyze_portfolio',
    'mcp__finance-tools__compare_stocks',
    'mcp__finance-tools__screen_stocks',
    'Read',
    'Write'
  ],
  model: 'sonnet'
};
```

### Subagenten-Orchestrierung

```typescript
const result = await query({
  prompt: `Analysiere mein Portfolio und gib Empfehlungen:
    AAPL: 50 Aktien @ $150
    TSLA: 30 Aktien @ $200
    MSFT: 40 Aktien @ $300`,
  options: {
    agents: {
      'fundamental-analyst': fundamentalAnalystConfig,
      'technical-analyst': technicalAnalystConfig,
      'sentiment-analyst': sentimentAnalystConfig,
      'risk-analyst': riskAnalystConfig,
      'portfolio-manager': portfolioManagerConfig
    }
  }
});

// Der Haupt-Agent wird automatisch die richtigen Subagenten delegieren:
// 1. Portfolio Manager analysiert die Positionen
// 2. Fundamental Analyst bewertet die Unternehmen
// 3. Technical Analyst checkt die Charts
// 4. Sentiment Analyst prüft die Marktstimmung
// 5. Risk Analyst bewertet das Portfolio-Risiko
```

---

## Implementierungs-Beispiel

### Vollständiges Beispiel: Stock Analyst Agent

```typescript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// 1. Finance Tools Server erstellen
const financeToolsServer = createSdkMcpServer({
  name: "finance-tools",
  version: "1.0.0",
  tools: [/* ... alle Tools von oben ... */]
});

// 2. Streaming Input Generator
async function* stockAnalystSession() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Hallo! Ich möchte die Aktie AAPL analysieren."
    }
  };

  // Optional: Weitere Nachrichten basierend auf User-Input
  await waitForUserInput();
  
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Wie ist das technische Bild?"
    }
  };
}

// 3. Main Agent mit allen Features
async function runStockAnalyst() {
  const result = await query(stockAnalystSession(), {
    mcpServers: {
      "finance-tools": financeToolsServer
    },
    systemPrompt: {
      preset: 'claude_code',
      extensions: [
        'Du bist ein professioneller Aktienanalyst.',
        'Nutze alle verfügbaren Tools für umfassende Analysen.',
        'Kombiniere Fundamental-, Technische und Sentiment-Analyse.',
        'Gib klare, actionable Empfehlungen mit Risikohinweisen.'
      ]
    },
    agents: {
      'fundamental-analyst': fundamentalAnalystConfig,
      'technical-analyst': technicalAnalystConfig,
      'sentiment-analyst': sentimentAnalystConfig,
      'risk-analyst': riskAnalystConfig,
      'portfolio-manager': portfolioManagerConfig
    },
    permissionMode: 'default',
    hooks: {
      PreToolUse: [{
        hooks: [async (input, toolUseId, { signal }) => {
          // Log alle Tool-Aufrufe für Audit
          console.log(`🔧 Tool: ${input.tool_name}`);
          console.log(`📊 Input: ${JSON.stringify(input.tool_input)}`);
          
          // Blockiere potenziell gefährliche Operationen
          if (input.tool_name === "execute_trade") {
            return {
              decision: "block",
              reason: "Trading-Operationen erfordern manuelle Bestätigung"
            };
          }
          
          return { continue: true };
        }]
      }],
      PostToolUse: [{
        hooks: [async (result, toolUseId, { signal }) => {
          // Log Ergebnisse
          console.log(`✅ Tool completed: ${result.tool_name}`);
          return { continue: true };
        }]
      }]
    },
    onMessage: (message) => {
      // Track Usage für Billing
      if (message.type === 'assistant' && message.usage) {
        console.log(`💰 Tokens: ${message.usage.output_tokens}`);
      }
      
      // Display Streaming Messages
      if (message.type === 'assistant' && message.content) {
        console.log(message.content);
      }
    }
  });

  return result;
}

// 4. Session Management für kontinuierliche Konversationen
let sessionId: string | undefined;

async function runInteractiveSession() {
  // Erste Anfrage
  const result1 = await query({
    prompt: "Analysiere AAPL",
    options: { /* ... */ }
  });

  // Capture Session ID
  for await (const message of result1) {
    if (message.type === 'system' && message.subtype === 'init') {
      sessionId = message.session_id;
      console.log(`📝 Session ID: ${sessionId}`);
    }
  }

  // Fortsetzen der Session
  if (sessionId) {
    const result2 = await query({
      prompt: "Und jetzt vergleiche mit MSFT",
      options: {
        resume: sessionId
      }
    });
  }
}

// 5. Starten
runStockAnalyst();
```

### Python Variante

```python
from claude_agent_sdk import query, tool, create_sdk_mcp_server, ClaudeAgentOptions
from pydantic import BaseModel, Field
from enum import Enum

# Custom Tool Definition
class StockPriceArgs(BaseModel):
    symbol: str = Field(description="Aktien-Symbol")
    period: str = Field(default="1d", description="Zeitraum")

async def get_stock_price(args: StockPriceArgs):
    data = await fetch_stock_data(args.symbol, args.period)
    return {
        "content": [{
            "type": "text",
            "text": json.dumps(data, indent=2)
        }]
    }

# Create MCP Server
custom_server = create_sdk_mcp_server(
    name="finance-tools",
    version="1.0.0",
    tools=[
        tool(
            name="get_stock_price",
            description="Holt Aktienkurse",
            input_schema=StockPriceArgs,
            handler=get_stock_price
        )
    ]
)

# Run Agent
async def streaming_prompt():
    yield "Analysiere AAPL"

result = await query(
    streaming_prompt(),
    mcp_servers={
        "finance-tools": custom_server
    },
    options=ClaudeAgentOptions(
        system_prompt="Du bist ein Stock Analyst",
        permission_mode='default'
    )
)
```

---

## Vergleich: Claude Agent SDK vs. LangChain/LangGraph

### Architektur-Philosophie

| Aspekt | Claude Agent SDK | LangChain/LangGraph |
|--------|------------------|---------------------|
| **Fokus** | Hochspezialisiert für Claude-Modelle | Framework-agnostisch, multi-LLM |
| **Architektur** | Session-basiert, Streaming-first | Graph-basiert, State-Maschine |
| **Komplexität** | Einfacher, weniger Boilerplate | Mehr Kontrolle, mehr Setup |
| **Built-in Features** | Tool-Management, Permissions, Sessions out-of-the-box | Benötigt manuelle Konfiguration |

### State Management

**LangGraph:**
```python
from langgraph.graph import StateGraph, MessagesState
from langgraph.checkpoint.postgres import PostgresSaver

# LangGraph erfordert explizites State Management
class AgentState(MessagesState):
    portfolio: dict
    analysis_results: list
    risk_metrics: dict

def fundamental_analyst(state: AgentState):
    # State muss manuell verwaltet werden
    state["analysis_results"].append(result)
    return state

# Graph mit Checkpointing
workflow = StateGraph(AgentState)
workflow.add_node("fundamental_analyst", fundamental_analyst)
workflow.add_node("technical_analyst", technical_analyst)

# Persistenz benötigt externe DB
checkpointer = PostgresSaver.from_conn_string("postgresql://...")
graph = workflow.compile(checkpointer=checkpointer)
```

**Claude Agent SDK:**
```typescript
// Claude Agent SDK verwaltet State automatisch via Sessions
const result = await query({
  prompt: "Analysiere mein Portfolio",
  options: {
    resume: sessionId  // Session State wird automatisch verwaltet
  }
});

// Kein explizites State Management notwendig
// Conversation Context wird automatisch beibehalten
```

**Vorteil LangGraph:** Granulare Kontrolle über State, optimiert für komplexe State-Maschinen
**Vorteil Claude SDK:** Einfacher, weniger Code, automatisches Session Management

### Multi-Agent Orchestrierung

**LangGraph Supervisor Pattern:**
```python
from langgraph.graph import StateGraph, MessagesState, Command, START, END
from typing import Literal

def supervisor(state: MessagesState) -> Command[Literal["agent_1", "agent_2", END]]:
    # Supervisor entscheidet explizit über Routing
    response = model.invoke(...)
    return Command(goto=response["next_agent"])

def agent_1(state: MessagesState) -> Command[Literal["supervisor"]]:
    response = model.invoke(...)
    return Command(
        goto="supervisor",
        update={"messages": [response]}
    )

# Explizite Graph-Definition
builder = StateGraph(MessagesState)
builder.add_node(supervisor)
builder.add_node(agent_1)
builder.add_node(agent_2)
builder.add_edge(START, "supervisor")
graph = builder.compile()
```

**Claude Agent SDK:**
```typescript
// Implizite Delegation basierend auf Beschreibungen
const result = await query({
  prompt: "Analysiere AAPL fundamental und technisch",
  options: {
    agents: {
      'fundamental-analyst': {
        description: 'Fundamental analysis expert',
        prompt: '...',
        tools: [...]
      },
      'technical-analyst': {
        description: 'Technical analysis expert',
        prompt: '...',
        tools: [...]
      }
    }
  }
});

// Claude entscheidet automatisch welcher Agent wann aufgerufen wird
```

**Vorteil LangGraph:** Explizite Kontrolle über Agent-Routing, deterministisch
**Vorteil Claude SDK:** Weniger Code, intelligentere automatische Delegation

### Tool Management

**LangChain:**
```python
from langchain.tools import tool
from langchain.agents import create_react_agent

@tool
def get_stock_price(symbol: str) -> str:
    """Holt Aktienkurs"""
    return fetch_price(symbol)

# Tools müssen manuell an Agent übergeben werden
tools = [get_stock_price, get_financial_metrics]
agent = create_react_agent(
    llm=llm,
    tools=tools,
    prompt=prompt_template
)
```

**Claude Agent SDK:**
```typescript
// MCP-basiertes Tool System mit Namespacing
const financeTools = createSdkMcpServer({
  name: "finance-tools",
  version: "1.0.0",
  tools: [
    tool("get_stock_price", "...", schema, handler),
    tool("get_financial_metrics", "...", schema, handler)
  ]
});

// Tools mit Prefix-Namespacing: mcp__finance-tools__get_stock_price
const result = await query(prompt, {
  mcpServers: { "finance-tools": financeTools },
  allowedTools: ["mcp__finance-tools__*"]
});
```

**Vorteil LangChain:** Einfache Tool-Definition, viele vorgefertigte Tools
**Vorteil Claude SDK:** MCP-Standard, bessere Organisation, Namespacing

### Permissions & Safety

**LangGraph:**
```python
# Permissions müssen manuell implementiert werden
def agent_with_permission_check(state):
    if requires_permission(state["action"]):
        # Custom Permission Logic
        if not ask_user_permission():
            return {"error": "Permission denied"}
    return execute_action(state)
```

**Claude Agent SDK:**
```typescript
// Built-in Permission System
const result = await query(prompt, {
  options: {
    permissionMode: 'default',  // oder 'acceptEdits', 'bypassPermissions'
    canUseTool: async (toolName, input) => {
      if (toolName === "execute_trade") {
        return {
          behavior: "deny",
          message: "Trading requires manual approval"
        };
      }
      return { behavior: "allow" };
    },
    hooks: {
      PreToolUse: [/* ... */]
    }
  }
});
```

**Vorteil LangGraph:** Vollständige Kontrolle
**Vorteil Claude SDK:** Built-in Permission System, weniger manueller Code

### Persistenz & Memory

**LangGraph:**
```python
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.store.postgres import PostgresStore

# Explizite Persistenz-Konfiguration
store = PostgresStore.from_conn_string("postgresql://...")
checkpointer = PostgresSaver.from_conn_string("postgresql://...")

graph = builder.compile(
    checkpointer=checkpointer,
    store=store
)

# State wird bei jedem Step gespeichert
config = {"configurable": {"thread_id": "1", "user_id": "1"}}
result = graph.invoke(input, config)
```

**Claude Agent SDK:**
```typescript
// Session-basierte Persistenz
let sessionId: string;

const result1 = await query({ prompt: "Start analysis" });
// Session ID wird automatisch erstellt

// Session fortsetzen
const result2 = await query({
  prompt: "Continue",
  options: { resume: sessionId }
});
```

**Vorteil LangGraph:** Granulare Kontrolle, eigene DB-Wahl, State-Snapshots
**Vorteil Claude SDK:** Einfacher, automatisches Session Management

### Streaming & Interaktivität

**LangGraph:**
```python
# Streaming mit explizitem State
for chunk in graph.stream(input, config, stream_mode="values"):
    print(chunk)
```

**Claude Agent SDK:**
```typescript
// Streaming-First Design
async function* streamingInput() {
  yield { type: "user", message: {...} };
  await waitForCondition();
  yield { type: "user", message: {...} };
}

const result = await query(streamingInput(), {
  onMessage: (message) => {
    // Real-time message handling
    console.log(message);
  }
});
```

**Vorteil LangGraph:** Flexible Stream-Modi
**Vorteil Claude SDK:** Native Streaming, Queued Messages, Interrupts

### Code-Vergleich: Stock Analyst Implementation

**LangGraph Implementierung (~150 Zeilen):**
```python
from langgraph.graph import StateGraph, MessagesState, Command
from langgraph.checkpoint.postgres import PostgresSaver
from typing import List, Dict, Literal

class StockAnalystState(MessagesState):
    portfolio: Dict
    analysis_results: List
    current_stock: str
    risk_score: float

def supervisor(state: StockAnalystState) -> Command[Literal["fundamental", "technical", "sentiment", END]]:
    messages = state["messages"]
    # Entscheide nächsten Schritt
    if needs_fundamental_analysis(messages):
        return Command(goto="fundamental")
    elif needs_technical_analysis(messages):
        return Command(goto="technical")
    # ... mehr Routing Logic
    return Command(goto=END)

def fundamental_analyst(state: StockAnalystState) -> Command[Literal["supervisor"]]:
    symbol = state["current_stock"]
    analysis = perform_fundamental_analysis(symbol)
    state["analysis_results"].append(analysis)
    return Command(
        goto="supervisor",
        update={"messages": [create_message(analysis)]}
    )

def technical_analyst(state: StockAnalystState) -> Command[Literal["supervisor"]]:
    # ... ähnliche Implementierung
    pass

# Graph Setup
workflow = StateGraph(StockAnalystState)
workflow.add_node("supervisor", supervisor)
workflow.add_node("fundamental", fundamental_analyst)
workflow.add_node("technical", technical_analyst)
workflow.add_node("sentiment", sentiment_analyst)
workflow.add_edge(START, "supervisor")

# Checkpointing
checkpointer = PostgresSaver.from_conn_string("postgresql://...")
graph = workflow.compile(checkpointer=checkpointer)

# Execution
config = {"configurable": {"thread_id": "1"}}
result = graph.invoke(
    {"messages": [{"role": "user", "content": "Analyze AAPL"}]},
    config
)
```

**Claude Agent SDK Implementierung (~50 Zeilen):**
```typescript
import { query, createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";

// Tools definieren
const financeTools = createSdkMcpServer({
  name: "finance",
  version: "1.0.0",
  tools: [/* ... tool definitions ... */]
});

// Subagenten definieren
const agents = {
  'fundamental-analyst': {
    description: 'Performs fundamental analysis',
    prompt: 'You are a fundamental analyst...',
    tools: ['mcp__finance__get_financial_metrics']
  },
  'technical-analyst': {
    description: 'Performs technical analysis',
    prompt: 'You are a technical analyst...',
    tools: ['mcp__finance__calculate_indicators']
  }
};

// Run
async function* input() {
  yield "Analyze AAPL comprehensively";
}

const result = await query(input(), {
  mcpServers: { "finance": financeTools },
  agents,
  systemPrompt: {
    preset: 'claude_code',
    extensions: ['You are a professional stock analyst']
  }
});
```

### Zusammenfassung: Wann was?

| Use Case | Empfehlung |
|----------|------------|
| **Komplexe State-Maschinen** | LangGraph ⭐ |
| **Deterministisches Routing** | LangGraph ⭐ |
| **Multi-LLM Support** | LangChain/LangGraph ⭐ |
| **Schnelle Prototypen** | Claude Agent SDK ⭐⭐⭐ |
| **Claude-spezifische Features** | Claude Agent SDK ⭐⭐⭐ |
| **Built-in Permissions** | Claude Agent SDK ⭐⭐⭐ |
| **Session Management** | Claude Agent SDK ⭐⭐⭐ |
| **Weniger Boilerplate** | Claude Agent SDK ⭐⭐⭐ |
| **Granulare State-Kontrolle** | LangGraph ⭐⭐⭐ |
| **Production Deployment** | Beide (je nach Anforderungen) |

---

## Empfehlung

### Für einen Stock Analyst Agent: **Claude Agent SDK** 

**Gründe:**

1. **✅ Schnellere Entwicklung**: Weniger Boilerplate, schneller zum MVP
2. **✅ Built-in Features**: Permissions, Sessions, Streaming out-of-the-box
3. **✅ Bessere Integration**: Native Claude-Optimierung für beste Ergebnisse
4. **✅ MCP Standard**: Zukunftssicher, wachsendes Ökosystem
5. **✅ Einfachere Subagenten**: Weniger Code für Multi-Agent-Systeme
6. **✅ Session Management**: Perfekt für kontinuierliche Konversationen
7. **✅ Streaming-First**: Ideal für real-time Updates

### Wann LangGraph/LangChain?

- Du brauchst **multiple LLM-Provider** (GPT-4, Gemini, Claude)
- Du benötigst **sehr komplexe State-Maschinen** mit vielen Zuständen
- Du willst **deterministisches Routing** zwischen Agenten
- Du brauchst **granulare Kontrolle** über jeden State-Übergang
- Du hast **spezifische Persistenz-Anforderungen**

### Best Practice: Hybrid Approach

Du könntest auch einen **Hybrid-Ansatz** verwenden:
- **Claude Agent SDK** für den Haupt-Agent und UI-Interaktion
- **LangGraph** für komplexe Sub-Workflows (z.B. multi-step portfolio optimization)

```typescript
// Haupt-Agent mit Claude SDK
const mainAgent = await query(input, {
  agents: {
    'portfolio-optimizer': {
      description: 'Optimizes portfolios using LangGraph',
      prompt: '...',
      tools: ['call_langgraph_workflow']  // Bridge zu LangGraph
    }
  }
});

// LangGraph für komplexe Optimierung
const langGraphWorkflow = buildOptimizationGraph();
```

---

## Fazit

Ein **Stock Analyst Agent** ist mit dem **Claude Agent SDK absolut machbar** und bietet:

✅ **8+ Custom Tools** für Finanzanalyse
✅ **5 Spezialisierte Subagenten** (Fundamental, Technical, Sentiment, Risk, Portfolio)
✅ **Echtzeit-Streaming** für Live-Updates
✅ **Session Management** für kontinuierliche Konversationen
✅ **Permission System** für sichere Operationen
✅ **MCP Integration** für externe Services

Der **Claude Agent SDK** ist die bessere Wahl für diesen Use Case wegen:
- Einfacherer Implementierung
- Besserer Claude-Integration
- Built-in Features (Permissions, Sessions)
- Weniger Code, schnellere Entwicklung

**LangGraph** wäre besser wenn:
- Multi-LLM Support benötigt wird
- Sehr komplexe State-Maschinen erforderlich sind
- Granulare Kontrolle über State-Übergänge wichtig ist

**Nächste Schritte:**
1. ✅ Konzept verstanden
2. 🔨 Finance APIs auswählen (Alpha Vantage, Yahoo Finance, etc.)
3. 🔨 Custom Tools implementieren
4. 🔨 Subagenten konfigurieren
5. 🔨 Testing & Iteration
6. 🚀 Production Deployment

Viel Erfolg mit deinem Stock Analyst Agent! 🚀📈
