# Resume Cloud Persistence Design

**Problem**

Resume data is currently mirrored into browser `localStorage` and then merged back into Firestore reads. That causes two classes of issues:
- Deleted resumes can reappear from stale local cache.
- Resume data can survive sign-out in the same browser profile, which is the wrong privacy posture for account-scoped documents.

**Goal**

Remove `localStorage` as a persistence layer for resumes. Resume documents and resume lists should come only from Firestore. Builder edits may remain in React memory while the current tab is open, but they should not survive a refresh unless the cloud save succeeds.

**Design**

**Persistence model**

- Firestore becomes the only persisted source of truth for resume documents and resume lists.
- The builder keeps its current in-session state in `ResumeContext` while the tab is open.
- No resume list or resume document data is written to or restored from `localStorage`.

**Read flow**

- Dashboard, Resumes, and Sidebar fetch resumes from `getUserResumes(userId)` and render only the Firestore result.
- Builder load for an existing resume fetches from `getResume(resumeId)` and hydrates the reducer from that response.
- There is no cached bootstrap state for list or detail reads.

**Write flow**

- `createResume` persists directly to Firestore and returns the created document ID.
- `updateResume` writes merged data to Firestore and does not maintain a browser cache mirror.
- `deleteResume` removes the Firestore document and the UI removes the item only after the delete succeeds.
- If a save fails, current in-memory builder state remains available in the open tab, but the app does not promise persistence across refresh.

**Error handling**

- Save failures should not silently create browser-persistent shadow state.
- Delete failures should leave the resume visible and log the error so the UI state stays aligned with persistence state.
- Resume list screens should handle Firestore read failures without replaying stale deleted content from browser storage.

**Testing**

- Replace cache-merge tests with tests for Firestore-only resume helpers such as builder step restoration and write data construction.
- Add component-level behavior checks where practical by verifying that local cache imports are removed from resume list and builder persistence code paths.
