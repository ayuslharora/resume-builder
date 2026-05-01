# Creator Credit Design

**Problem**

The product does not currently credit its creator inside the app or on shared resume pages. The user wants a visible but restrained attribution that points to their portfolio without making the interface feel promotional.

**Goal**

Add a subtle linked credit that reads `Created by Ayush` and points to `https://Ayuslh.in` in both the signed in app shell and the public shared resume page.

**Design**

**Public shared resume page**

- Add the credit to the shared resume page chrome, not inside the resume document itself.
- Keep the credit visually secondary to the existing ResuMe branding and `Build Yours` action.
- Use the exact text `Created by Ayush`.
- Link to `https://Ayuslh.in`.
- Open the portfolio in a new tab with safe external link attributes.
- Preserve the current desktop and mobile structure, only adding a low emphasis inline text link that matches the existing color system.

**Signed in app shell**

- Add the same credit to the persistent app shell so attribution is visible while using the product.
- On desktop, place the credit in the sidebar footer beneath the user account area.
- On mobile, place a compact version in a low priority shell area that does not compete with the bottom navigation actions.
- Use the same text and destination as the public page.
- Keep the styling understated and consistent with current typography and spacing.

**Behavior**

- The credit is purely navigational and does not affect app state.
- The link should be keyboard accessible.
- The link should not replace any current primary navigation or call to action.

**Implementation notes**

- Update the public resume page component to render the new external credit link.
- Update the shared app shell component set so the credit appears in both desktop and mobile layouts.
- Reuse existing utility classes and visual tokens where possible instead of introducing a new branding pattern.

**Testing**

- Add focused checks that the public resume page includes `Created by Ayush` and links to `https://Ayuslh.in`.
- Add focused checks that the signed in app shell renders the same credit in the intended layout components.
- Keep tests narrow and structural rather than snapshot heavy.
