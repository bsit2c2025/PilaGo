# PilaGo Design System
**Version:** 1.0 · **Status:** Proposed foundation · **Format:** AI/developer reference

> PilaGo is a Filipino tricycle queue-management web application. This guide defines a friendly, modern SaaS visual system with a subtle Filipino identity. It is a proposed design direction, not a record of an already-approved production brand.

## 1. Brand foundation

### Purpose
Digitize the familiar Filipino *pila* system so passengers, drivers, and terminal administrators can coordinate turns with greater fairness, transparency, order, and efficiency.

### Brand promise
**A fairer, clearer pila for everyone.**

### Personality
- Friendly and approachable, never childish.
- Dependable and orderly, never bureaucratic.
- Modern and efficient, while familiar to local communities.
- Inclusive of passengers, drivers, and administrators equally.

### Design principles
1. **Fairness is visible:** make queue order, position, and dispatch status easy to understand.
2. **The next action is obvious:** each role should quickly see what to do next.
3. **Local, not ornamental:** Filipino identity appears through thoughtful cues, not decorative overload.
4. **Readable in real conditions:** strong contrast, clear hierarchy, large queue numbers, and responsive layouts.
5. **One system, role-aware views:** a shared component language adapts to each user's task.

## 2. Logo exploration — three proposed directions

No official PilaGo logo was supplied. Treat these as concept territories for future exploration, not final approved marks.

### Concept 1 — Tricycle Mark
A simplified, geometric tricycle silhouette with a compact wordmark. The mark should remain recognizable at small sizes and avoid excessive mechanical detail.
- Meaning: direct connection to local transport and the people who use it.
- Best use: app icon, driver-facing touchpoints, terminal signage.
- Caution: keep the silhouette abstract enough to avoid looking like a vehicle brand or clip art.

### Concept 2 — Queue Mark
A compact arrangement of three or four aligned forms, lanes, or dots suggesting orderly movement and a fair turn sequence.
- Meaning: organized queues, transparency, and predictable progress.
- Best use: software interface, favicon, dashboard identity.
- Caution: avoid generic list/checklist symbolism; introduce a distinctive rhythm or negative-space detail.

### Concept 3 — Filipino Journey Mark
A simple movement/route symbol with a restrained sun or star reference inspired by the Philippine flag.
- Meaning: local identity, movement, and shared journeys.
- Best use: broader brand storytelling and community-facing materials.
- Caution: use the sun/star cue subtly; do not reproduce the flag as a literal logo or make the mark overly patriotic/decorative.

### Logo system requirements
- Primary lockup: symbol + “PilaGo” wordmark.
- Secondary lockup: horizontal and stacked versions.
- Symbol-only: square app icon and favicon.
- Monochrome: one-color dark and one-color light versions.
- Clear space: at least the height of the lowercase “o” around the lockup.
- Minimum digital size: symbol 20 px; full lockup 110 px wide (validate after final artwork).
- Do not stretch, rotate, add effects, change proportions, or place low-contrast marks on busy backgrounds.

**Selection status:** all three concepts remain exploratory. Choose and refine one direction before production use.

## 3. Color system

The palette is a custom interpretation of Philippine flag colors: deep blue anchors trust and structure, warm golden yellow signals attention and progress, and restrained red is reserved for important exceptions. Green and neutrals complete the functional system.

### Core palette

| Token | HEX | Role |
|---|---:|---|
| `brand-900` | `#12345A` | Deep brand blue; headers, strong emphasis |
| `brand-800` | `#174675` | Primary dark blue |
| `brand-700` | `#1D5B91` | Primary interaction |
| `brand-600` | `#2876B8` | Primary buttons and links |
| `brand-500` | `#3D8BCB` | Highlight / active accents |
| `brand-100` | `#E8F2FA` | Soft brand surface |
| `brand-50` | `#F4F8FC` | Subtle background |
| `gold-700` | `#A96F08` | Dark gold text/icon on light surfaces |
| `gold-500` | `#E5A928` | Main golden accent |
| `gold-100` | `#FFF4D8` | Highlight surface |
| `red-700` | `#B83232` | Destructive / cancelled |
| `red-100` | `#FCE8E8` | Destructive soft surface |
| `green-700` | `#24734A` | Success / completed |
| `green-100` | `#E5F4EB` | Success soft surface |
| `gray-950` | `#17212B` | Main text |
| `gray-700` | `#465564` | Secondary text |
| `gray-500` | `#718096` | Muted text |
| `gray-300` | `#D7DEE6` | Borders |
| `gray-200` | `#E7ECF1` | Dividers |
| `gray-100` | `#F3F6F8` | Subtle surface |
| `white` | `#FFFFFF` | Cards / page surfaces |

### Semantic queue colors
Never communicate status by color alone. Pair every status with a text label and, where useful, an icon.

| Status | Foreground | Soft surface | Meaning |
|---|---|---|---|
| Waiting | `#1D5B91` | `#E8F2FA` | Passenger is in the queue |
| Next in line | `#8A5B00` | `#FFF4D8` | Passenger is approaching their turn |
| Dispatched | `#174675` | `#E8F2FA` | Turn assigned / driver dispatched |
| Completed | `#24734A` | `#E5F4EB` | Trip or transaction completed |
| Cancelled | `#B83232` | `#FCE8E8` | Queue entry cancelled |
| Unavailable | `#465564` | `#F3F6F8` | Driver or service unavailable |

### Light theme tokens
- Page background: `#F7F9FB`
- Surface: `#FFFFFF`
- Elevated surface: `#FFFFFF`
- Primary text: `#17212B`
- Secondary text: `#465564`
- Border: `#D7DEE6`
- Primary action: `#2876B8`
- Focus ring: `#3D8BCB` with a visible 2 px outline and offset.

### Dark theme tokens
- Page background: `#101923`
- Surface: `#172432`
- Elevated surface: `#1D2D3D`
- Primary text: `#F4F7FA`
- Secondary text: `#B7C4D0`
- Border: `#344657`
- Primary action: `#69A9DA`
- Focus ring: `#8CC5EF`

Use the same semantic meaning in both themes. Re-check status badge contrast in dark mode rather than mechanically inverting light colors.

## 4. Typography

**Primary typeface: Nunito Sans.** Use a friendly, rounded sans-serif with clear numerals and strong legibility. If unavailable, use `Inter`, then system sans-serif.

| Style | Size / line height | Weight | Typical use |
|---|---|---:|---|
| Display | 36 / 44 px | 800 | Large passenger queue number |
| H1 | 30 / 38 px | 800 | Page title |
| H2 | 24 / 32 px | 700 | Section title |
| H3 | 20 / 28 px | 700 | Card title |
| H4 | 16 / 24 px | 700 | Subsection |
| Body large | 16 / 24 px | 400–600 | Main explanatory text |
| Body | 14 / 22 px | 400–600 | Default interface text |
| Label | 12 / 16 px | 700 | Field labels, metadata |
| Caption | 12 / 16 px | 400 | Helper text, timestamps |
| Numeric emphasis | 40–56 / 1.1 | 800 | Queue numbers and key metrics |

Use tabular numerals for queue numbers, times, counts, and financial values. Avoid long passages in all caps. Keep labels concise and sentence case.

## 5. Shape, spacing, and elevation

### Shape language
Balanced and practical: rounded cards, moderately rounded buttons, and structured tables.
- Small controls: 8 px radius.
- Inputs and buttons: 10 px radius.
- Cards: 14 px radius.
- Large panels / dialogs: 16 px radius.
- Pills: fully rounded only for compact status tags and filters.

### Spacing scale
Use a 4 px base unit.
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px`

Default content padding: 24 px desktop, 16 px tablet, 16 px mobile. Keep dense admin tables compact but preserve row readability.

### Borders and shadows
- Standard border: 1 px solid `gray-300` (light) / dark border token.
- Card shadow: subtle, e.g. `0 2px 8px rgba(18, 52, 90, 0.06)`.
- Dialog shadow: stronger but restrained.
- Prefer borders and spacing over heavy shadows.

## 6. Layout and responsive behavior

### Application shell
- Desktop: persistent left sidebar, top bar for page context and account actions, main content area.
- Tablet: collapsible sidebar or compact rail; keep primary actions visible.
- Mobile: simplified top bar and bottom navigation for frequent passenger/driver tasks; admin tables may use horizontal scroll or responsive stacked records.

### Breakpoints
Use these as practical defaults; adjust to the actual content:
- Mobile: `< 640 px`
- Tablet: `640–1023 px`
- Desktop: `≥ 1024 px`
- Wide desktop: `≥ 1280 px`

### Information density
- Passenger: spacious, reassuring, focused on current queue state.
- Driver: focused and operational, with dispatch actions immediately visible.
- Admin: balanced density, clear filters, tables, summary cards, and analytics.

## 7. Navigation and role-specific information architecture

### Passenger
Primary destinations: Home / Join Queue, My Queue, Notifications, Profile.
The main screen should prioritize terminal selection, join-queue action, queue number, position, and live progress.

### Driver
Primary destinations: Dispatch, Queue, Availability, History, Profile.
Prioritize current turn, next passenger, dispatch confirmation, and availability state. Avoid ambiguous destructive actions.

### Administrator
Primary destinations: Overview, Terminals, Drivers, Passengers, Queue Records, Transactions, Reports, Settings.
Use a consistent sidebar, page title, filter row, data table, and contextual actions.

Use role-based access and navigation labels that reflect actual permissions. Do not show controls that the signed-in role cannot use.

## 8. Core component guidance

The implementation target is **React + Tailwind CSS + shadcn/ui**. Treat shadcn/ui as an accessible component foundation and apply PilaGo tokens consistently. Do not allow default component styling to drift between screens.

### Buttons
- Primary: brand blue fill, white text.
- Secondary: neutral surface, border, dark text.
- Tertiary/ghost: transparent, brand-colored text.
- Destructive: red treatment and explicit action wording.
- Heights: 40 px standard, 44–48 px for prominent mobile actions.
- Include hover, focus-visible, pressed, disabled, and loading states.

### Inputs
- 40–44 px minimum height.
- Persistent labels; placeholders are examples, not substitutes for labels.
- Show validation text close to the field.
- Use visible focus rings and clear error states.
- Support keyboard and screen-reader use.

### Cards
- White/dark surface, 1 px border, 14 px radius.
- Use consistent internal padding (16–24 px).
- Separate card title, context, and action areas.

### Tables
- Use clear column labels, aligned numeric columns, row hover, and visible sorting/filter states.
- Keep critical status visible as text plus semantic badge.
- Provide empty, loading, error, and no-results states.
- On narrow screens, prioritize key columns or convert records to stacked cards.

### Status badges
Use compact labels with optional icons. Avoid using color alone and avoid excessively saturated fills.

### Dialogs and confirmations
Confirm irreversible actions (e.g. cancel queue entry, remove driver, close terminal). State the consequence in plain language and make the safe action easy to identify.

### Notifications
Use concise titles, one-sentence explanations, timestamps, and a clear destination/action when relevant. Distinguish informational, success, warning, and error messages.

## 9. Queue and dispatch patterns

### Passenger queue card
Show, in order:
1. Current status label.
2. Large queue number.
3. Position or people ahead.
4. Terminal name.
5. Progress indicator with text equivalent (e.g. “3 people ahead”).
6. Last-updated timestamp and notification preferences.

Do not promise an exact wait time unless the system has reliable data to calculate it. If an estimate is shown, label it as an estimate.

### Driver dispatch panel
Show:
- Driver availability state.
- Current turn / passenger assignment.
- Next in queue.
- Clear dispatch action and confirmation.
- Queue sequence and recent activity.
- A visible way to pause or mark unavailable, with reason if required.

### Admin queue overview
Show:
- Queue totals by status.
- Active terminal selector.
- Filterable queue table.
- Driver availability and dispatch state.
- Exception alerts (stalled queue, unavailable driver, repeated cancellation).
- Clear timestamp and data freshness indicator.

Real-time updates should not cause disorienting layout jumps. Announce meaningful changes accessibly and preserve the user's current focus.

## 10. Dashboard and analytics

Use a restrained dashboard: a small set of summary cards, one or two useful charts, and a readable data table. Avoid decorative charts that do not support a decision.

Suggested metrics (only when supported by actual data):
- Active queue count.
- Passengers served today.
- Available drivers.
- Average waiting time.
- Completed trips / transactions.
- Cancellation rate.

Use brand blue as the primary chart color and gold only for meaningful highlights. Label axes, units, date ranges, and data sources. Never imply live data if the dashboard is showing a delayed or cached snapshot.

## 11. Language and content

Default language: English, with Filipino/Tagalog available through a visible language switcher. Translations should sound natural and familiar rather than word-for-word. Keep terminology consistent across roles.

Content principles:
- Short, direct sentences.
- Familiar terms such as “Queue”, “Your turn”, “Next in line”, and “Available”.
- Avoid jargon and blame-oriented error messages.
- Explain what happened and what the user can do next.
- Keep numbers and time formats consistent within a locale.

Example:
- English: “You’re in the queue. We’ll notify you when your turn is near.”
- Filipino: “Nasa pila ka na. Aabisuhan ka namin kapag malapit na ang iyong turn.”

## 12. Iconography and cultural cues

Use rounded Lucide line icons for standard interface actions. Use custom Filipino transportation illustrations sparingly for empty states, onboarding, and help content.

Approved visual cues:
- Philippine sun and stars, abstracted and used sparingly.
- Tricycle / terminal / route motifs.
- Everyday terminal signage and wayfinding conventions.

Avoid flag wallpaper, excessive sunbursts, decorative borders on every card, stereotypes, or ornamental motifs that reduce legibility.

## 13. Motion and interaction

Use subtle, purposeful motion:
- Button press feedback.
- Gentle status transitions.
- Small notification entrance.
- Queue progress changes that are easy to follow.

Respect `prefers-reduced-motion`. Never use motion as the only way to communicate a state change. Avoid flashing, bouncing, or continuous decorative animation.

## 14. Accessibility and usability

- Target WCAG 2.2 AA contrast for text and controls.
- Use visible keyboard focus.
- Provide semantic headings, labels, and button names.
- Ensure touch targets are preferably at least 44 × 44 px.
- Do not encode meaning by color alone.
- Support zoom and responsive reflow.
- Announce important queue changes to assistive technology without repeatedly interrupting users.
- Ensure tables, dialogs, menus, and forms are keyboard operable.

## 15. UI screen blueprint and mockup guidance

The companion printable guide contains low-fidelity wireframe descriptions and high-fidelity visual direction for the following views. These are reference layouts, not production screenshots.

### Passenger — mobile / tablet / desktop
- Primary: queue number and status.
- Secondary: terminal, people ahead, progress, notifications.
- Desktop can add queue history and terminal information in a side column.
- Mobile uses a clear bottom navigation and a single dominant “Join Queue” action when not queued.

### Driver — mobile / tablet / desktop
- Primary: current assignment and next passenger.
- Secondary: availability, dispatch action, queue list, recent activity.
- Mobile keeps the dispatch action prominent and avoids dense multi-column tables.
- Tablet and desktop may show a queue list beside the active assignment panel.

### Admin — mobile / tablet / desktop
- Primary: operational summary and terminal status.
- Secondary: filterable queue, driver availability, transaction and passenger records.
- Desktop uses sidebar + top bar + multi-column dashboard.
- Tablet collapses navigation and reduces columns.
- Mobile prioritizes alerts and key metrics; detailed tables become stacked records or scrollable views.

## 16. Implementation notes for AI tools and developers

When generating PilaGo interfaces:
1. Use React, Tailwind CSS, and shadcn/ui.
2. Use Nunito Sans with a sensible system fallback.
3. Centralize the palette and semantic tokens; do not scatter raw HEX values through components.
4. Build shared components for buttons, inputs, cards, badges, tables, dialogs, and notifications.
5. Use role-aware page layouts while keeping shared components consistent.
6. Design responsive behavior intentionally at mobile, tablet, and desktop sizes.
7. Include loading, empty, error, disabled, success, and permission-denied states.
8. Keep queue number, queue position, and dispatch status visually unambiguous.
9. Use realistic but fictional sample data in mockups; never present sample metrics as real.
10. Treat the logo concepts as provisional until a direction is formally selected.

### Suggested semantic token names
`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--success`, `--warning`, `--info`.

## 17. Scope and assumptions

Included product capabilities:
- Passenger and driver registration/login.
- Administrator authentication and roles.
- Join terminal queue; view queue number and position.
- Real-time queue updates.
- Driver dispatch, turn management, and availability.
- Terminal/location management.
- Passenger and driver records.
- Queue history and transaction records.
- Notifications and alerts.
- Dashboard statistics and analytics.
- Search, filters, and data tables.
- QR scanning/verification.
- Reports and data exports.

This design system does not define backend behavior, security architecture, legal requirements, exact wait-time algorithms, or final brand artwork. Those require separate product and technical decisions.
