# OpenAI SDK compatibility

Anthropic provides a compatibility layer that enables you to use the OpenAI SDK to test the Claude API. With a few code changes, you can quickly evaluate Anthropic model capabilities.

> This compatibility layer is primarily intended to test and compare model capabilities, and is not considered a long-term or production-ready solution.

## Getting started with the OpenAI SDK

To use the OpenAI SDK compatibility feature, you'll need to:

1. Use an official OpenAI SDK
2. Change the following:
   - Update your base URL to point to the Claude API
   - Replace your API key with a Claude API key
   - Update your model name to use a Claude model

### Quick start example

**Python:**
```python
from openai import OpenAI

client = OpenAI(
    api_key="ANTHROPIC_API_KEY",  # Your Claude API key
    base_url="https://api.anthropic.com/v1/"  # the Claude API endpoint
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5", # Anthropic model name
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Who are you?"}
    ],
)

print(response.choices[0].message.content)
```

## Important OpenAI compatibility limitations

### API Behavior

Key differences from using OpenAI:

- The `strict` parameter for function calling is ignored
- Audio input is not supported
- Prompt caching is not supported through this compatibility layer
- System/developer messages are hoisted and concatenated

### Output Quality Considerations

If you've done lots of tweaking to your prompt, it's likely well-tuned to OpenAI specifically. Consider using the prompt improver in the Claude Console.

### System / Developer Message Hoisting

Since Anthropic only supports an initial system message, all system/developer messages are concatenated together with a single newline between them.

### Extended Thinking Support

You can enable extended thinking capabilities by adding the `thinking` parameter to your requests when using compatible Claude models.

## Detailed API Support

### Request Fields

The compatibility layer supports various OpenAI request fields with some limitations:

#### Supported Fields
- `model` - Use Claude model names (e.g., `claude-sonnet-4-5`)
- `messages` - Standard chat message format
- `max_tokens` - Controls response length
- `temperature` - Controls randomness (0-1)
- `top_p` - Nucleus sampling parameter
- `stream` - Enables streaming responses
- `stop` - Custom stop sequences
- `tools` - Function calling support
- `tool_choice` - Control tool usage

#### Unsupported/Ignored Fields
- `strict` - Function calling strict mode (ignored)
- `audio` - Audio input not supported
- Some OpenAI-specific parameters may be ignored

### Response Fields

Responses follow the OpenAI format but may have some differences in specific fields or behaviors.

### Error Handling

Errors are formatted to match OpenAI SDK expectations where possible, though some Anthropic-specific error details may differ.

### Headers

Standard HTTP headers are supported. Authentication uses the `x-api-key` header with your Anthropic API key.

## Best Practices

1. **For Testing Only**: This compatibility layer is designed for quick testing and comparison, not for production use
2. **Use Native API**: For production applications, use the native Anthropic API to access all features including prompt caching
3. **Prompt Optimization**: Prompts optimized for OpenAI may need adjustment for Claude. Use the Claude Console's prompt improver
4. **Feature Limitations**: Be aware that not all OpenAI features are supported through this compatibility layer

## Migration to Native API

For production use or to access advanced features like prompt caching, consider migrating to the native Anthropic API:

```python
import anthropic

client = anthropic.Anthropic(
    api_key="ANTHROPIC_API_KEY"
)

message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Who are you?"}
    ]
)

print(message.content)
```

## Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Claude Console](https://console.anthropic.com/)
- [Model Comparison Guide](https://docs.anthropic.com/en/docs/models-overview)

---

**Source:** https://docs.claude.com/en/api/openai-sdk