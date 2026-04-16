## 1. Infrastructure (Undo/Redo)

- [x] 1.1 Install dependencies: `npm install zundo`
- [x] 1.2 Update `src/lib/store.ts` to wrap store with `temporal` middleware from `zundo`.
- [x] 1.3 Configure `temporal` to exclude UI-only fields (`isDirty`, `isInitialized`, `activeProjectId`, `activeBlockId`).
- [x] 1.4 Create `UndoRedoControls` component with buttons and keyboard shortcut listeners (Ctrl+Z / Ctrl+Y).
- [x] 1.5 Integrate `UndoRedoControls` into the editor `Header`.

## 2. Editor Features (Duplicate Module)

- [x] 2.1 Add `duplicateProject` action to `src/lib/store.ts`.
- [x] 2.2 Implement recursive ID regeneration for blocks and quiz options during duplication.
- [x] 2.3 Add "Duplicar" option to the project menu in `src/components/LeftSidebar.tsx` (or wherever module actions are).

## 3. Types and Settings

- [x] 3.1 Update `Theme` type in `src/lib/types.ts` to include `watermark?: WatermarkSettings`.
- [x] 3.2 Define `WatermarkSettings` interface (text, opacity, position, font size, etc.).
- [x] 3.3 Update `initialHandbookData` in `src/lib/initial-data.ts` with default watermark settings.
- [x] 3.4 Add watermark configuration controls to `src/components/RightSidebar.tsx` (under Theme tab).

## 4. Export logic

- [x] 4.1 Update `getOptimizedCss` in `src/lib/export.ts` to include `.watermark` styles.
- [x] 4.2 Update `generatePrintHtml` to inject the watermark `div` if enabled.
- [x] 4.3 Implement student notes UI (sidebar or modal) in `generatePrintHtml`.
- [x] 4.4 Update `getInteractiveScript` in `src/lib/export.ts` to handle note persistence (`localStorage`), module-specific indexing, and "Export to TXT" functionality.
