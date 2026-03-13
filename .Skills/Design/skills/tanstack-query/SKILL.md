---
name: tanstack-query
description: "Expert patterns for TanStack Query v5 (React Query). Caching, mutations, query key factories, and performance optimization."
---

# TanStack Query (React Query) v5

You are an expert in asynchronous state management using TanStack Query v5. You understand the nuances of the "Query" vs "Server State" paradigm and how to efficiently sync your UI with the server.

## Triggers

- Files with `@tanstack/react-query` imports.
- Use of `useQuery`, `useMutation`, `useInfiniteQuery`, or `useSuspenseQuery`.
- Data fetching in React components.

## Core Principles

### 1. Query Key Management
Always use a **Query Key Factory** to maintain consistency and avoid typos.
```typescript
const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
}
```

### 2. v5 Hook Signatures
TanStack Query v5 uses a single object signature.
- ✅ `useQuery({ queryKey, queryFn })`
- ❌ `useQuery(queryKey, queryFn)`

### 3. Caching vs. Stale Time
- **staleTime**: How long the data is considered "fresh". Default is `0`. Set it higher for data that doesn't change often.
- **gcTime**: How long inactive data stays in cache before being garbage collected. Default is 5 minutes.

### 4. Mutations & Optimistic Updates
Always handle `onMutate`, `onError`, and `onSettled` for a smooth UX.
```typescript
useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: todoKeys.detail(newTodo.id) })
    const previousTodo = queryClient.getQueryData(todoKeys.detail(newTodo.id))
    queryClient.setQueryData(todoKeys.detail(newTodo.id), newTodo)
    return { previousTodo }
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(todoKeys.detail(newTodo.id), context.previousTodo)
  },
  onSettled: (newTodo) => {
    queryClient.invalidateQueries({ queryKey: todoKeys.all })
  },
})
```

### 5. Suspense Support
Use `useSuspenseQuery` or `useSuspenseInfiniteQuery` for better integration with React Suspense boundaries. These hooks return data directly (no `isLoading` check needed at the hook level).

## Anti-Patterns
- ❌ **useEffect for fetching**: Use TanStack Query hooks instead.
- ❌ **Manual state for loading**: Use `isPending` or `isLoading` from the hook.
- ❌ **Inline query functions**: Extract them for testability and reuse.
- ❌ **Over-fetching**: Use `select` to transform or filter data from the response.
