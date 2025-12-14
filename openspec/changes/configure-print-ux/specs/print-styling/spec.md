# Spec Delta: Print Styling

**Capability**: `print-styling`

## MODIFIED Requirements

### Requirement: Print Metadata Suppression
The application MUST suppress browser-generated headers and footers when printing.

#### Scenario: Printing Index Page
- **Given** the user is viewing the index page (or any printable page)
- **When** they initiate a print action (Ctrl+P)
- **Then** the print preview should NOT show the page URL, date, or title in the header/footer areas.
- **And** the content should still have appropriate margins (simulated via padding) so it does not touch the paper edge.
