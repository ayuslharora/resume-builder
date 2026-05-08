import { useState } from "react";
import { useAuth } from "../context/useAuth";
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
    <div className="app-page app-page-narrow profile-page fade-in">
      <div className="profile-header">
        <div>
          <p className="lbl-mono">Account</p>
          <h1 className="h-display">Profile Settings</h1>
        </div>
        <p>Manage your display name and profile picture.</p>
      </div>

      <div className="profile-grid">
        <section className="panel profile-section">
          <h2 className="profile-section-title">
            <Camera size={15} className="text-primary" />
            Profile Photo
          </h2>

          <div className="profile-photo-row">
            <div className="avatar profile-avatar">
              {userDoc?.photoURL ? (
                <img src={userDoc.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {isGoogleUser && googlePhotoURL ? (
                <div className="space-y-2">
                  <p className="profile-helper">
                    Your Google account has a profile photo. Use it as your avatar.
                  </p>
                  <div className="flex items-center gap-3">
                    <img src={googlePhotoURL} alt="Google" className="profile-google-photo" />
                    <button
                      onClick={handleUseGooglePhoto}
                      disabled={userDoc?.photoURL === googlePhotoURL}
                      className="btn btn-outline btn-sm"
                    >
                      {userDoc?.photoURL === googlePhotoURL ? "Currently Active" : "Use Google Photo"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="profile-helper">
                  Sign in with Google to use your Google profile photo, or your initials will be shown.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="panel profile-section">
          <h2 className="profile-section-title">
            <User size={15} className="text-primary" />
            Display Name
          </h2>

          {error && (
            <div className="profile-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label className="field-label">Your Name</label>
              <input
                type="text"
                className="field"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Jane Doe"
                required
              />
              <p className="profile-helper mt-1.5">
                This is how your name appears in the sidebar and on your account.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!displayName.trim()}
                className="btn btn-accent"
              >
                <Save size={14} />
                Save Name
              </button>

              {saved && (
                <span className="profile-saved fade-in">
                  <CheckCircle size={13} />
                  Saved!
                </span>
              )}
            </div>
          </form>
        </section>

        <section className="panel profile-section profile-section-wide">
          <h2 className="profile-section-title">Account Info</h2>
          <div className="profile-account-grid">
            <div className="profile-account-row">
              <p className="field-label">Email</p>
              <p>{currentUser?.email}</p>
            </div>
            <div className="profile-account-row">
              <p className="field-label">Sign-in Method</p>
              <p className="capitalize">
                {currentUser?.providerData?.map(p =>
                  p.providerId === "google.com" ? "Google" : "Email/Password"
                ).join(", ")}
              </p>
            </div>
            <div className="profile-account-row profile-account-row-full">
              <p className="field-label">Creator</p>
              <div className="profile-creator-card">
                <div>
                  <p>Built and designed by Ayush</p>
                  <span>Visit portfolio: Ayuslh.in</span>
                </div>
                <a
                  href="https://Ayuslh.in"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Open Ayuslh.in
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
