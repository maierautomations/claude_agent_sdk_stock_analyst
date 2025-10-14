# Tracking Costs and Usage

Understand and track token usage for billing in the Claude Agent SDK

## SDK Cost Tracking

The Claude Agent SDK provides detailed token usage information for each interaction with Claude. This guide explains how to properly track costs and understand usage reporting, especially when dealing with parallel tool uses and multi-step conversations. For complete API documentation, see the [TypeScript SDK reference](/en/docs/claude-code/typescript-sdk-reference).

## Understanding Token Usage

When Claude processes requests, it reports token usage at the message level. This usage data is essential for tracking costs and billing users appropriately.

### Key Concepts

1. **Steps**: A step is a single request/response pair between your application and Claude
2. **Messages**: Individual messages within a step (text, tool uses, tool results)
3. **Usage**: Token consumption data attached to assistant messages

## Usage Reporting Structure

### Single vs Parallel Tool Use

When Claude executes tools, the usage reporting differs based on whether tools are executed sequentially or in parallel:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

// Example: Tracking usage in a conversation
const result = await query({
  prompt: "Analyze this codebase and run tests",
  options: {
    onMessage: (message) => {
      if (message.type === 'assistant' && message.usage) {
        console.log(`Message ID: ${message.id}`);
        console.log(`Usage:`, message.usage);
      }
    }
  }
});
```

### Message Flow Example

Here's how messages and usage are reported in a typical multi-step conversation:

```
<!-- Step 1: Initial request with parallel tool uses -->
assistant (text)      { id: "msg_1", usage: { output_tokens: 100, ... } }
assistant (tool_use)  { id: "msg_1", usage: { output_tokens: 100, ... } }
assistant (tool_use)  { id: "msg_1", usage: { output_tokens: 100, ... } }
assistant (tool_use)  { id: "msg_1", usage: { output_tokens: 100, ... } }
user (tool_result)
user (tool_result)
user (tool_result)

<!-- Step 2: Second request with parallel tool uses -->
assistant (text)      { id: "msg_2", usage: { output_tokens: 150, ... } }
assistant (tool_use)  { id: "msg_2", usage: { output_tokens: 150, ... } }
user (tool_result)

<!-- Final result -->
assistant (result)    { usage: { total_cost_usd: 0.0023, ... } }
```

## Important Usage Rules

### 1. Same ID = Same Usage

All messages with the same `id` field report identical usage. When Claude sends multiple messages in the same turn, they share the same message ID and usage data.

```typescript
const messages = [
  { type: 'assistant', id: 'msg_123', usage: { output_tokens: 100 } },
  { type: 'assistant', id: 'msg_123', usage: { output_tokens: 100 } }
];
```

### 2. Charge Once Per Step

You should only charge users once per step, not for each individual message.

### 3. Result Message Contains Cumulative Usage

The final `result` message contains the total cumulative usage from all steps in the conversation.

## Implementation: Cost Tracking System

```typescript
class CostTracker {
  private processedMessageIds = new Set<string>();
  private stepUsages: Array<any> = [];

  async trackConversation(prompt: string) {
    const result = await query({
      prompt,
      options: {
        onMessage: (message) => {
          this.processMessage(message);
        }
      }
    });

    return {
      result,
      stepUsages: this.stepUsages,
      totalCost: result.usage?.total_cost_usd || 0
    };
  }

  private processMessage(message: any) {
    if (message.type !== 'assistant' || !message.usage) return;

    if (this.processedMessageIds.has(message.id)) return;

    this.processedMessageIds.add(message.id);
    this.stepUsages.push({
      messageId: message.id,
      timestamp: new Date().toISOString(),
      usage: message.usage,
      costUSD: this.calculateCost(message.usage)
    });
  }

  private calculateCost(usage: any): number {
    const inputCost = usage.input_tokens * 0.00003;
    const outputCost = usage.output_tokens * 0.00015;
    const cacheReadCost = (usage.cache_read_input_tokens || 0) * 0.0000075;

    return inputCost + outputCost + cacheReadCost;
  }
}
```

## Usage Fields Reference

Each usage object contains detailed fields:

- `input_tokens`: Base input tokens processed
- `output_tokens`: Tokens generated in the response
- `cache_creation_input_tokens`: Tokens used to create cache entries
- `cache_read_input_tokens`: Tokens read from cache
- `service_tier`: The service tier used (e.g., "standard")
- `total_cost_usd`: Total cost in USD (only in result message)

## Best Practices

1. **Use Message IDs for Deduplication**: Track which message IDs you've already processed to avoid double-counting
2. **Monitor the Result Message**: The final result message contains authoritative cumulative usage for the entire conversation
3. **Implement Comprehensive Logging**: Log all step usages for debugging and auditing purposes
4. **Handle Failures Gracefully**: If a conversation fails partway through, you may have partial usage to account for
5. **Consider Streaming Responses**: Usage information is still available when using streaming responses

## Billing Aggregator Example

Here's an example of how to aggregate billing information across multiple users:

```typescript
class BillingAggregator {
  private userUsage = new Map<string, {
    totalTokens: number;
    totalCost: number;
    conversations: number;
  }>();

  async processUserRequest(userId: string, prompt: string) {
    const tracker = new CostTracker();
    const { result, stepUsages, totalCost } = await tracker.trackConversation(prompt);

    const current = this.userUsage.get(userId) || {
      totalTokens: 0,
      totalCost: 0,
      conversations: 0
    };

    const totalTokens = stepUsages.reduce((sum, step) =>
      sum + step.usage.input_tokens + step.usage.output_tokens, 0
    );

    this.userUsage.set(userId, {
      totalTokens: current.totalTokens + totalTokens,
      totalCost: current.totalCost + totalCost,
      conversations: current.conversations + 1
    });

    return result;
  }

  getUserBilling(userId: string) {
    return this.userUsage.get(userId) || {
      totalTokens: 0,
      totalCost: 0,
      conversations: 0
    };
  }
}
```

## Related Documentation

- [TypeScript SDK Reference](/en/docs/claude-code/typescript-sdk-reference)
- [SDK Overview](/en/api/agent-sdk/overview)
- [SDK Permissions](/en/api/agent-sdk/permissions)