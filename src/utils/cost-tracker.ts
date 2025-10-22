// Cost tracking utility for Claude Agent SDK
// Based on SDK best practices: https://docs.claude.com/en/docs/claude-code/cost-tracking

/**
 * Usage data for a single step in the conversation
 */
export interface StepUsage {
  messageId: string;
  timestamp: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  costUSD: number;
}

/**
 * Detailed usage report for the entire conversation
 */
export interface UsageReport {
  totalSteps: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheCreationTokens: number;
  totalCostUSD: number;
  stepBreakdown: StepUsage[];
}

/**
 * Tracks costs and token usage for Claude Agent SDK queries
 *
 * Key features:
 * - Deduplicates messages by ID (messages with same ID have same usage)
 * - Tracks step-by-step usage breakdown
 * - Calculates costs based on Anthropic pricing
 * - Provides detailed usage reports
 *
 * Usage:
 * ```typescript
 * const tracker = new CostTracker();
 *
 * const result = query({
 *   prompt: "...",
 *   options: {
 *     onMessage: (message) => {
 *       tracker.processMessage(message);
 *     }
 *   }
 * });
 *
 * console.log(tracker.getDetailedUsage());
 * ```
 */
export class CostTracker {
  private processedMessageIds = new Set<string>();
  private stepUsages: StepUsage[] = [];
  private finalTotalCost: number = 0;

  /**
   * Process a message from the Claude Agent SDK
   * Automatically deduplicates based on message ID
   *
   * @param message Message from the SDK query result
   */
  processMessage(message: any): void {
    // Handle result message with total cost
    if (message.type === 'result' && message.total_cost_usd !== undefined) {
      this.finalTotalCost = message.total_cost_usd;
      return;
    }

    // Only process assistant messages with usage data
    if (message.type !== 'assistant' || !message.usage) {
      return;
    }

    // Skip if we've already processed this message ID
    // (messages with same ID have same usage data - avoid double counting)
    if (this.processedMessageIds.has(message.id)) {
      return;
    }

    // Mark this message ID as processed
    this.processedMessageIds.add(message.id);

    // Record the step usage
    const stepUsage: StepUsage = {
      messageId: message.id,
      timestamp: new Date().toISOString(),
      usage: {
        input_tokens: message.usage.input_tokens || 0,
        output_tokens: message.usage.output_tokens || 0,
        cache_creation_input_tokens: message.usage.cache_creation_input_tokens,
        cache_read_input_tokens: message.usage.cache_read_input_tokens
      },
      costUSD: this.calculateStepCost(message.usage)
    };

    this.stepUsages.push(stepUsage);
  }

  /**
   * Calculate cost for a single step based on Anthropic pricing
   *
   * Pricing (as of 2025):
   * - Input: $0.003 per 1K tokens ($0.000003 per token)
   * - Output: $0.015 per 1K tokens ($0.000015 per token)
   * - Cache Read: $0.03 per 1M tokens ($0.00000003 per token)
   * - Cache Creation: $0.0375 per 1M tokens ($0.0000000375 per token)
   *
   * @param usage Usage object from message
   * @returns Cost in USD
   */
  private calculateStepCost(usage: any): number {
    const inputCost = (usage.input_tokens || 0) * 0.000003;
    const outputCost = (usage.output_tokens || 0) * 0.000015;
    const cacheReadCost = (usage.cache_read_input_tokens || 0) * 0.00000003;
    const cacheCreationCost = (usage.cache_creation_input_tokens || 0) * 0.0000000375;

    return inputCost + outputCost + cacheReadCost + cacheCreationCost;
  }

  /**
   * Get the total cost from the final result message
   * This is the authoritative cost from the API
   *
   * @returns Total cost in USD
   */
  getTotalCost(): number {
    return this.finalTotalCost;
  }

  /**
   * Get detailed usage report with step-by-step breakdown
   *
   * @returns Comprehensive usage report
   */
  getDetailedUsage(): UsageReport {
    const totalInputTokens = this.stepUsages.reduce(
      (sum, step) => sum + step.usage.input_tokens, 0
    );
    const totalOutputTokens = this.stepUsages.reduce(
      (sum, step) => sum + step.usage.output_tokens, 0
    );
    const totalCacheReadTokens = this.stepUsages.reduce(
      (sum, step) => sum + (step.usage.cache_read_input_tokens || 0), 0
    );
    const totalCacheCreationTokens = this.stepUsages.reduce(
      (sum, step) => sum + (step.usage.cache_creation_input_tokens || 0), 0
    );
    const calculatedTotalCost = this.stepUsages.reduce(
      (sum, step) => sum + step.costUSD, 0
    );

    return {
      totalSteps: this.stepUsages.length,
      totalInputTokens,
      totalOutputTokens,
      totalCacheReadTokens,
      totalCacheCreationTokens,
      // Use final total cost from API if available, otherwise use calculated
      totalCostUSD: this.finalTotalCost || calculatedTotalCost,
      stepBreakdown: this.stepUsages
    };
  }

  /**
   * Get a formatted summary string for display
   *
   * @returns Human-readable usage summary
   */
  getFormattedSummary(): string {
    const usage = this.getDetailedUsage();

    let summary = `\n💰 Cost Breakdown:\n`;
    summary += `   Total Cost: $${usage.totalCostUSD.toFixed(4)}\n`;
    summary += `   Steps: ${usage.totalSteps}\n`;
    summary += `   Input Tokens: ${usage.totalInputTokens.toLocaleString()}\n`;
    summary += `   Output Tokens: ${usage.totalOutputTokens.toLocaleString()}\n`;

    if (usage.totalCacheReadTokens > 0) {
      summary += `   Cache Read Tokens: ${usage.totalCacheReadTokens.toLocaleString()}\n`;
    }
    if (usage.totalCacheCreationTokens > 0) {
      summary += `   Cache Creation Tokens: ${usage.totalCacheCreationTokens.toLocaleString()}\n`;
    }

    return summary;
  }

  /**
   * Reset the tracker for a new conversation
   */
  reset(): void {
    this.processedMessageIds.clear();
    this.stepUsages = [];
    this.finalTotalCost = 0;
  }
}