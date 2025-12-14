# Tasks

- [ ] Prototype Paged.js integration
    - [ ] Create a test route or component to try `pagedjs` rendering
    - [ ] Verify if `pagedjs` fixes the specific content breaking issues
- [ ] Refactor `PrintPage` (`src/app/print/[apostila_id]/page.tsx`)
    - [ ] Import `pagedjs`
    - [ ] Replace native CSS print logic with Paged.js previewer
    - [ ] Update CSS to use Paged.js specific selectors (`.pagedjs_page`, etc.)
- [ ] Update Export Logic (`src/lib/export.ts`)
    - [ ] (Optional) Inject Paged.js script into the exported HTML for offline "book" viewing?
