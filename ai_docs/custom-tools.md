# Custom Tools

Build and integrate custom tools to extend Claude Agent SDK functionality

Custom tools allow you to extend Claude Code's capabilities with your own functionality through in-process MCP servers, enabling Claude to interact with external services, APIs, or perform specialized operations.

## Creating Custom Tools

Use the `createSdkMcpServer` and `tool` helper functions to define type-safe custom tools:

### TypeScript

```typescript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// Create an SDK MCP server with custom tools
const customServer = createSdkMcpServer({
  name: "my-custom-tools",
  version: "1.0.0",
  tools: [
    tool(
      "get_weather",
      "Get current weather for a location",
      {
        location: z.string().describe("City name or coordinates"),
        units: z.enum(["celsius", "fahrenheit"]).default("celsius").describe("Temperature units")
      },
      async (args) => {
        // Call weather API
        const response = await fetch(
          `https://api.weather.com/v1/current?q=${args.location}&units=${args.units}`
        );
        const data = await response.json();

        return {
          content: [{
            type: "text",
            text: `Temperature: ${data.temp}°\nConditions: ${data.conditions}\nHumidity: ${data.humidity}%`
          }]
        };
      }
    )
  ]
});
```

## Using Custom Tools

Pass the custom server to the `query` function via the `mcpServers` option as a dictionary/object.

**Important:** Custom MCP tools require streaming input mode. You must use an async generator/iterable for the `prompt` parameter - a simple string will not work with MCP servers.

### Tool Name Format

When MCP tools are exposed to Claude, their names follow a specific format:

- Pattern: `mcp__{server_name}__{tool_name}`
- Example: A tool named `get_weather` in server `my-custom-tools` becomes `mcp__my-custom-tools__get_weather`

### TypeScript Example

```typescript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const customServer = createSdkMcpServer({
  name: "my-custom-tools",
  version: "1.0.0",
  tools: [
    tool(
      "get_weather",
      "Get current weather for a location",
      {
        location: z.string().describe("City name or coordinates"),
        units: z.enum(["celsius", "fahrenheit"]).default("celsius").describe("Temperature units")
      },
      async (args) => {
        const response = await fetch(
          `https://api.weather.com/v1/current?q=${args.location}&units=${args.units}`
        );
        const data = await response.json();

        return {
          content: [{
            type: "text",
            text: `Temperature: ${data.temp}°\nConditions: ${data.conditions}\nHumidity: ${data.humidity}%`
          }]
        };
      }
    )
  ]
});

async function* streamingPrompt() {
  yield "What's the weather in San Francisco?";
}

const result = await query(streamingPrompt(), {
  mcpServers: {
    "my-custom-tools": customServer
  }
});
```

### Python Example

```python
from anthropic_sdk import query, tool, create_sdk_mcp_server
from pydantic import BaseModel, Field
from enum import Enum

class Units(str, Enum):
    celsius = "celsius"
    fahrenheit = "fahrenheit"

class WeatherArgs(BaseModel):
    location: str = Field(description="City name or coordinates")
    units: Units = Field(default=Units.celsius, description="Temperature units")

async def get_weather(args: WeatherArgs):
    # Call weather API
    response = await fetch(
        f"https://api.weather.com/v1/current?q={args.location}&units={args.units}"
    )
    data = await response.json()

    return {
        "content": [{
            "type": "text",
            "text": f"Temperature: {data['temp']}°\nConditions: {data['conditions']}\nHumidity: {data['humidity']}%"
        }]
    }

custom_server = create_sdk_mcp_server(
    name="my-custom-tools",
    version="1.0.0",
    tools=[
        tool(
            name="get_weather",
            description="Get current weather for a location",
            input_schema=WeatherArgs,
            handler=get_weather
        )
    ]
)

async def streaming_prompt():
    yield "What's the weather in San Francisco?"

result = await query(
    streaming_prompt(),
    mcp_servers={
        "my-custom-tools": custom_server
    }
)
```

## Example Use Cases

### Database Query Tool

```typescript
tool(
  "query_database",
  "Execute SQL queries on the database",
  {
    query: z.string().describe("SQL query to execute"),
    params: z.array(z.any()).optional().describe("Query parameters")
  },
  async (args) => {
    const results = await db.query(args.query, args.params);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(results, null, 2)
      }]
    };
  }
)
```

### API Gateway Tool

```typescript
tool(
  "call_api",
  "Make authenticated API requests",
  {
    endpoint: z.string().describe("API endpoint path"),
    method: z.enum(["GET", "POST", "PUT", "DELETE"]).describe("HTTP method"),
    body: z.record(z.any()).optional().describe("Request body")
  },
  async (args) => {
    const response = await fetch(`${API_BASE_URL}${args.endpoint}`, {
      method: args.method,
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: args.body ? JSON.stringify(args.body) : undefined
    });

    const data = await response.json();
    return {
      content: [{
        type: "text",
        text: JSON.stringify(data, null, 2)
      }]
    };
  }
)
```

### Calculator Tool

```typescript
tool(
  "calculate",
  "Perform mathematical calculations",
  {
    expression: z.string().describe("Mathematical expression to evaluate")
  },
  async (args) => {
    // Use a safe math parser library
    const result = mathParser.evaluate(args.expression);
    return {
      content: [{
        type: "text",
        text: `Result: ${result}`
      }]
    };
  }
)
```

## Tool Permissions

You can control which tools Claude can use with the `allowedTools` option:

### TypeScript

```typescript
const result = await query(streamingPrompt(), {
  mcpServers: {
    "my-custom-tools": customServer
  },
  allowedTools: [
    "mcp__my-custom-tools__get_weather"
  ]
});
```

### Python

```python
result = await query(
    streaming_prompt(),
    mcp_servers={
        "my-custom-tools": custom_server
    },
    allowed_tools=[
        "mcp__my-custom-tools__get_weather"
    ]
)
```

## Key Features

- **Type Safety**: Tools use Zod (TypeScript) or Pydantic (Python) schemas for type-safe input validation
- **Streaming Required**: Custom MCP tools require streaming input mode using async generators/iterables
- **Flexible Integration**: Enable interaction with external services, APIs, or specialized operations
- **Permission Control**: Selectively allow specific tools using the `allowedTools` option
- **Error Handling**: Implement comprehensive error handling in tool implementations
- **In-Process MCP Servers**: Tools run as in-process Model Context Protocol servers

## Best Practices

1. **Handle Errors Gracefully**: Implement proper error handling in your tool implementations
2. **Use Type-Safe Schemas**: Define comprehensive input schemas with clear descriptions
3. **Manage Permissions Carefully**: Use `allowedTools` to control which tools Claude can access
4. **Provide Clear Descriptions**: Write detailed descriptions for tools and their parameters
5. **Return Structured Content**: Use the proper content format in tool responses

## Related Documentation

- [TypeScript SDK Reference](/en/api/agent-sdk/typescript)
- [Python SDK Reference](/en/api/agent-sdk/python)
- [MCP Documentation](https://modelcontextprotocol.io)

---

**Source**: https://docs.claude.com/en/api/agent-sdk/custom-tools