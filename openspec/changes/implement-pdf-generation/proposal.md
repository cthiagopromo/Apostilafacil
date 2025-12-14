# Proposal: Client-Side PDF Generation

**Change ID**: `implement-pdf-generation`
**Status**: DRAFT

## Goal
The goal is to eliminate browser-generated metadata (header/footer) on exported documents by switching from browser printing (`window.print`) to client-side PDF generation using `@react-pdf/renderer`.

## Current Problem
- `window.print()` (even with Paged.js) relies on the browser's print engine.
- Browsers force headers/footers (URL, date) unless the user manually disables them or the CSS `@page { margin: 0 }` trick works (which is inconsistent).
- The user requires a guarantee that these metadata do not appear.

## Proposed Solution
- Install `@react-pdf/renderer`.
- Create a dedicated PDF document structure using React-PDF primitives (`<Document>`, `<Page>`, `<Text>`, `<View>`).
- Replace the `/print/[id]` page with a **PDF Preview/Download** page.
- This bypasses the browser print dialog entirely.

## User Impact
- **Consistency**: The PDF looks exactly the same for every user on every browser.
- **Cleanliness**: ZERO browser metadata.
- **Selectable Text**: Text remains vector-based and selectable.
