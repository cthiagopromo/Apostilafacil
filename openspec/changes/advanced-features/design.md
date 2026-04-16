## Context

The current system is a React/Next.js application using Zustand for state management. Handbooks are composed of "Projects" (modules) which contain "Blocks". Exporting generates a single-file HTML version.

## Goals / Non-Goals

**Goals:**
- Implement reliable Undo/Redo for editor actions.
- Allow cloning modules with all content preserved but IDs regenerated.
- Enable student notes in the exported HTML with local persistence.
- Add customizable branding/protection via watermarks.

**Non-Goals:**
- Syncing student notes across devices (offline only).
- Multi-user collaboration in the editor.
- Advanced watermark protection (e.g., against element removal).

## Decisions

- **Undo/Redo (zundo)**: Wrap the Zustand store with `zundo`. Exclude `isDirty`, `isInitialized`, and `activeProjectId` from the history to prevent UI state from cluttering the undo stack.
- **Project Duplication**: Implement a `duplicateProject` action that deep clones a project and updates IDs of the project itself, its blocks, and quiz options using `getUniqueId`.
- **Student Notes**: 
    - Inject a JSON-like structure or `localStorage` keys for storage.
    - Add a "Notes" sidebar to the exported HTML.
    - Use `localStorage.getItem('notes_' + handbookId + '_' + moduleId)` for persistence.
- **Watermark**:
    - Add `watermark` settings to `Theme` (text, size, opacity, color, position).
    - Render a fixed-position `div` in the exported HTML with `z-index: 100` but `pointer-events: none`.

## Risks / Trade-offs

- **Memory Usage**: `zundo` stores snapshots. For very large handbooks (lots of base64 images), this could increase memory usage. We'll limit the stack size to 50.
- **ID Collisions**: Regeneration must be thorough. If an ID is missed, duplicate keys in React or logic errors in quizzes might occur.
- **Exported Script Size**: Injecting more JS into the exported HTML increases file size slightly, though we minify it.
