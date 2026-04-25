import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Signup() {
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] bg-purple-600/10 -top-48 -right-32 animate-float-slow" />
      <div className="orb w-[400px] h-[400px] bg-cyan-500/8 -bottom-32 -left-32 animate-float-medium" style={{ animationDelay: "-2s" }} />
      <div className="orb w-[200px] h-[200px] bg-indigo-400/6 top-1/3 left-1/3 animate-pulse-glow" style={{ animationDelay: "-1.5s" }} />

      <div className="auth-panel max-w-[420px] w-full p-8 sm:p-10 fade-in relative z-10">

        {/* Top edge glow */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(6,182,212,0.4), transparent)" }} />

        <div className="text-center mb-8">
          <Link to="/" className="inline-block font-bold text-xl text-on-surface tracking-tight mb-6">
            Resume<span className="text-primary">Forge</span>
          </Link>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Create Account</h2>
          <p className="text-sm text-on-surface-variant">Start building better resumes today.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-6 text-sm border border-red-500/20 font-medium text-center"
            style={{ backdropFilter: "blur(8px)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Full Name</label>
            <input
              type="text"
              required
              className="input-field"
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div>
            <label className="field-label">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full btn-primary mt-6 py-3 text-base"
          >
            {loading ? "Forging Account..." : "Create Account"} <ArrowRight size={16} />
          </button>
        </form>

        <div className="my-6 flex items-center justify-between">
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">OR</span>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full btn-ghost py-3 text-sm font-semibold text-on-surface"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 ml-1">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
