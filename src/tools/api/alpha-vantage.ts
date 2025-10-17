// Alpha Vantage API Client
import axios, { AxiosError } from 'axios';
import type {
  StockQuote,
  AlphaVantageQuoteResponse,
  CachedQuote,
  FinancialMetrics,
  AlphaVantageOverviewResponse,
  TechnicalIndicators,
  AlphaVantageSMAResponse,
  AlphaVantageRSIResponse,
  AlphaVantageMACDResponse,
  CachedData
} from '../../types/stock-data.js';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_DELAY_MS = 12000; // 12 seconds between calls (5 calls/min)

// In-memory caches
const quoteCache = new Map<string, CachedQuote>();
const metricsCache = new Map<string, CachedData<FinancialMetrics>>();
const individualIndicatorCache = new Map<string, CachedData<any>>();

// Request deduplication: prevents parallel duplicate API calls
const inflightRequests = new Map<string, Promise<any>>();

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
function isCacheValid<T extends { cachedAt: number }>(cached: T): boolean {
  const now = Date.now();
  return (now - cached.cachedAt) < CACHE_TTL_MS;
}

/**
 * Helper to parse float or return null (for optional financial metrics)
 */
function parseFloatOrNull(value: string): number | null {
  if (!value || value === 'None' || value === '-') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
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

/**
 * Parses Alpha Vantage OVERVIEW response to FinancialMetrics
 */
function parseOverviewResponse(response: AlphaVantageOverviewResponse): FinancialMetrics {
  if (!response.Symbol) {
    throw new Error('Invalid company overview data');
  }

  return {
    symbol: response.Symbol,
    name: response.Name,
    marketCap: parseFloat(response.MarketCapitalization) || 0,
    peRatio: parseFloatOrNull(response.PERatio),
    pegRatio: parseFloatOrNull(response.PEGRatio),
    bookValue: parseFloatOrNull(response.BookValue),
    dividendYield: parseFloatOrNull(response.DividendYield),
    eps: parseFloatOrNull(response.EPS),
    revenuePerShare: parseFloatOrNull(response.RevenuePerShareTTM),
    profitMargin: parseFloatOrNull(response.ProfitMargin),
    operatingMargin: parseFloatOrNull(response.OperatingMarginTTM),
    returnOnAssets: parseFloatOrNull(response.ReturnOnAssetsTTM),
    returnOnEquity: parseFloatOrNull(response.ReturnOnEquityTTM),
    debtToEquity: null, // Not directly in OVERVIEW, would need BALANCE_SHEET
    currentRatio: null, // Would need BALANCE_SHEET
    beta: parseFloatOrNull(response.Beta),
    fiftyTwoWeekHigh: parseFloat(response["52WeekHigh"]) || 0,
    fiftyTwoWeekLow: parseFloat(response["52WeekLow"]) || 0,
    analystTargetPrice: parseFloatOrNull(response.AnalystTargetPrice),
    sector: response.Sector || 'N/A',
    industry: response.Industry || 'N/A'
  };
}

/**
 * Fetches financial metrics for a company with caching and retry logic
 */
export async function fetchFinancialMetrics(symbol: string, retries = 3): Promise<FinancialMetrics> {
  const upperSymbol = symbol.toUpperCase();

  // Check cache first
  const cached = metricsCache.get(upperSymbol);
  if (cached && isCacheValid(cached)) {
    console.log(`✅ Cache hit for ${upperSymbol} metrics`);
    return cached.data;
  }

  if (!API_KEY) {
    throw new Error('ALPHA_VANTAGE_API_KEY not set in environment variables');
  }

  // Respect rate limits
  await respectRateLimit();

  try {
    console.log(`📊 Fetching financial metrics for ${upperSymbol}...`);

    const response = await axios.get<AlphaVantageOverviewResponse>(BASE_URL, {
      params: {
        function: 'OVERVIEW',
        symbol: upperSymbol,
        apikey: API_KEY
      },
      timeout: 10000
    });

    const metrics = parseOverviewResponse(response.data);

    // Cache the result
    metricsCache.set(upperSymbol, {
      data: metrics,
      cachedAt: Date.now()
    });

    console.log(`✅ Fetched metrics for ${upperSymbol}: ${metrics.name}`);
    return metrics;

  } catch (error) {
    // Retry logic
    if (retries > 0 && axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (!axiosError.response || (axiosError.response.status >= 500)) {
        console.log(`⚠️  Error fetching metrics for ${upperSymbol}, retrying... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchFinancialMetrics(symbol, retries - 1);
      }
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error(`Financial data for "${upperSymbol}" not found`);
      }
      throw new Error(`API Error: ${axiosError.message}`);
    }

    throw error;
  }
}



/**
 * Fetches a single technical indicator with deduplication and caching
 * This helper prevents parallel duplicate requests for the same indicator
 */
async function fetchSingleIndicator(
  symbol: string,
  indicator: 'SMA50' | 'SMA200' | 'RSI' | 'MACD'
): Promise<any> {
  const cacheKey = `${symbol}-${indicator}`;

  // Check cache first
  const cached = individualIndicatorCache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    console.log(`✅ Cache hit for ${symbol} ${indicator}`);
    return cached.data;
  }

  // Check if this indicator is already being fetched (deduplication)
  const existingRequest = inflightRequests.get(cacheKey);
  if (existingRequest) {
    console.log(`⏳ Waiting for in-flight request: ${symbol} ${indicator}`);
    return await existingRequest;
  }

  // Create new fetch promise and register it
  const fetchPromise = (async () => {
    try {
      await respectRateLimit();
      let value: any;

      if (indicator === 'SMA50' || indicator === 'SMA200') {
        const period = indicator === 'SMA50' ? 50 : 200;
        console.log(`📈 Fetching SMA(${period}) for ${symbol}...`);

        const response = await axios.get<AlphaVantageSMAResponse>(BASE_URL, {
          params: {
            function: 'SMA',
            symbol,
            interval: 'daily',
            time_period: period,
            series_type: 'close',
            apikey: API_KEY
          },
          timeout: 10000
        });

        const smaData = response.data["Technical Analysis: SMA"];
        if (smaData && Object.keys(smaData).length > 0) {
          const latestDate = Object.keys(smaData)[0];
          value = parseFloat(smaData[latestDate].SMA);
        }
      } else if (indicator === 'RSI') {
        console.log(`📉 Fetching RSI for ${symbol}...`);

        const response = await axios.get<AlphaVantageRSIResponse>(BASE_URL, {
          params: {
            function: 'RSI',
            symbol,
            interval: 'daily',
            time_period: 14,
            series_type: 'close',
            apikey: API_KEY
          },
          timeout: 10000
        });

        const rsiData = response.data["Technical Analysis: RSI"];
        if (rsiData && Object.keys(rsiData).length > 0) {
          const latestDate = Object.keys(rsiData)[0];
          value = parseFloat(rsiData[latestDate].RSI);
        }
      } else if (indicator === 'MACD') {
        console.log(`📊 Fetching MACD for ${symbol}...`);

        const response = await axios.get<AlphaVantageMACDResponse>(BASE_URL, {
          params: {
            function: 'MACD',
            symbol,
            interval: 'daily',
            series_type: 'close',
            apikey: API_KEY
          },
          timeout: 10000
        });

        const macdData = response.data["Technical Analysis: MACD"];
        if (macdData && Object.keys(macdData).length > 0) {
          const latestDate = Object.keys(macdData)[0];
          value = {
            macd: parseFloat(macdData[latestDate].MACD),
            signal: parseFloat(macdData[latestDate].MACD_Signal),
            histogram: parseFloat(macdData[latestDate].MACD_Hist)
          };
        }
      }

      // Cache the result if we got data
      if (value !== undefined) {
        individualIndicatorCache.set(cacheKey, {
          data: value,
          cachedAt: Date.now()
        });
      }

      return value;
    } finally {
      // Always clean up inflight request
      inflightRequests.delete(cacheKey);
    }
  })();

  // Register the inflight request
  inflightRequests.set(cacheKey, fetchPromise);

  return await fetchPromise;
}

/**
 * Fetches technical indicators for a stock with individual caching and request deduplication
 */
export async function fetchTechnicalIndicators(
  symbol: string,
  indicators: ('SMA50' | 'SMA200' | 'RSI' | 'MACD')[] = ['SMA50', 'RSI']
): Promise<TechnicalIndicators> {
  const upperSymbol = symbol.toUpperCase();

  if (!API_KEY) {
    throw new Error('ALPHA_VANTAGE_API_KEY not set in environment variables');
  }

  const result: TechnicalIndicators = {
    symbol: upperSymbol,
    indicators: {},
    timestamp: new Date().toISOString()
  };

  // Fetch all indicators (with deduplication and individual caching)
  for (const indicator of indicators) {
    try {
      const value = await fetchSingleIndicator(upperSymbol, indicator);

      if (value !== undefined) {
        if (indicator === 'SMA50') result.indicators.sma50 = value;
        else if (indicator === 'SMA200') result.indicators.sma200 = value;
        else if (indicator === 'RSI') result.indicators.rsi = value;
        else if (indicator === 'MACD') result.indicators.macd = value;
      }
    } catch (error) {
      console.warn(`⚠️  Failed to fetch ${indicator} for ${upperSymbol}`);
      // Continue with other indicators
    }
  }

  console.log(`✅ Fetched technical indicators for ${upperSymbol}`);
  return result;
}
