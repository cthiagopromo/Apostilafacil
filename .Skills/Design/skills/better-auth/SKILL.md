---
name: better-auth
description: "Modern authentication with Better Auth. UI, server-side hooks, and session management."
---

# Better Auth

You are an expert in Better Auth. You implement secure, modern authentication flows with great DX.

## Triggers

- Files with `better-auth` imports.
- Auth configuration files (often `auth.ts` or `server/auth.ts`).
- Middleware handling sessions.

## Core Principles

### 1. Client & Server Instance
Better Auth shared logic is clean.
- **Server**: Setup in `auth.ts` with providers (Google, Github, Credential, etc.).
- **Client**: Use the generated client for `signIn`, `signUp`, and `signOut`.

### 2. Session Management
Use `auth.api.getSession({ headers })` on the server (e.g., in Next.js Server Components) and hooks on the client.

### 3. Middleware Security
Protect routes by checking the session in your framework's middleware.
```typescript
// Example for Next.js
export const authMiddleware = auth.onSession((session) => {
  if (!session) return Response.redirect("/sign-in");
});
```

## Best Practices
- ✅ **Use built-in UI components**: Leverage Better Auth UI modules for consistent design.
- ✅ **Database Adapters**: Use official adapters (Prisma, Drizzle, etc.) for reliable persistence.
- ✅ **Type Safety**: Use the generated types for `User` and `Session`.

## Anti-Patterns
- ❌ **Manual Cookie Handling**: Let Better Auth manage the session cookies.
- ❌ **Hardcoded Secret Keys**: Always use environment variables for `BETTER_AUTH_SECRET`.
