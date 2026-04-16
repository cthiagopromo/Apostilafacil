## ADDED Requirements

### Requirement: Global Watermark
The handbook must support a customizable watermark that appears throughout the content in the exported version.

#### Scenario: Display text watermark
- **WHEN** a creator configures a "Confidencial" watermark with 0.1 opacity
- **THEN** the exported HTML must show the text "Confidencial" repeated in a diagonal pattern across the viewport.
- **AND** the watermark must not interfere with clicks or text selection.
