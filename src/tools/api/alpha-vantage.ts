// Alpha Vantage API Client
import axios, { AxiosError } from 'axios';
import type { StockQuote, AlphaVantageQuoteResponse, CachedQuote } from '../../types/stock-data.js';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_DELAY_MS = 12000; // 12 seconds between calls (5 calls/min)

// In-memory cache
const quoteCache = new Map<string, CachedQuote>();
let lastRequestTime = 0;

/**
 * Delays execution to respect rate limits (5 calls/min)
 */
async function respectRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
    const waitTime = RATE_LIMIT_DELAY_MS - timeSinceLastRequest;
    console.log(`⏳ Rate limit: waiting ${Math.round(waitTime / 1000)}s...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * Checks if cached data is still valid
 */
function isCacheValid(cached: CachedQuote): boolean {
  const now = Date.now();
  return (now - cached.cachedAt) < CACHE_TTL_MS;
}

/**
 * Parses Alpha Vantage response to StockQuote
 */
function parseQuoteResponse(response: AlphaVantageQuoteResponse): StockQuote {
  const globalQuote = response["Global Quote"];

  if (!globalQuote || Object.keys(globalQuote).length === 0) {
    throw new Error('Invalid symbol or no data returned from Alpha Vantage');
  }

  return {
    symbol: globalQuote["01. symbol"],
    price: parseFloat(globalQuote["05. price"]),
    change: parseFloat(globalQuote["09. change"]),
    changePercent: parseFloat(globalQuote["10. change percent"].replace('%', '')),
    high: parseFloat(globalQuote["03. high"]),
    low: parseFloat(globalQuote["04. low"]),
    open: parseFloat(globalQuote["02. open"]),
    previousClose: parseFloat(globalQuote["08. previous close"]),
    volume: parseInt(globalQuote["06. volume"], 10),
    timestamp: globalQuote["07. latest trading day"]
  };
}

/**
 * Fetches stock quote with caching and retry logic
 */
export async function fetchStockQuote(symbol: string, retries = 3): Promise<StockQuote> {
  const upperSymbol = symbol.toUpperCase();

  // Check cache first
  const cached = quoteCache.get(upperSymbol);
  if (cached && isCacheValid(cached)) {
    console.log(`✅ Cache hit for ${upperSymbol}`);
    return cached.data;
  }

  if (!API_KEY) {
    throw new Error('ALPHA_VANTAGE_API_KEY not set in environment variables');
  }

  // Respect rate limits
  await respectRateLimit();

  try {
    console.log(`🔍 Fetching ${upperSymbol} from Alpha Vantage...`);

    const response = await axios.get<AlphaVantageQuoteResponse>(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: upperSymbol,
        apikey: API_KEY
      },
      timeout: 10000
    });

    const quote = parseQuoteResponse(response.data);

    // Cache the result
    quoteCache.set(upperSymbol, {
      data: quote,
      cachedAt: Date.now()
    });

    console.log(`✅ Fetched ${upperSymbol}: $${quote.price}`);
    return quote;

  } catch (error) {
    // Retry logic
    if (retries > 0 && axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Retry on network errors or 5xx server errors
      if (!axiosError.response || (axiosError.response.status >= 500)) {
        console.log(`⚠️  Error fetching ${upperSymbol}, retrying... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchStockQuote(symbol, retries - 1);
      }
    }

    // Format error message
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error(`Stock symbol "${upperSymbol}" not found`);
      }
      throw new Error(`API Error: ${axiosError.message}`);
    }

    throw error;
  }
}

