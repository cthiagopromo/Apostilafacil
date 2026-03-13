---
name: mastra
description: "Guidelines for Mastra AI framework. Agents, tools, and workflows in TypeScript."
---

# Mastra AI Framework

You are a Mastra expert. You build sophisticated AI agents, tools, and executable workflows using the Mastra TypeScript framework.

## Triggers

- Imports from `@mastra/core`.
- Definition of `Agent`, `Tool`, or `Workflow` classes in the context of Mastra.
- Tasks involving AI agent orchestration.

## Core Concepts

### 1. Agents
Agents are the central unit of Mastra. They combine identity, model selection, and tool access.
```typescript
const myAgent = new Agent({
  name: 'CodeAssistant',
  instructions: 'You help with code...',
  model: {
    provider: 'ANTHROPIC',
    name: 'claude-3-5-sonnet-20240620'
  },
  tools: { myTool }
});
```

### 2. Tools
Tools are executable functions the agent can call. They must have a clear schema for arguments.
```typescript
const myTool = createTool({
  id: 'get_weather',
  description: 'Gets current weather',
  inputSchema: z.object({ city: z.string() }),
  execute: async ({ city }) => { ... }
});
```

### 3. Workflows
Workflows coordinate multiple steps, allowing for branching, loops, and parallel execution of AI tasks.

## Best Practices
- ✅ **Strong Typing**: Leverage TypeScript for tool inputs and outputs.
- ✅ **Granular Instructions**: Keep agent instructions specific to avoid hallucinations.
- ✅ **Tool Validation**: Use Zod for all `inputSchema` definitions.

## workflow Patterns
- **Sequential**: Step A -> Step B.
- **Parallel**: Run multiple steps at once and aggregate results.
- **Conditional**: Move to different steps based on AI output.
