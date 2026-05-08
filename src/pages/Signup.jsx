import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AUTH_ROUTE_SEO } from "../seo/siteSeo";
import { useRouteSeo } from "../seo/routeSeo";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function BrandLogo() {
  return (
    <>
      <div
        className="flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-[7px]"
        style={{
          boxShadow: "0 1px 2px rgba(15,23,42,.16)",
        }}
      >
        <img
          src="/favicon.svg"
          alt=""
          aria-hidden="true"
          className="h-full w-full"
        />
      </div>
      <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">
        Resu<span className="serif italic font-normal">Me</span>
      </span>
    </>
  );
}

export default function Signup() {
  useRouteSeo({
    title: AUTH_ROUTE_SEO["/signup"].title,
    description: AUTH_ROUTE_SEO["/signup"].description,
    path: "/signup",
    robots: AUTH_ROUTE_SEO["/signup"].robots,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) navigate("/dashboard");
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await signup(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create account. " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to sign up with Google. " + (err.message || ""));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-design min-h-screen flex items-center justify-center px-4 py-10 relative bg-[var(--bg)]" style={{ background: "var(--bg)", minHeight: "100%" }}>
      
      <div className="w-full max-w-[400px]">
        
        <div className="flex justify-center mb-8 fade-in">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo />
          </Link>
        </div>

        <div className="fade-in border border-[var(--border)] rounded-[18px] bg-[var(--surface)] p-8 sm:p-10 shadow-[var(--shadow-md)]">

          <div className="text-center mb-8">
            <h2 className="h-display text-[26px] mb-2" style={{ letterSpacing: "-0.02em", margin: 0 }}>Create Account</h2>
            <p className="text-[13.5px] text-[var(--text-2)]" style={{ margin: 0 }}>Start building better resumes today.</p>
          </div>

          {error && (
            <div className="bg-[var(--bad-soft)] text-[var(--bad)] p-3 rounded-lg mb-6 text-[13px] border border-[color-mix(in_oklch,var(--bad)_20%,transparent)] font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="lbl">Full Name</label>
              <input
                type="text"
                required
                className="field"
                value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div>
              <label className="lbl">Email Address</label>
              <input
                type="email"
                required
                className="field"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="lbl">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="field"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="btn btn-accent w-full mt-6 flex justify-center"
              style={{ height: 44, borderRadius: 10, marginTop: 24 }}
            >
              {loading ? "Forging Account..." : "Create Account"} <ArrowRight size={15} />
            </button>
          </form>

          <div className="my-6 flex items-center justify-between" style={{ marginTop: 24, marginBottom: 24 }}>
            <div className="h-px flex-1 bg-[var(--border-strong)] opacity-50" />
            <span className="lbl-mono px-3" style={{ margin: 0 }}>OR</span>
            <div className="h-px flex-1 bg-[var(--border-strong)] opacity-50" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn w-full flex justify-center"
            style={{ height: 44, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border-strong)" }}
          >
            <GoogleIcon />
            <span style={{ color: "var(--text)" }}>Continue with Google</span>
          </button>

          <div className="mt-8 text-center text-[13px] text-[var(--text-2)]" style={{ marginTop: 32 }}>
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[var(--accent)] hover:underline underline-offset-4 ml-1">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
