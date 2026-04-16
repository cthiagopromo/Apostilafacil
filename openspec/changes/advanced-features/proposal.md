## Why

This change aims to enhance the user experience for both handbook creators and students. 
- **Undo/Redo** solves the problem of accidental deletions or mistakes during editing.
- **Duplicate Module** streamlines the creation process by allowing reuse of existing layouts and structures.
- **Student Notes** increases engagement by allowing students to personalize their learning materials in the exported offline version.
- **Watermark** provides a visual layer of content protection and branding for creators.

## What Changes

- Integration of `zundo` middleware in the Zustand store for history management.
- New module/project duplication logic that ensures ID uniqueness.
- Enhanced export logic to inject a notes interface and persistence script within the generated HTML.
- New theme settings for watermark configuration (text, opacity, position) and its rendering in the exported HTML.

## Capabilities

### New Capabilities
- `undo-redo`: Provides the ability to undo and redo actions in the handbook editor.
- `duplicate-module`: Allows creators to clone an entire module (project) including all its blocks.
- `student-notes`: Enables a note-taking feature in the exported HTML handout, persisting data locally in the student's browser.
- `watermark`: Injects a customizable watermark into the exported handbook and printouts.

### Modified Capabilities
- none

## Impact

- **Store**: `src/lib/store.ts` will be wrapped with `zundo` and will have new actions.
- **Types**: `src/lib/types.ts` will include watermark settings in the `Theme` type.
- **Components**: New UI elements in `Header`, `LeftSidebar`, and `RightSidebar`.
- **Export**: `src/lib/export.ts` will be updated to include notes UI and watermark rendering.
