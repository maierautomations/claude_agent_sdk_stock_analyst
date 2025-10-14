# Agent SDK Reference - Python

The Python Agent SDK is a library for interacting with Claude Code, offering flexible ways to integrate AI-powered code generation and interaction into your Python applications.

## Installation

```bash
pip install claude-agent-sdk
```

## Overview

The Python Agent SDK provides two primary ways to interact with Claude Code:

### 1. `query()` Function
- Creates a new session for each interaction
- Best for simple, one-off tasks
- Returns an async iterator of messages
- Minimal setup required
- Stateless interactions

### 2. `ClaudeSDKClient` Class
- Maintains conversation context across multiple exchanges
- Supports continuous conversations
- Provides advanced features:
  - Interrupts
  - Custom tools
  - Hooks for behavior modification
  - Streaming input
  - Explicit session lifecycle management

## Basic Usage

### Using `query()`

```python
import asyncio
from claude_agent_sdk import query

async def main():
    async for message in query(prompt="Create a Python project"):
        print(message)

asyncio.run(main())
```

### Using `ClaudeSDKClient`

```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient

async def main():
    async with ClaudeSDKClient() as client:
        await client.query("What's the capital of France?")
        async for message in client.receive_response():
            print(message)

asyncio.run(main())
```

## Configuration

### ClaudeAgentOptions

Configure the Agent SDK behavior with flexible options:

```python
from claude_agent_sdk import ClaudeAgentOptions, query

options = ClaudeAgentOptions(
    system_prompt="You are an expert Python developer",
    permission_mode='acceptEdits'
)

async for message in query(
    prompt="Create a Python web server",
    options=options
):
    print(message)
```

## Key Features

### Custom Tools

Create custom tools using the `@tool` decorator:

```python
from claude_agent_sdk import tool

@tool
def my_custom_tool(param: str) -> str:
    """Tool description"""
    return f"Result: {param}"
```

### Streaming Input/Output

The SDK supports streaming for both input and output, enabling real-time interaction:

```python
async for message in query(prompt="Your task"):
    # Process streaming messages
    print(message)
```

### Permission Control

Control how Claude interacts with your system through permission modes:

- `acceptEdits`: Automatically accept file edits
- `ask`: Prompt for permission on each action
- Custom permission handling via hooks

### Conversation Context

Maintain conversation state across multiple interactions:

```python
async with ClaudeSDKClient() as client:
    # First query
    await client.query("Start a project")
    async for msg in client.receive_response():
        print(msg)

    # Follow-up in same context
    await client.query("Add more features")
    async for msg in client.receive_response():
        print(msg)
```

## Advanced Features

### Interrupts

Interrupt running tasks when using `ClaudeSDKClient`:

```python
async with ClaudeSDKClient() as client:
    await client.query("Long running task")
    # Interrupt if needed
    await client.interrupt()
```

### Hooks

Modify SDK behavior with custom hooks for:
- Pre/post processing
- Custom logging
- Error handling
- Permission control

### Session Management

Explicit control over session lifecycle:

```python
client = ClaudeSDKClient()
await client.start()
# ... interactions ...
await client.close()
```

## API Reference

### Functions

#### `query()`

Creates a new session for each interaction, ideal for simple, one-off tasks.

**Signature:**
```python
async def query(
    prompt: str,
    options: Optional[ClaudeAgentOptions] = None
) -> AsyncIterator[Message]
```

**Parameters:**
- `prompt` (str): The task or question to send to Claude
- `options` (Optional[ClaudeAgentOptions]): Configuration options

**Returns:**
- AsyncIterator[Message]: Stream of response messages

### Classes

#### `ClaudeSDKClient`

Main client class for maintaining conversation context.

**Methods:**

##### `query()`
Send a query to Claude within the current session.

```python
async def query(self, prompt: str) -> None
```

##### `receive_response()`
Receive streaming responses from Claude.

```python
async def receive_response(self) -> AsyncIterator[Message]
```

##### `interrupt()`
Interrupt the current running task.

```python
async def interrupt(self) -> None
```

##### `start()`
Start the client session.

```python
async def start(self) -> None
```

##### `close()`
Close the client session and clean up resources.

```python
async def close(self) -> None
```

### Types

#### `ClaudeAgentOptions`

Configuration options for the Agent SDK.

**Fields:**
- `system_prompt` (Optional[str]): Custom system prompt
- `permission_mode` (Optional[str]): Permission handling mode
- `tools` (Optional[List]): Custom tools to provide
- `hooks` (Optional[Dict]): Custom hooks for behavior modification

#### `Message`

Represents a message in the conversation.

**Fields:**
- `type` (str): Message type
- `content` (Union[str, List]): Message content
- `role` (Optional[str]): Message role (user/assistant)

### Tool Decorator

#### `@tool`

Decorator for creating custom tools.

```python
from claude_agent_sdk import tool

@tool
def custom_tool(param1: str, param2: int) -> str:
    """
    Tool description

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        Result description
    """
    return "result"
```

## Error Handling

The SDK provides comprehensive error handling for:
- CLI interaction errors
- Process execution errors
- Permission denial errors
- Network errors
- Session management errors

```python
try:
    async for message in query(prompt="Task"):
        print(message)
except Exception as e:
    print(f"Error: {e}")
```

## Best Practices

1. **Use `query()` for simple tasks**: One-off interactions that don't require context
2. **Use `ClaudeSDKClient` for conversations**: Multi-turn interactions with context
3. **Configure appropriate permissions**: Set permission modes based on your security needs
4. **Handle errors gracefully**: Implement proper error handling for production use
5. **Clean up resources**: Use async context managers or explicit close calls
6. **Stream processing**: Process messages as they arrive for better responsiveness

## Examples

### Complete Example with Options

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    options = ClaudeAgentOptions(
        system_prompt="You are an expert Python developer",
        permission_mode='acceptEdits'
    )

    async for message in query(
        prompt="Create a Python web server with FastAPI",
        options=options
    ):
        if hasattr(message, 'content'):
            print(message.content)

asyncio.run(main())
```

### Multi-turn Conversation

```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient

async def main():
    async with ClaudeSDKClient() as client:
        # Initial query
        await client.query("Create a todo app")
        async for message in client.receive_response():
            print(message)

        # Follow-up
        await client.query("Add authentication")
        async for message in client.receive_response():
            print(message)

        # Another follow-up
        await client.query("Write tests")
        async for message in client.receive_response():
            print(message)

asyncio.run(main())
```

## Comparison: `query()` vs `ClaudeSDKClient`

| Feature | `query()` | `ClaudeSDKClient` |
|---------|-----------|-------------------|
| Session management | New session each call | Persistent session |
| Conversation context | No | Yes |
| Interrupts | No | Yes |
| Custom tools | Yes | Yes |
| Hooks | Yes | Yes |
| Use case | One-off tasks | Multi-turn conversations |
| Setup complexity | Minimal | Moderate |

## Additional Resources

- [Claude Agent SDK Documentation](https://docs.claude.com)
- [API Reference](https://docs.claude.com/en/api)
- [GitHub Repository](https://github.com/anthropics/claude-agent-sdk)

---

*This documentation is for the Python Agent SDK for Claude Code. For other language implementations, see the main Agent SDK documentation.*