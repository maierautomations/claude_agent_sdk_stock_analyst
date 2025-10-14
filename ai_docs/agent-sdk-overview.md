# Agent SDK Overview

## Key Highlights

The Claude Code SDK has been renamed to the **Claude Agent SDK**. Developers can build custom AI agents with this SDK.

## Installation

```bash
npm install @anthropic-ai/claude-agent-sdk
```

## SDK Options

Available in multiple forms:
- TypeScript SDK (Node.js and web applications)
- Python SDK (Python applications and data science)
- Streaming vs Single Mode options

## Why Use the Claude Agent SDK?

Built on Claude Code's agent harness, offering:
- Automatic context management
- Rich tool ecosystem
- Advanced permissions
- Production essentials
- Optimized Claude integration

## What Can You Build?

### Coding Agents
- SRE agents for production issue diagnosis
- Security review bots
- Oncall engineering assistants
- Code review agents

### Business Agents
- Legal contract review assistants
- Finance advisors
- Customer support agents
- Content creation assistants

## Core Concepts

### Authentication
- Retrieve API key from Claude Console
- Set `ANTHROPIC_API_KEY` environment variable
- Supports third-party providers like Amazon Bedrock and Google Vertex AI

### Features
- Subagents
- Hooks
- Slash Commands
- Memory management

### System Prompts
Define agent's role, expertise, and behavior

### Tool Permissions
- Control tool usage
- Set allowed/disallowed tools
- Configure permission strategies

### Model Context Protocol (MCP)
Extend agents with custom tools and external service integrations

## Reporting Bugs
- TypeScript SDK: GitHub issues
- Python SDK: GitHub issues

## Related Resources
- CLI Reference
- GitHub Actions Integration
- MCP Documentation
- Common Workflows
- Troubleshooting Guide