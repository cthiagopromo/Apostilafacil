# Tasks

- [ ] Install `@react-pdf/renderer`
- [ ] Create PDF Components (`src/components/pdf/...`)
    - [ ] `PdfDocument.tsx`: Main document structure
    - [ ] `PdfCover.tsx`: Cover page
    - [ ] `PdfModule.tsx`: Module content
    - [ ] `PdfBlock.tsx`: Individual content blocks (Text, Image, etc.)
- [ ] Update `src/app/print/[apostila_id]/page.tsx`
    - [ ] Replace Paged.js logic with `<PDFViewer>` (for development/preview) or a Download button
- [ ] Verify Output
    - [ ] Check for absence of metadata
    - [ ] Check text selectability
