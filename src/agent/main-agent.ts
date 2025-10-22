// Main agent configuration and setup
import { query } from '@anthropic-ai/claude-agent-sdk';
import { financeToolsServer } from '../tools/finance-tools.js';
import { subagentConfigs } from './subagents.js';
import { CostTracker, type UsageReport } from '../utils/cost-tracker.js';

/**
 * Stock Analyst Agent v0.3
 * Main coordinating agent that delegates to specialized subagents
 *
 * Features:
 * - Delegates to 4 specialized analyst subagents
 * - Enhanced cost tracking with step-by-step breakdown
 * - Session management for conversation continuity
 */
export class StockAnalystAgent {
  private totalCost = 0;
  private costTracker: CostTracker;
  private sessionId?: string;

  constructor() {
    this.costTracker = new CostTracker();
  }

  /**
   * Analyzes a stock based on user prompt
   * Coordinates 4 specialized analyst subagents: fundamental, technical, sentiment, and risk
   */
  async analyze(userPrompt: string): Promise<string> {
    // Reset cost tracking for this query
    this.totalCost = 0;
    this.costTracker.reset();

    let finalResponse = '';
    let hasSeenAssistantMessage = false;

    try {
      const result = query({
        prompt: userPrompt,
        options: {
          // Resume previous session if available
          ...(this.sessionId ? { resume: this.sessionId } : {}),

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

You have FOUR expert analysts at your disposal:
- fundamental-analyst: Expert in company fundamentals, financials, and valuation metrics
- technical-analyst: Expert in price trends, technical indicators, and trading signals
- sentiment-analyst: Expert in news sentiment analysis and market psychology
- risk-analyst: Expert in volatility analysis, risk assessment, and downside protection

When analyzing stocks:
1. For fundamental questions (valuation, P/E ratios, earnings), delegate to fundamental-analyst
2. For technical questions (trends, indicators, entry/exit points), delegate to technical-analyst
3. For sentiment questions (news impact, market psychology), delegate to sentiment-analyst
4. For risk questions (volatility, downside risk, portfolio risk), delegate to risk-analyst
5. For comprehensive analysis, consult MULTIPLE or ALL analysts as needed
6. Synthesize their insights into a clear, actionable recommendation

IMPORTANT: After consulting with subagents, you MUST provide a comprehensive synthesis and recommendation.
Always explain your reasoning and cite specific metrics from the analysts. Integrate insights from different
perspectives (fundamental + technical + sentiment + risk) to provide well-rounded investment advice.`
          }
        }
      });

      // Iterate through the async generator to get all messages
      for await (const message of result) {
        // Capture session ID from system init message
        if (message.type === 'system' && message.subtype === 'init') {
          this.sessionId = message.session_id;
        }

        // Track costs for detailed reporting
        this.costTracker.processMessage(message);

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

  /**
   * Gets detailed usage report with step-by-step breakdown
   *
   * Includes:
   * - Total steps (message batches)
   * - Total input/output tokens
   * - Cache usage tokens
   * - Cost breakdown by step
   * - Total cost
   *
   * @returns Comprehensive usage report
   */
  getDetailedUsage(): UsageReport {
    return this.costTracker.getDetailedUsage();
  }

  /**
   * Gets a formatted summary string for display
   *
   * @returns Human-readable usage summary with breakdown
   */
  getFormattedCostSummary(): string {
    return this.costTracker.getFormattedSummary();
  }

  /**
   * Gets the current session ID
   *
   * @returns Session ID if available, undefined otherwise
   */
  getSessionId(): string | undefined {
    return this.sessionId;
  }

  /**
   * Clears the current session
   *
   * Use this to start a fresh conversation without context
   */
  clearSession(): void {
    this.sessionId = undefined;
  }

  /**
   * Checks if the agent has an active session
   *
   * @returns True if session exists, false otherwise
   */
  hasSession(): boolean {
    return this.sessionId !== undefined;
  }
}