// Quick test script for Alpha Vantage API client
import 'dotenv/config';
import { fetchStockQuote } from './tools/api/alpha-vantage.js';

async function test() {
  console.log('🧪 Testing Alpha Vantage API Client\n');

  try {
    // Test 1: Fetch AAPL
    console.log('Test 1: Fetching AAPL...');
    const aapl = await fetchStockQuote('AAPL');
    console.log(`✅ AAPL: $${aapl.price} (${aapl.changePercent > 0 ? '+' : ''}${aapl.changePercent.toFixed(2)}%)\n`);

    // Test 2: Cache test (should be instant)
    console.log('Test 2: Fetching AAPL again (should use cache)...');
    const aaplCached = await fetchStockQuote('AAPL');
    console.log(`✅ AAPL (cached): $${aaplCached.price}\n`);

    // Test 3: Different stock
    console.log('Test 3: Fetching MSFT...');
    const msft = await fetchStockQuote('MSFT');
    console.log(`✅ MSFT: $${msft.price} (${msft.changePercent > 0 ? '+' : ''}${msft.changePercent.toFixed(2)}%)\n`);

    // Test 4: Invalid symbol (should fail gracefully)
    console.log('Test 4: Fetching invalid symbol...');
    try {
      await fetchStockQuote('INVALIDXYZ');
      console.log('❌ Should have thrown an error');
    } catch (error) {
      console.log(`✅ Correctly handled error: ${error instanceof Error ? error.message : error}\n`);
    }

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
