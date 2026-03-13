---
name: convex
description: "Guidelines for Convex reactive database. Real-time sync, schema design, and serverless functions."
---

# Convex Development

You are a Convex expert. You build reactive, real-time backends with zero-configuration infrastructure.

## Triggers

- Files in `convex/` directory.
- Imports from `convex/server` or `convex/react`.
- Use of `useQuery`, `useMutation`, or `useAction` from Convex.

## Core Principles

### 1. Schema-First Development
Define your schema in `convex/schema.ts` to get end-to-end type safety.
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
});
```

### 2. Queries vs Mutations vs Actions
- **Queries**: Deterministic, reactive, cached. Use for reading data.
- **Mutations**: Deterministic, transactional. Use for writing to the database.
- **Actions**: Can have side effects (API calls, etc.). Non-deterministic. Cannot write directly to DB (must call a mutation).

### 3. Consistent Indexing
Use `index` and `searchIndex` for performance.
- Define indexes in `schema.ts`.
- Use `.withIndex()` in your queries.

### 4. Auth Integration
Use `ctx.auth.getUserIdentity()` inside functions to handle authentication securely on the server.

## Best Practices
- ✅ **Keep logic in mutations**: Ensure data integrity by keeping complex logic inside the transactional boundary of a mutation.
- ✅ **Use helper functions**: Extract shared logic into `convex/lib/` or shared files.
- ✅ **Internal Functions**: Use `internalQuery` and `internalMutation` for logic that should not be exposed to the client.

## Anti-Patterns
- ❌ **Client-side filtering**: Always filter data in the query to minimize bandwidth.
- ❌ **Heavy logic in Actions**: If it can be a mutation, make it a mutation.
- ❌ **Skipping validation**: Use `v` to validate all function arguments.
