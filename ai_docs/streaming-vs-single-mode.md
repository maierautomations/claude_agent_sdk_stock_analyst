# Streaming Input

## Overview

The Claude Agent SDK supports two distinct input modes for interacting with agents:
- **Streaming Input Mode** (Default & Recommended) - A persistent, interactive session
- **Single Message Input** - One-shot queries that use session state and resuming

## Streaming Input Mode (Recommended)

Streaming input mode is the **preferred** way to use the Claude Agent SDK. It provides full access to the agent's capabilities and enables rich, interactive experiences.

### Benefits

1. Image Uploads
   - Attach images directly to messages for visual analysis and understanding

2. Queued Messages
   - Send multiple messages that process sequentially, with ability to interrupt

3. Tool Integration
   - Full access to all tools and custom MCP servers during the session

4. Hooks Support
   - Use lifecycle hooks to customize behavior at various points

5. Real-time Feedback
   - See responses as they're generated, not just final results

6. Context Persistence
   - Maintain conversation context across multiple turns naturally

### Implementation Example (TypeScript)

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFileSync } from "fs";

async function* generateMessages() {
  // First message
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Analyze this codebase for security issues"
    }
  };

  // Wait for conditions or user input
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Follow-up with image
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: [
        {
          type: "text",
          text: "Review this architecture diagram"
        },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: readFileSync("diagram.png", "base64")
          }
        }
      ]
    }
  };
}

const result = await query({
  messages: generateMessages()
});
```

### Implementation Example (Python)

```python
from anthropic_agent_sdk import query
import base64

async def generate_messages():
    # First message
    yield {
        "type": "user",
        "message": {
            "role": "user",
            "content": "Analyze this codebase for security issues"
        }
    }

    # Wait for conditions or user input
    await asyncio.sleep(2)

    # Follow-up with image
    with open("diagram.png", "rb") as f:
        image_data = base64.b64encode(f.read()).decode()

    yield {
        "type": "user",
        "message": {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Review this architecture diagram"
                },
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data
                    }
                }
            ]
        }
    }

result = await query(messages=generate_messages())
```

## Single Message Input

Single message input is a simpler mode suitable for one-off queries. While less feature-rich than streaming input, it still maintains session state and supports resuming.

### Limitations

- No image upload support
- No message queuing
- Limited interactivity
- Cannot use lifecycle hooks

### When to Use

Single message input is appropriate for:
- Simple, one-off queries
- Stateless interactions
- Quick prototyping
- Scripts and automation that don't require full interactivity

### Implementation Example (TypeScript)

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const result = await query({
  messages: [{
    role: "user",
    content: "What's the weather like today?"
  }]
});
```

### Implementation Example (Python)

```python
from anthropic_agent_sdk import query

result = await query(
    messages=[{
        "role": "user",
        "content": "What's the weather like today?"
    }]
)
```

### Session State and Resuming

Even with single message input, the SDK maintains session state. You can resume a session by providing the session ID:

**TypeScript:**
```typescript
// Initial query
const result1 = await query({
  messages: [{
    role: "user",
    content: "Start analyzing the logs"
  }]
});

// Resume the session
const result2 = await query({
  sessionId: result1.sessionId,
  messages: [{
    role: "user",
    content: "Continue with the error analysis"
  }]
});
```

**Python:**
```python
# Initial query
result1 = await query(
    messages=[{
        "role": "user",
        "content": "Start analyzing the logs"
    }]
)

# Resume the session
result2 = await query(
    session_id=result1.session_id,
    messages=[{
        "role": "user",
        "content": "Continue with the error analysis"
    }]
)
```

## Choosing the Right Mode

| Feature | Streaming Input | Single Message |
|---------|----------------|----------------|
| Image Support | ✓ | ✗ |
| Message Queuing | ✓ | ✗ |
| Lifecycle Hooks | ✓ | ✗ |
| Real-time Feedback | ✓ | ✗ |
| Session State | ✓ | ✓ |
| Session Resuming | ✓ | ✓ |
| Simplicity | Medium | High |
| Use Cases | Interactive apps, complex workflows | Scripts, simple queries |

**Recommendation:** Use streaming input mode for most applications to get full SDK capabilities. Only use single message input for very simple, stateless interactions.