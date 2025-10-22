// MCP Finance Tools Server
import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import {
  fetchStockQuote,
  fetchFinancialMetrics,
  fetchTechnicalIndicators,
  fetchNewsSentiment,
  compareStocks
} from './api/alpha-vantage.js';

/**
 * Finance Tools MCP Server
 * Provides stock market data tools to the agent
 */
export const financeToolsServer = createSdkMcpServer({
  name: "finance-tools",
  version: "0.3.0",
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
    ),

    tool(
      "analyze_news_sentiment",
      "Fetches recent news articles and analyzes sentiment for a stock. Returns news headlines, sources, and overall sentiment score.",
      {
        symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA)"),
        limit: z.number().min(1).max(20).default(10).describe("Number of articles to fetch (default: 10)")
      },
      async (args) => {
        try {
          const sentiment = await fetchNewsSentiment(args.symbol, args.limit);

          const sentimentEmoji = sentiment.overallSentiment === 'positive' ? '📈' :
                                 sentiment.overallSentiment === 'negative' ? '📉' : '➡️';

          let formattedResponse = `📰 **${sentiment.symbol}** - News Sentiment Analysis\n\n`;
          formattedResponse += `**Overall Sentiment:** ${sentimentEmoji} ${sentiment.overallSentiment.toUpperCase()}\n`;
          formattedResponse += `**Sentiment Score:** ${sentiment.sentimentScore.toFixed(2)} (-1 to 1)\n`;
          formattedResponse += `**Articles Analyzed:** ${sentiment.articleCount}\n\n`;

          if (sentiment.articles.length > 0) {
            formattedResponse += `**Recent Headlines:**\n\n`;
            sentiment.articles.slice(0, 5).forEach((article, index) => {
              const articleEmoji = article.sentiment === 'positive' ? '✅' :
                                  article.sentiment === 'negative' ? '❌' : '➖';
              formattedResponse += `${index + 1}. ${articleEmoji} **${article.title}**\n`;
              formattedResponse += `   Source: ${article.source} | Published: ${new Date(article.publishedAt).toLocaleDateString()}\n`;
              if (article.description) {
                formattedResponse += `   ${article.description.substring(0, 100)}${article.description.length > 100 ? '...' : ''}\n`;
              }
              formattedResponse += `\n`;
            });

            if (sentiment.articles.length > 5) {
              formattedResponse += `\n_...and ${sentiment.articles.length - 5} more articles_\n`;
            }
          } else {
            formattedResponse += `No recent news articles found.\n`;
          }

          formattedResponse += `\n*Analysis timestamp: ${sentiment.timestamp}*`;

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
              text: `❌ Error fetching news sentiment: ${errorMessage}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "compare_stocks",
      "Compares multiple stocks side-by-side with key metrics. Useful for relative analysis and identifying the best investment among similar stocks.",
      {
        symbols: z.array(z.string()).min(2).max(5).describe("Array of stock ticker symbols to compare (2-5 stocks)")
      },
      async (args) => {
        try {
          const comparison = await compareStocks(args.symbols);

          let formattedResponse = `📊 **Stock Comparison**\n\n`;
          formattedResponse += `Comparing: ${comparison.symbols.join(', ')}\n\n`;

          // Create comparison table header
          formattedResponse += `| Metric | ${comparison.symbols.join(' | ')} |\n`;
          formattedResponse += `|--------|${comparison.symbols.map(() => '--------').join('|')}|\n`;

          // Price row
          formattedResponse += `| **Price** | ${comparison.symbols.map(s => {
            const m = comparison.metrics[s];
            return m ? `$${m.price.toFixed(2)}` : 'N/A';
          }).join(' | ')} |\n`;

          // Change % row
          formattedResponse += `| **Change %** | ${comparison.symbols.map(s => {
            const m = comparison.metrics[s];
            if (!m) return 'N/A';
            const sign = m.changePercent >= 0 ? '+' : '';
            return `${sign}${m.changePercent.toFixed(2)}%`;
          }).join(' | ')} |\n`;

          // Market Cap row
          formattedResponse += `| **Market Cap** | ${comparison.symbols.map(s => {
            const m = comparison.metrics[s];
            if (!m) return 'N/A';
            if (m.marketCap >= 1e12) return `$${(m.marketCap / 1e12).toFixed(2)}T`;
            if (m.marketCap >= 1e9) return `$${(m.marketCap / 1e9).toFixed(2)}B`;
            return `$${(m.marketCap / 1e6).toFixed(2)}M`;
          }).join(' | ')} |\n`;

          // P/E Ratio row
          formattedResponse += `| **P/E Ratio** | ${comparison.symbols.map(s => {
            const m = comparison.metrics[s];
            return m?.peRatio ? m.peRatio.toFixed(2) : 'N/A';
          }).join(' | ')} |\n`;

          // EPS row
          formattedResponse += `| **EPS** | ${comparison.symbols.map(s => {
            const m = comparison.metrics[s];
            return m?.eps ? `$${m.eps.toFixed(2)}` : 'N/A';
          }).join(' | ')} |\n`;

          // Profit Margin row
          formattedResponse += `| **Profit Margin** | ${comparison.symbols.map(s => {
            const m = comparison.metrics[s];
            return m?.profitMargin ? `${m.profitMargin.toFixed(1)}%` : 'N/A';
          }).join(' | ')} |\n`;

          // Beta row
          formattedResponse += `| **Beta** | ${comparison.symbols.map(s => {
            const m = comparison.metrics[s];
            return m?.beta ? m.beta.toFixed(2) : 'N/A';
          }).join(' | ')} |\n`;

          formattedResponse += `\n*Comparison timestamp: ${comparison.timestamp}*`;

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
              text: `❌ Error comparing stocks: ${errorMessage}`
            }],
            isError: true
          };
        }
      }
    )
  ]
});