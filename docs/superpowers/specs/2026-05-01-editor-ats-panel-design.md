# Editor ATS Panel Design

**Problem**

Users can render and edit a resume, but they cannot see ATS feedback in the editor itself. The grading capability already exists separately in the grader flow, which forces users to leave the editor to evaluate changes.

**Goal**

Add an ATS feedback panel to the rendered resume editor so users can manually rescan the current resume and review score and improvement guidance without leaving the builder.

**Design**

**Scope**

- Add ATS feedback only to the final editor screen in `EditStep`.
- Do not auto-run scans.
- Only run ATS grading when the user explicitly clicks `Re-scan`.
- Do not persist ATS results to Firestore for now.

**User experience**

- The editor gets a collapsible side panel for ATS feedback.
- The toolbar gets an explicit ATS action such as `ATS Re-scan` or `Open ATS`.
- Before the first scan, the panel explains that the user can rescan the current draft.
- After a scan, the panel shows:
  - overall ATS score
  - short fit summary
  - ATS breakdown
  - missing keywords
  - top priority fixes
- If rescanning fails, the panel stays open and shows an inline error with retry affordance.

**Data flow**

- `EditStep` reads the current `resumeData` and target-role context from `builderData`.
- A helper converts the current resume structure into plain text suitable for `gradeResume`.
- On `Re-scan`, the editor calls `gradeResume` with:
  - serialized resume text
  - target role
  - additional context if available
  - a fixed review tone appropriate for editor rescans
- The scan result is stored in local component state and replaces the previous result.

**Architecture**

- Keep the ATS UI in the editor flow rather than reusing the full grader page.
- Extract resume-to-text formatting into a small service helper so the scan input is testable and not embedded in JSX.
- Reuse the existing Groq grading response shape and existing visual patterns from the grader page where useful, but keep the panel smaller and editor-focused.

**Error handling**

- If target role is missing, do not call the API; show a clear message in the panel.
- If the API call fails, show the message inline and allow another rescan.
- While rescanning, disable the trigger and show loading state.

**Testing**

- Add a focused test for the resume text serialization helper.
- Add a focused editor test ensuring the ATS trigger exists and the feature remains explicit-only.
