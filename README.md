# ResumeForge

ResumeForge is an AI-assisted resume builder and resume grader for students, freshers, and early-career professionals. It combines a guided resume builder, Groq-powered content generation, and a role-aware grading workflow that helps users compare resumes against target jobs, identify ATS risks, rewrite weak bullets, and open an improved draft directly in the builder.

## Features

- AI resume builder: Upload a brag sheet, notes, resume, or LinkedIn-style export and generate a structured resume draft tailored to a target role.
- Guided builder flow: Collects target-role context, interview-style inputs, template selection, AI generation, and final editing in one workflow.
- Resume grader: Scores uploaded resumes against a target job with recruiter-style feedback, ATS breakdowns, section scores, keyword gaps, and prioritized fixes.
- OCR-backed PDF parsing: Handles text PDFs and falls back to OCR for scanned/image-based PDFs that would otherwise fail parsing.
- Role comparison: Compare the same resume against multiple target roles from the grader.
- Recruiter tone modes: Review a resume through different lenses such as ATS strict, HR recruiter, hiring manager, or campus placement.
- Weak bullet rewriting: Surface weak bullets, generate stronger rewrites, and apply selected rewrites into the improved-draft flow.
- One-click improvement pass: Turn grader feedback into an improved resume draft and open it in the builder for further editing.
- Export and persistence: Save resumes in Firestore with local caching and export final versions to PDF or DOCX.

## Tech Stack

- Frontend: React 19, Vite
- Styling: Tailwind CSS, PostCSS, custom CSS variables
- Auth and data: Firebase Auth, Firestore
- AI services: Groq API using `llama-3.1-8b-instant`
- Document parsing and export: `pdfjs-dist`, `mammoth`, `tesseract.js`, `jspdf`, `html2canvas`, `docx`

## Main Flows

### Builder

1. Choose a target role and role context.
2. Upload a brag sheet or supporting resume material.
3. Pick a resume template.
4. Generate a resume draft with Groq.
5. Edit the final resume and export it.

### Grader

1. Enter the target job and optional job description.
2. Upload a resume in `pdf`, `docx`, or `txt`.
3. Parse the resume text, including OCR fallback for scanned PDFs.
4. Grade the resume for ATS fit, keyword alignment, impact, clarity, and recruiter fit.
5. Review weak bullets, rewrite suggestions, ATS risks, and job-match gaps.
6. Open an improved draft in the builder if needed.

## Local Development

Make sure you have a recent version of Node.js installed.

1. Clone the repository:
```bash
git clone https://github.com/ayuslharora/resume-builder.git
cd resume-builder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"

VITE_GROQ_API_KEY="your_groq_api_key_here"
```

4. Start the dev server:
```bash
npm run dev
```

5. Open `http://localhost:5173`.

## Deployment Notes

For Vercel deployments:

1. Import the repository into Vercel.
2. Add every Firebase and Groq environment variable from your local `.env` file in the Vercel project settings.
3. Redeploy after adding or changing environment variables.

If the Firebase keys are missing or invalid, authentication and Firestore-backed flows will fail.

## Current Architecture Notes

- The Groq service layer now lives in `src/services/groq.js`.
- The grader stores a small local score history in browser storage for quick report recall.
- The builder and dashboard use local cache plus Firestore sync so the app remains responsive even during slower network conditions.

## License

This project is open-source and free to use.
