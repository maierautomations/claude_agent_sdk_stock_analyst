// Main entry point for Stock Analyst Agent
import 'dotenv/config';
import * as readline from 'readline';
import { StockAnalystAgent } from './agent/main-agent.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('🤖 Stock Analyst Agent v0.3.0');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✨ New: 4 specialized analysts (fundamental, technical, sentiment, risk)\n');
  console.log('📊 Tools: Stock quotes, financials, indicators, news, comparisons\n');
  console.log('Ask me about any US stock! (Type "exit" to quit)\n');

  // Verify API keys
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY not found in .env file');
    process.exit(1);
  }

  if (!process.env.ALPHA_VANTAGE_API_KEY) {
    console.error('❌ Error: ALPHA_VANTAGE_API_KEY not found in .env file');
    process.exit(1);
  }

  const agent = new StockAnalystAgent();

  const askQuestion = () => {
    rl.question('\n💬 You: ', async (input) => {
      const trimmedInput = input.trim();

      if (!trimmedInput) {
        askQuestion();
        return;
      }

      if (trimmedInput.toLowerCase() === 'exit' || trimmedInput.toLowerCase() === 'quit') {
        console.log('\n👋 Goodbye!\n');
        rl.close();
        process.exit(0);
      }

      try {
        console.log('\n🤔 Analyzing...\n');

        const response = await agent.analyze(trimmedInput);

        console.log('\n🤖 Agent:\n');
        console.log(response);
        console.log(`\n💵 Query cost: $${agent.getLastQueryCost().toFixed(4)}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`\n❌ Error: ${errorMessage}`);
      }

      askQuestion();
    });
  };

  // Start the conversation loop
  askQuestion();
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

