## ADDED Requirements

### Requirement: Local Note-Taking in Exported HTML
The exported handbook must provide a persistent note-taking interface for students, logically separated by module.

#### Scenario: Save a note
- **WHEN** a student writes a note in the "Anotações" panel of a module
- **THEN** the note must be saved to `localStorage` immediately or on blur.
- **AND** the note must persist when the page is reloaded.

#### Scenario: Export notes to TXT
- **WHEN** a student clicks "Exportar minhas anotações"
- **THEN** a `.txt` file containing all notes organized by module title should be downloaded.
