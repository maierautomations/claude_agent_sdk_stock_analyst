// MCP Finance Tools Server
import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { fetchStockQuote, fetchFinancialMetrics, fetchTechnicalIndicators } from './api/alpha-vantage.js';

/**
 * Finance Tools MCP Server
 * Provides stock market data tools to the agent
 */
export const financeToolsServer = createSdkMcpServer({
  name: "finance-tools",
  version: "0.2.0",
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
    ),

    tool(
      "get_financial_metrics",
      "Fetches fundamental financial metrics for a company including P/E ratio, market cap, EPS, profit margins, and more. Essential for fundamental analysis.",
      {
        symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA, MSFT)")
      },
      async (args) => {
        try {
          const metrics = await fetchFinancialMetrics(args.symbol);

          const formatNumber = (num: number | null, prefix = '', suffix = '') => {
            if (num === null) return 'N/A';
            return `${prefix}${num.toLocaleString()}${suffix}`;
          };

          const formatMarketCap = (cap: number) => {
            if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
            if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
            if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
            return `$${cap.toLocaleString()}`;
          };

          const formattedResponse = `📊 **${metrics.name} (${metrics.symbol})** - Financial Metrics

**Valuation:**
  - Market Cap: ${formatMarketCap(metrics.marketCap)}
  - P/E Ratio: ${formatNumber(metrics.peRatio)}
  - PEG Ratio: ${formatNumber(metrics.pegRatio)}
  - Book Value: ${formatNumber(metrics.bookValue, '$')}
  - Beta: ${formatNumber(metrics.beta)}

**Profitability:**
  - EPS: ${formatNumber(metrics.eps, '$')}
  - Profit Margin: ${formatNumber(metrics.profitMargin, '', '%')}
  - Operating Margin: ${formatNumber(metrics.operatingMargin, '', '%')}
  - ROA: ${formatNumber(metrics.returnOnAssets, '', '%')}
  - ROE: ${formatNumber(metrics.returnOnEquity, '', '%')}

**Performance:**
  - 52-Week High: $${metrics.fiftyTwoWeekHigh.toFixed(2)}
  - 52-Week Low: $${metrics.fiftyTwoWeekLow.toFixed(2)}
  - Analyst Target: ${formatNumber(metrics.analystTargetPrice, '$')}
  - Dividend Yield: ${formatNumber(metrics.dividendYield, '', '%')}

**Company Info:**
  - Sector: ${metrics.sector}
  - Industry: ${metrics.industry}`;

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
              text: `❌ Error fetching financial metrics: ${errorMessage}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "calculate_technical_indicators",
      "Calculates technical indicators including SMA (50/200 day), RSI, and MACD. Used for technical analysis and identifying trading signals.",
      {
        symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA)"),
        indicators: z.array(z.enum(["SMA50", "SMA200", "RSI", "MACD"]))
          .default(["SMA50", "RSI"])
          .describe("Technical indicators to calculate. Default: SMA50, RSI")
      },
      async (args) => {
        try {
          const result = await fetchTechnicalIndicators(args.symbol, args.indicators);

          let formattedResponse = `📈 **${result.symbol}** - Technical Indicators\n\n`;

          if (result.indicators.sma50 !== undefined) {
            formattedResponse += `**SMA(50):** $${result.indicators.sma50.toFixed(2)}\n`;
          }

          if (result.indicators.sma200 !== undefined) {
            formattedResponse += `**SMA(200):** $${result.indicators.sma200.toFixed(2)}\n`;
          }

          if (result.indicators.rsi !== undefined) {
            const rsi = result.indicators.rsi;
            let rsiSignal = '';
            if (rsi > 70) rsiSignal = ' (Overbought ⚠️)';
            else if (rsi < 30) rsiSignal = ' (Oversold 🔔)';
            else rsiSignal = ' (Neutral)';
            formattedResponse += `**RSI(14):** ${rsi.toFixed(2)}${rsiSignal}\n`;
          }

          if (result.indicators.macd) {
            const macd = result.indicators.macd;
            const signal = macd.macd > macd.signal ? 'Bullish 📈' : 'Bearish 📉';
            formattedResponse += `\n**MACD:**\n`;
            formattedResponse += `  - MACD: ${macd.macd.toFixed(4)}\n`;
            formattedResponse += `  - Signal: ${macd.signal.toFixed(4)}\n`;
            formattedResponse += `  - Histogram: ${macd.histogram.toFixed(4)}\n`;
            formattedResponse += `  - Signal: ${signal}\n`;
          }

          formattedResponse += `\n*Last Updated: ${result.timestamp}*`;

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
              text: `❌ Error calculating technical indicators: ${errorMessage}`
            }],
            isError: true
          };
        }
      }
    )
  ]
});