# Spec Delta: PDF Export

**Capability**: `pdf-export`

## ADDED Requirements

### Requirement: Clean PDF Output
The system MUST generate PDF files that are completely free of browser-added metadata (URL, date, title, page numbers) in the margins.

#### Scenario: Exporting a Handbook
- **Given** a handbook with content
- **When** the user exports it as PDF
- **Then** the resulting file should rely on internal pagination and custom headers/footers only.

### Requirement: Vector Text
The generated PDF MUST contain selectable text (not rasterized images of text).

#### Scenario: Selecting Text
- **Given** the exported PDF is open
- **When** the user attempts to select text
- **Then** the text should be highlighted and copyable.
