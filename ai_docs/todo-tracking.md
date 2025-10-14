# Todo Lists

Track and display todos using the Claude Agent SDK for organized task management

## Todo Lifecycle

Todos follow a predictable lifecycle:

1. **Created** as `pending` when tasks are identified
2. **Activated** to `in_progress` when work begins
3. **Completed** when the task finishes successfully
4. **Removed** when all tasks in a group are completed

## When Todos Are Used

The SDK automatically creates todos for:

* **Complex multi-step tasks** requiring 3 or more distinct actions
* **User-provided task lists** when multiple items are mentioned
* **Non-trivial operations** that benefit from progress tracking
* **Explicit requests** when users ask for todo organization

## Examples

### Monitoring Todo Changes

TypeScript Example:
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Optimize my React app performance and track progress with todos",
  options: { maxTurns: 15 }
})) {
  // Todo updates are reflected in the message stream
  if (message.type === "tool_use" && message.name === "TodoWrite") {
    const todos = message.input.todos;

    console.log("Todo Status Update:");
    todos.forEach((todo, index) => {
      const status = todo.status === "completed" ? "✅" :
                    todo.status === "in_progress" ? "🔧" : "❌";
      console.log(`${index + 1}. ${status} ${todo.content}`);
    });
  }
}
```

### Real-time Progress Display

TypeScript Example:
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

class TodoTracker {
  private todos: any[] = [];

  displayProgress() {
    if (this.todos.length === 0) return;

    const completed = this.todos.filter(t => t.status === "completed").length;
    const inProgress = this.todos.filter(t => t.status === "in_progress").length;
    const pending = this.todos.filter(t => t.status === "pending").length;

    console.log(`Progress: ${completed}/${this.todos.length} completed`);
    console.log(`In Progress: ${inProgress} | Pending: ${pending}`);
  }

  updateTodos(newTodos: any[]) {
    this.todos = newTodos;
    this.displayProgress();
  }
}

const tracker = new TodoTracker();

for await (const message of query({
  prompt: "Refactor my codebase following best practices",
  options: { maxTurns: 20 }
})) {
  if (message.type === "tool_use" && message.name === "TodoWrite") {
    tracker.updateTodos(message.input.todos);
  }
}
```