# Spec Delta: Advanced Print Layout

**Capability**: `advanced-print-layout`

## ADDED Requirements

### Requirement: Content Fragmentation Control
The system MUST prevent content blocks (images, quizzes, quotes) from breaking across pages unless they exceed a full page height.

#### Scenario: Printing a Quiz
- **Given** a quiz block exists on the page
- **When** the content ispaginated
- **Then** the entire quiz block should appear on a single page, moving to the next page if it doesn't fit on the current one.

### Requirement: Paged Preview
The print view MUST render a paginated preview in the browser that visualizes exactly how the PDF will look.

#### Scenario: Viewing Print Page
- **Given** the user navigates to the print view
- **Then** they should see discrete pages (A4 size) on screen.
