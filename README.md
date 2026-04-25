# ResumeForge

ResumeForge is an AI-powered resume builder designed to help students and professionals create tailored, ATS-friendly resumes quickly. Built with React, Vite, and Firebase, the application uses **Groq (Llama-3.1-8B)** to digest a user's "brag sheet" and intelligently generate precise resume content based on their target roles.

## 🚀 Features

- **Brainstorming to Resume:** Upload a raw "brag sheet" or provide interview-style answers, and let the AI generate polished, action-oriented resume bullets.
- **Multiple Visual Templates:** Choose from Minimal, Modern, Professional, and Creative layouts that best fit the industry you are applying to.
- **Fast and Responsive:** Built with Vite and TailwindCSS for a seamless, highly-responsive user experience right on your browser.
- **Cloud Storage & Caching:** All resumes are saved securely in Firestore. Combined with LocalStorage dual-caching, your dashboard loads instantly without any latency.
- **Export to PDF / DOCX:** Export your completed resumes in universally accepted formats for job applications.
- **Midnight Luminary aesthetic:** Enjoy a sleek, premium dark-mode interface with micro-smooth animations built using pure CSS and Tailwind.

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + PostCSS + raw CSS variables
- **Authentication & Database:** Firebase Auth, Firestore, and Firebase Storage
- **AI Processing:** Groq Language Model API (Llama-3.1-8B-instant)
- **Document Rendering:** `jspdf`, `html2canvas`, and `docx`

---

## 💻 Running the App Locally

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayuslharora/resume-builder.git
   cd resume-builder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your own Firebase and Groq configuration limits:
   ```env
   VITE_FIREBASE_API_KEY="your_firebase_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
   VITE_FIREBASE_APP_ID="your_firebase_app_id"
   
   VITE_GROQ_API_KEY="your_groq_api_key_here"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:5173` in your browser.

---

## 🌍 Deployment (Vercel)

If you are deploying this application to Vercel, there is a crucial extra step beyond simply linking your GitHub repository:

1. **Import the repository into Vercel.**
2. Go to your Vercel Project **Settings** → **Environment Variables**.
3. **Add all of the variables** from your `.env` file (e.g., `VITE_FIREBASE_API_KEY`, `VITE_GROQ_API_KEY`). **If you don't do this, you will receive an `auth/invalid-api-key` error from Firebase.**
4. Once variables are added, go to **Deployments** and click **Redeploy**.

## 📄 License
This project is open-source and free to use.
