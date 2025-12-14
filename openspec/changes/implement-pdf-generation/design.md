# Design: PDF Generation Architecture

## Library: `@react-pdf/renderer`
Allows writing PDFs using React components. It renders to a blob/stream, not DOM.

## Component Handling
We need to map our existing HTML content to React-PDF primitives.
- **HTML Content**: Use `react-pdf-html` (if compatible) OR manually parse blocks.
    - *Decision*: Since our content is structured as `blocks` (type: text, image, quote), we should map these directly to React-PDF components rather than trying to parse raw HTML strings, which is error-prone in React-PDF.
    - *Text Blocks*: Might contain some HTML (bold, italic). We will strip tags or use a primitive parser if formatting is critical. *Assumption*: Basic text is acceptable for now.

## Styling
- React-PDF uses a subset of CSS via `StyleSheet.create`.
- We can't reuse `globals.css` directly. We must replicate the "theme" (colors, fonts) in the StyleSheet.
- Fonts: Must register fonts (Roboto Slab, Inter) with `Font.register()`.

## Layout
- Pagination is automatic in React-PDF.
- `break={true}` on `<Page>` or `<View>` handles page breaks.

## Workflow
1. User clicks "Print/Export".
2. App fetches data.
3. React-PDF generates the blob.
4. User sees the PDF in a viewer iframe OR it downloads automatically.
