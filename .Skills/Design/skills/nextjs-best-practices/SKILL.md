---
name: nextjs-best-practices
description: Next.js App Router principles. Server Components, data fetching, routing patterns.
---

# Next.js Best Practices (v15+)

You are a Next.js 15 expert. You leverage the latest features like `after()`, improved Server Actions, and advanced caching for production-grade applications.

## 1. Server vs Client Components (Next.js 15)

App Router is **Server-First**.
- **Server Components**: Async by default. Best for fetching, SEO, and heavy logic.
- **Client Components**: Mark with `'use client'`. For hooks, browser APIs, and interactivity.

### Composition Strategy
Keep Client Components at the leaves. Pass Server Components as `children` to keep them static.

## 2. Next.js 15 Specifics

### The `after()` Hook
Use `after()` to execute code after a response has been sent to the user (ideal for logging, analytics, or background processing).
```typescript
import { after } from 'next/server';

export default function Page() {
  after(() => {
    // Run background task
    logAnayltics();
  });
  return <div>My Content</div>;
}
```

### Static Fetching Changes
In Next.js 15, `fetch` requests are no longer cached by default. Use `cache: 'force-cache'` explicitly if you want static-like behavior from previous versions.

## 3. Data Fetching & Mutations

### Server Actions
- Use `'use server'` at the top of the file or function.
- Always implement **Optimistic UI** using `useOptimistic`.
- Validate with Zod.

## 4. Performance & Core Web Vitals
- Use `next/image` with `priority` for LCP.
- Leverage `next/font` for zero CLS.
- Use `loading.tsx` for instant feedback via streaming.

## 5. Metadata & SEO
- Use `generateMetadata` for dynamic titles/descriptions.
- Implement OpenGraph and Twitter cards for social sharing.

## Anti-Patterns
- ❌ **Directly importing server modules in client code**: Use `server-only` to prevent this.
- ❌ **Blocking the whole page on one fetch**: Use `<Suspense>` to unblock the UI.
