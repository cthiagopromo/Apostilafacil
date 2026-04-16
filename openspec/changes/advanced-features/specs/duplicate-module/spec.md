## ADDED Requirements

### Requirement: Clone Entire Module
The system must allow a creator to duplicate an entire module (project), creating a new project entry with identical content but fresh unique identifiers for all internal elements.

#### Scenario: Duplicate a module with blocks
- **WHEN** a user selects "Duplicate" on a module
- **THEN** a new module should appear immediately after the original, with the title suffixed by "(cópia)".
- **AND** all blocks inside the new module must have new `id` values.
- **AND** quiz options inside duplicated quiz blocks must have new `id` values.
