# Migrate to Claude Agent SDK

## Overview

The Claude Code SDK has been renamed to the **Claude Agent SDK** and its documentation has been reorganized. This change reflects the SDK's broader capabilities for building AI agents beyond just coding tasks.

## What's Changed

| Aspect | Old | New |
|--------|-----|-----|
| **Package Name (TS/JS)** | `@anthropic-ai/claude-code` | `@anthropic-ai/claude-agent-sdk` |
| **Python Package** | `claude-code-sdk` | `claude-agent-sdk` |
| **Documentation Location** | Claude Code docs → SDK section | API Guide → Agent SDK section |

## Migration Steps

### For TypeScript/JavaScript Projects

**1. Uninstall the old package:**

```
npm uninstall @anthropic-ai/claude-code
```

**2. Install the new package:**

```
npm install @anthropic-ai/claude-agent-sdk
```

**3. Update your imports:**

```typescript
// Before
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-code";

// After
import {
  query,
  tool,
  createSdkMcpServer,
} from "@anthropic-ai/claude-agent-sdk";
```

### For Python Projects

**1. Uninstall the old package:**

```
pip uninstall claude-code-sdk
```

**2. Install the new package:**

```
pip install claude-agent-sdk
```

**3. Update your imports:**

```python
# Before
from claude_code_sdk import query, ClaudeCodeOptions

# After
from claude_agent_sdk import query, ClaudeAgentOptions
```

## Breaking Changes

### Python: ClaudeCodeOptions renamed to ClaudeAgentOptions

**What changed:** The Python SDK type `ClaudeCodeOptions` has been renamed to `ClaudeAgentOptions`.

### System prompt no longer default

The SDK no longer uses Claude Code's system prompt by default.

### Settings Sources No Longer Loaded by Default

**What changed:** The SDK no longer reads from filesystem settings (CLAUDE.md, settings.json, slash commands, etc.) by default.

**Why this changed:** Ensures SDK applications have predictable behavior independent of local filesystem configurations. Key benefits include:

- Consistent behavior in CI/CD environments
- Predictable performance in deployed applications
- Isolated testing environments
- Prevention of settings leakage in multi-tenant systems

**Backward compatibility:** If your application relied on filesystem settings, add `settingSources: ['user', 'project', 'local']` to your options.

## Why the Rename?

The Claude Code SDK evolved beyond its original coding-focused design. The new "Claude Agent SDK" name reflects broader capabilities:

- Building business agents (legal, finance, customer support)
- Creating specialized coding agents
- Developing custom agents across various domains

## Getting Help

**For TypeScript/JavaScript:**
1. Update imports to `@anthropic-ai/claude-agent-sdk`
2. Verify package.json dependencies
3. Run `npm install`

**For Python:**
1. Update imports to `claude_agent_sdk`
2. Update requirements files
3. Run `pip install claude-agent-sdk`

## Next Steps

- Explore [Agent SDK Overview](/en/api/agent-sdk/overview)
- Review TypeScript and Python SDK References
- Learn about Custom Tools and MCP Integration