import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Save, Camera, CheckCircle } from "lucide-react";

export default function Profile() {
  const { userDoc, currentUser, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(userDoc?.displayName || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isGoogleUser = currentUser?.providerData?.some(p => p.providerId === "google.com");
  const googlePhotoURL = currentUser?.providerData?.find(p => p.providerId === "google.com")?.photoURL;

  const initials = displayName
    ? displayName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  function handleSaveName(e) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setError("");
    // updateUserProfile is now optimistic — updates UI instantly, persists in background
    updateUserProfile({ displayName: displayName.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleUseGooglePhoto() {
    if (!googlePhotoURL) return;
    setError("");
    updateUserProfile({ photoURL: googlePhotoURL });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="w-full max-w-2xl mx-auto fade-in">
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your display name and profile picture.</p>
      </div>

      <div className="space-y-6">

        {/* Avatar section */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: "rgba(25,31,49,0.5)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <h2 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
            <Camera size={15} className="text-primary" />
            Profile Photo
          </h2>

          <div className="flex items-center gap-6">
            {/* Avatar preview */}
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold text-on-surface flex-shrink-0"
              style={{
                background: "rgba(6,182,212,0.1)",
                border: "2px solid rgba(6,182,212,0.25)",
                boxShadow: "0 0 20px rgba(6,182,212,0.15)"
              }}
            >
              {userDoc?.photoURL ? (
                <img src={userDoc.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {isGoogleUser && googlePhotoURL ? (
                <div className="space-y-2">
                  <p className="text-xs text-on-surface-variant">
                    Your Google account has a profile photo. Use it as your avatar.
                  </p>
                  <div className="flex items-center gap-3">
                    <img src={googlePhotoURL} alt="Google" className="w-8 h-8 rounded-full border border-white/10" />
                    <button
                      onClick={handleUseGooglePhoto}
                      disabled={userDoc?.photoURL === googlePhotoURL}
                      className="btn-ghost text-xs py-1.5 px-3"
                    >
                      {userDoc?.photoURL === googlePhotoURL ? "Currently Active" : "Use Google Photo"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant">
                  Sign in with Google to use your Google profile photo, or your initials will be shown.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Display name section */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: "rgba(25,31,49,0.5)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <h2 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
            <User size={15} className="text-primary" />
            Display Name
          </h2>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label className="field-label">Your Name</label>
              <input
                type="text"
                className="input-field"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Jane Doe"
                required
              />
              <p className="text-xs text-on-surface-variant mt-1.5">
                This is how your name appears in the sidebar and on your account.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!displayName.trim()}
                className="btn-primary py-2"
              >
                <Save size={14} />
                Save Name
              </button>

              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium fade-in">
                  <CheckCircle size={13} />
                  Saved!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Account info (read-only) */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: "rgba(25,31,49,0.3)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.04)"
          }}
        >
          <h2 className="text-sm font-bold text-on-surface mb-4">Account Info</h2>
          <div className="space-y-3">
            <div>
              <p className="field-label">Email</p>
              <p className="text-sm text-on-surface-variant">{currentUser?.email}</p>
            </div>
            <div>
              <p className="field-label">Sign-in Method</p>
              <p className="text-sm text-on-surface-variant capitalize">
                {currentUser?.providerData?.map(p =>
                  p.providerId === "google.com" ? "Google" : "Email/Password"
                ).join(", ")}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
