# Design: Print Configuration & Watermarks

## Metadata Suppression
Browser headers and footers (URL, date, title, page numbers) are typically rendered in the page margins. By setting `@page { margin: 0; }`, we force the browser to treat the entire paper textable, which has the side effect of hiding these default headers/footers in most modern browsers (Chrome/Edge/Firefox).

**Trade-off**:
- Removing `@page` margins removes the "safe area" for content.
- **Solution**: We must manually apply `padding` to the content container (e.g., `body` or a wrapper div) inside `@media print` to ensure text doesn't run to the edge of the paper.

## Watermark Feasibility (Future Capability)
The user asked: *"futuramente também quero colocar marcar dagua nas páginas, é possível?"*

**Answer: Yes, it is possible.**

### Implementation Approaches
1.  **Fixed Position Element**:
    - CSS: `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; opacity: 0.1;`
    - Behavior: A fixed element repeats on *every printed page* in most browsers.
    - Content: Can be an SVG, text, or image.

2.  **Background Image**:
    - CSS: `body { background-image: url(...); }`
    - Limitation: Users often check "Background graphics" option in print dialog. If unchecked, it might not print. Fixed elements are more reliable for text watermarks.

### Recommendation
When the user decides to implement watermarks, we should use a **fixed position overlay** with `pointer-events: none` to ensure it repeats on all pages and doesn't interfere with content selection.
