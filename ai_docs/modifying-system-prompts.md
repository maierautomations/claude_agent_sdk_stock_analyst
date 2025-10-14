# Modifying system prompts

System prompts define Claude's behavior, capabilities, and response style. The Claude Agent SDK provides three approaches to customize system prompts:

## Understanding system prompts

A system prompt is the initial instruction set that shapes Claude's behavior throughout a conversation.

**Default behavior:** The Agent SDK uses an **empty system prompt** by default. To use Claude Code's system prompt, specify `systemPrompt: { preset: "claude_code" }` in TypeScript or `system_prompt="claude_code"` in Python.

Claude Code's system prompt includes:
- Tool usage instructions and available tools
- Code style and formatting guidelines
- Response tone and verbosity settings
- Security and safety instructions
- Context about the current working directory and environment

## Methods of modification

### Method 1: Output styles (persistent configurations)

Output styles are saved configurations that modify Claude's system prompt, stored as markdown files and reusable across sessions and projects.

#### Creating an output style

Example TypeScript code for creating an output style:

```typescript
async function createOutputStyle(name: string, description: string, prompt: string) {
  const outputStylesDir = join(homedir(), '.claude', 'output-styles')

  await mkdir(outputStylesDir, { recursive: true })

  const content = `---
name: ${name}
description: ${description}
---

${prompt}`

  const filePath = join(outputStylesDir, `${name.toLowerCase().replace(/\s+/g, '-')}.md`)
  await writeFile(filePath, content, 'utf-8')
}

// Example: Create a code review specialist
await createOutputStyle(
  'Code Reviewer',
  'Thorough code review assistant',
  `You are an expert code reviewer.

For every code submission:
1. Check for bugs and security issues
2. Evaluate performance
3. Suggest improvements
4. Rate code quality (1-10)`
)
```

#### Using output styles

Activate output styles via:
- CLI: `/output-style [style-name]`
- Settings: `.claude/settings.local.json`
- Create new: `/create-output-style`

### Method 2: Programmatic system prompt modification

Modify system prompts directly when creating an agent:

```typescript
import { Agent } from '@anthropic-ai/agent-sdk';

const agent = new Agent({
  systemPrompt: {
    preset: 'claude_code',
    extensions: [
      'You are a Python expert specializing in data science.',
      'Always include type hints in code examples.',
      'Prefer pandas and numpy for data manipulation.'
    ]
  }
});
```

Python example:

```python
from anthropic_agent import Agent

agent = Agent(
    system_prompt={
        'preset': 'claude_code',
        'extensions': [
            'You are a Python expert specializing in data science.',
            'Always include type hints in code examples.',
            'Prefer pandas and numpy for data manipulation.'
        ]
    }
)
```

### Method 3: Runtime system prompt injection

Modify system prompts during agent execution:

```typescript
const response = await agent.chat({
  message: 'Help me optimize this code',
  systemPromptExtensions: [
    'Focus on memory efficiency',
    'Target execution time under 100ms'
  ]
});
```

Python example:

```python
response = agent.chat(
    message='Help me optimize this code',
    system_prompt_extensions=[
        'Focus on memory efficiency',
        'Target execution time under 100ms'
    ]
)
```

## Best practices

1. **Start with the preset**: Use `claude_code` preset as a foundation for tool-using agents
2. **Layer modifications**: Use extensions to add specific behaviors rather than replacing the entire prompt
3. **Be specific**: Clear, detailed instructions yield better results
4. **Test iteratively**: Refine prompts based on actual agent behavior
5. **Document your styles**: Use descriptive names and documentation for output styles
6. **Avoid conflicts**: Ensure extensions don't contradict base prompt instructions

## Common use cases

### Specialized coding assistant

```typescript
const agent = new Agent({
  systemPrompt: {
    preset: 'claude_code',
    extensions: [
      'You are a senior DevOps engineer.',
      'Prioritize infrastructure-as-code solutions.',
      'Always consider scalability and security.',
      'Provide Terraform and Kubernetes examples when relevant.'
    ]
  }
});
```

### Educational tutor

```typescript
const agent = new Agent({
  systemPrompt: {
    preset: 'claude_code',
    extensions: [
      'You are a patient programming tutor.',
      'Break down complex concepts into simple steps.',
      'Ask questions to check understanding.',
      'Provide hints before giving full solutions.'
    ]
  }
});
```

### Code reviewer

```typescript
const agent = new Agent({
  systemPrompt: {
    preset: 'claude_code',
    extensions: [
      'You are a thorough code reviewer.',
      'Check for: bugs, security issues, performance, readability.',
      'Provide specific line-by-line feedback.',
      'Suggest concrete improvements with examples.'
    ]
  }
});
```

## Troubleshooting

**Issue**: Agent ignoring custom instructions
- **Solution**: Ensure extensions don't conflict with preset instructions
- **Solution**: Make instructions more explicit and specific

**Issue**: Inconsistent behavior across sessions
- **Solution**: Save as an output style for consistency
- **Solution**: Document and version control your system prompts

**Issue**: Agent being too verbose or too terse
- **Solution**: Add explicit verbosity instructions to extensions
- **Solution**: Include examples of desired response length

## Additional resources

- [Agent SDK API Reference](/en/api/agent-sdk/reference)
- [Best practices for prompting](/en/docs/build-with-claude/prompt-engineering)
- [System prompt examples repository](https://github.com/anthropics/agent-sdk-examples)