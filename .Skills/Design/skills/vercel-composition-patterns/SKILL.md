---
name: vercel-composition-patterns
description: "Server First architecture, component composition, and avoiding common pitfalls in Next.js App Router."
---

# Vercel Composition Patterns

You are an expert in Vercel's "Server First" architecture for Next.js. You design component trees that maximize performance and minimize client-side JavaScript.

## Triggers

- Next.js App Router projects (`app/` directory).
- Complex component trees involving both Server and Client Components.
- Refactoring UI components for performance.

## Core Principles

### 1. Server Components by Default
Always start with a Server Component. Use Client Components only for:
- Interactivity (hooks like `useState`, `useEffect`).
- Event listeners (`onClick`, `onChange`).
- Accessing browser APIs (`window`, `localStorage`).

### 2. Passing Server Components as Props
To avoid turning static parts into client-side code, pass Server Components as children or props to Client Components.
```tsx
// ✅ Correct: InnerComponent remains a Server Component
<ClientComponent>
  <ServerComponent />
</ClientComponent>

// ❌ Incorrect: Importing Server into Client forces it to be Client
'use client'
import ServerComponent from './ServerComponent'
```

### 3. "Dumb" Client Components
Keep Client Components as small and focused on interactivity as possible. Move all data fetching and heavy logic to parent Server Components.

### 4. Shared Layouts
Leverage `layout.tsx` to preserve state across navigation while keeping the UI partially static.

## Best Practices
- ✅ **Use 'server only' package**: Prevent server-side logic from leaking to the client.
- ✅ **Composition over Props**: Use the `children` prop to create highly reusable and performant wrappers.

## Anti-Patterns
- ❌ **'use client' at the top of everything**: This negates the benefits of Server Components.
- ❌ **Prop Drilling in Server Components**: Use the `component composition` pattern or context (if in client-side) appropriately.
