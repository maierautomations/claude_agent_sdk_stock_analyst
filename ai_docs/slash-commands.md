# Slash Commands in the SDK

Slash commands provide a way to control Claude Code sessions with special commands that start with `/`. These commands can be sent through the SDK to perform actions like clearing conversation history, compacting messages, or getting help.

## Discovering Available Slash Commands

The Claude Agent SDK provides information about available slash commands in the system initialization message:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Hello Claude",
  options: { maxTurns: 1 }
})) {
  if (message.type === "system" && message.subtype === "init") {
    console.log("Available slash commands:", message.slash_commands);
    // Example output: ["/compact", "/clear", "/help"]
  }
}
```

## Sending Slash Commands

Send slash commands by including them in your prompt string:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

// Send a slash command
for await (const message of query({
  prompt: "/compact",
  options: { maxTurns: 1 }
})) {
  if (message.type === "result") {
    console.log("Command executed:", message.result);
  }
}
```

## Common Slash Commands

### `/compact` - Compact Conversation History

Reduces the size of conversation history by summarizing older messages:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "/compact",
  options: { maxTurns: 1 }
})) {
  if (message.type === "system" && message.subtype === "compact_boundary") {
    console.log("Compaction completed");
    console.log("Pre-compaction tokens:", message.compact_metadata.pre_tokens);
    console.log("Trigger:", message.compact_metadata.trigger);
  }
}
```

### `/clear` - Clear Conversation

Starts a fresh conversation by clearing all previous history:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "/clear",
  options: { maxTurns: 1 }
})) {
  if (message.type === "result") {
    console.log("Conversation cleared");
  }
}
```

### `/help` - Get Help

Displays information about available commands and how to use them:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "/help",
  options: { maxTurns: 1 }
})) {
  if (message.type === "result") {
    console.log("Help information:", message.result);
  }
}
```

## Best Practices

- Use `/compact` when conversation history becomes too long to manage token usage
- Use `/clear` when you want to start a completely new conversation context
- Check the initialization message for the full list of supported slash commands
- Slash commands are processed before regular prompts