// Type definitions for stock data

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  timestamp: string;
}

export interface AlphaVantageQuoteResponse {
  "Global Quote": {
    "01. symbol": string;
    "02. open": string;
    "03. high": string;
    "04. low": string;
    "05. price": string;
    "06. volume": string;
    "07. latest trading day": string;
    "08. previous close": string;
    "09. change": string;
    "10. change percent": string;
  };
}

export interface CachedQuote {
  data: StockQuote;
  cachedAt: number;
}

// Financial Metrics Types
export interface FinancialMetrics {
  symbol: string;
  name: string;
  marketCap: number;
  peRatio: number | null;
  pegRatio: number | null;
  bookValue: number | null;
  dividendYield: number | null;
  eps: number | null;
  revenuePerShare: number | null;
  profitMargin: number | null;
  operatingMargin: number | null;
  returnOnAssets: number | null;
  returnOnEquity: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  beta: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  analystTargetPrice: number | null;
  sector: string;
  industry: string;
}

export interface AlphaVantageOverviewResponse {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  "52WeekHigh": string;
  "52WeekLow": string;
  "50DayMovingAverage": string;
  "200DayMovingAverage": string;
  SharesOutstanding: string;
  DividendDate: string;
  ExDividendDate: string;
}

// Technical Indicators Types
export interface TechnicalIndicators {
  symbol: string;
  indicators: {
    sma50?: number;
    sma200?: number;
    rsi?: number;
    macd?: {
      macd: number;
      signal: number;
      histogram: number;
    };
  };
  timestamp: string;
}

export interface AlphaVantageSMAResponse {
  "Meta Data": {
    "1: Symbol": string;
    "2: Indicator": string;
    "3: Last Refreshed": string;
  };
  "Technical Analysis: SMA": {
    [date: string]: {
      SMA: string;
    };
  };
}

export interface AlphaVantageRSIResponse {
  "Meta Data": {
    "1: Symbol": string;
    "2: Indicator": string;
    "3: Last Refreshed": string;
  };
  "Technical Analysis: RSI": {
    [date: string]: {
      RSI: string;
    };
  };
}

export interface AlphaVantageMACDResponse {
  "Meta Data": {
    "1: Symbol": string;
    "2: Indicator": string;
    "3: Last Refreshed": string;
  };
  "Technical Analysis: MACD": {
    [date: string]: {
      MACD: string;
      MACD_Signal: string;
      MACD_Hist: string;
    };
  };
}

export interface CachedData<T> {
  data: T;
  cachedAt: number;
}

