# LendLoop UI Overhaul Plan — Revised

## 1. Purpose

This plan replaces the original visual overhaul draft with an implementation-ready
direction. It retains the **Animated Kangaroo-inspired hero, atmospheric
backdrops, rich midnight palette, glass surfaces, and micromotion**, while
correcting the LendLoop-specific layout, copy, authentication, loading, and
borrowing behavior problems found in the current implementation.

The target is not to recreate Animated Kangaroo literally. It is to use the
reference's most effective visual principles:

- Bold, editorial hero typography
- Deep atmospheric backgrounds
- Cyan and violet accents with strong contrast
- Translucent surfaces and restrained glow
- Fast, clear micro-interactions
- A sense of depth and motion without visual noise

---

## 2. Confirmed Current Issues

| Issue | Required outcome |
| --- | --- |
| Some main containers stop at `1024px` | Public and authenticated content may use wider, responsive desktop containers |
| Buttons do not consistently have pointer cursors | Every actionable control has an appropriate cursor state |
| "Public catalog" is unclear | Rename the public tool section to clearer neighborhood-sharing language |
| Signed-out and signed-in header CTAs are inconsistent | Use a clear signed-out sign-in action and a clear signed-in destination |
| Board cards do not expose pending requests | Cards reflect the current user's and other users' request state |
| Pending requests do not reserve dates consistently | Introduce a clear date reservation lifecycle |
| The trust copy beside the main CTA feels disconnected | Recompose this as a polished CTA/trust block |
| Mobile footer alignment is inconsistent | Align and wrap both footer regions deliberately |
| Skeletons can flash or resemble wireframes | Use stable, high-fidelity card silhouettes with a shimmer |

---

## 3. Visual Direction

### 3.1 Keep the Animated Kangaroo character

The implementation should strongly preserve:

- A deep midnight or near-black backdrop
- Royal-blue atmospheric glow
- Electric-cyan primary accents
- Violet or sapphire secondary accents
- Multi-stop color accents for major hero words
- Rounded glass and translucent dark surfaces
- Subtle ambient radial lighting rather than arbitrary divider lines
- Precise, spring-based interaction rather than decorative constant animation

Avoid an all-purple or all-cyan screen. The palette should retain enough neutral
surface and text contrast to keep tools, dates, and loan states legible.

### 3.2 Hero

Follow the Animated Kangaroo-style hero guide:

- Large, bold, editorial headline
- Strong tracking and a clear dominant line
- One or more gradient-clipped words
- Motion entrance for the headline words
- An inline or closely associated pill CTA on desktop
- Graceful stacked treatment on mobile
- One quiet ambient visual element behind the typography
- No oversized animated orbital decoration that competes with the content

Recommended copy:

- `Borrow what you need.`
- `Lend what you don't.`

The hero animation may reveal words from below and fade or scale slightly. Use
the existing [motion utilities](/workspaces/lendloop/src/lib/motion.ts) for shared
timing and easing.

### 3.3 Background

Use a dark radial background system rather than a flat global black:

- Deep midnight base
- Large radial blue glow near the upper center
- Cyan tint concentrated around interactive/focal regions
- Subtle violet tint in the lower or surrounding backdrop
- No repeated ornamental gradients on every card

Respect `prefers-reduced-motion` and avoid moving background effects.

### 3.4 Type and surfaces

Use:

- Existing Geist as the interface typeface
- Existing Instrument Serif for selected display or editorial moments
- Strong font-weight contrast instead of excessive text size
- Dark glass cards with a one-pixel border
- Soft, restrained shadows and edge illumination
- Pill controls for primary actions and filters
- Rounded rectangles rather than overly pill-shaped cards

### 3.5 Motion

Keep micro-motion purposeful:

- Card hover lift of approximately `2–4px`
- Subtle border and ambient glow change on hover
- Spring feedback for taps
- Layout animation for filters and navigation indicators
- Fast sheet and modal entrances
- Shimmer only for loading states

No continuous bouncing, pulsing dots, or decorative infinite movement in the UI.

---

## 4. Layout and Responsive Requirements

### 4.1 Container widths

Do not use a single `1024px`-only constraint for every desktop viewport.

Define responsive page containers as follows:

| Surface | Recommended behavior |
| --- | --- |
| Public page | Wider content container, adjusted from mobile to ultrawide |
| Authenticated app shell | Match public-page rhythm without stretching rows excessively |
| Tool grids | `2` columns at small/medium widths and `3` columns at large widths |
| Wide desktops | Bounded reading width plus meaningful side breathing room |

The initial target should be more open than `1024px`, but still intentionally
bounded. Verify at `390px`, `768px`, `1024px`, `1440px`, and `1556px`.

### 4.2 Public page

- The header remains transparent above the hero and becomes a compact glass header
  after scrolling.
- The hero and CTA remain visually connected.
- The tool section uses the public neighborhood tools heading.
- Cards remain full-width on mobile and consistent across grid rows.

### 4.3 App shell

- Remove overflow constraints that produce an inner scrollbar or arrow artifact.
- Keep the header height predictable.
- Navigation remains horizontally scrollable on narrow screens.
- Navigation tabs use one clear active indicator.
- Preserve Clerk's `UserButton` without wrapping or clipping.

### 4.4 Footer

At mobile widths:

- Use one column
- Center or consistently left-align the two regions
- Keep the first region readable instead of forcing it onto a cramped two-line
  alignment
- Stack or wrap the secondary labels cleanly

At desktop widths:

- Place the primary copyright/message at the left
- Place supporting labels at the right

---

## 5. Content and Navigation

### 5.1 Rename public catalogue

Replace `Public catalog` with one consistent phrase, preferably:

- `Neighborhood tools`

Supporting copy:

- `Tools available to share around you`

### 5.2 Rename board navigation

The term `Board` may remain only if product language clearly supports it. Prefer
the calmer, more direct label:

- `Explore tools`

Use the same term in:

- Header destination
- App navigation
- Empty-state links
- Page-level descriptions

### 5.3 Signed-out behavior

When signed out:

- Header: `Sign in`
- Hero or public CTA: `Sign in to explore`
- Public tool card: `Sign in to borrow`
- No authenticated-only controls are shown

### 5.4 Signed-in behavior

When signed in:

- Header: `Explore tools`
- Hero CTA: `Explore tools`
- Public tool card: `View tool` or `Request`
- No button remains labeled `Sign in`

The route destination for a signed-in visitor is `/app`.

---

## 6. Tool Card and Request States

### 6.1 Card information

Each card should show:

- Category
- Tool name
- Availability or request state
- Owner name
- Trusted owner marker when applicable
- A clear single action

### 6.2 Available states

Use these states consistently:

| State | Display |
| --- | --- |
| Available | Open request action |
| Your listing | Disabled or navigates to My listings |
| Already requested | `Pending request` with disabled action |
| Approved loan in progress | `On loan` |
| Other member pending request conflict | `Unavailable for those dates` |
| No match from search/filter | Existing empty state |

### 6.3 Request lifecycle

The borrowing flow must reflect real backend state, not just card UI.

1. A member may submit a request for one tool and date range.
2. A member may have only one pending request per tool.
3. The card hides or disables the repeat request action after that member has
   submitted a pending request.
4. A member may browse proposed dates in the request sheet.
5. Proposed dates become unavailable while another pending or approved request
   reserves all or part of that range.
6. An owner can decline or approve a pending request.
7. A borrower or owner can cancel a pending request.
8. Cancelling or declining a pending request releases its reserved dates.
9. Approval creates an active reservation and continues to block overlap.
10. Marking the loan returned releases the item for future dates.

The backend and UI must use the same overlap rules. Pending overlap and approved
overlap should be enforced atomically before a request is inserted.

### 6.4 Request sheet

- Disabled dates must include approved and reserving pending ranges.
- Preserve the existing maximum 30-day booking range.
- Keep the past-date and end-before-start validation.
- Show a concise conflict message if the request state changes while the sheet is
  open.
- Keep the submit button disabled until a valid range is selected.
- After success, close the sheet and immediately update the card state.
- After cancellation or decline, re-enable only the dates that become free.

This behavior requires the authenticated board query to include the current
user's pending request state and pending reservations. It should not leak
borrower identities into the public catalogue.

---

## 7. Loading and Empty States

### 7.1 Loading card

Use [docs/loading_card.tsx](/workspaces/lendloop/docs/loading_card.tsx) as the
starting implementation.

Retain:

- Real card-shaped silhouettes
- Independent card count
- Stable grid sizing
- SVG shimmer instead of multiple generic pulse blocks
- Reduced-motion fallback
- `role="status"`, `aria-busy="true"`, and an accessible loading label
- No loading text that misleads the user into thinking data has arrived

Adapt it to LendLoop:

- Replace green base and shimmer colors with existing/theme-compatible cyan,
  sapphire, and neutral glass tokens
- Preserve a card height matched to the real board or public cards
- Use the grid's real minimum and maximum column behavior
- Add a theme-aware CSS variable rather than hard-coded product colors
- Ensure SVG mask IDs remain unique

Do not add the loading card component unless it is used consistently across:

- Public neighbourhood tool loading
- Authenticated board loading
- Listings loading
- Request and incoming-loan loading

### 7.2 Prevent layout jumps

- Render loading cards with the same height and grid dimensions as loaded cards.
- Use the same card count or a stable minimum count.
- Do not flash an empty state before a query resolves.
- Keep filters and search controls mounted while cards load.
- Preserve the existing toolbar position.

### 7.3 Empty states

Replace dashed-wireframe empties with a single atmospheric glass panel:

- One quiet radial spotlight
- Clear headline
- Short supporting copy
- One primary action
- No repeated decorative icon stacks

---

## 8. Page-Specific Refinement

### Public page

- [Hero](/workspaces/lendloop/src/components/hero.tsx): follow the Animated
  Kangaroo-inspired animated editorial treatment
- [Header](/workspaces/lendloop/src/components/header.tsx): transparent-to-glass
  scroll transition
- [Tool grid](/workspaces/lendloop/src/components/tool-grid.tsx): livelier card
  entrance, hover, and border glow
- Public cards: no owner details unless the user is authenticated
- CTA/trust region: recompose it as one clear component instead of a CTA followed
  by unrelated trust sentence

### Authenticated board

- Add glowing search focus without making the input excessively large
- Keep category filters in a stable row or wrap row
- Disable clear, unavailable, owner, and pending actions appropriately
- Show pending status and date conflict state
- Preserve smooth filter layout transitions

### Listings

- Retain the existing sheet pattern
- Restyle it with the same dark glass and border system
- Clear primary and destructive actions
- Prevent layout jumps when a listing is removed or a form opens

### Requests and incoming requests

- Use status badges with strong, accessible contrast
- Keep approval and decline actions visually distinct
- Use responsive action wrapping
- Add concise date and status copy
- Animate only the row that changes

### Admin

- Preserve the terminal-like utility character
- Use readable monospace for event data
- Avoid making administrative errors visually disappear into background noise

---

## 9. Interaction and Accessibility Requirements

### Cursor

Apply cursor behavior globally and semantically:

- `button:not(:disabled)`, `a`, and `[role="button"]`: `cursor-pointer`
- Disabled controls: `cursor-not-allowed`
- Loading controls: `cursor-wait`
- Draggable or non-interactive elements: no pointer cue

Cards themselves only get pointer/hover behavior when the whole card is
clickable. Use buttons or links for actual actions.

### Keyboard and focus

- Preserve visible focus rings
- Use focus states with sufficient cyan or neutral contrast
- Keep dialog and sheet focus trapping
- Restore focus after modal close
- Announce loading and mutation results

### Contrast

- Validate cyan text and borders against dark surfaces
- Do not use pale text on similarly pale violet backgrounds
- Ensure status badges do not rely on color alone
- Preserve button labels on disabled states

### Reduced motion

- Remove entrance and hover movement for `prefers-reduced-motion`
- Disable shimmer sweep and show a static light surface
- Keep opacity and state changes instant or near-instant

---

## 10. Implementation Phases

### Phase 1 — Design tokens and responsive foundation

- Replace or complement the existing paper token system for the selected dark
  visual direction
- Add the Animated Kangaroo-inspired midnight, cyan, violet, and glass tokens
- Re-establish body and page backdrops
- Add bounded content-container utilities
- Add global interaction cursor states
- Fix mobile footer alignment
- Remove overflow and scrollbar artifacts

### Phase 2 — Public hero and header

- Implement the animated editorial hero
- Implement transparent-to-glass header behavior
- Recompose the public CTA and trust block
- Rename public catalogue copy
- Fix signed-out and signed-in CTAs

### Phase 3 — Shared loading, cards, and states

- Add the adapted loading-card implementation
- Replace public and app pulse skeletons
- Restyle tool cards and grid motion
- Implement clear card state labels
- Improve empty states

### Phase 4 — Backend request reservation rules

- Extend Convex queries with the authenticated member's pending state
- Enforce pending overlap rules in mutation logic
- Verify cancellation and decline release reserved dates
- Verify approval and return lifecycle behavior
- Add focused backend tests for cross-member overlap

### Phase 5 — App shell and sub-pages

- Restyle app navigation
- Update request, incoming, listings, and admin surfaces
- Remove remaining `Board` labels where direct product language is clearer
- Verify sheets, focus states, and responsive wrapping

### Phase 6 — Verification and cleanup

- Test at required viewport widths
- Test authenticated and unauthenticated states
- Test loading, error, empty, and success states
- Run backend tests
- Run lint, typecheck/build, and focused UI checks
- Remove obsolete plan and style fragments

---

## 11. Backend Verification Checklist

- One borrower cannot submit two pending requests for the same tool
- Two borrowers cannot submit overlapping pending ranges
- Owner approval cannot create an overlap with any existing approved range
- Declining a pending request releases proposed dates
- Borrower cancellation of a pending request releases proposed dates
- Owner cannot cancel via the borrower-only mutation
- Returned loans do not block future dates
- Public catalogue does not expose owner identity or loan details
- Board data does not expose borrower identities between unrelated members

---

## 12. Final Verification Checklist

- [ ] Hero follows the lively Animated Kangaroo-style direction
- [ ] Midnight, cyan, violet, and glass elements are cohesive
- [ ] Desktop pages are not limited to `1024px`
- [ ] Public and app layouts work at all required viewport widths
- [ ] Footer aligns correctly on mobile and desktop
- [ ] Header has no scrollbar or avatar overflow artifact
- [ ] Every interactive element has the correct cursor
- [ ] Signed-out copy has no authenticated-only phrasing
- [ ] Signed-in copy has no remaining sign-in CTA
- [ ] "Neighborhood tools" replaces "Public catalog"
- [ ] `Board` is replaced or clearly justified as product language
- [ ] Request cards show pending, unavailable, owner, and loan states
- [ ] Pending and approved date overlap rules are covered by tests
- [ ] Cancellation and decline release dates
- [ ] Loading cards are stable and accessible
- [ ] Reduced-motion behavior is implemented
- [ ] Keyboard, focus, contrast, and screen-reader states are usable
- [ ] The public catalogue and authenticated board remain visually consistent
- [ ] Lint and build pass
