# Design: Paged.js Integration

## Architecture
- **Library**: `pagedjs` (Client-side fragmentation)
- **Component**: `PrintPage` should wrap the content in a Paged.js "Previewer".

## CSS Changes
Paged.js uses standard CSS Paged Media specs but renders them utilizing DOM nodes.
- `@page` rules work effectively.
- Content flow is managed by Paged.js.

## Handling "Breaking" Content
- We must enforce `break-inside: avoid` on:
    - `.block-wrapper` (each content block)
    - `figure`
    - Tables
    - Quiz cards
- If a block is larger than a page, Paged.js handles splitting, but we should try to keep blocks atomic where possible.

## Export Considerations
The user mentioned "index.html vai ficar online".
- If the "Export" feature is meant to produce a simplified HTML file, we might NOT want to force Paged.js there unless they want the "book experience" offline.
- For now, we focus on the **Print UI** (`/print/...`).
