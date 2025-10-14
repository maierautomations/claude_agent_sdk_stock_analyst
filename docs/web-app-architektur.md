# Stock Analyst Web App - Architektur & Spezifikation

> Detaillierte Spezifikation für die Web-basierte Stock Analyst Anwendung mit Portfolio Management und AI-Agent Integration

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [System-Architektur](#system-architektur)
3. [Frontend Spezifikation](#frontend-spezifikation)
4. [Backend API](#backend-api)
5. [Datenbank Schema](#datenbank-schema)
6. [Agent Integration](#agent-integration)
7. [User Flows](#user-flows)
8. [Security & Privacy](#security--privacy)
9. [Implementation Roadmap](#implementation-roadmap)
10. [API Referenz](#api-referenz)

---

## Übersicht

### Was bauen wir?

Eine **Web-basierte Stock Analyst Anwendung**, die es Usern ermöglicht:

✅ **Portfolio Management**

- Portfolio/Depot manuell anlegen und pflegen
- Positionen hinzufügen, bearbeiten, löschen
- Multiple Portfolios verwalten
- Watchlists erstellen

✅ **AI-Powered Analysis**

- Mit Stock Analyst Agent chatten
- Agent hat Read-Only Zugriff auf User-Portfolio
- Agent analysiert Portfolio und gibt Empfehlungen
- Conversation History speichern

✅ **Dashboard & Analytics**

- Portfolio Performance visualisieren
- Position Details anzeigen
- Gewinn/Verlust Tracking
- Risk Metrics Dashboard

### Kern-Prinzipien

🔒 **Security First**

- User-Daten strikt isoliert
- Agent hat nur Read-Access
- Keine automatischen Trades
- Verschlüsselte Datenbank

👤 **User Control**

- User hat volle Kontrolle über Portfolio
- Agent ist nur "Berater"
- Alle Changes manuell durch User

📊 **Datenfluss**

```
User → Frontend → Backend API → Database
                      ↓
                Agent SDK (Read-Only)
                      ↓
                Finance APIs
```

---

## System-Architektur

### High-Level Übersicht

```
┌───────────────────────────────────────────────────────────────┐
│                         Web Frontend                          │
│              (React/Next.js + TypeScript)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Portfolio   │  │   Agent      │  │  Dashboard   │       │
│  │  Management  │  │   Chat       │  │  Analytics   │       │
│  │  - Add/Edit  │  │  - Converse  │  │  - Charts    │       │
│  │  - Positions │  │  - History   │  │  - Metrics   │       │
│  │  - Watchlist │  │  - Context   │  │  - Reports   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼──────────────────┼──────────────────┼───────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │ REST API / WebSocket
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                      Backend (Node.js)                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                     API Layer (Express)                   ││
│  │  - Authentication & Authorization                         ││
│  │  - Request Validation                                     ││
│  │  - Rate Limiting                                          ││
│  └────────────────────────┬──────────────────────────────────┘│
│  ┌────────────────────────┼──────────────────────────────────┐│
│  │         Service Layer                                     ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   ││
│  │  │  Portfolio   │  │    Agent     │  │    Auth      │   ││
│  │  │   Service    │  │   Service    │  │   Service    │   ││
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   ││
│  └─────────┼──────────────────┼──────────────────┼───────────┘│
└────────────┼──────────────────┼──────────────────┼────────────┘
             │                  │                  │
     ┌───────┴───────┐  ┌───────┴───────┐  ┌──────┴───────┐
     ▼               │  ▼               │  ▼              │
┌─────────────┐      │ ┌──────────────────┐  ┌─────────────┐
│  PostgreSQL │      │ │ Claude Agent SDK │  │    Redis    │
│  Database   │      │ │                  │  │   (Cache/   │
│             │      │ │ Finance Tools    │  │   Sessions) │
│ - Users     │      │ │ MCP Server       │  └─────────────┘
│ - Portfolios│      │ └────────┬─────────┘
│ - Positions │      │          │
│ - Sessions  │      │          ▼
└─────────────┘      │ ┌──────────────────┐
                     │ │  Finance APIs    │
                     │ │ - Alpha Vantage  │
                     │ │ - News API       │
                     │ │ - Yahoo Finance  │
                     │ └──────────────────┘
                     │
                     ▼
            ┌──────────────────┐
            │  External Files  │
            │  - CSV Import    │
            │  - Excel Export  │
            └──────────────────┘
```

### Tech Stack

**Frontend:**

```typescript
- Framework: Next.js 14+ (React 18+)
- Language: TypeScript
- UI Library: Tailwind CSS + shadcn/ui
- State Management: Zustand / React Query
- Charts: Recharts / Chart.js
- Forms: React Hook Form + Zod
- Auth: NextAuth.js
```

**Backend:**

```typescript
- Runtime: Node.js 20+
- Framework: Express.js
- Language: TypeScript
- ORM: Prisma
- Validation: Zod
- Auth: JWT + bcrypt
- Agent: Claude Agent SDK
```

**Database:**

```
- Primary: PostgreSQL 15+
- Cache: Redis 7+
- Search: PostgreSQL Full-Text Search
```

**Infrastructure:**

```
- Deployment: Docker + Docker Compose
- Reverse Proxy: Nginx
- SSL: Let's Encrypt
- Monitoring: Winston Logging
```

---

## Frontend Spezifikation

### Seiten-Struktur

```
/
├── / (landing page)
│   └── Marketing, Features, Pricing
│
├── /auth
│   ├── /login
│   ├── /register
│   └── /forgot-password
│
├── /dashboard (protected)
│   ├── Overview Dashboard
│   ├── Portfolio Summary Cards
│   └── Quick Actions
│
├── /portfolios (protected)
│   ├── /portfolios - List all portfolios
│   ├── /portfolios/new - Create new portfolio
│   ├── /portfolios/[id] - Portfolio details
│   │   ├── Positions table
│   │   ├── Performance charts
│   │   ├── Add position form
│   │   └── Portfolio settings
│   └── /portfolios/[id]/edit - Edit portfolio
│
├── /watchlist (protected)
│   ├── Stock watchlist
│   ├── Add/remove stocks
│   └── Price alerts
│
├── /agent (protected)
│   ├── Chat interface
│   ├── Conversation history
│   ├── Portfolio context selector
│   └── Cost tracking display
│
├── /analytics (protected)
│   ├── Advanced portfolio analytics
│   ├── Risk metrics
│   ├── Correlation matrices
│   └── Performance reports
│
└── /settings (protected)
    ├── Profile
    ├── Security
    ├── API Keys (future)
    └── Preferences
```

### UI Components

#### 1. Portfolio Manager Component

```typescript
// components/portfolio/PortfolioManager.tsx
interface PortfolioManagerProps {
  userId: string;
}

/**
 * Main Portfolio Management Component
 *
 * Features:
 * - List all portfolios
 * - Create/Edit/Delete portfolios
 * - Switch between portfolios
 * - Import from CSV
 */
export function PortfolioManager({ userId }: PortfolioManagerProps) {
  // Portfolio list
  // CRUD operations
  // CSV import modal
  // Portfolio selector
}
```

#### 2. Position Form Component

```typescript
// components/portfolio/PositionForm.tsx
interface PositionFormProps {
  portfolioId: string;
  position?: Position; // For edit mode
  onSuccess: () => void;
}

interface PositionFormData {
  symbol: string; // Stock ticker (AAPL)
  quantity: number; // Number of shares
  purchasePrice: number; // Price per share
  purchaseDate: string; // ISO date string
  notes?: string; // Optional notes
}

/**
 * Add/Edit Position Form
 *
 * Validation:
 * - Symbol must be valid (check against API)
 * - Quantity > 0
 * - Purchase price > 0
 * - Date not in future
 */
export function PositionForm({
  portfolioId,
  position,
  onSuccess,
}: PositionFormProps) {
  // Form state with React Hook Form
  // Zod validation
  // Symbol lookup/validation
  // Submit handler
}
```

#### 3. Agent Chat Component

```typescript
// components/agent/AgentChat.tsx
interface AgentChatProps {
  userId: string;
  portfolioId?: string; // Optional: specific portfolio context
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  tokens?: number;
  cost?: number;
}

/**
 * Agent Chat Interface
 *
 * Features:
 * - Streaming responses
 * - Portfolio context selection
 * - Conversation history
 * - Cost tracking display
 * - Loading states
 * - Error handling
 */
export function AgentChat({ userId, portfolioId }: AgentChatProps) {
  // WebSocket connection for streaming
  // Message history
  // Input field with auto-complete
  // Portfolio context selector
  // Cost counter
}
```

#### 4. Portfolio Dashboard Component

```typescript
// components/portfolio/PortfolioDashboard.tsx
interface PortfolioDashboardProps {
  portfolioId: string;
}

/**
 * Portfolio Dashboard with Analytics
 *
 * Displays:
 * - Total value
 * - Gain/Loss ($ and %)
 * - Positions table
 * - Performance chart (historical)
 * - Sector allocation pie chart
 * - Top gainers/losers
 */
export function PortfolioDashboard({ portfolioId }: PortfolioDashboardProps) {
  // Fetch portfolio data
  // Calculate metrics
  // Charts
  // Position list
}
```

#### 5. Position Table Component

```typescript
// components/portfolio/PositionTable.tsx
interface PositionTableProps {
  portfolioId: string;
  editable?: boolean;
}

interface PositionRow {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  purchaseDate: string;
}

/**
 * Interactive Position Table
 *
 * Features:
 * - Real-time price updates
 * - Sortable columns
 * - Edit/Delete actions
 * - Color coding (green/red for gain/loss)
 * - Export to CSV
 */
export function PositionTable({
  portfolioId,
  editable = true,
}: PositionTableProps) {
  // Fetch positions
  // Fetch current prices
  // Calculate metrics
  // Table rendering
  // Actions (edit/delete)
}
```

### State Management

**Global State (Zustand Store):**

```typescript
// stores/useUserStore.ts
interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

// stores/usePortfolioStore.ts
interface PortfolioStore {
  portfolios: Portfolio[];
  activePortfolioId: string | null;
  isLoading: boolean;

  fetchPortfolios: () => Promise<void>;
  createPortfolio: (data: CreatePortfolioDto) => Promise<Portfolio>;
  updatePortfolio: (id: string, data: UpdatePortfolioDto) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  setActivePortfolio: (id: string) => void;
}

// stores/useAgentStore.ts
interface AgentStore {
  sessionId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  totalCost: number;

  sendMessage: (message: string, portfolioId?: string) => Promise<void>;
  clearHistory: () => void;
  loadHistory: (sessionId: string) => Promise<void>;
}
```

### Data Fetching (React Query)

```typescript
// hooks/usePortfolio.ts
export function usePortfolio(portfolioId: string) {
  return useQuery({
    queryKey: ["portfolio", portfolioId],
    queryFn: () => api.portfolios.getById(portfolioId),
    staleTime: 1000 * 60, // 1 minute
  });
}

// hooks/usePositions.ts
export function usePositions(portfolioId: string) {
  return useQuery({
    queryKey: ["positions", portfolioId],
    queryFn: () => api.positions.getByPortfolio(portfolioId),
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}

// hooks/useCurrentPrices.ts
export function useCurrentPrices(symbols: string[]) {
  return useQuery({
    queryKey: ["prices", symbols],
    queryFn: () => api.prices.getBatch(symbols),
    refetchInterval: 1000 * 60, // Refresh every minute
  });
}
```

---

## Backend API

### Project Structure

```
backend/
├── src/
│   ├── index.ts                    # App entry point
│   ├── config/
│   │   ├── database.ts             # Prisma setup
│   │   ├── redis.ts                # Redis client
│   │   └── env.ts                  # Environment variables
│   ├── middleware/
│   │   ├── auth.ts                 # JWT authentication
│   │   ├── validation.ts           # Request validation
│   │   ├── rateLimiter.ts          # Rate limiting
│   │   └── errorHandler.ts         # Error handling
│   ├── routes/
│   │   ├── auth.routes.ts          # Auth endpoints
│   │   ├── portfolio.routes.ts     # Portfolio CRUD
│   │   ├── position.routes.ts      # Position CRUD
│   │   ├── agent.routes.ts         # Agent interaction
│   │   └── analytics.routes.ts     # Analytics endpoints
│   ├── services/
│   │   ├── auth.service.ts         # Authentication logic
│   │   ├── portfolio.service.ts    # Portfolio business logic
│   │   ├── position.service.ts     # Position business logic
│   │   ├── agent.service.ts        # Agent integration
│   │   ├── price.service.ts        # Price fetching
│   │   └── analytics.service.ts    # Analytics calculations
│   ├── agent/
│   │   ├── stock-analyst-agent.ts  # Main agent
│   │   ├── finance-tools.ts        # MCP tools
│   │   └── config.ts               # Agent config
│   ├── utils/
│   │   ├── logger.ts               # Winston logger
│   │   ├── validation.ts           # Zod schemas
│   │   └── errors.ts               # Custom errors
│   └── types/
│       ├── portfolio.types.ts      # Portfolio types
│       ├── agent.types.ts          # Agent types
│       └── api.types.ts            # API types
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # DB migrations
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json
```

### Core Services

#### 1. Portfolio Service

```typescript
// services/portfolio.service.ts
import { PrismaClient } from "@prisma/client";
import {
  CreatePortfolioDto,
  UpdatePortfolioDto,
} from "../types/portfolio.types";

export class PortfolioService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all portfolios for a user
   * READ-ONLY: Used by Agent
   */
  async getByUserId(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
      include: {
        positions: true,
        _count: {
          select: { positions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get single portfolio with all details
   * READ-ONLY: Used by Agent
   */
  async getById(portfolioId: string, userId: string) {
    // Verify ownership
    const portfolio = await this.prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId, // Important: Ensure user owns this portfolio!
      },
      include: {
        positions: true,
      },
    });

    if (!portfolio) {
      throw new Error("Portfolio not found or access denied");
    }

    return portfolio;
  }

  /**
   * Create new portfolio
   */
  async create(userId: string, data: CreatePortfolioDto) {
    return this.prisma.portfolio.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  /**
   * Update portfolio
   */
  async update(portfolioId: string, userId: string, data: UpdatePortfolioDto) {
    // Verify ownership
    await this.getById(portfolioId, userId);

    return this.prisma.portfolio.update({
      where: { id: portfolioId },
      data,
    });
  }

  /**
   * Delete portfolio
   */
  async delete(portfolioId: string, userId: string) {
    // Verify ownership
    await this.getById(portfolioId, userId);

    return this.prisma.portfolio.delete({
      where: { id: portfolioId },
    });
  }

  /**
   * Calculate portfolio metrics
   * Used for dashboard display
   */
  async calculateMetrics(portfolioId: string, userId: string) {
    const portfolio = await this.getById(portfolioId, userId);

    // Fetch current prices for all positions
    const symbols = portfolio.positions.map((p) => p.symbol);
    const currentPrices = await this.priceService.getBatch(symbols);

    // Calculate total value, gain/loss, etc.
    let totalValue = 0;
    let totalCost = 0;

    const positionsWithMetrics = portfolio.positions.map((position) => {
      const currentPrice = currentPrices[position.symbol];
      const positionValue = position.quantity * currentPrice;
      const positionCost = position.quantity * position.purchasePrice;
      const gainLoss = positionValue - positionCost;
      const gainLossPercent = (gainLoss / positionCost) * 100;

      totalValue += positionValue;
      totalCost += positionCost;

      return {
        ...position,
        currentPrice,
        value: positionValue,
        gainLoss,
        gainLossPercent,
      };
    });

    return {
      positions: positionsWithMetrics,
      totalValue,
      totalCost,
      totalGainLoss: totalValue - totalCost,
      totalGainLossPercent: ((totalValue - totalCost) / totalCost) * 100,
      cash: portfolio.cash,
      totalAssets: totalValue + portfolio.cash,
    };
  }
}
```

#### 2. Agent Service

```typescript
// services/agent.service.ts
import { StockAnalystAgent } from "../agent/stock-analyst-agent";
import { PortfolioService } from "./portfolio.service";

export class AgentService {
  private agents: Map<string, StockAnalystAgent> = new Map();

  constructor(
    private portfolioService: PortfolioService,
    private prisma: PrismaClient
  ) {}

  /**
   * Send query to agent with portfolio context
   */
  async query(
    userId: string,
    message: string,
    portfolioId?: string
  ): AsyncGenerator<any, void, unknown> {
    // Get or create agent for this user
    let agent = this.agents.get(userId);
    if (!agent) {
      agent = new StockAnalystAgent();
      this.agents.set(userId, agent);
    }

    // Load portfolio context if specified
    let portfolioContext = null;
    if (portfolioId) {
      portfolioContext = await this.portfolioService.getById(
        portfolioId,
        userId
      );
    }

    // Build context message
    let contextualizedMessage = message;
    if (portfolioContext) {
      const portfolioSummary = this.buildPortfolioSummary(portfolioContext);
      contextualizedMessage = `
User Portfolio Context:
${portfolioSummary}

User Question: ${message}
`;
    }

    // Stream agent response
    yield * agent.queryStream(contextualizedMessage);

    // Save conversation to database
    await this.saveConversation(userId, agent.sessionId!, message, portfolioId);
  }

  /**
   * Build portfolio summary for agent context
   * READ-ONLY: Agent only reads this data
   */
  private buildPortfolioSummary(portfolio: any): string {
    const positions = portfolio.positions
      .map((p) => `- ${p.symbol}: ${p.quantity} shares @ $${p.purchasePrice}`)
      .join("\n");

    return `
Portfolio: ${portfolio.name}
Cash: $${portfolio.cash}
Positions:
${positions}
`;
  }

  /**
   * Save conversation to database
   */
  private async saveConversation(
    userId: string,
    sessionId: string,
    message: string,
    portfolioId?: string
  ) {
    await this.prisma.conversation.create({
      data: {
        userId,
        sessionId,
        portfolioId,
        userMessage: message,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get conversation history
   */
  async getHistory(userId: string, limit: number = 50) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        portfolio: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Get cost summary for user
   */
  async getCostSummary(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { userId },
      select: { totalCost: true },
    });

    const totalCost = conversations.reduce(
      (sum, conv) => sum + (conv.totalCost || 0),
      0
    );

    return {
      totalCost,
      conversationCount: conversations.length,
      averageCost: totalCost / conversations.length,
    };
  }

  /**
   * Cleanup: Remove agent from memory
   */
  cleanup(userId: string) {
    this.agents.delete(userId);
  }
}
```

#### 3. Position Service

```typescript
// services/position.service.ts
export class PositionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Add position to portfolio
   */
  async create(portfolioId: string, userId: string, data: CreatePositionDto) {
    // Verify portfolio ownership
    await this.portfolioService.getById(portfolioId, userId);

    // Validate symbol
    await this.validateSymbol(data.symbol);

    return this.prisma.position.create({
      data: {
        ...data,
        portfolioId,
      },
    });
  }

  /**
   * Update position
   */
  async update(positionId: string, userId: string, data: UpdatePositionDto) {
    // Get position and verify ownership through portfolio
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
      include: { portfolio: true },
    });

    if (!position || position.portfolio.userId !== userId) {
      throw new Error("Position not found or access denied");
    }

    return this.prisma.position.update({
      where: { id: positionId },
      data,
    });
  }

  /**
   * Delete position
   */
  async delete(positionId: string, userId: string) {
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
      include: { portfolio: true },
    });

    if (!position || position.portfolio.userId !== userId) {
      throw new Error("Position not found or access denied");
    }

    return this.prisma.position.delete({
      where: { id: positionId },
    });
  }

  /**
   * Validate stock symbol
   */
  private async validateSymbol(symbol: string): Promise<boolean> {
    try {
      // Call Alpha Vantage or similar to validate symbol exists
      const response = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
      );
      const data = await response.json();

      if (!data.bestMatches || data.bestMatches.length === 0) {
        throw new Error(`Invalid stock symbol: ${symbol}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Symbol validation failed: ${error.message}`);
    }
  }
}
```

---

## Datenbank Schema

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Model
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String         @map("password_hash")
  firstName     String?        @map("first_name")
  lastName      String?        @map("last_name")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  portfolios    Portfolio[]
  conversations Conversation[]
  watchlist     WatchlistItem[]

  @@map("users")
}

// Portfolio Model
model Portfolio {
  id          String     @id @default(uuid())
  userId      String     @map("user_id")
  name        String
  description String?
  cash        Decimal    @default(0) @db.Decimal(15, 2)
  currency    String     @default("USD")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  positions    Position[]
  transactions Transaction[]
  conversations Conversation[]

  @@index([userId])
  @@map("portfolios")
}

// Position Model
model Position {
  id            String   @id @default(uuid())
  portfolioId   String   @map("portfolio_id")
  symbol        String   @db.VarChar(10)
  quantity      Decimal  @db.Decimal(15, 4)
  purchasePrice Decimal  @map("purchase_price") @db.Decimal(15, 2)
  purchaseDate  DateTime @map("purchase_date") @db.Date
  notes         String?  @db.Text
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  portfolio Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  @@index([portfolioId])
  @@index([symbol])
  @@map("positions")
}

// Transaction Model (for history tracking)
model Transaction {
  id              String   @id @default(uuid())
  portfolioId     String   @map("portfolio_id")
  symbol          String   @db.VarChar(10)
  type            String   @db.VarChar(10) // 'BUY' or 'SELL'
  quantity        Decimal  @db.Decimal(15, 4)
  price           Decimal  @db.Decimal(15, 2)
  fees            Decimal  @default(0) @db.Decimal(10, 2)
  transactionDate DateTime @map("transaction_date") @db.Date
  notes           String?  @db.Text
  createdAt       DateTime @default(now()) @map("created_at")

  portfolio Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  @@index([portfolioId])
  @@index([symbol])
  @@index([transactionDate])
  @@map("transactions")
}

// Conversation Model (Agent chat history)
model Conversation {
  id           String    @id @default(uuid())
  userId       String    @map("user_id")
  portfolioId  String?   @map("portfolio_id")
  sessionId    String    @map("session_id")
  userMessage  String    @map("user_message") @db.Text
  agentResponse String?  @map("agent_response") @db.Text
  totalTokens  Int?      @map("total_tokens")
  totalCost    Decimal?  @map("total_cost") @db.Decimal(10, 6)
  timestamp    DateTime  @default(now())

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  portfolio Portfolio? @relation(fields: [portfolioId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([sessionId])
  @@index([timestamp])
  @@map("conversations")
}

// Watchlist Model
model WatchlistItem {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  symbol    String   @db.VarChar(10)
  notes     String?  @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, symbol])
  @@index([userId])
  @@map("watchlist")
}

// Price Cache Model (optional, for caching API responses)
model PriceCache {
  id        String   @id @default(uuid())
  symbol    String   @unique @db.VarChar(10)
  price     Decimal  @db.Decimal(15, 2)
  change    Decimal? @db.Decimal(10, 2)
  changePercent Decimal? @map("change_percent") @db.Decimal(10, 4)
  volume    BigInt?
  timestamp DateTime @default(now())
  expiresAt DateTime @map("expires_at")

  @@index([symbol])
  @@index([expiresAt])
  @@map("price_cache")
}
```

### Database Indexes

```sql
-- Performance indexes for common queries

-- User lookups
CREATE INDEX idx_users_email ON users(email);

-- Portfolio queries
CREATE INDEX idx_portfolios_user_created ON portfolios(user_id, created_at DESC);

-- Position queries
CREATE INDEX idx_positions_portfolio_symbol ON positions(portfolio_id, symbol);

-- Conversation queries
CREATE INDEX idx_conversations_user_timestamp ON conversations(user_id, timestamp DESC);
CREATE INDEX idx_conversations_session ON conversations(session_id);

-- Watchlist queries
CREATE INDEX idx_watchlist_user_symbol ON watchlist(user_id, symbol);

-- Price cache
CREATE INDEX idx_price_cache_expires ON price_cache(expires_at) WHERE expires_at > NOW();
```

---

## Agent Integration

### Agent-Portfolio Context Flow

```typescript
// agent/stock-analyst-agent.ts

export class StockAnalystAgent {
  private sessionId?: string;
  private costTracker = new CostTracker();

  /**
   * Query agent with portfolio context (READ-ONLY)
   *
   * Important: Agent only READS portfolio data
   * Agent CANNOT modify portfolio
   */
  async *queryStream(
    userMessage: string,
    portfolioContext?: PortfolioContext
  ): AsyncGenerator<AgentMessage, void, unknown> {
    // Build contextualized prompt
    const prompt = this.buildPrompt(userMessage, portfolioContext);

    // Create streaming input generator
    async function* streamingInput() {
      yield {
        type: "user" as const,
        message: {
          role: "user" as const,
          content: prompt,
        },
      };
    }

    // Query agent with portfolio context
    const result = await query(streamingInput(), {
      mcpServers: {
        "finance-tools": financeToolsServer,
      },
      systemPrompt: {
        preset: "claude_code",
        extensions: [
          "You are a professional stock analyst.",
          "The user has shared their portfolio with you (READ-ONLY).",
          "You can analyze their positions and give recommendations.",
          "You CANNOT make trades or modify their portfolio.",
          "Always provide risk disclaimers with recommendations.",
        ],
      },
      agents: agentConfigs,
      permissionMode: "default",
      onMessage: (message) => {
        // Track costs
        if (message.type === "assistant" && message.usage) {
          this.costTracker.processMessage(message);
        }

        // Capture session ID
        if (message.type === "system" && message.subtype === "init") {
          this.sessionId = message.session_id;
        }

        // Yield message for streaming
        if (message.type === "assistant") {
          return message;
        }
      },
    });

    // Stream response
    for await (const message of result) {
      yield message;
    }
  }

  /**
   * Build contextualized prompt with portfolio data
   */
  private buildPrompt(
    userMessage: string,
    portfolioContext?: PortfolioContext
  ): string {
    if (!portfolioContext) {
      return userMessage;
    }

    // Format portfolio data for agent
    const portfolioSummary = `
### User's Portfolio: ${portfolioContext.name}

**Cash:** $${portfolioContext.cash.toLocaleString()}

**Positions:**
${portfolioContext.positions
  .map(
    (p) => `
- **${p.symbol}**: ${p.quantity} shares
  - Purchase Price: $${p.purchasePrice}
  - Purchase Date: ${p.purchaseDate}
  - Current Value: $${(p.quantity * p.currentPrice).toLocaleString()}
  - Gain/Loss: ${
    p.gainLoss >= 0 ? "+" : ""
  }$${p.gainLoss.toLocaleString()} (${p.gainLossPercent.toFixed(2)}%)
`
  )
  .join("\n")}

**Portfolio Summary:**
- Total Positions Value: $${portfolioContext.totalValue.toLocaleString()}
- Total Cost Basis: $${portfolioContext.totalCost.toLocaleString()}
- Total Gain/Loss: ${
      portfolioContext.totalGainLoss >= 0 ? "+" : ""
    }$${portfolioContext.totalGainLoss.toLocaleString()} (${portfolioContext.totalGainLossPercent.toFixed(
      2
    )}%)
- Total Assets (including cash): $${(
      portfolioContext.totalValue + portfolioContext.cash
    ).toLocaleString()}

---

**User's Question:** ${userMessage}
`;

    return portfolioSummary;
  }

  /**
   * Get cost summary
   */
  getCostSummary() {
    return this.costTracker.getDetailedUsage();
  }
}
```

### Portfolio Context Type

```typescript
// types/agent.types.ts

export interface PortfolioContext {
  id: string;
  name: string;
  cash: number;
  positions: PositionWithMetrics[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export interface PositionWithMetrics {
  id: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface AgentMessage {
  id: string;
  type: "assistant" | "user" | "system";
  content: string;
  timestamp: Date;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
}
```

---

## User Flows

### Flow 1: User Registration & First Portfolio

```
1. User visits landing page
   ↓
2. User clicks "Get Started" / "Sign Up"
   ↓
3. User fills registration form:
   - Email
   - Password
   - Confirm Password
   ↓
4. Backend creates user account:
   - Hash password (bcrypt)
   - Create user in DB
   - Send verification email (optional)
   ↓
5. User redirected to /dashboard
   ↓
6. Dashboard shows "Create Your First Portfolio" prompt
   ↓
7. User clicks "Create Portfolio"
   ↓
8. User fills portfolio form:
   - Name: "My Main Portfolio"
   - Initial Cash: $10,000
   ↓
9. Portfolio created → Redirect to /portfolios/[id]
   ↓
10. User sees empty portfolio
    ↓
11. User clicks "Add Position"
    ↓
12. User fills position form:
    - Symbol: AAPL (with autocomplete/validation)
    - Quantity: 50
    - Purchase Price: $150
    - Purchase Date: 2024-01-15
    ↓
13. Position added → Table updates
    ↓
14. Dashboard shows portfolio summary
```

### Flow 2: User Chats with Agent

```
1. User navigates to /agent
   ↓
2. Chat interface loads
   ↓
3. User selects portfolio from dropdown (optional)
   - "My Main Portfolio" selected
   ↓
4. User types message:
   "Should I hold or sell my AAPL position?"
   ↓
5. Frontend sends to backend:
   POST /api/agent/query
   {
     userId: "user123",
     message: "Should I hold or sell my AAPL position?",
     portfolioId: "portfolio-abc"
   }
   ↓
6. Backend AgentService:
   - Loads portfolio (READ-ONLY)
   - Builds context with portfolio data
   - Sends to Claude Agent SDK
   ↓
7. Agent processes:
   - Receives portfolio context
   - Calls finance tools (get_stock_price, get_financial_metrics)
   - Analyzes AAPL fundamentals & portfolio exposure
   - Generates recommendation
   ↓
8. Agent streams response:
   "Based on your portfolio, AAPL represents 68% of your holdings ($7,500).

   Current Analysis:
   - AAPL at $180, up 20% since your purchase
   - Strong fundamentals: P/E 28.5, Revenue growth 8%
   - High concentration risk (68% in single stock)

   Recommendation:
   Consider taking partial profits (sell 20-30 shares) to:
   - Lock in gains (+$1,500)
   - Reduce concentration risk
   - Diversify into other sectors

   ⚠️ Disclaimer: Not financial advice. Consult a licensed advisor."
   ↓
9. Frontend displays streaming response
   ↓
10. Conversation saved to database
    ↓
11. Cost displayed: "$0.0023" at bottom
```

### Flow 3: Portfolio Analysis & Dashboard

```
1. User navigates to /portfolios/[id]
   ↓
2. Frontend fetches:
   - Portfolio data
   - Positions
   - Current prices for all symbols
   ↓
3. Frontend calculates metrics:
   - Total value
   - Gain/Loss per position
   - Overall portfolio performance
   ↓
4. Dashboard displays:

   ┌─────────────────────────────────────┐
   │ My Main Portfolio                   │
   │ Total Value: $14,700                │
   │ Gain/Loss: +$1,200 (+8.89%)        │
   └─────────────────────────────────────┘

   ┌─────────────────────────────────────┐
   │ Positions                           │
   ├─────────┬────────┬─────────┬───────┤
   │ Symbol  │ Qty    │ Value   │ G/L   │
   ├─────────┼────────┼─────────┼───────┤
   │ AAPL    │ 50     │ $9,000  │ +20%  │
   │ TSLA    │ 30     │ $5,700  │ -5%   │
   └─────────┴────────┴─────────┴───────┘

   ┌─────────────────────────────────────┐
   │ Performance Chart (Last 30 Days)    │
   │  [Line Chart]                       │
   └─────────────────────────────────────┘

   ┌─────────────────────────────────────┐
   │ Sector Allocation                   │
   │  [Pie Chart]                        │
   │  - Technology: 95%                  │
   │  - Other: 5%                        │
   └─────────────────────────────────────┘
   ↓
5. User clicks "Ask Agent"
   ↓
6. Opens agent chat with this portfolio pre-selected
```

---

## Security & Privacy

### Authentication & Authorization

```typescript
// middleware/auth.ts

/**
 * JWT Authentication Middleware
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Portfolio Ownership Verification
 *
 * CRITICAL: Always verify user owns the resource!
 */
export async function verifyPortfolioOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { portfolioId } = req.params;
  const userId = req.user.id;

  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: portfolioId,
      userId, // IMPORTANT: Ensure user owns this portfolio
    },
  });

  if (!portfolio) {
    return res.status(403).json({
      error: "Portfolio not found or access denied",
    });
  }

  req.portfolio = portfolio;
  next();
}
```

### Data Isolation

```typescript
/**
 * ALL database queries MUST include userId filter
 */

// ❌ BAD: Exposes all portfolios
const portfolios = await prisma.portfolio.findMany();

// ✅ GOOD: Only user's portfolios
const portfolios = await prisma.portfolio.findMany({
  where: { userId: req.user.id },
});

// ❌ BAD: Could access other user's portfolio
const portfolio = await prisma.portfolio.findUnique({
  where: { id: portfolioId },
});

// ✅ GOOD: Verifies ownership
const portfolio = await prisma.portfolio.findFirst({
  where: {
    id: portfolioId,
    userId: req.user.id, // CRITICAL!
  },
});
```

### Agent Security

```typescript
/**
 * Agent Security Principles
 */

// ✅ Agent has READ-ONLY access to portfolio
const portfolio = await portfolioService.getById(portfolioId, userId);
await agent.query(message, portfolio); // Portfolio is READ-ONLY

// ❌ Agent CANNOT modify portfolio
// No write operations exposed to agent

// ✅ Agent responses are informational only
// User must manually make any changes

// ✅ Cost tracking prevents abuse
if (userCost > MONTHLY_LIMIT) {
  throw new Error("Monthly usage limit exceeded");
}
```

### Environment Variables

```bash
# .env (NEVER commit this file!)

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stockanalyzer"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Claude API
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"

# Finance APIs
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
NEWS_API_KEY="your-news-api-key"

# Rate Limiting
API_RATE_LIMIT=100
API_RATE_WINDOW=60000

# CORS
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"

# Node Environment
NODE_ENV="production"
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

#### Sprint 1.1: Backend Setup

```
Tasks:
1. Initialize Node.js/TypeScript project
2. Setup Express.js with middleware
3. Configure Prisma + PostgreSQL
4. Setup Redis
5. Implement JWT authentication
6. Create basic user endpoints (register/login)

Deliverables:
✅ Working backend server
✅ User registration/login
✅ JWT authentication
✅ Database connected
```

#### Sprint 1.2: Frontend Setup

```
Tasks:
1. Initialize Next.js project
2. Setup Tailwind CSS + shadcn/ui
3. Create layout components
4. Implement auth pages (login/register)
5. Setup React Query
6. Configure Zustand stores

Deliverables:
✅ Working frontend
✅ Auth UI
✅ State management setup
```

#### Sprint 1.3: Portfolio CRUD

```
Tasks:
1. Create Portfolio model & migrations
2. Implement Portfolio service
3. Create Portfolio API endpoints
4. Build Portfolio UI components
5. Implement create/edit/delete flows

Deliverables:
✅ Portfolio management working
✅ User can create portfolios
✅ CRUD operations functional
```

### Phase 2: Positions & Analytics (Week 3-4)

#### Sprint 2.1: Position Management

```
Tasks:
1. Create Position model & migrations
2. Implement Position service
3. Create Position API endpoints
4. Build Position form component
5. Implement position table
6. Add symbol validation

Deliverables:
✅ Position management working
✅ User can add/edit/delete positions
✅ Symbol validation functional
```

#### Sprint 2.2: Dashboard & Metrics

```
Tasks:
1. Implement price fetching service
2. Create metrics calculation service
3. Build portfolio dashboard
4. Add performance charts
5. Implement real-time price updates

Deliverables:
✅ Dashboard showing portfolio metrics
✅ Performance charts
✅ Real-time updates
```

### Phase 3: Agent Integration (Week 5-6)

#### Sprint 3.1: Agent Backend

```
Tasks:
1. Integrate Claude Agent SDK
2. Implement Finance Tools MCP Server
3. Create Agent service
4. Build context injection logic
5. Implement streaming responses
6. Add cost tracking

Deliverables:
✅ Agent backend working
✅ Portfolio context injection
✅ Streaming functional
```

#### Sprint 3.2: Agent Frontend

```
Tasks:
1. Build chat interface component
2. Implement WebSocket connection
3. Add portfolio selector
4. Create conversation history UI
5. Add cost display
6. Implement message streaming

Deliverables:
✅ Chat UI working
✅ Streaming messages displayed
✅ Portfolio context selectable
```

### Phase 4: Polish & Deploy (Week 7-8)

#### Sprint 4.1: Testing & QA

```
Tasks:
1. Write unit tests
2. Write integration tests
3. E2E testing
4. Bug fixes
5. Performance optimization

Deliverables:
✅ Test coverage >80%
✅ All major bugs fixed
```

#### Sprint 4.2: Deployment

```
Tasks:
1. Setup Docker containers
2. Configure Nginx
3. SSL certificates
4. Production database
5. CI/CD pipeline
6. Monitoring setup

Deliverables:
✅ Production deployment
✅ SSL enabled
✅ Monitoring active
```

---

## API Referenz

### Authentication Endpoints

```typescript
POST /api/auth/register
Body: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
Response: {
  user: User;
  token: string;
}

POST /api/auth/login
Body: {
  email: string;
  password: string;
}
Response: {
  user: User;
  token: string;
}

POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response: { success: boolean }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user: User }
```

### Portfolio Endpoints

```typescript
GET /api/portfolios
Headers: Authorization: Bearer <token>
Response: { portfolios: Portfolio[] }

GET /api/portfolios/:id
Headers: Authorization: Bearer <token>
Response: { portfolio: Portfolio }

POST /api/portfolios
Headers: Authorization: Bearer <token>
Body: {
  name: string;
  description?: string;
  cash?: number;
  currency?: string;
}
Response: { portfolio: Portfolio }

PUT /api/portfolios/:id
Headers: Authorization: Bearer <token>
Body: Partial<Portfolio>
Response: { portfolio: Portfolio }

DELETE /api/portfolios/:id
Headers: Authorization: Bearer <token>
Response: { success: boolean }

GET /api/portfolios/:id/metrics
Headers: Authorization: Bearer <token>
Response: {
  positions: PositionWithMetrics[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  cash: number;
  totalAssets: number;
}
```

### Position Endpoints

```typescript
GET /api/portfolios/:portfolioId/positions
Headers: Authorization: Bearer <token>
Response: { positions: Position[] }

POST /api/portfolios/:portfolioId/positions
Headers: Authorization: Bearer <token>
Body: {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
}
Response: { position: Position }

PUT /api/positions/:id
Headers: Authorization: Bearer <token>
Body: Partial<Position>
Response: { position: Position }

DELETE /api/positions/:id
Headers: Authorization: Bearer <token>
Response: { success: boolean }
```

### Agent Endpoints

```typescript
POST /api/agent/query
Headers: Authorization: Bearer <token>
Body: {
  message: string;
  portfolioId?: string;
}
Response: Stream<AgentMessage>
// Streaming response (Server-Sent Events or WebSocket)

GET /api/agent/history
Headers: Authorization: Bearer <token>
Query: ?limit=50
Response: {
  conversations: Conversation[];
}

GET /api/agent/cost-summary
Headers: Authorization: Bearer <token>
Response: {
  totalCost: number;
  conversationCount: number;
  averageCost: number;
}
```

### Analytics Endpoints

```typescript
GET /api/analytics/performance/:portfolioId
Headers: Authorization: Bearer <token>
Query: ?period=30d
Response: {
  data: Array<{ date: string; value: number }>;
  totalReturn: number;
  totalReturnPercent: number;
}

GET /api/analytics/allocation/:portfolioId
Headers: Authorization: Bearer <token>
Response: {
  sectors: Array<{ sector: string; value: number; percent: number }>;
  positions: Array<{ symbol: string; value: number; percent: number }>;
}

GET /api/analytics/risk/:portfolioId
Headers: Authorization: Bearer <token>
Response: {
  volatility: number;
  sharpeRatio: number;
  beta: number;
  diversificationScore: number;
}
```

---

## Zusammenfassung

### Was haben wir spezifiziert?

✅ **Vollständige Web App Architektur**

- Frontend: Next.js + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma
- Agent: Claude Agent SDK (Read-Only)

✅ **Portfolio Management System**

- User kann Portfolios anlegen
- Positionen hinzufügen/bearbeiten/löschen
- Real-time Price Updates
- Performance Tracking

✅ **AI Agent Integration**

- Agent hat Read-Only Zugriff auf Portfolios
- Portfolio Context wird automatisch injected
- Streaming Responses
- Cost Tracking

✅ **Security & Privacy**

- JWT Authentication
- User Data Isolation
- Agent kann nur lesen, nicht schreiben
- Alle Queries mit userId Filter

✅ **Complete User Flows**

- Registration → Portfolio Creation → Agent Chat
- Alle Interaktionen dokumentiert

### Nächste Schritte mit Claude Code

```
1. Starte mit Backend Setup:
"Erstelle das Backend-Projekt gemäß der Spezifikation in
@docs/web-app-architektur.md

Phase 1, Sprint 1.1: Backend Setup
- Node.js + TypeScript + Express
- Prisma + PostgreSQL Schema
- JWT Authentication
- User Registration/Login Endpoints"

2. Dann Frontend:
"Erstelle das Frontend-Projekt gemäß
@docs/web-app-architektur.md

Phase 1, Sprint 1.2: Frontend Setup
- Next.js 14 + TypeScript
- Tailwind CSS + shadcn/ui
- Auth Pages
- State Management (Zustand)"

3. Iteriere durch alle Sprints!
```

### Wichtige Prinzipien

🔒 **Agent = Read-Only**

- Agent liest nur Portfolio-Daten
- Agent kann nichts ändern
- User hat volle Kontrolle

👤 **User Data Isolation**

- Jede Query hat userId Filter
- Kein User sieht Daten von anderen
- Ownership wird immer verifiziert

📊 **Real-Time Updates**

- Preise werden regelmäßig aktualisiert
- Dashboard zeigt aktuelle Metriken
- Agent bekommt frische Daten

**Jetzt kann Claude Code genau diese Architektur implementieren!** 🚀
