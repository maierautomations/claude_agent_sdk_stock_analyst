# TypeScript Agent SDK Reference

Source: https://docs.claude.com/en/api/agent-sdk/typescript

## Installation

```bash
npm install @anthropic-ai/claude-agent-sdk
```

## Overview

The Claude Agent SDK for TypeScript provides a comprehensive toolkit for building AI agents that can interact with Claude Code. This reference documents all available functions, types, and interfaces.

## Primary Functions

### query()

The main function for interacting with Claude Code.

**Signature:**
```typescript
function query(
  config: QueryConfig
): Promise<QueryResult>
```

**Description:**
Main function for sending queries to Claude and managing agent interactions. Supports streaming responses, tool usage, and permission management.

**Parameters:**
- `config: QueryConfig` - Configuration object for the query

**Returns:**
- `Promise<QueryResult>` - The result of the query operation

### tool()

Creates type-safe MCP tool definitions.

**Signature:**
```typescript
function tool<TInput, TOutput>(
  definition: ToolDefinition<TInput, TOutput>
): Tool<TInput, TOutput>
```

**Description:**
Creates a type-safe tool definition for use with the MCP (Model Context Protocol). Ensures input and output schemas are properly validated.

**Parameters:**
- `definition: ToolDefinition<TInput, TOutput>` - The tool definition including name, description, and schemas

**Returns:**
- `Tool<TInput, TOutput>` - A type-safe tool instance

### createSdkMcpServer()

Creates an MCP server instance.

**Signature:**
```typescript
function createSdkMcpServer(
  options: McpServerOptions
): McpServer
```

**Description:**
Creates and configures an MCP server instance for handling tool requests and managing agent interactions.

**Parameters:**
- `options: McpServerOptions` - Configuration options for the MCP server

**Returns:**
- `McpServer` - Configured MCP server instance

## Configuration Types

### QueryConfig

Configuration object for query operations.

```typescript
interface QueryConfig {
  // Core configuration
  messages: Message[];
  apiKey?: string;
  model?: string;
  maxTokens?: number;

  // Streaming
  stream?: boolean;
  onStreamChunk?: (chunk: StreamChunk) => void;

  // Tools
  tools?: Tool[];
  onToolUse?: (toolUse: ToolUse) => Promise<ToolResult>;

  // Permissions
  requirePermission?: boolean;
  onPermissionRequest?: (request: PermissionRequest) => Promise<boolean>;

  // Hooks
  beforeRequest?: (config: QueryConfig) => QueryConfig;
  afterResponse?: (result: QueryResult) => QueryResult;
}
```

### McpServerOptions

Configuration options for MCP server creation.

```typescript
interface McpServerOptions {
  name: string;
  version: string;
  tools?: Tool[];
  capabilities?: ServerCapabilities;
  onError?: (error: Error) => void;
}
```

## Message Types

### Message

Represents a single message in a conversation.

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}
```

### ContentBlock

Represents structured content within a message.

```typescript
type ContentBlock =
  | TextContentBlock
  | ImageContentBlock
  | ToolUseContentBlock
  | ToolResultContentBlock;

interface TextContentBlock {
  type: 'text';
  text: string;
}

interface ImageContentBlock {
  type: 'image';
  source: {
    type: 'base64' | 'url';
    data: string;
  };
}

interface ToolUseContentBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}

interface ToolResultContentBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string | ContentBlock[];
  is_error?: boolean;
}
```

## Tool Types

### ToolDefinition

Definition for creating a new tool.

```typescript
interface ToolDefinition<TInput, TOutput> {
  name: string;
  description: string;
  inputSchema: JSONSchema<TInput>;
  outputSchema: JSONSchema<TOutput>;
  handler: (input: TInput) => Promise<TOutput>;
}
```

### Tool

A fully configured tool instance.

```typescript
interface Tool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: JSONSchema<TInput>;
  outputSchema: JSONSchema<TOutput>;
  execute: (input: TInput) => Promise<TOutput>;
}
```

### ToolUse

Represents a tool invocation request from Claude.

```typescript
interface ToolUse {
  id: string;
  name: string;
  input: unknown;
}
```

### ToolResult

Result of a tool execution.

```typescript
interface ToolResult {
  tool_use_id: string;
  content: string | ContentBlock[];
  is_error?: boolean;
}
```

## Response Types

### QueryResult

Result returned from a query operation.

```typescript
interface QueryResult {
  content: ContentBlock[];
  stopReason: StopReason;
  usage: Usage;
  model: string;
}
```

### StopReason

Reasons why Claude stopped generating.

```typescript
type StopReason =
  | 'end_turn'
  | 'max_tokens'
  | 'stop_sequence'
  | 'tool_use';
```

### Usage

Token usage information.

```typescript
interface Usage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}
```

## Streaming Types

### StreamChunk

Represents a chunk of streamed response data.

```typescript
interface StreamChunk {
  type: 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_start' | 'message_delta' | 'message_stop';
  index?: number;
  delta?: ContentBlockDelta;
  content_block?: ContentBlock;
  message?: Partial<QueryResult>;
}
```

### ContentBlockDelta

Incremental content updates during streaming.

```typescript
interface ContentBlockDelta {
  type: 'text_delta' | 'input_json_delta';
  text?: string;
  partial_json?: string;
}
```

## Permission Types

### PermissionRequest

Request for user permission to perform an action.

```typescript
interface PermissionRequest {
  action: string;
  resource: string;
  details?: Record<string, unknown>;
}
```

## Hook Types

### beforeRequest

Hook called before sending a request to Claude.

```typescript
type BeforeRequestHook = (config: QueryConfig) => QueryConfig;
```

### afterResponse

Hook called after receiving a response from Claude.

```typescript
type AfterResponseHook = (result: QueryResult) => QueryResult;
```

### onStreamChunk

Hook called for each chunk in a streaming response.

```typescript
type OnStreamChunkHook = (chunk: StreamChunk) => void;
```

### onToolUse

Hook called when Claude requests to use a tool.

```typescript
type OnToolUseHook = (toolUse: ToolUse) => Promise<ToolResult>;
```

### onPermissionRequest

Hook called when permission is required for an action.

```typescript
type OnPermissionRequestHook = (request: PermissionRequest) => Promise<boolean>;
```

## JSON Schema Types

### JSONSchema

Type-safe JSON Schema definition.

```typescript
interface JSONSchema<T = unknown> {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  enum?: unknown[];
  description?: string;
  default?: T;
}
```

## Server Types

### McpServer

MCP server instance.

```typescript
interface McpServer {
  start(): Promise<void>;
  stop(): Promise<void>;
  registerTool(tool: Tool): void;
  unregisterTool(name: string): void;
  listTools(): Tool[];
}
```

### ServerCapabilities

Capabilities supported by the MCP server.

```typescript
interface ServerCapabilities {
  tools?: boolean;
  streaming?: boolean;
  permissions?: boolean;
}
```

## Error Types

### AgentError

Base error class for agent-related errors.

```typescript
class AgentError extends Error {
  code: string;
  details?: Record<string, unknown>;
}
```

### ToolExecutionError

Error thrown during tool execution.

```typescript
class ToolExecutionError extends AgentError {
  toolName: string;
  input: unknown;
}
```

### PermissionDeniedError

Error thrown when permission is denied.

```typescript
class PermissionDeniedError extends AgentError {
  action: string;
  resource: string;
}
```

## Usage Examples

### Basic Query

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const result = await query({
  messages: [
    { role: 'user', content: 'Hello, Claude!' }
  ],
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 1024
});

console.log(result.content);
```

### Streaming Query

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

await query({
  messages: [
    { role: 'user', content: 'Tell me a story' }
  ],
  stream: true,
  onStreamChunk: (chunk) => {
    if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
      process.stdout.write(chunk.delta.text);
    }
  }
});
```

### Using Tools

```typescript
import { query, tool } from '@anthropic-ai/claude-agent-sdk';

const weatherTool = tool({
  name: 'get_weather',
  description: 'Get the current weather for a location',
  inputSchema: {
    type: 'object',
    properties: {
      location: { type: 'string', description: 'City name' }
    },
    required: ['location']
  },
  outputSchema: {
    type: 'object',
    properties: {
      temperature: { type: 'number' },
      conditions: { type: 'string' }
    }
  },
  handler: async (input) => {
    // Fetch weather data
    return {
      temperature: 72,
      conditions: 'Sunny'
    };
  }
});

const result = await query({
  messages: [
    { role: 'user', content: 'What\'s the weather in San Francisco?' }
  ],
  tools: [weatherTool],
  onToolUse: async (toolUse) => {
    const tool = [weatherTool].find(t => t.name === toolUse.name);
    if (!tool) {
      return {
        tool_use_id: toolUse.id,
        content: 'Tool not found',
        is_error: true
      };
    }

    try {
      const result = await tool.execute(toolUse.input);
      return {
        tool_use_id: toolUse.id,
        content: JSON.stringify(result)
      };
    } catch (error) {
      return {
        tool_use_id: toolUse.id,
        content: error.message,
        is_error: true
      };
    }
  }
});
```

### Creating an MCP Server

```typescript
import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';

const calculatorTool = tool({
  name: 'calculate',
  description: 'Perform basic arithmetic',
  inputSchema: {
    type: 'object',
    properties: {
      operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
      a: { type: 'number' },
      b: { type: 'number' }
    },
    required: ['operation', 'a', 'b']
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: { type: 'number' }
    }
  },
  handler: async (input) => {
    let result: number;
    switch (input.operation) {
      case 'add': result = input.a + input.b; break;
      case 'subtract': result = input.a - input.b; break;
      case 'multiply': result = input.a * input.b; break;
      case 'divide': result = input.a / input.b; break;
    }
    return { result };
  }
});

const server = createSdkMcpServer({
  name: 'calculator-server',
  version: '1.0.0',
  tools: [calculatorTool],
  capabilities: {
    tools: true,
    streaming: false,
    permissions: false
  },
  onError: (error) => {
    console.error('Server error:', error);
  }
});

await server.start();
```

### Permission Management

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const result = await query({
  messages: [
    { role: 'user', content: 'Delete the file config.json' }
  ],
  requirePermission: true,
  onPermissionRequest: async (request) => {
    console.log(`Permission requested: ${request.action} on ${request.resource}`);

    // In a real application, prompt the user
    const userApproved = await promptUser(
      `Allow ${request.action} on ${request.resource}?`
    );

    return userApproved;
  }
});
```

## Best Practices

### Error Handling

Always wrap agent operations in try-catch blocks:

```typescript
try {
  const result = await query({
    messages: [{ role: 'user', content: 'Hello' }]
  });
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    console.error('Permission denied:', error.action);
  } else if (error instanceof ToolExecutionError) {
    console.error('Tool failed:', error.toolName);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Type Safety

Leverage TypeScript's type system for tool definitions:

```typescript
interface WeatherInput {
  location: string;
  units?: 'celsius' | 'fahrenheit';
}

interface WeatherOutput {
  temperature: number;
  conditions: string;
  humidity: number;
}

const weatherTool = tool<WeatherInput, WeatherOutput>({
  name: 'get_weather',
  description: 'Get weather data',
  inputSchema: {
    type: 'object',
    properties: {
      location: { type: 'string' },
      units: { type: 'string', enum: ['celsius', 'fahrenheit'] }
    },
    required: ['location']
  },
  outputSchema: {
    type: 'object',
    properties: {
      temperature: { type: 'number' },
      conditions: { type: 'string' },
      humidity: { type: 'number' }
    }
  },
  handler: async (input) => {
    // TypeScript knows the exact types here
    return {
      temperature: 72,
      conditions: 'Sunny',
      humidity: 65
    };
  }
});
```

### Resource Management

Clean up resources properly:

```typescript
const server = createSdkMcpServer({ /* ... */ });

try {
  await server.start();
  // Use server...
} finally {
  await server.stop();
}
```

## Additional Resources

- [Agent SDK Documentation](https://docs.claude.com/en/api/agent-sdk)
- [MCP Protocol Specification](https://docs.claude.com/en/api/mcp)
- [Anthropic API Reference](https://docs.anthropic.com)

## Support

For issues and questions:
- GitHub Issues: https://github.com/anthropics/claude-agent-sdk
- Documentation: https://docs.claude.com
- Community: https://community.anthropic.com