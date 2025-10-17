// Main agent configuration and setup
import { query } from '@anthropic-ai/claude-agent-sdk';
import { financeToolsServer } from '../tools/finance-tools.js';
import { subagentConfigs } from './subagents.js';

/**
 * Stock Analyst Agent v0.2
 * Main coordinating agent that delegates to specialized subagents
 */
export class StockAnalystAgent {
  private totalCost = 0;

  /**
   * Analyzes a stock based on user prompt
   * Coordinates fundamental and technical analyst subagents
   */
  async analyze(userPrompt: string): Promise<string> {
    // Reset cost tracking for this query
    this.totalCost = 0;

    let finalResponse = '';
    let hasSeenAssistantMessage = false;

    try {
      const result = query({
        prompt: userPrompt,
        options: {
          mcpServers: {
            "finance-tools": financeToolsServer
          },
          agents: subagentConfigs,
          permissionMode: 'bypassPermissions',  // Auto-approve finance tools
          systemPrompt: {
            type: 'preset',
            preset: 'claude_code',
            append: `

You are a professional stock analyst coordinating specialized subagents.

You have two expert analysts at your disposal:
- fundamental-analyst: Expert in company fundamentals, financials, and valuation
- technical-analyst: Expert in price trends, technical indicators, and trading signals

When analyzing stocks:
1. For fundamental questions (valuation, financials), delegate to fundamental-analyst
2. For technical questions (trends, indicators), delegate to technical-analyst
3. For comprehensive analysis, consult BOTH analysts
4. Synthesize their insights into a clear, actionable recommendation

IMPORTANT: After consulting with subagents, you MUST provide a comprehensive synthesis and recommendation.
Always explain your reasoning and cite specific metrics from the analysts.`
          }
        }
      });

      // Iterate through the async generator to get all messages
      for await (const message of result) {
        // Capture final result with cost
        if (message.type === 'result') {
          this.totalCost = message.total_cost_usd;
          console.log(`\n💰 Total cost: $${this.totalCost.toFixed(4)}`);
        }

        // Capture assistant message content
        if (message.type === 'assistant') {
          hasSeenAssistantMessage = true;

          const content = message.message.content;
          if (Array.isArray(content)) {
            for (const block of content) {
              if (block.type === 'text') {
                finalResponse += block.text;
              }
            }
          }
        }

        // Stream events for real-time display (if available)
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