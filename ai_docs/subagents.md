# Subagents in the SDK

## Overview
Subagents are specialized AIs orchestrated by the main agent in the Claude Agent SDK. They can be defined in two primary ways:
1. Programmatically using the `agents` parameter (recommended)
2. Filesystem-based by placing markdown files in `.claude/agents/` directories

## Benefits of Using Subagents

### Context Management
Subagents maintain separate contexts, preventing information overload and keeping interactions focused. For example, a "research-assistant" subagent can explore documentation without cluttering the main conversation.

### Parallelization
Multiple subagents can run concurrently, dramatically speeding up complex workflows. During a code review, you could run `style-checker`, `security-scanner`, and `test-coverage` subagents simultaneously.

### Specialized Instructions and Knowledge
Each subagent can have tailored system prompts with specific expertise, best practices, and constraints.

### Tool Restrictions
Subagents can be limited to specific tools, reducing the risk of unintended actions.

## Creating Subagents

### Programmatic Definition (Recommended)
Example of defining subagents programmatically:

```typescript
import { query } from '@anthropic/claude-code-sdk';

const result = query({
  prompt: "Review the authentication module for security issues",
  options: {
    agents: {
      'code-reviewer': {
        description: 'Expert code review specialist',
        prompt: `You are a code review specialist with expertise in security...`,
        tools: ['Read', 'Write', 'Grep', 'Glob'],
        model: 'sonnet'
      }
    }
  }
});
```

### AgentDefinition Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | `string` | Yes | Natural language description of when to use this agent |
| `prompt` | `string` | Yes | The agent's system prompt defining its role and behavior |
| `tools` | `string[]` | No | Array of allowed tool names |
| `model` | `'sonnet' \| 'opus' \| 'haiku'` | No | Claude model to use (defaults to parent model) |

### Filesystem-Based Definition
Create markdown files in `.claude/agents/` directory:

```markdown
<!-- .claude/agents/code-reviewer.md -->
# Code Reviewer

You are a code review specialist with expertise in security, performance, and best practices.

## Guidelines
- Check for security vulnerabilities
- Verify error handling
- Assess code maintainability
```

## Using Subagents

Once defined, the main agent can delegate to subagents through natural conversation:

```typescript
const result = query({
  prompt: "Use the code-reviewer agent to analyze src/auth.ts",
  options: {
    agents: { /* agent definitions */ }
  }
});
```

The main agent will automatically recognize when to invoke a subagent based on the task description.

## Best Practices

1. **Clear Descriptions**: Write precise agent descriptions so the main agent knows when to delegate
2. **Focused Prompts**: Give each subagent a specific, well-defined role
3. **Tool Restrictions**: Limit tools to only what each subagent needs
4. **Model Selection**: Use appropriate models (e.g., Haiku for simple tasks, Opus for complex reasoning)
5. **Prefer Programmatic**: Programmatic definitions are more maintainable and easier to version control

## Examples

### Research Assistant
```typescript
agents: {
  'research-assistant': {
    description: 'Gathers information from documentation and external sources',
    prompt: 'You are a research specialist. Find and summarize relevant information.',
    tools: ['WebFetch', 'Read', 'Grep']
  }
}
```

### Security Scanner
```typescript
agents: {
  'security-scanner': {
    description: 'Analyzes code for security vulnerabilities',
    prompt: 'You are a security expert. Check for common vulnerabilities like SQL injection, XSS, etc.',
    tools: ['Read', 'Grep', 'Glob'],
    model: 'opus'
  }
}
```

### Test Generator
```typescript
agents: {
  'test-generator': {
    description: 'Creates unit tests for code modules',
    prompt: 'You are a testing expert. Write comprehensive unit tests with edge cases.',
    tools: ['Read', 'Write', 'Bash']
  }
}
```