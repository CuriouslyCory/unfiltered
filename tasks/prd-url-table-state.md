# PRD: URL Query Parameter State for Data Table

## Introduction

The main page's document data table manages sort, search, and pagination state entirely in local React state. When a user clicks into a document detail page and presses the browser back button, all their table state is lost — sort resets, search clears, and pagination returns to page 1. This feature syncs the table's sort, search, and pagination state to URL query parameters so the browser's back/forward navigation restores the exact table view the user left.

## Goals

- Persist sort column, sort direction, search text, and current page in URL query parameters
- Each state change pushes a new browser history entry so back/forward navigation works naturally
- State changes must feel instant — optimistic UI updates in under 100ms
- When no query params are present, fall back to current defaults (sort by dateSigned desc, no filter, page 1)

## User Stories

### US-001: Sync sorting state to URL query params

**Description:** As a user, I want my sort selection to be reflected in the URL so that pressing back restores my previous sort.

**Acceptance Criteria:**
- [ ] Clicking a sort header updates URL with `sort` and `order` params (e.g., `?sort=riskScore&order=desc`)
- [ ] The table reads initial sort state from URL params on mount
- [ ] Pressing browser back after changing sort restores the previous sort
- [ ] Sort change is visually reflected in under 100ms (optimistic update before URL push)
- [ ] When no `sort`/`order` params exist, defaults to `dateSigned` / `desc`
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-002: Sync search filter to URL query params

**Description:** As a user, I want my search text to persist in the URL so I can bookmark or share a filtered view and restore it via back navigation.

**Acceptance Criteria:**
- [ ] Typing in the search input updates URL with `search` param (e.g., `?search=executive`)
- [ ] Search param is debounced (300ms) to avoid excessive history entries, but the input field updates optimistically
- [ ] The search input initializes from the `search` URL param on mount
- [ ] Clearing the search input removes the `search` param from the URL
- [ ] Pressing browser back restores the previous search text and filtered results
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-003: Sync pagination to URL query params

**Description:** As a user, I want my current page to persist in the URL so that navigating away and pressing back returns me to the same page of results.

**Acceptance Criteria:**
- [ ] Clicking next/previous page updates URL with `page` param (e.g., `?page=3`)
- [ ] Page 1 omits the `page` param to keep URLs clean
- [ ] The table initializes page index from the `page` URL param on mount
- [ ] Changing sort or search resets `page` to 1 (removes param)
- [ ] Pressing browser back restores the previous page
- [ ] Invalid page values (negative, non-numeric, beyond max) fall back to page 1
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-004: Combine all params and verify full round-trip

**Description:** As a user, I want all table state params to work together so that a URL like `?sort=riskScore&order=asc&search=executive&page=2` fully restores my view.

**Acceptance Criteria:**
- [ ] All params coexist in the URL without conflict
- [ ] Navigating to a document detail page and pressing back restores full table state (sort + search + page)
- [ ] Direct browser URL entry with valid params renders the correct table state
- [ ] Params with empty values are omitted from the URL (no `?search=&page=`)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: The `DataTable` component must read `sort`, `order`, `search`, and `page` from URL search params to initialize table state
- FR-2: Sorting changes must update `sort` (column id) and `order` (`asc`|`desc`) query params and push a new history entry
- FR-3: Search input changes must update the `search` query param with a 300ms debounce and push a new history entry; the text input itself must update optimistically without waiting for the debounce
- FR-4: Pagination changes must update the `page` query param (1-indexed in URL, omitted when page is 1) and push a new history entry
- FR-5: Changing sort or search must reset `page` to 1
- FR-6: When query params are absent, the table must use defaults: `sort=dateSigned`, `order=desc`, `search=""`, `page=1`
- FR-7: Invalid or unrecognized param values must fall back to defaults gracefully (no crashes, no blank screens)
- FR-8: All state transitions must produce visual feedback in under 100ms via optimistic local state updates

## Non-Goals

- No new filter UI (e.g., document type dropdown) — only persist existing sort, search, and pagination
- No server-side sorting/filtering — the existing client-side TanStack Table behavior stays as-is
- No shareable short-URLs or link-copy button
- No `replaceState` behavior — all changes push new history entries
- No persisting column visibility preferences

## Technical Considerations

- Use Next.js `useSearchParams()` from `next/navigation` to read params and `useRouter().push()` to update them
- The main page (`src/app/page.tsx`) is currently a server component that passes data to the client `DataTable`. The `DataTable` is already a client component (`"use client"`), so param reading/writing should live there
- Use `useSearchParams` + local state together: local state drives the table for instant feedback, and a `useEffect` syncs local state changes to the URL. On mount or popstate, URL params seed the local state
- Debounce only the URL push for search, not the input value — this avoids perceived lag while preventing history spam
- TanStack Table's `onSortingChange`, `onColumnFiltersChange`, and `onPaginationChange` callbacks are already wired up — extend them to also push URL updates
- Validate `sort` param against known column IDs; reject unknown values
- Validate `order` param against `asc`|`desc`; reject unknown values
- Validate `page` param as a positive integer; reject non-numeric or out-of-range values

## Success Metrics

- User can navigate to a document, press back, and see the exact same table state (sort, search, page) they had before — 100% of the time
- No perceptible delay when changing sort, typing in search, or paginating (under 100ms visual response)
- URL accurately reflects current table state at all times (after debounce for search)

## Open Questions

- Should the `pageSize` (currently hardcoded at 20) also be a URL param for future flexibility, or leave it fixed?
- If full-text server-side search (`document.search` tRPC endpoint) replaces client-side title filtering in the future, should the `search` param name stay the same for URL compatibility?
