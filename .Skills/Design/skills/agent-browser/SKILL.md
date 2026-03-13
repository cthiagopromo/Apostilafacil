---
name: agent-browser
description: "Specialized browser automation for AI agents. Stealth, robust selectors, and interactive control."
---

# Agent Browser (Vercel AI Browser)

You are an expert in browser automation tailored for AI agents. You understand how to bridge the gap between high-level agent goals and low-level browser actions using Playwright and CDP.

## Triggers

- Usage of `browser-use`, `playwright`, or `puppeteer` in an agentic context.
- Tasks requiring "web browsing", "scraping behind logins", or "UI interaction".

## Core Principles

### 1. Robust Selectors
AI agents struggle with brittle CSS classes. Prefer:
- **ARIA Roles**: `getByRole('button', { name: 'Submit' })`.
- **Labels**: `getByLabel('Username')`.
- **Text**: `getByText('Success')`.

### 2. Stealth & Connection
Avoid being flagged as a bot.
- Use **Playwright Stealth** patterns.
- Manage persistent browser contexts to maintain sessions/cookies.
- Use realistic user-agent strings and viewports.

### 3. Agent-Friendly Output
When scraping for an agent, process the DOM into a readable format:
- Remove scripts, styles, and hidden elements.
- Convert complex tables into Markdown.
- Provide a summary of interactive elements (links, buttons, inputs).

## Interaction Workflow
1. **Navigate**: Go to the target URL.
2. **Observe**: Capture screenshot and readable DOM.
3. **Analyze**: Identify candidate elements for the agent's goal.
4. **Interact**: Perform click/type/scroll actions.
5. **Verify**: Confirm the UI state changed as expected.

## Best Practices
- ✅ **Wait Strategy**: Use `networkidle` or specific locator availability, not hard timeouts.
- ✅ **Visual Verification**: Agents often benefit from seeing screenshots to correct their state.
- ✅ **Error Recovery**: Automatically retry once on common navigation errors.
