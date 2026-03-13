---
name: ui-ux-pro-max
description: "UI/UX design intelligence v2.0 with AI-powered Design System Generator. 67 styles, 96 color palettes, 57 font pairings, 25 chart types, 100 industry-specific reasoning rules, 13 tech stacks. Auto-generates complete design systems with pattern recommendations, color moods, typography, effects, and anti-patterns. Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, mobile app, .html, .tsx, .vue, .svelte. Elements: button, modal, navbar, sidebar, card, table, form, chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, flat design. Topics: color palette, accessibility, animation, layout, typography, font pairing, spacing, hover, shadow, gradient. Integrations: shadcn/ui MCP for component search and examples."
---

# UI/UX Pro Max - Design Intelligence v2.0

Comprehensive design guide for web, mobile, and **desktop** applications. Contains 67 styles, 96 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 13 technology stacks (including **PySide6/Qt**). Searchable database with priority-based recommendations and **AI-powered Design System Generator**.

## What's New in v2.0

### Intelligent Design System Generation

The flagship feature of v2.0 is the **Design System Generator** - an AI-powered reasoning engine that analyzes your project requirements and generates a complete, tailored design system in seconds.

**How it works:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER REQUEST                                                  │
│    "Build a landing page for my beauty spa"                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. MULTI-DOMAIN SEARCH (5 parallel searches)                    │
│    • Product type matching (100 categories)                      │
│    • Style recommendations (67 styles)                           │
│    • Color palette selection (96 palettes)                       │
│    • Landing page patterns (24 patterns)                         │
│    • Typography pairing (57 font combinations)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. REASONING ENGINE                                              │
│    • Match product → UI category rules                           │
│    • Apply style priorities (BM25 ranking)                       │
│    • Filter anti-patterns for industry                           │
│    • Process decision rules (JSON conditions)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. COMPLETE DESIGN SYSTEM OUTPUT                                │
│    Pattern + Style + Colors + Typography + Effects              │
│    + Anti-patterns to avoid + Pre-delivery checklist            │
└─────────────────────────────────────────────────────────────────┘
```

**100 Industry-Specific Reasoning Rules** covering:
- SaaS (General, Micro, Enterprise, B2B)
- E-commerce (General, Luxury)
- Healthcare, Fintech, Banking, Insurance
- Education, Gaming, Entertainment
- Beauty/Spa/Wellness, Food/Restaurant
- Real Estate, Travel, Logistics
- And 80+ more specialized categories

Each rule includes:
- **Recommended Pattern** - Landing page structure optimized for industry
- **Style Priority** - Best matching UI styles (e.g., "Glassmorphism + Flat Design")
- **Color Mood** - Industry-appropriate palettes (e.g., "Trust blue + Accent contrast")
- **Typography Mood** - Font personality matching (e.g., "Professional + Hierarchy")
- **Key Effects** - Animations and interactions (e.g., "Subtle hover 200-250ms")
- **Decision Rules** - JSON conditions for dynamic recommendations
- **Anti-Patterns** - What NOT to do (e.g., "AI purple/pink gradients" for banking)
- **Severity** - Impact level (HIGH, MEDIUM, LOW)

## When to Apply

Reference these guidelines when:

- Designing new UI components or pages
- Choosing color palettes and typography
- Reviewing code for UX issues
- Building landing pages or dashboards
- Implementing accessibility requirements

## Rule Categories by Priority

| Priority | Category            | Impact   | Domain                |
| -------- | ------------------- | -------- | --------------------- |
| 1        | Accessibility       | CRITICAL | `ux`                  |
| 2        | Touch & Interaction | CRITICAL | `ux`                  |
| 3        | Performance         | HIGH     | `ux`                  |
| 4        | Layout & Responsive | HIGH     | `ux`                  |
| 5        | Typography & Color  | MEDIUM   | `typography`, `color` |
| 6        | Animation           | MEDIUM   | `ux`                  |
| 7        | Style Selection     | MEDIUM   | `style`, `product`    |
| 8        | Charts & Data       | LOW      | `chart`               |

## Quick Reference

### 1. Accessibility (CRITICAL)

- `color-contrast` - Minimum 4.5:1 ratio for normal text
- `focus-states` - Visible focus rings on interactive elements
- `alt-text` - Descriptive alt text for meaningful images
- `aria-labels` - aria-label for icon-only buttons
- `keyboard-nav` - Tab order matches visual order
- `form-labels` - Use label with for attribute

### 2. Touch & Interaction (CRITICAL)

- `touch-target-size` - Minimum 44x44px touch targets
- `hover-vs-tap` - Use click/tap for primary interactions
- `loading-buttons` - Disable button during async operations
- `error-feedback` - Clear error messages near problem
- `cursor-pointer` - Add cursor-pointer to clickable elements

### 3. Performance (HIGH)

- `image-optimization` - Use WebP, srcset, lazy loading
- `reduced-motion` - Check prefers-reduced-motion
- `content-jumping` - Reserve space for async content

### 4. Layout & Responsive (HIGH)

- `viewport-meta` - width=device-width initial-scale=1
- `readable-font-size` - Minimum 16px body text on mobile
- `horizontal-scroll` - Ensure content fits viewport width
- `z-index-management` - Define z-index scale (10, 20, 30, 50)

### 5. Typography & Color (MEDIUM)

- `line-height` - Use 1.5-1.75 for body text
- `line-length` - Limit to 65-75 characters per line
- `font-pairing` - Match heading/body font personalities

### 6. Animation (MEDIUM)

- `duration-timing` - Use 150-300ms for micro-interactions
- `transform-performance` - Use transform/opacity, not width/height
- `loading-states` - Skeleton screens or spinners

### 7. Style Selection (MEDIUM)

- `style-match` - Match style to product type
- `consistency` - Use same style across all pages
- `no-emoji-icons` - Use SVG icons, not emojis

### 8. Charts & Data (LOW)

- `chart-type` - Match chart type to data type
- `color-guidance` - Use accessible color palettes
- `data-table` - Provide table alternative for accessibility

## How to Use

Search specific domains using the CLI tool below.

---

## Prerequisites

Check if Python is installed:

```bash
python3 --version || python --version
```

If Python is not installed, install it based on user's OS:

**macOS:**

```bash
brew install python3
```

**Ubuntu/Debian:**

```bash
sudo apt update && sudo apt install python3
```

**Windows:**

```powershell
winget install Python.Python.3.12
```

---

## How to Use This Skill

When user requests UI/UX work (design, build, create, implement, review, fix, improve), follow this workflow:

### Step 1: Analyze User Requirements

Extract key information from user request:

- **Product type**: SaaS, e-commerce, portfolio, dashboard, landing page, etc.
- **Style keywords**: minimal, playful, professional, elegant, dark mode, etc.
- **Industry**: healthcare, fintech, gaming, education, etc.
- **Stack**: React, Vue, Next.js, or default to `html-tailwind`

### Step 2: Generate Design System (⚡ REQUIRED - DO THIS FIRST ⚡)

**CRITICAL: Always start with `--design-system`** to get the AI-powered reasoning engine recommendations:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

**Why this is required:**

1. **Searches 5 domains in parallel** (product, style, color, landing, typography)
2. **Applies 100 industry-specific reasoning rules** from `ui-reasoning.csv`
3. **Returns complete design system**: pattern, style, colors, typography, effects
4. **Includes anti-patterns to avoid** (e.g., "AI purple/pink gradients" for banking)
5. **Pre-delivery checklist** for professional quality

**Example:**

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

**Output format:** ASCII box (default) or Markdown (`-f markdown`)

### Step 3: Supplement with Detailed Searches (as needed)

After getting the design system, use domain searches for additional details:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**When to use detailed searches:**

| Need                  | Domain       | Example                                 |
| --------------------- | ------------ | --------------------------------------- |
| More style options    | `style`      | `--domain style "glassmorphism dark"`   |
| Chart recommendations | `chart`      | `--domain chart "real-time dashboard"`  |
| UX best practices     | `ux`         | `--domain ux "animation accessibility"` |
| Alternative fonts     | `typography` | `--domain typography "elegant luxury"`  |
| Landing structure     | `landing`    | `--domain landing "hero social-proof"`  |

### Step 4: Stack Guidelines (Default: html-tailwind)

Get implementation-specific best practices. If user doesn't specify a stack, **default to `html-tailwind`**.

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack html-tailwind
```

Available stacks: `html-tailwind`, `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`

---

## Search Reference

### Available Domains

| Domain       | Use For                              | Example Keywords                                         |
| ------------ | ------------------------------------ | -------------------------------------------------------- |
| `product`    | Product type recommendations         | SaaS, e-commerce, portfolio, healthcare, beauty, service |
| `style`      | UI styles, colors, effects           | glassmorphism, minimalism, dark mode, brutalism          |
| `typography` | Font pairings, Google Fonts          | elegant, playful, professional, modern                   |
| `color`      | Color palettes by product type       | saas, ecommerce, healthcare, beauty, fintech, service    |
| `landing`    | Page structure, CTA strategies       | hero, hero-centric, testimonial, pricing, social-proof   |
| `chart`      | Chart types, library recommendations | trend, comparison, timeline, funnel, pie                 |
| `ux`         | Best practices, anti-patterns        | animation, accessibility, z-index, loading               |
| `react`      | React/Next.js performance            | waterfall, bundle, suspense, memo, rerender, cache       |
| `web`        | Web interface guidelines             | aria, focus, keyboard, semantic, virtualize              |
| `web`        | Web interface guidelines             | aria, focus, keyboard, semantic, virtualize              |
| `prompt`     | AI prompts, CSS keywords             | (style name)                                             |
| `templates`  | FREE High-quality Templates          | `site:htmlrev.com <stack> <category>`                    |

### Available Stacks

| Stack           | Focus                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| `html-tailwind` | Tailwind utilities, responsive, a11y (DEFAULT)                                                             |
| `react`         | State, hooks, performance, patterns                                                                        |
| `nextjs`        | SSR, routing, images, API routes                                                                           |
| `vue`           | Composition API, Pinia, Vue Router                                                                         |
| `svelte`        | Runes, stores, SvelteKit                                                                                   |
| `swiftui`       | Views, State, Navigation, Animation                                                                        |
| `react-native`  | Components, Navigation, Lists                                                                              |
| `flutter`       | Widgets, State, Layout, Theming                                                                            |
| `shadcn`        | shadcn/ui components, theming, forms, patterns                                                             |
| `desktop-qt`    | **PySide6/PyQt6**: QSS styling, Glassmorphism, Signals/Slots, resource systems (`.rcc`), custom title bars |

---

## Example Workflow

**User request:** "Làm landing page cho dịch vụ chăm sóc da chuyên nghiệp"

### Step 1: Analyze Requirements

- Product type: Beauty/Spa service
- Style keywords: elegant, professional, soft
- Industry: Beauty/Wellness
- Stack: html-tailwind (default)

### Step 2: Generate Design System (REQUIRED)

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service elegant" --design-system -p "Serenity Spa"
```

**Output:** Complete design system with pattern, style, colors, typography, effects, and anti-patterns.

### Step 3: Supplement with Detailed Searches (as needed)

```bash
# Get UX guidelines for animation and accessibility
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux

# Get alternative typography options if needed
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "elegant luxury serif" --domain typography
```

### Step 4: Stack Guidelines

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "layout responsive form" --stack html-tailwind
```

**Then:** Synthesize design system + detailed searches and implement the design.

---

## Output Formats

The `--design-system` flag supports two output formats:

```bash
# ASCII box (default) - best for terminal display
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system

# Markdown - best for documentation
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system -f markdown
```

---

## Design System Persistence (Advanced)

### Master + Overrides Pattern

Save your design system to files for hierarchical retrieval across sessions:

```bash
# Generate and persist to design-system/MASTER.md
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --design-system --persist -p "MyApp"

# Also create a page-specific override file
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "checkout payment" --design-system --persist -p "MyApp" --page "checkout"
```

This creates a `design-system/` folder structure:

```
design-system/
├── MASTER.md              # Global Source of Truth (colors, typography, spacing, components)
└── pages/
    └── checkout.md        # Page-specific overrides (only deviations from Master)
```

**How hierarchical retrieval works:**

1. When building a specific page (e.g., "Checkout"), first check `design-system/pages/checkout.md`
2. If the page file exists, its rules **override** the Master file
3. If not, use `design-system/MASTER.md` exclusively

**Context-aware retrieval prompt:**

```
I am building the [Page Name] page.
Please read design-system/MASTER.md.
Also check if design-system/pages/[page-name].md exists.
If the page file exists, prioritize its rules. If not, use the Master rules exclusively.
Now, generate the code...
```

---

## Tips for Better Results

1. **Be specific with keywords** - "healthcare SaaS dashboard" > "app"
2. **Search multiple times** - Different keywords reveal different insights
3. **Combine domains** - Style + Typography + Color = Complete design system
4. **Always check UX** - Search "animation", "z-index", "accessibility" for common issues
5. **Use stack flag** - Get implementation-specific best practices
6. **Iterate** - If first search doesn't match, try different keywords

---

## Common Rules for Professional UI

These are frequently overlooked issues that make UI look unprofessional:

### Icons & Visual Elements

| Rule                       | Do                                              | Don't                                  |
| -------------------------- | ----------------------------------------------- | -------------------------------------- |
| **No emoji icons**         | Use SVG icons (Heroicons, Lucide, Simple Icons) | Use emojis like 🎨 🚀 ⚙️ as UI icons   |
| **Stable hover states**    | Use color/opacity transitions on hover          | Use scale transforms that shift layout |
| **Correct brand logos**    | Research official SVG from Simple Icons         | Guess or use incorrect logo paths      |
| **Consistent icon sizing** | Use fixed viewBox (24x24) with w-6 h-6          | Mix different icon sizes randomly      |

### Interaction & Cursor

| Rule                   | Do                                                    | Don't                                        |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------- |
| **Cursor pointer**     | Add `cursor-pointer` to all clickable/hoverable cards | Leave default cursor on interactive elements |
| **Hover feedback**     | Provide visual feedback (color, shadow, border)       | No indication element is interactive         |
| **Smooth transitions** | Use `transition-colors duration-200`                  | Instant state changes or too slow (>500ms)   |

### Light/Dark Mode Contrast

| Rule                      | Do                                  | Don't                                   |
| ------------------------- | ----------------------------------- | --------------------------------------- |
| **Glass card light mode** | Use `bg-white/80` or higher opacity | Use `bg-white/10` (too transparent)     |
| **Text contrast light**   | Use `#0F172A` (slate-900) for text  | Use `#94A3B8` (slate-400) for body text |
| **Muted text light**      | Use `#475569` (slate-600) minimum   | Use gray-400 or lighter                 |
| **Border visibility**     | Use `border-gray-200` in light mode | Use `border-white/10` (invisible)       |

### Layout & Spacing

| Rule                     | Do                                  | Don't                                  |
| ------------------------ | ----------------------------------- | -------------------------------------- |
| **Floating navbar**      | Add `top-4 left-4 right-4` spacing  | Stick navbar to `top-0 left-0 right-0` |
| **Content padding**      | Account for fixed navbar height     | Let content hide behind fixed elements |
| **Consistent max-width** | Use same `max-w-6xl` or `max-w-7xl` | Mix different container widths         |

---

## Pre-Delivery Checklist

Before delivering UI code, verify these items:

### Visual Quality

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] Brand logos are correct (verified from Simple Icons)
- [ ] Hover states don't cause layout shift
- [ ] Use theme colors directly (bg-primary) not var() wrapper

### Interaction

- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide clear visual feedback
- [ ] Transitions are smooth (150-300ms)
- [ ] Focus states visible for keyboard navigation

### Light/Dark Mode

- [ ] Light mode text has sufficient contrast (4.5:1 minimum)
- [ ] Glass/transparent elements visible in light mode
- [ ] Borders visible in both modes
- [ ] Test both modes before delivery

### Layout

- [ ] Floating elements have proper spacing from edges
- [ ] No content hidden behind fixed navbars
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile

### Accessibility

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color is not the only indicator
- [ ] `prefers-reduced-motion` respected
