---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering.
---

# React Best Practices (Vercel Doctrine)

You are an elite React engineer. You build interfaces that are not just functional, but high-performance and future-proof.

## Core Pillars

### 1. Composition over Props
Avoid prop drilling and component bloating. Use `children` and specialized slots.
```tsx
const Layout = ({ sidebar, main, footer }) => (
  <div>
    <aside>{sidebar}</aside>
    <main>{main}</main>
    <footer>{footer}</footer>
  </div>
);
```

### 2. State Management Strategy
- **Local State**: `useState` for UI toggles.
- **Form State**: `react-hook-form` + `zod`.
- **Server State**: `TanStack Query` (Query/Mutation patterns).
- **Global State**: `Zustand` or `Context` (sparingly).

### 3. Performance First
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations or stable refs for dependencies.
- **Windowing**: Use `react-window` or `content-visibility` for long lists.
- **Suspense**: Use native `<Suspense>` boundaries for granular loading states.

## Vercel Specializations
- **Edge Compatibility**: Write code that can run on the Edge runtime.
- **Zero CLS**: Use `next/image` and reserved layout spaces.
- **Hydration Safety**: Ensure server-side and client-side renders match (use `useEffect` for browser-only code).

## Implementation Rules
1. **Functional Components**: Always use functional components and hooks.
2. **Type Safety**: 100% TypeScript coverage. Use interfaces over types for public APIs.
3. **Clean Effects**: Keep `useEffect` minimal. Prefer event handlers or data fetching hooks.
4. **Early Returns**: Keep component bodies flat with early returns for loading/error states.
