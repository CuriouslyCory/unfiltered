# PRD: Admin Document Detail Page Enhancements

## Introduction

The admin document detail page (`/admin/documents/[id]`) is where admins review, edit, and maintain government document records and their associated artifacts (ELI5, Key Points, Constitutional Considerations, etc.). The current page is a single-column layout with no quick navigation, no completeness indicators, and no way to generate missing artifacts directly from the detail view.

This enhancement adds a sticky sidebar with artifact navigation and a health/completeness score, connects missing artifact generation to the external workflow API at `localhost:3200`, and applies visual and UX polish to help power users work faster across many documents.

## Goals

- Enable admins to quickly navigate between artifact sections on long document pages without manual scrolling
- Provide at-a-glance visibility into document completeness (fields filled, artifacts present, published status)
- Allow one-click generation of missing artifacts via the external workflow API
- Apply consistent visual styling (artifact border colors, published status) to improve scannability
- Add keyboard shortcuts for common actions (toggle edit mode)

## User Stories

### Phase 1: Layout & Health Score

### US-001: Flex Layout with Sidebar
**Description:** As an admin, I want the document detail page to have a sidebar + main content layout so that navigation tools are always visible while I scroll through content.

**Acceptance Criteria:**
- [ ] Page uses flex layout: sidebar (280px, left) + main content (flex-1)
- [ ] Sidebar is sticky (`sticky top-4 self-start`) and scrolls independently if taller than viewport (`max-h-[calc(100vh-2rem)] overflow-y-auto`)
- [ ] Main content area retains all existing functionality (document editor, adjacent nav)
- [ ] Sidebar is hidden below `lg` breakpoint; single-column layout preserved on mobile/tablet
- [ ] Dark mode renders correctly
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-002: Document Health Score Card
**Description:** As an admin, I want to see a completeness score for the current document so that I know what's missing before publishing.

**Acceptance Criteria:**
- [ ] Health score card appears at top of sidebar
- [ ] Displays SVG circular progress ring with percentage (0-100) in center
- [ ] Color coded: green (80-100), yellow (60-79), orange (40-59), red (0-39)
- [ ] Score calculated as follows (100 points total):
  - Required fields (35 pts): 7 pts each for title, originalDocumentUrl, dateSigned, signer, type
  - Optional fields (10 pts): 5 pts each for shortSummary, riskScore
  - Artifact coverage (45 pts): 5 pts per standard artifact present (9 × 5)
  - Published status (10 pts): 10 pts if published
- [ ] Health score is informational only — does not block or warn on publish
- [ ] Card is collapsible (collapsed = ring + percentage only; expanded = full breakdown)
- [ ] Expanded view shows each category with mini progress bar and lists missing items
- [ ] Score updates after document edits or artifact creation/deletion (via `router.refresh()`)
- [ ] Uses existing `Card` and `Collapsible` UI components
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-003: Add `calculateDocumentHealth` utility function
**Description:** As a developer, I need a pure utility function to calculate document health scores so the logic is reusable and testable.

**Acceptance Criteria:**
- [ ] Function added to `src/lib/document-utils.ts`
- [ ] Signature: `calculateDocumentHealth(document: Document & { documentArtifact: DocumentArtifact[] }): HealthScoreResult`
- [ ] `HealthScoreResult` type exported with: `score`, `maxScore`, and `breakdown` (requiredFields, optionalFields, artifacts, published — each with filled/missing arrays and score/max numbers)
- [ ] Pure function with no side effects — works in both server and client components
- [ ] Typecheck/lint passes

### Phase 2: Artifact Navigation

### US-004: Artifact Navigation List in Sidebar
**Description:** As an admin, I want to see all 9 standard artifact types listed in the sidebar with present/missing indicators so that I can quickly assess coverage and jump to any section.

**Acceptance Criteria:**
- [ ] Sidebar lists "Document Details" entry at top, followed by all 9 artifacts from `artifactOrder`
- [ ] Each artifact shows its icon and border color from `getArtifactStyle()`
- [ ] Present artifacts show a filled indicator; missing artifacts show a muted/hollow indicator
- [ ] Clicking a present artifact smooth-scrolls to that section (`scrollIntoView({ behavior: "smooth", block: "start" })`)
- [ ] Clicking "Document Details" scrolls to `#document-details`
- [ ] Uses `artifactSectionId()` helper (added to `document-utils.ts`) for consistent ID generation between sidebar and editor
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-005: Active Section Highlighting
**Description:** As an admin, I want the sidebar to highlight which section I'm currently viewing so I maintain orientation while scrolling.

**Acceptance Criteria:**
- [ ] Active sidebar nav item has a left border accent and subtle background highlight
- [ ] Active item determined by `IntersectionObserver` with `rootMargin: "-20% 0px -70% 0px"`
- [ ] Highlight updates smoothly as user scrolls through sections
- [ ] Only one item highlighted at a time
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-006: Add Section IDs to Document Editor
**Description:** As a developer, I need scroll-target IDs on each section in the document editor so the sidebar navigation can jump to them.

**Acceptance Criteria:**
- [ ] `id="document-details"` added to Document Details section element
- [ ] Each artifact div gets `id={artifactSectionId(artifact.title)}` attribute
- [ ] Each artifact div gets `scroll-mt-4` class for scroll offset
- [ ] `artifactSectionId` helper added to `document-utils.ts`: generates `artifact-${title.toLowerCase().replace(/\s+/g, "-")}`
- [ ] Typecheck/lint passes

### Phase 3: Artifact Generation

### US-007a: Add Workflow API URL Environment Variable
**Description:** As a developer, I need the workflow API base URL to be configurable via environment variable so deployment across environments is straightforward.

**Acceptance Criteria:**
- [ ] `NEXT_PUBLIC_WORKFLOW_API_URL` added to `src/env.js` client schema with `z.string().url().default("http://localhost:3200")`
- [ ] Added to `runtimeEnv` mapping: `NEXT_PUBLIC_WORKFLOW_API_URL: process.env.NEXT_PUBLIC_WORKFLOW_API_URL`
- [ ] Typecheck/lint passes

### US-007: Quick-Generate Missing Artifacts from Sidebar
**Description:** As an admin, I want to generate missing artifacts directly from the sidebar so I can quickly fill in content without manual entry.

**Acceptance Criteria:**
- [ ] Missing artifacts in sidebar show a "Generate" button (small, icon-based)
- [ ] Clicking "Generate" calls the appropriate workflow API route at `${WORKFLOW_API_URL}/document/<route>?documentId=<id>` where `WORKFLOW_API_URL` is configured in `src/env.js` (default: `http://localhost:3200`):
  - ELI5 → `GET /document/eli5`
  - Key Points → `GET /document/key-points`
  - Areas of Concern → **No route available** — show disabled generate button with tooltip "Deprecated"
  - Constitutional Considerations → `GET /document/constitutional-considerations`
  - Take Action → `GET /document/action-plan`
  - Social Post → `GET /document/social-post`
  - Letter of Concern → `GET /document/resist-letter`
  - Risk Score Details → `GET /document/score`
  - Final Summary → `GET /document/final-summary`
- [ ] While generating, button shows a spinner/loading state
- [ ] On success, page refreshes (`router.refresh()`) and the artifact appears in the nav and editor
- [ ] On error, a toast notification shows the error message
- [ ] "Generate All Missing" button at bottom of artifact nav list calls `GET /document/run-all?documentId=<id>` to generate all missing artifacts at once
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### Phase 4: Visual & UX Polish

### US-008: Artifact Border Colors in Editor
**Description:** As an admin, I want artifact cards in the editor to use their signature border colors so I can visually distinguish artifact types at a glance.

**Acceptance Criteria:**
- [ ] Each artifact card in the editor uses its border color from `getArtifactStyle()` via a left border (e.g., `border-l-4 ${borderClass}`)
- [ ] Replaces current uniform `border-gray-700` styling
- [ ] Artifact icon displayed next to artifact title in editor
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-009: Sort Artifacts by Canonical Order
**Description:** As an admin, I want artifacts displayed in a consistent, logical order rather than alphabetical so the page layout is predictable.

**Acceptance Criteria:**
- [ ] Artifacts sorted by `artifactOrder` index from `document-utils.ts`
- [ ] Artifacts not in `artifactOrder` appear at the end
- [ ] Replaces current `.sort((a, b) => a.title.localeCompare(b.title))` in document-editor.tsx
- [ ] Typecheck/lint passes

### US-010: Published Status Badge
**Description:** As an admin, I want to see a Draft/Published badge next to the document title so I know the visibility status at a glance.

**Acceptance Criteria:**
- [ ] Badge appears next to the document title in the page header
- [ ] Published: green badge with "Published" text
- [ ] Unpublished: muted/gray badge with "Draft" text
- [ ] Uses existing `Badge` component with appropriate variant
- [ ] Typecheck/lint passes
- [ ] **Verify in browser using dev-browser skill**

### US-011: Keyboard Shortcut for Edit Mode
**Description:** As a power user, I want to press Ctrl+E to toggle edit mode on the document details section so I can start editing without reaching for the mouse.

**Acceptance Criteria:**
- [ ] `Ctrl+E` (or `Cmd+E` on Mac) toggles the document details edit mode
- [ ] Only active when not already editing an artifact or in a text input/textarea
- [ ] No conflict with browser default shortcuts (Ctrl+E is not a standard browser shortcut)
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: Create `DocumentSidebar` client component at `src/app/admin/_components/document-sidebar.tsx`
- FR-2: Add `calculateDocumentHealth()` pure function and `HealthScoreResult` type to `src/lib/document-utils.ts`
- FR-3: Add `artifactSectionId()` helper to `src/lib/document-utils.ts` for consistent ID generation
- FR-4: Restructure `page.tsx` from single-column to `flex gap-6` layout with sidebar and main content areas
- FR-5: Sidebar uses `sticky top-4 self-start` positioning with `max-h-[calc(100vh-2rem)] overflow-y-auto`
- FR-6: Sidebar hidden below `lg` breakpoint via `hidden lg:block`
- FR-7: Health score card uses SVG circular progress ring, collapsible via existing `Collapsible` component
- FR-8: Artifact nav items use icons and colors from existing `getArtifactStyle()` function
- FR-9: Scroll-to-section uses `scrollIntoView({ behavior: "smooth", block: "start" })` pattern from `sticky-document-header.tsx`
- FR-10: Active section tracking uses `IntersectionObserver` with `rootMargin: "-20% 0px -70% 0px"`
- FR-11: Missing artifact generation calls external API at `${WORKFLOW_API_URL}/document/<route>?documentId=<id>` (env var with default `http://localhost:3200`)
- FR-16: Add `WORKFLOW_API_URL` to `src/env.js` as a client-side env var (`NEXT_PUBLIC_WORKFLOW_API_URL`) with default `http://localhost:3200`
- FR-17: "Areas of Concern" artifact shows disabled generate button with "Deprecated" tooltip (no API route)
- FR-12: Artifact cards in editor use `border-l-4` with color from `getArtifactStyle()` and display artifact icon
- FR-13: Artifacts sorted by `artifactOrder` index, unknown artifacts at end
- FR-14: Published badge uses existing `Badge` component next to document title
- FR-15: `Ctrl+E` / `Cmd+E` keyboard shortcut toggles document details edit mode

## Non-Goals

- No mobile sidebar (sheet/drawer) — mobile uses existing single-column layout
- Health score is informational only — no publish blocking or warnings
- No inline editing of artifacts from the sidebar
- No drag-and-drop reordering of artifacts
- No bulk operations across multiple documents from this page
- No real-time/SSE progress tracking for artifact generation (simple request/response)

## Design Considerations

- **Aesthetic**: Utilitarian admin tool — clean, information-dense, no decorative elements
- **Sidebar**: Dark card background (`bg-card`), subtle border, compact spacing
- **Health ring**: Thin SVG stroke with color fill, numeric percentage in center
- **Active nav item**: Left border accent + subtle background highlight matching artifact color
- **Transitions**: Smooth 150ms transitions on hover/active states

### Existing Components to Reuse
- `Card`, `CardHeader`, `CardContent` from `src/app/_components/ui/card.tsx`
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `src/app/_components/ui/collapsible.tsx`
- `Badge` from `src/app/_components/ui/badge.tsx`
- `Button` from `src/app/_components/ui/button.tsx`
- `Tooltip` from `src/app/_components/ui/tooltip.tsx`
- `getArtifactStyle()`, `artifactOrder` from `src/lib/document-utils.ts`

### Existing Patterns to Follow
- Scroll-to-section: `src/app/eo-summary/[slug]/_components/sticky-document-header.tsx` (lines 49-55)
- IntersectionObserver: `src/app/eo-summary/[slug]/_components/sticky-document-header.tsx` (lines 29-47)
- Risk color coding: `src/app/_components/risk-score.tsx`

## Technical Considerations

- **Serialization**: Document prop with Date fields is already passed from server to client component (`DocumentEditor`), so the same approach works for `DocumentSidebar`
- **Stale health score**: After mutations, `router.refresh()` is already called in all mutation handlers, which re-fetches server data and re-renders both components
- **External API**: The workflow API uses simple GET requests with `documentId` query parameter. Base URL configured via `NEXT_PUBLIC_WORKFLOW_API_URL` env var (default: `http://localhost:3200`). Calls made directly from the client component (admin-only page, internal tool)
- **Env var setup**: Add `NEXT_PUBLIC_WORKFLOW_API_URL` to `src/env.js` using `@t3-oss/env-nextjs` `client` schema with `z.string().url().default("http://localhost:3200")`
- **Scroll offset**: `scroll-mt-4` on artifact sections handles any potential overlap from sticky elements

## Success Metrics

- Admin can navigate to any artifact section in under 2 clicks from the sidebar
- Health score accurately reflects document completeness and updates in real-time after edits
- Missing artifacts can be generated with a single click from the sidebar
- Page renders correctly in both light and dark modes at all breakpoints

## Open Questions

None — all questions resolved.
