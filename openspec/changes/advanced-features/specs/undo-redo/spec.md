## ADDED Requirements

### Requirement: Global Undo/Redo
The editor must support undoing and redoing actions that modify the handbook state, except for UI-only state like the currently active project or focus.

#### Scenario: Undo a block deletion
- **WHEN** a block is deleted and the user clicks "Undo" (or presses Ctrl+Z)
- **THEN** the deleted block must reappear in its original position.

#### Scenario: Redo a block deletion
- **WHEN** a block deletion is undone and the user clicks "Redo" (or presses Ctrl+Y)
- **THEN** the block must be deleted again.
