# Mobile Bottom Navigation Design

## Goal

Replace the current mobile hamburger drawer navigation with a fixed bottom navigation bar while preserving the existing desktop sidebar behavior.

## Scope

- Desktop navigation remains unchanged.
- Mobile navigation changes from a top bar + slide-out drawer to a fixed bottom bar.
- The mobile bar includes five actions:
  - Dashboard
  - Grader
  - New
  - Resources
  - Profile

## Navigation Behavior

- `Dashboard`, `Grader`, `Resources`, and `Profile` behave as standard route links.
- `New` is the center action and navigates directly to `/builder/new`.
- The active route is visually highlighted in the bottom bar.
- The old mobile hamburger button, drawer, and backdrop are removed.

## Layout Changes

- The mobile top spacing previously reserved for the fixed top bar is removed.
- Mobile pages receive bottom padding so content is not obscured by the fixed bottom navigation.
- Desktop spacing and left offset remain unchanged.

## Component Design

- `src/components/layout/Sidebar.jsx` remains the shared navigation source.
- The component continues to render the desktop sidebar on large screens.
- On mobile, the component renders a separate fixed bottom navigation variant using the same route definitions where practical.
- Profile display details that currently live in the desktop sidebar footer are reduced to a profile icon action on mobile.

## Visual Direction

- Match the existing blue glassmorphism UI language.
- Keep the bottom bar compact, readable, and touch-friendly.
- Make the `New` action more prominent than the surrounding tabs.
- Use clear icon-first navigation with short labels.

## Error Handling And Edge Cases

- If user profile data has not loaded yet, the mobile profile tab still renders with a fallback avatar initial.
- Route changes should not require mobile drawer state cleanup because the drawer is removed.

## Testing

- Verify desktop sidebar still renders and functions as before.
- Verify mobile bottom bar is fixed and visible on authenticated app screens.
- Verify each mobile action routes correctly.
- Verify page content is not covered by the bottom bar on common mobile viewport sizes.
