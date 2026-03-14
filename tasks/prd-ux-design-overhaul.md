# PRD: UX & Design Overhaul

## Introduction

Slak.me is a civic information platform providing AI-assisted analysis of executive orders and legislation. Users arrive via two primary paths: (1) social media links landing directly on a document detail page (`/eo-summary/[slug]`), or (2) organic discovery landing on the homepage. The current site is functional but has significant UX gaps that undermine trust and credibility:

- Users landing on document pages have no context about the site, no breadcrumbs, and no way to discover related content
- Document pages contain 9+ collapsible artifact sections (ELI5, Key Points, Areas of Concern, etc.) with uniform styling and no table of contents -- overwhelming for users trying to navigate dense analysis
- The homepage opens with a personal-sounding paragraph rather than an authoritative civic tool identity
- Cross-document discovery is limited to chronological prev/next links
- Visual inconsistencies (hardcoded grays, small risk scores, uniform section styling) weaken the professional feel
- A full-text search tRPC procedure (`document.search`) exists but is completely unused in the frontend

This overhaul transforms Slak.me into a trustworthy, navigable civic information tool where users can quickly find, understand, and share analysis regardless of how they arrive. The work is organized into 4 phases, ordered by impact and complexity.

## Goals

- Establish Slak.me as a credible, authoritative civic information platform through professional branding, visual hierarchy, and consistent design
- Enable users landing on any page to understand the site's purpose and discover related content within 10 seconds
- Provide intuitive navigation within long document pages so users can scan and jump to relevant sections without excessive scrolling
- Surface the existing full-text search capability to help users find specific documents quickly
- Ensure WCAG AA accessibility compliance across all interactive elements
- Support both light and dark themes consistently using design tokens rather than hardcoded values
- Improve mobile experience for document pages with floating navigation and responsive layouts

## User Stories

### Phase 1: Foundation & Quick Wins

### US-001: Header Tagline & Brand Identity
**Description:** As a first-time visitor, I want to immediately understand what Slak.me does so that I can trust the site as a credible information source.

**Acceptance Criteria:**
- [ ] Tagline "Independent Executive Order Analysis" appears below the "Slak.me" brand name in the header
- [ ] Tagline uses `text-xs text-muted-foreground` styling, visible but not competing with brand
- [ ] Header has a bottom border (`border-b border-border`) for visual structure
- [ ] Header bottom margin reduced from `mb-12` to `mb-8`
- [ ] Site metadata description in `layout.tsx` updated to: "Independent analysis of executive orders, legislation, and government actions — tracking constitutional risk and civic impact"
- [ ] Tagline visible on both desktop and mobile layouts
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-002: Breadcrumbs on Document Pages
**Description:** As a user who landed directly on a document page, I want to see breadcrumb navigation so that I understand where I am in the site and can navigate to related areas.

**Acceptance Criteria:**
- [ ] shadcn `breadcrumb` component installed
- [ ] Breadcrumbs render above the document title: `Home > {Document Type (e.g. "Executive Orders")} > {Truncated Title}`
- [ ] "Home" links to `/`
- [ ] Document type segment is human-readable (e.g., "Executive Orders" not "EXECUTIVE_ORDER")
- [ ] Document title truncated to ~60 characters with ellipsis
- [ ] Breadcrumbs visible on both desktop and mobile
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-003: Artifact Section Visual Differentiation
**Description:** As a user scanning a document page, I want each analysis section to have a distinct visual identity so that I can quickly find the type of content I'm looking for (e.g., ELI5 vs. Areas of Concern).

**Acceptance Criteria:**
- [ ] Each artifact type has a unique colored left border (`border-l-4`) and Lucide icon next to the title:
  - ELI5: blue border, `BookOpen` icon
  - Key Points: slate border, `ListChecks` icon
  - Areas of Concern: orange border, `AlertTriangle` icon
  - Constitutional Considerations: red border, `Scale` icon
  - Take Action: green border, `Megaphone` icon
  - Social Post: indigo border, `Share2` icon
  - Letter of Concern: amber border, `Mail` icon
  - Risk Score Details: uses document's risk color, `ShieldAlert` icon
  - Final Summary: primary color border, `FileText` icon
- [ ] `artifactStyles` config map added to `document-utils.ts` mapping artifact titles to border classes and icon components
- [ ] Icon renders at 16x16 (`h-4 w-4`) next to the section title in the CollapsibleTrigger
- [ ] Border color applied to the content container div (the `bg-muted` box)
- [ ] Colors work correctly in both light and dark themes
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-004: Expand All / Collapse All Controls
**Description:** As a user reading a document analysis, I want to expand or collapse all sections at once so that I can either read everything sequentially or scan just the headers.

**Acceptance Criteria:**
- [ ] New client component `artifact-section-list.tsx` wraps all artifact sections and manages collective open/close state
- [ ] "Expand All" and "Collapse All" buttons appear above the artifact sections
- [ ] Buttons use existing `Button` component with `variant="outline"` and `size="sm"`
- [ ] Clicking "Expand All" opens all sections; clicking "Collapse All" closes all
- [ ] Individual sections can still be toggled independently after a bulk action
- [ ] URL param `?sections=all` supported for "expand all" via link sharing
- [ ] Existing `openSections` URL param pattern preserved for individual sections
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-005: Section Preview Text When Collapsed
**Description:** As a user scanning a document page, I want to see a brief preview of each section's content when collapsed so that I can decide which sections to read without opening each one.

**Acceptance Criteria:**
- [ ] When an artifact section is collapsed, the first ~120 characters of content appear below the title
- [ ] Preview text is plain text (markdown formatting stripped)
- [ ] Preview styled as `text-sm text-muted-foreground truncate`
- [ ] Preview disappears when section is expanded
- [ ] Preview does not add significant height to collapsed sections (single line, truncated)
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-006: Homepage Full-Text Search
**Description:** As a user looking for a specific document, I want to search across all documents from the homepage so that I can quickly find relevant analysis without manually scrolling the table.

**Acceptance Criteria:**
- [ ] New client component `document-search.tsx` renders a prominent search input with `Search` icon (Lucide)
- [ ] Search input placed in the homepage hero area (above the data table)
- [ ] Input calls existing `api.document.search` tRPC procedure with 300ms debounce
- [ ] Results appear in a dropdown/popover below the search input
- [ ] Each result shows: title, risk score badge (reuse `RiskScore` component), type badge (reuse `DocumentTypeBadge`), and truncated short summary
- [ ] Clicking a result navigates to `/eo-summary/{slug}?sections=ELI5`
- [ ] Results capped at 30 items maximum
- [ ] Empty query shows no results (the table below handles browsing)
- [ ] No results state shows "No documents found" message
- [ ] Search input accessible with keyboard (arrow keys to navigate results, Enter to select)
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-007: Migrate Hardcoded Grays to Theme Tokens
**Description:** As a developer maintaining the codebase, I want all color values to use theme tokens so that the warm design tone applies consistently and theme switching works properly.

**Acceptance Criteria:**
- [ ] All instances of `bg-gray-200` replaced with `bg-muted`
- [ ] All instances of `dark:bg-gray-800` replaced (handled by `bg-muted` dark mode)
- [ ] All instances of `text-gray-500` and `text-gray-600` replaced with `text-muted-foreground`
- [ ] All instances of `dark:text-gray-400` replaced (handled by `text-muted-foreground`)
- [ ] All instances of `border-gray-700` and `dark:border-gray-700` replaced with `border-border`
- [ ] Contrast audit: all text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text) in both themes
- [ ] No hardcoded gray Tailwind classes remain in any component file (except where intentionally distinct from theme)
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill** — check both light and dark themes

### US-008: Accessibility Fixes
**Description:** As a user relying on assistive technology, I want all interactive elements to be semantic and accessible so that I can navigate and use the site effectively.

**Acceptance Criteria:**
- [ ] All `<div>` elements with `onClick` handlers in `ArtifactActions` converted to semantic `<button>` elements
- [ ] Each action button has an `aria-label` attribute (e.g., "Copy link to section", "Copy content", "Share", "Send via ResistBot")
- [ ] `animate-pulse` on severe risk scores (8-10) replaced with static visual indicator: `ring-2 ring-offset-2` using the risk color
- [ ] All action buttons have visible focus styles (`:focus-visible` ring)
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

---

### Phase 2: Navigation & Information Architecture

### US-009: Sticky Sidebar Table of Contents (Desktop)
**Description:** As a desktop user reading a long document analysis, I want a persistent table of contents sidebar so that I can see all available sections and jump to any one without scrolling.

**Acceptance Criteria:**
- [ ] New component `table-of-contents.tsx` renders a vertical list of section links
- [ ] TOC items derived from `artifactOrder` filtered to only artifacts present on current document
- [ ] Document page artifact area uses two-column grid layout: `md:grid md:grid-cols-[200px_1fr] md:gap-6`
- [ ] TOC column is sticky: `sticky top-4` so it stays visible during scroll
- [ ] TOC is collapsible on desktop: a toggle button collapses to a narrow column showing longer dashes for section headings and shorter dashes for any subsections
- [ ] Collapsed TOC state persists during the session (not saved to localStorage)
- [ ] Active section highlighted with a left-border accent using `IntersectionObserver`
- [ ] Clicking a TOC item scrolls to the section AND opens it if collapsed
- [ ] Risk score badge and document type badge displayed at top of TOC for quick reference
- [ ] TOC hidden on mobile (only visible at `md` breakpoint and above)
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-010: Mobile Floating TOC
**Description:** As a mobile user reading a long document, I want a floating button that opens a section navigator so that I can jump between sections without scrolling back to the top.

**Acceptance Criteria:**
- [ ] shadcn `sheet` component installed
- [ ] New component `mobile-toc-sheet.tsx` renders a floating action button
- [ ] FAB positioned at `fixed bottom-4 right-4 z-50` with `List` icon (Lucide), only visible below `md` breakpoint
- [ ] Tapping FAB opens a bottom sheet listing all artifact sections present on the document
- [ ] Each sheet item shows the artifact icon and title (matching the visual differentiation from US-003)
- [ ] Tapping a sheet item: scrolls to section, opens it if collapsed, closes the sheet
- [ ] Document page has `pb-16` padding on mobile to prevent content behind the FAB
- [ ] Sheet is accessible: can be closed with swipe down or close button
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-011: Homepage Hero Section Redesign
**Description:** As a first-time visitor to the homepage, I want to see a professional, informative hero section so that I immediately understand the site's purpose and can start exploring.

**Acceptance Criteria:**
- [ ] New component `hero-section.tsx` replaces the current personal intro paragraph
- [ ] Hero contains:
  - Large serif heading (e.g., "Track the Impact of Executive Orders")
  - Concise sans-serif subheading explaining the value proposition (1-2 sentences, third person, not first person)
  - Search input from US-006
  - Stats bar with 3 stat cards
- [ ] New component `stat-card.tsx` built on existing `Card` component: icon + large number + label
- [ ] Stats displayed: total documents tracked, high-risk document count (risk >= 5), date of most recent update — all server-rendered (no client-side real-time updates needed)
- [ ] Personal "I built this" text removed from homepage (already exists on About page)
- [ ] Hero looks professional in both light and dark themes
- [ ] Responsive: stats stack vertically on mobile, horizontal on desktop
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-012: Homepage Filter Bar
**Description:** As a user browsing documents, I want to filter the data table by document type and risk level so that I can focus on the specific content I care about.

**Acceptance Criteria:**
- [ ] Document type filter using existing `Select` component with options: "All Types", "Executive Order", "Fact Sheet", "Remarks", "Legislation", "Other"
- [ ] Risk level filter using existing `Select` component with options: "All Risk Levels", "Low (0-2)", "Moderate (3-4)", "Elevated (5-6)", "High (7-8)", "Severe (9-10)"
- [ ] Filters placed inline with existing search input in `flex flex-wrap gap-2` layout
- [ ] Filter state synced to URL params (`?type=EXECUTIVE_ORDER&risk=high`) following existing pattern for sort/search/page
- [ ] Section heading "All Documents" added above the table
- [ ] Results count shown: "Showing X of Y documents"
- [ ] Changing a filter resets pagination to page 1
- [ ] Filters work in combination with existing search and sort
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-013: Redesign High-Risk Alert Section & Document Cards
**Description:** As a user viewing the homepage, I want the high-risk documents section to feel like a dashboard alert and the cards to convey more useful information at a glance.

**Acceptance Criteria:**
- [ ] Yellow warning box replaced with structured alert panel using `AlertTriangle` icon (Lucide) + "High Risk Documents" header
- [ ] High-risk count displayed as a large number with label, not buried in a sentence
- [ ] Document cards enhanced:
  - `DocumentTypeBadge` added to each card
  - Date signed shown as small detail text
  - Left-border color accent based on risk level (using risk score color logic from `risk-score.tsx`)
  - "Read More" ghost button removed (entire card is already a clickable link)
- [ ] Alert panel and cards look professional in both light and dark themes
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

---

### Phase 3: Discovery & Document Page Enhancements

### US-014: Related Documents Section
**Description:** As a user reading a document analysis, I want to see related documents so that I can explore connected executive orders and legislation without returning to the homepage.

**Acceptance Criteria:**
- [ ] New tRPC procedure `document.getRelated` added to `document.ts` router
  - Input: `{ documentId: number, type: DocumentType, riskScore: number }`
  - Returns up to 4 published documents of same type OR similar risk score (+/-1), excluding current document, ordered by `dateSigned` desc
  - Falls back to highest-risk documents if no same-type matches found
- [ ] New component `related-documents.tsx` renders a "Related Documents" section
- [ ] Uses grid of existing `DocumentCard` components (reuse, don't duplicate)
- [ ] Grid responsive: 1 column on mobile, 2 on tablet, 4 on desktop
- [ ] Section title indicates the relation reason when readily available from the query (e.g., "More Executive Orders" when matched by type, "Similar Risk Level" when matched by risk score). No LLM generation needed — derive from which query criteria matched.
- [ ] Section placed after artifact sections, before prev/next navigation
- [ ] Section hidden if no related documents exist
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-015: Site Context Banner for Direct-Landing Users
**Description:** As a user who arrived from a social media link, I want a brief introduction to the site so that I understand what Slak.me is and can explore further.

**Acceptance Criteria:**
- [ ] New component `site-context-banner.tsx` renders a slim, dismissible banner
- [ ] Banner appears only when `document.referrer` does not match the current site domain (or is empty)
- [ ] Banner text: "Slak.me provides independent analysis of executive orders and legislation."
- [ ] Banner includes two link buttons: "Browse All Documents" (links to `/`) and "About" (links to `/about`)
- [ ] Dismiss button (X icon) hides the banner and saves dismissal to `localStorage` key `slakme-banner-dismissed`
- [ ] Banner does not reappear after dismissal (persists across page navigations)
- [ ] Banner placed between breadcrumbs and document title
- [ ] Styled with `bg-muted` background, `border`, and `rounded-md` for consistency
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-016: Risk Score Enhancement with Size Variants
**Description:** As a user viewing document details, I want a more informative risk score visualization so that I can immediately understand the severity and meaning of the score.

**Acceptance Criteria:**
- [ ] `RiskScore` component refactored to support `size` prop: `"compact"` (default) and `"full"`
- [ ] **Compact variant**: current circle increased to `h-8 w-8` with `text-sm font-bold`. Scores >= 7 get subtle `ring-2` glow in risk color
- [ ] **Full variant**: displays score at `text-3xl font-bold`, risk level label below (e.g., "High"), horizontal meter bar (colored div with width proportional to score on 0-10 scale)
- [ ] shadcn `tooltip` component installed
- [ ] Tooltip on hover (both variants) explains the score range meaning (e.g., "High Risk (7/10): This document poses significant constitutional concerns")
- [ ] Details pane updated to use `full` variant
- [ ] Table and cards continue using `compact` variant
- [ ] Both variants work in light and dark themes
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-017: Improved Prev/Next Navigation
**Description:** As a user finishing a document analysis, I want the prev/next navigation to be more informative and visually prominent so that I'm encouraged to continue exploring.

**Acceptance Criteria:**
- [ ] Prev/next links wrapped in Card-like containers with padding and hover effects
- [ ] Each link shows: document title, risk score badge (compact), and document type badge
- [ ] Clickable area covers the entire card container
- [ ] "Previous" and "Next" labels clearly visible above the document title
- [ ] Responsive: cards stack vertically on mobile, side-by-side on desktop
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-018: Summary Section Enhancement
**Description:** As a user viewing a document, I want the summary section to be visually distinct and informative so that I get the key context at a glance before diving into detailed sections.

**Acceptance Criteria:**
- [ ] Summary section uses `Card` component instead of plain div
- [ ] Summary text rendered at `text-lg` for prominence
- [ ] Quick stats row added below summary: number of analysis sections available, document type badge, risk score badge
- [ ] Card visually distinct from artifact sections (no left-border color treatment)
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

---

### Phase 4: Polish & Mobile

### US-019: Sticky Document Header on Scroll
**Description:** As a user scrolling through a long document page, I want a compact sticky header to appear so that I always know which document I'm reading and can quickly navigate.

**Acceptance Criteria:**
- [ ] New component `sticky-document-header.tsx` using `IntersectionObserver` on the main document title
- [ ] When the title scrolls out of view, a slim sticky bar appears at the top of the viewport
- [ ] Sticky bar contains: truncated document title, risk score badge (compact), and a "Jump to section" dropdown (using existing `DropdownMenu` component)
- [ ] "Jump to section" dropdown lists all artifact sections with their icons
- [ ] Styled: `fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-b px-4 py-2`
- [ ] Sticky bar smoothly transitions in/out (not jarring)
- [ ] Sticky bar does not conflict with the main site header
- [ ] Hidden on mobile where the floating TOC FAB serves a similar purpose
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-020: Typography & Color Refinements
**Description:** As a user reading long-form analysis content, I want improved typography and color consistency so that content is comfortable to read and the site feels polished.

**Acceptance Criteria:**
- [ ] Roboto Serif font weight `"700"` added to the font loading configuration in `layout.tsx` (currently only `"400"` loaded, headings are faux-bolded)
- [ ] `leading-relaxed` (line-height 1.625) applied to markdown prose content areas for readability
- [ ] CSS variable `--font-cactus` renamed to `--font-heading` in layout.tsx and globals.css
- [ ] Semantic artifact color tokens added to `globals.css`:
  - `--color-artifact-info`, `--color-artifact-warning`, `--color-artifact-danger`, `--color-artifact-action`, `--color-artifact-share`
- [ ] Card background color adjusted to match warm theme tone: light mode `hsl(36, 20%, 99%)`, dark mode `hsl(240, 10%, 13%)`
- [ ] All heading font weights render correctly (no browser faux-bolding)
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill** — check both light and dark themes

### US-021: Details Pane Improvements
**Description:** As a user viewing document metadata, I want the details pane to be visually consistent and make the risk score prominent so that key information is immediately clear.

**Acceptance Criteria:**
- [ ] Details pane uses `Card` component for visual consistency with other components
- [ ] Risk score displayed using `full` variant from US-016 (large number + label + meter)
- [ ] Subtle dividers (border or spacing) between metadata groups: risk score, signer info, dates, type/links
- [ ] Metadata labels use `text-muted-foreground` (not hardcoded gray)
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-022: DataTable Polish
**Description:** As a user browsing the document table, I want visual refinements that improve scannability and provide context about the result set.

**Acceptance Criteria:**
- [ ] Alternating row background colors: `even:bg-muted/30` for improved scannability
- [ ] Search icon (`Search` from Lucide) rendered inside the filter input as a visual affordance
- [ ] Results count displayed below the table: "Showing X of Y documents"
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-023: Footer Enhancement
**Description:** As a user reaching the bottom of a page, I want a well-structured footer that reinforces the site's identity and makes it easy to support the project.

**Acceptance Criteria:**
- [ ] Footer restructured into two sections: top section with brief mission statement, bottom section with links and legal disclaimer
- [ ] Tagline "Independent Executive Order Analysis" included in footer for brand reinforcement
- [ ] "Buy me a coffee" link given more visual weight (larger, possibly with a `Button` component styled as secondary)
- [ ] Footer links use `text-muted-foreground` (not hardcoded gray)
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

## Functional Requirements

### Brand & Identity
- FR-1: Header must display tagline "Independent Executive Order Analysis" below the brand name on all pages
- FR-2: Header must have a bottom border for visual structure
- FR-3: Site metadata description must accurately describe the platform's purpose

### Document Page Navigation
- FR-4: Document pages must render breadcrumbs showing: Home > Document Type > Title
- FR-5: Document pages must include a sticky sidebar TOC (desktop) listing all artifact sections present, collapsible to a narrow dash-based indicator column
- FR-6: Document pages must include a floating TOC button (mobile) that opens a bottom sheet navigator
- FR-7: TOC must highlight the currently visible section using IntersectionObserver
- FR-8: Clicking a TOC item must scroll to and open the corresponding section

### Artifact Sections
- FR-9: Each artifact type must display a unique colored left border and icon per the `artifactStyles` config
- FR-10: "Expand All" / "Collapse All" buttons must control all artifact sections collectively
- FR-11: Collapsed sections must show a ~120 character plain-text preview of content
- FR-12: All action buttons (copy link, copy content, share, ResistBot) must be semantic `<button>` elements with `aria-label`

### Homepage
- FR-13: Homepage must display a professional hero section with heading, subheading, search, and stats
- FR-14: Homepage search must use the existing `document.search` tRPC procedure with 300ms debounce
- FR-15: Search results must display in a dropdown with title, risk score, type badge, and summary, capped at 30 results maximum
- FR-16: Data table must support filtering by document type and risk level via URL-synced controls
- FR-17: High-risk alert section must display count as a prominent number with structured layout

### Discovery
- FR-18: Document pages must display up to 4 related documents based on same type or similar risk score, with the section title indicating the relation reason when readily derivable from query criteria
- FR-19: A dismissible site context banner must appear for users arriving from external referrers
- FR-20: Banner dismissal must persist via localStorage

### Risk Score
- FR-21: RiskScore component must support `compact` and `full` size variants
- FR-22: Full variant must include score number, risk label, and proportional meter bar
- FR-23: Both variants must show explanatory tooltip on hover

### Visual Consistency
- FR-24: All component colors must use theme tokens (no hardcoded Tailwind gray classes)
- FR-25: All text must meet WCAG AA contrast ratios in both light and dark themes
- FR-26: Card backgrounds must use warm-toned theme colors matching the site's color scheme

## Non-Goals

- No server-side rendering changes to the data fetching strategy (existing tRPC pattern preserved)
- No new database models or schema changes (uses existing Document and DocumentArtifact models)
- No user authentication changes or new auth-protected features
- No CMS or content editing changes (admin pages unchanged)
- No SEO-focused category landing pages (e.g., `/type/executive-orders`) — homepage filters serve this need
- No swipe gesture navigation between documents
- No mobile bottom navigation bar (floating TOC button is sufficient)
- No changes to the document artifact content itself (only presentation)
- No analytics event tracking implementation (can be added later)
- No performance optimization of data fetching (e.g., pagination at the API level)

## Design Considerations

### Existing Components to Reuse
- `Card`, `Button`, `Badge`, `Select`, `Collapsible`, `DropdownMenu`, `HoverCard` — all from shadcn/ui, already installed
- `RiskScore` component — extend with size variants, don't replace
- `DocumentTypeBadge` — reuse in cards and TOC
- `DocumentCard` — reuse for related documents grid
- `DataTable` — extend with filter controls, don't restructure

### New shadcn/ui Components to Install
- `breadcrumb` — for document page navigation
- `sheet` — for mobile TOC bottom sheet
- `tooltip` — for risk score explanations

### Visual System
- Artifact type differentiation via colored left borders and Lucide icons
- Risk score color scale: green (0-2), yellow (3-4), orange (5-6), red (7-8), dark red (9-10) — already defined in globals.css
- Warm color palette: cream backgrounds, dark charcoal text, with theme token consistency

## Technical Considerations

- **Existing unused code:** The `document.search` tRPC procedure in `src/server/api/routers/document.ts` uses PostgreSQL full-text search with `tsvector`. It works but has never been wired to the frontend. US-006 connects it.
- **State management pattern:** The existing `DataTable` component already syncs sort, search, and page state to URL params. New filters (US-012) should follow this exact same pattern for consistency.
- **Component architecture:** The `ArtifactSection` currently manages its own open/close state. US-004 lifts this to a parent `ArtifactSectionList` wrapper. This is the biggest architectural change — the parent must pass `isOpen` and `onToggle` props down.
- **IntersectionObserver usage:** Both the sticky TOC (US-009) and sticky document header (US-019) use IntersectionObserver. These should be implemented as separate hooks to avoid conflict.
- **localStorage for banner:** US-015 uses localStorage for banner dismissal. Use a simple boolean key `slakme-banner-dismissed`. Check on mount, no expiration needed.
- **Font weight loading:** Currently Roboto Serif only loads weight 400. Adding weight 700 in the Next.js font config will fix faux-bolding and improve rendering quality.

### Key Files to Modify
- `src/app/page.tsx` — Homepage layout (Phases 1, 2)
- `src/app/eo-summary/[slug]/page.tsx` — Document detail page (Phases 1-4)
- `src/app/eo-summary/[slug]/_components/artifact-section.tsx` — Artifact display (Phases 1, 2)
- `src/server/api/routers/document.ts` — tRPC routes (Phases 1, 3)
- `src/lib/document-utils.ts` — Artifact ordering + style config (Phase 1)
- `src/app/_components/risk-score.tsx` — Risk visualization (Phase 3)
- `src/app/_components/document-table/data-table.tsx` — Data table (Phases 2, 4)
- `src/app/_components/theme/header.tsx` — Header/brand (Phase 1)
- `src/app/_components/theme/footer.tsx` — Footer (Phase 4)
- `src/styles/globals.css` — Theme tokens (Phases 1, 4)
- `src/app/_components/document-card.tsx` — Document cards (Phase 2)
- `src/app/eo-summary/[slug]/_components/details-pane.tsx` — Details pane (Phase 4)
- `src/app/eo-summary/[slug]/_components/summary-section.tsx` — Summary section (Phase 3)

### New Files to Create
| File | Phase | Purpose |
|------|-------|---------|
| `src/app/eo-summary/[slug]/_components/breadcrumbs.tsx` | 1 | Breadcrumb navigation |
| `src/app/eo-summary/[slug]/_components/artifact-section-list.tsx` | 1 | Collective expand/collapse state management |
| `src/app/_components/document-search.tsx` | 1 | Full-text search with results dropdown |
| `src/app/eo-summary/[slug]/_components/table-of-contents.tsx` | 2 | Sticky desktop sidebar TOC |
| `src/app/eo-summary/[slug]/_components/mobile-toc-sheet.tsx` | 2 | Mobile floating TOC with bottom sheet |
| `src/app/_components/hero-section.tsx` | 2 | Homepage hero section |
| `src/app/_components/stat-card.tsx` | 2 | Dashboard stat cards for hero |
| `src/app/eo-summary/[slug]/_components/related-documents.tsx` | 3 | Related documents grid |
| `src/app/eo-summary/[slug]/_components/site-context-banner.tsx` | 3 | Dismissible context banner for external visitors |
| `src/app/eo-summary/[slug]/_components/sticky-document-header.tsx` | 4 | Compact sticky header on scroll |

## Success Metrics

- **Trust & credibility:** The site presents as an authoritative civic information tool — professional header with tagline, structured hero section, consistent visual design system, no personal-sounding copy on public pages
- **Navigation efficiency:** Users on document pages can identify and navigate to any section within 3 clicks/taps via TOC
- **Content discovery:** Users viewing a document are exposed to 4+ related documents, reducing single-page bounce rate
- **Search discoverability:** Users can find a specific document in under 5 seconds using full-text search
- **Accessibility:** All interactive elements are keyboard-navigable with visible focus indicators, all text meets WCAG AA contrast ratios
- **Visual consistency:** Zero hardcoded gray values; all colors use theme tokens; both light and dark themes look polished
- **Return visits and sharing:** Improved sharing tools and professional presentation encourage users to return and share analysis

## Open Questions

None — all resolved.
