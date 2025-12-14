# Proposal: Improve Print Layout (Paged.js)

**Change ID**: `improve-print-layout`
**Status**: DRAFT

## Goal
The goal is to fix content breaking issues and improve print reliability by integrating **Paged.js**. The user reports content breaking across pages using the current native browser print method.

## Current State vs. Proposed Solution
- **Current**: Native `window.print()` with CSS `@media print`.
    - *Pros*: Simple, native.
    - *Cons*: Inconsistent application of `page-break` properties across browsers. No control over headers/footers per page (beyond crude margins). Elements often split awkwardly.
- **Proposed**: Use `pagedjs` (already in `package.json` but unused) to render the content.
    - *How it works*: Paged.js fragments the DOM into "pages" visually within the browser before printing.
    - *Benefits*:
        - Accurate content splitting (respects `break-inside: avoid` better).
        - Custom headers/footers per page (e.g., Chapter titles).
        - Table of Contents generation support.
        - WYSWYG print preview in the browser window.

## User Impact
- **Printing**: Users will see a "book view" in the browser that matches the PDF output exactly.
- **Reliability**: Images and text blocks will no longer break in the middle of a page (where configured).

## Questions for User
- Do you want to enable the Paged.js "preview" mode where users scroll through pages horizontally/vertically on screen, or only activate it when clicking "Print"?
