# Stock Analyst Agent

AI-powered stock analysis agent using Claude Agent SDK and real-time financial data.

## Features

- Real-time stock price data via Alpha Vantage
- Specialized subagents for different analysis types:
  - Fundamental Analysis
  - Technical Analysis
  - Sentiment Analysis
  - Risk Assessment

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Get API Keys:**
   - **Claude API**: https://console.anthropic.com/settings/keys
   - **Alpha Vantage**: https://www.alphavantage.co/support/#api-key (free tier: 500 calls/day)

## Development

```bash
# Run in development mode
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Run production build
npm start
```

## Usage

```bash
npm run dev
# Ask: "What is the current price of AAPL?"
```

## Project Structure

```
src/
├── index.ts              # Entry point
├── agent/
│   └── main-agent.ts     # Agent configuration
├── tools/
│   ├── finance-tools.ts  # MCP tools server
│   └── api/
│       └── alpha-vantage.ts  # API client
└── types/
    └── stock-data.ts     # Type definitions
```

## Technology Stack

- **Claude Agent SDK** - AI agent framework
- **TypeScript** - Type safety
- **Alpha Vantage API** - Financial data
- **Zod** - Schema validation

## License

ISC
