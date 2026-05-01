# Creator Credit Design

**Problem**

The product does not currently credit its creator inside the app or on shared resume pages. The user wants a visible but restrained attribution that points to their portfolio without making the interface feel promotional.

**Goal**

Add a subtle linked credit that points to `https://Ayuslh.in` in both the signed in app and the public shared resume page.

**Design**

**Public shared resume page**

- Add the credit to the shared resume page chrome, not inside the resume document itself.
- Keep the credit visually secondary to the existing ResuMe branding and `Build Yours` action.
- Use the exact text `Created by Ayush`.
- Link to `https://Ayuslh.in`.
- Open the portfolio in a new tab with safe external link attributes.
- Preserve the current desktop and mobile structure, only adding a low emphasis inline text link that matches the existing color system.

**Signed in app profile section**

- Add the credit inside the existing profile section so attribution feels integrated with the account area.
- On desktop, place the credit beneath the user name area in the sidebar footer.
- On mobile, place the same information in the profile screen or the existing profile section entry point rather than near the bottom navigation.
- Show both the creator name and the portfolio link in this area.
- Keep the styling understated and consistent with current typography and spacing.

**Behavior**

- The credit is purely navigational and does not affect app state.
- The link should be keyboard accessible.
- The link should not replace any current primary navigation or call to action.

**Implementation notes**

- Update the public resume page component to render the new external credit link.
- Update the profile related layout components so the credit appears inside the account area on desktop and mobile.
- Reuse existing utility classes and visual tokens where possible instead of introducing a new branding pattern.

**Testing**

- Add focused checks that the public resume page includes `Created by Ayush` and links to `https://Ayuslh.in`.
- Add focused checks that the signed in app profile area renders the creator name and portfolio link in the intended layout components.
- Keep tests narrow and structural rather than snapshot heavy.
