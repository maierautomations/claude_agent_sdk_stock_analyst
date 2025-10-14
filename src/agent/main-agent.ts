// Main agent configuration and setup
import { query } from '@anthropic-ai/claude-agent-sdk';
import { financeToolsServer } from '../tools/finance-tools.js';

/**
 * Stock Analyst Agent
 * Uses Claude Agent SDK with custom finance tools
 */
export class StockAnalystAgent {
  private totalCost = 0;

  /**
   * Analyzes a stock based on user prompt
   */
  async analyze(userPrompt: string): Promise<string> {
    // Reset cost tracking for this query
    this.totalCost = 0;

    let finalResponse = '';

    try {
      const result = query({
        prompt: userPrompt,
        options: {
          mcpServers: {
            "finance-tools": financeToolsServer
          },
          permissionMode: 'bypassPermissions'  // Auto-approve finance tools
        }
      });

      // Iterate through the async generator to get all messages
      for await (const message of result) {
        // Capture final result with cost
        if (message.type === 'result') {
          this.totalCost = message.total_cost_usd;
          console.log(`💰 Total cost: $${this.totalCost.toFixed(4)}`);
        }

        // Capture assistant message content
        if (message.type === 'assistant') {
          const content = message.message.content;
          if (Array.isArray(content)) {
            for (const block of content) {
              if (block.type === 'text') {
                finalResponse += block.text;
              }
            }
          }
        }

        // Stream events for real-time display
        if (message.type === 'stream_event') {
          const event = message.event;
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            process.stdout.write(event.delta.text);
          }
        }
      }

      return finalResponse || 'No response received from agent.';

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Agent analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Gets the total cost of the last query
   */
  getLastQueryCost(): number {
    return this.totalCost;
  }
}
