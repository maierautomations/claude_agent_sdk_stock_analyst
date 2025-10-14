// MCP Finance Tools Server
import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { fetchStockQuote } from './api/alpha-vantage.js';

/**
 * Finance Tools MCP Server
 * Provides stock market data tools to the agent
 */
export const financeToolsServer = createSdkMcpServer({
  name: "finance-tools",
  version: "0.1.0",
  tools: [
    tool(
      "get_stock_price",
      "Fetches current stock price and quote data for a given ticker symbol. Returns real-time data including price, change, volume, and daily high/low.",
      {
        symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA, MSFT, GOOGL)")
      },
      async (args) => {
        try {
          const quote = await fetchStockQuote(args.symbol);

          // Format the response nicely
          const changeDirection = quote.change >= 0 ? '📈' : '📉';
          const changeSign = quote.change >= 0 ? '+' : '';

          const formattedResponse = `${changeDirection} **${quote.symbol}** - Stock Quote

**Price:** $${quote.price.toFixed(2)}
**Change:** ${changeSign}$${quote.change.toFixed(2)} (${changeSign}${quote.changePercent.toFixed(2)}%)

**Daily Range:**
  - Open: $${quote.open.toFixed(2)}
  - High: $${quote.high.toFixed(2)}
  - Low: $${quote.low.toFixed(2)}
  - Previous Close: $${quote.previousClose.toFixed(2)}

**Volume:** ${quote.volume.toLocaleString()}
**Last Updated:** ${quote.timestamp}`;

          return {
            content: [{
              type: "text" as const,
              text: formattedResponse
            }]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          return {
            content: [{
              type: "text" as const,
              text: `❌ Error fetching stock data: ${errorMessage}`
            }],
            isError: true
          };
        }
      }
    )
  ]
});

