# Handling Permissions

## SDK Permissions

The Claude Agent SDK provides powerful permission controls that allow you to manage how Claude uses tools in your application. This guide covers how to implement permission systems using the `canUseTool` callback, hooks, and settings.json permission rules.

## Overview

The Claude Agent SDK provides four complementary ways to control tool usage:

1. **Permission Modes** - Global permission behavior settings that affect all tools
2. **canUseTool callback** - Runtime permission handler for cases not covered by other rules
3. **Hooks** - Fine-grained control over every tool execution with custom logic
4. **Permission rules (settings.json)** - Declarative allow/deny rules with integrated bash command parsing

Use cases for each approach:
- Permission modes - Set overall permission behavior
- `canUseTool` - Dynamic approval for uncovered cases
- Hooks - Programmatic control over tool executions
- Permission rules - Static policies with bash command parsing

## Permission Modes

Permission modes provide global control over how Claude uses tools. You can set the permission mode when calling `query()` or change it dynamically during streaming sessions.

### Available Modes

| Mode | Description | Tool Behavior |
|------|-------------|---------------|
| `default` | Standard permission behavior | Normal permission checks apply |
| `plan` | Planning mode - no execution | Claude can only use read-only tools; presents a plan before execution |
| `acceptEdits` | Auto-accept file edits | File edits and filesystem operations are automatically approved |
| `bypassPermissions` | Bypass all permission checks | All tools run without permission prompts (use with caution) |

### Setting Permission Mode

#### Initial Configuration

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const result = await query({
  prompt: "Help me refactor this code",
  options: {
    permissionMode: 'default'  // Standard permission mode
  }
});
```

#### Dynamic Mode Changes (Streaming Only)

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function* streamInput() {
  yield {
    type: 'user',
    message: {
      role: 'user',
      content: "Let's start with default permissions"
    }
  };
}

const q = query({
  prompt: streamInput(),
  options: {
    permissionMode: 'default'
  }
});

await q.setPermissionMode('acceptEdits');
```

### Mode-Specific Behaviors

#### Accept Edits Mode (`acceptEdits`)
- Automatically approves file edits
- Automatically approves filesystem operations
- Speeds up development when you trust Claude's edits

#### Bypass Permissions Mode (`bypassPermissions`)
- **ALL tool uses are automatically approved**
- No permission prompts
- Hooks still execute
- Use with extreme caution

## canUseTool Callback

### Overview
The `canUseTool` callback is a runtime permission handler that allows dynamic approval for tool usage cases not covered by other rules.

### Code Example

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function promptForToolApproval(toolName: string, input: any) {
  console.log("\n🔧 Tool Request:");
  console.log(`   Tool: ${toolName}`);

  // Display tool parameters
  if (input && Object.keys(input).length > 0) {
    console.log("   Parameters:");
    for (const [key, value] of Object.entries(input)) {
      let displayValue = value;
      if (typeof value === 'string' && value.length > 100) {
        displayValue = value.substring(0, 100) + "...";
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value, null, 2);
      }
      console.log(`     ${key}: ${displayValue}`);
    }
  }

  // Get user approval (replace with your UI logic)
  const approved = await getUserApproval();

  if (approved) {
    console.log("   ✅ Approved\n");
    return {
      behavior: "allow",
      updatedInput: input
    };
  } else {
    console.log("   ❌ Denied\n");
    return {
      behavior: "deny",
      message: "User denied permission for this tool"
    };
  }
}

// Use the permission callback
const result = await query({
  prompt: "Help me analyze this codebase",
  options: {
    canUseTool: async (toolName, input) => {
      return promptForToolApproval(toolName, input);
    }
  }
});
```

### Key Characteristics

- Fires when Claude would normally show a permission prompt
- Allows dynamic, runtime decisions about tool usage
- Can modify input or completely deny tool usage

## Hooks

### Overview

Hooks provide programmatic control over tool execution at various stages. They are called for every tool use, giving complete control over the permission pipeline.

### Hook Types

1. **PreToolUse Hook**: Executes before a tool is used
2. **PostToolUse Hook**: Executes after a tool is used

### Hook Implementation Example

```typescript
const result = await query({
  prompt: "Help me refactor this code",
  options: {
    hooks: {
      PreToolUse: [{
        hooks: [async (input, toolUseId, { signal }) => {
          console.log(`Tool request: ${input.tool_name}`);

          // Block dangerous Bash commands
          if (input.tool_name === "Bash") {
            const command = input.tool_input.command;
            if (command.startsWith("rm -rf")) {
              return {
                decision: "block",
                reason: "Dangerous command blocked"
              };
            }
          }

          return { continue: true };
        }]
      }],
      PostToolUse: [{
        hooks: [async (input, toolUseId, { signal }) => {
          console.log(`Tool completed: ${input.tool_name}`);
          // Log or audit tool results
          return { continue: true };
        }]
      }]
    }
  }
});
```

### Key Differences from canUseTool

- Hooks are called for all tool uses
- Hooks require manual parsing and validation of inputs
- Hooks support multiple events for different execution stages

## Permission Rules Configuration

### Overview

Permission rules are declarative allow/deny/ask rules defined in settings.json with integrated bash command parsing.

### Configuration Structure

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl:*)",
      "Read(./.env)",
      "Read(./secrets/**)",
      "WebFetch"
    ],
    "ask": [
      "Bash(git push:*)",
      "Write(./production/**)"
    ]
  }
}
```

### Rule Syntax

- Format: `ToolName(pattern)`
- Supports prefix matching and glob patterns
- Examples:
  - `Bash(npm:*)` matches any command starting with "npm"
  - `Read(./src/**/*.ts)` matches TypeScript files in src directory
  - `WebFetch` blocks all web fetches

### Key Features

- Bash command parsing understands:
  - Pipes
  - Redirects
  - Command substitution
- Supports wildcards and prefix matching

## Permission Flow Order

The permission processing order is:

1. PreToolUse Hook
2. Ask Rules
3. Deny Rules
4. Permission Mode Check
5. Allow Rules
6. canUseTool Callback
7. PostToolUse Hook

## Best Practices

1. **Start with default mode** for standard permission checks
2. **Use permission rules** for static policies, especially bash commands
3. **Use hooks** to log, audit, or transform all tool uses
4. **Use canUseTool** for dynamic decisions on uncovered cases
5. **Layer defenses** by combining modes, rules, hooks, and callbacks for critical applications

## Summary

The Claude Agent SDK provides multiple layers of permission control:
- Permission modes for global behavior
- Rules for static policies
- Hooks for programmatic control
- Callbacks for dynamic decision-making

The goal is to provide flexible, granular control over tool usage while maintaining security and user trust.