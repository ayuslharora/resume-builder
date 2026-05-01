# Builder Mobile Usability Design

## Goal

Make the resume builder usable on phones without changing desktop behavior.

## Scope

- Apply changes only below the `lg` breakpoint.
- Preserve the current desktop layout, spacing, and interaction model.
- Improve the shared builder shell and the builder steps that currently become cramped or overflow on phones.

## Current Problems

- The sticky builder header is too dense on phones when the back button and step indicator share one row.
- The step indicator tries to show the desktop presentation on narrow widths, which makes labels and spacing unreadable.
- Step cards and footer actions are sized for desktop first, so controls feel cramped and can be obscured by the mobile bottom navigation.
- Upload, template, generate, and edit screens each contain mobile-specific width or spacing pressure that makes the flow feel broken even when content technically fits.

## Non-Goals

- No desktop visual changes.
- No builder step reorder or logic changes.
- No redesign of the existing desktop edit experience.
- No change to backend, persistence, or generation behavior.

## Architecture

### Shared Builder Shell

`src/pages/Builder.jsx` remains the orchestration layer for step rendering, but gets mobile-only layout adjustments:

- The sticky top bar becomes phone-safe below `lg`, allowing compact spacing and vertical stacking when needed.
- The main content area keeps the current desktop spacing while using mobile-specific bottom padding so step actions are not covered by the fixed bottom navigation.
- Step 4 scroll-lock behavior remains functionally unchanged unless a mobile overflow issue requires a narrow, scoped adjustment.

### Step Indicator

`src/components/builder/StepIndicator.jsx` gets a responsive rendering mode:

- Desktop keeps the current five-step track and labels unchanged.
- Mobile uses a compact presentation that favors readable progress over full desktop labels.
- The mobile version should avoid horizontal crowding and preserve clear current-step feedback.

### Step Cards And Actions

Shared card and button layout behavior in `src/index.css` and step components is adjusted only for mobile:

- Step cards use tighter mobile spacing.
- Footer action rows can stack or wrap on phones.
- Buttons become easier to tap and less likely to compress into unusable widths.

## Step-Specific Changes

### Interview Step

- Keep the existing content structure.
- Make the footer actions phone-safe by allowing stacked or full-width behavior below `lg`.
- Ensure radio options can wrap cleanly on narrow screens.

### Upload Step

- Let the upload/paste segmented control wrap instead of forcing a single tight row.
- Keep the upload zone large enough to tap while reducing wasted vertical space on phones.
- Stack footer actions on narrow screens where side-by-side buttons feel cramped.

### Template Step

- Keep mobile as a single-column card list.
- Tighten spacing around previews and footer controls.
- Make the next action full-width or stacked on phones if needed for clarity.

### Generate Step

- Preserve the current generation flow.
- Adjust the container height and padding on phones so the status card and footer remain visible without awkward clipping.
- Keep desktop height behavior unchanged.

### Edit Step

- Preserve the desktop split layout exactly.
- On mobile, reduce toolbar density and allow action groups to wrap.
- Ensure preview chrome, ATS actions, and completion controls do not overflow horizontally.
- Preserve the current editing model while making the mobile view operable rather than desktop-compressed.

## Data Flow

- No data model changes.
- No new state ownership changes.
- Responsive behavior is driven by CSS classes and, where necessary, simple conditional rendering in the builder UI.

## Error Handling

- Existing step validation and error messaging remain unchanged.
- Mobile layout changes must not hide error banners, retry controls, or save/progress actions behind fixed UI.

## Testing

- Verify builder steps 1 through 5 at a narrow mobile viewport.
- Verify no horizontal scrolling is introduced in the builder shell or individual steps.
- Verify the mobile bottom navigation does not cover step actions.
- Verify the desktop builder remains visually unchanged at `lg` and above.
- Verify the sticky header still works on mobile and desktop.

## Implementation Notes

- Favor mobile-first overrides with `lg:` preserving existing desktop classes.
- Prefer narrow JSX changes in builder step components over global CSS rewrites.
- If the compact mobile step indicator needs alternate copy, use short labels or progress text only on mobile rather than shrinking the desktop version.
