# Client SDKs

We provide client libraries in a number of popular languages that make it easier to work with the Claude API.

> **Note:** Additional configuration is needed to use Anthropic's Client SDKs through a partner platform. If you are using Amazon Bedrock, see the Amazon Bedrock guide; if you are using Google Cloud Vertex AI, see the Vertex AI guide.

## Supported Languages

- Python
- TypeScript
- Java
- Go
- C#
- Ruby
- PHP

Each language SDK provides similar core functionality for creating messages with Claude models.

## Python Example

```python
import anthropic

client = anthropic.Anthropic(api_key="my_api_key")
message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude"}
    ]
)
print(message.content)
```

## TypeScript Example

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: 'my_api_key',
});

const msg = await anthropic.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, Claude" }],
});
```

## Beta Namespace

Every SDK includes a `beta` namespace for new features, used with beta headers:

```python
message = client.beta.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude"}],
    betas=["beta-feature-name"]
)
```

## Model Support

The SDKs provide comprehensive model string examples for each supported language, covering:
- Claude 4 models
- Claude 3.7 models
- Claude 3.5 models
- Claude 3 models