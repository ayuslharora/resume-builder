# Shared Resume Token Design

**Problem**

The app has a rough public resume path that exposes raw resume IDs and does not match the desired access model. Users need an explicit publish option that gives them a shareable URL, but viewers must log in before they can see the resume.

**Goal**

Let resume owners publish a resume, receive a shareable token-based URL, and allow any logged-in user with that URL to view the resume. Unpublishing must revoke the link.

**Design**

**Publishing model**

- Each resume gets:
  - `isShared: boolean`
  - `shareToken: string | null`
- Publishing turns on `isShared` and ensures a token exists.
- Unpublishing turns off `isShared`. The token may remain stored, but the route must refuse access while unpublished.

**Route model**

- Shared URLs use `/shared/:token`.
- The route is auth-gated.
- If a logged-out viewer opens the link, the app redirects them to login and then back to the exact shared URL after successful authentication.

**Access model**

- Any logged-in user with a valid token can view the resume.
- The viewer does not need to be the owner.
- The app resolves the token to a resume document and then checks `isShared === true`.

**User experience**

- Owners get a `Publish Resume` action.
- After publishing, a `Copy Link` action becomes available.
- If the resume is already published, the UI should show that state clearly and allow `Unpublish`.
- Shared viewers see the same read-only resume preview layout without edit controls.

**Implementation notes**

- Add a Firestore lookup by `shareToken`.
- Replace raw `/p/:resumeId` sharing with token-based sharing.
- Preserve the full shared URL in login redirect state.

**Testing**

- Add focused tests for token generation and shared URL building.
- Add focused tests for login redirect preservation and token-based shared route references where practical.
