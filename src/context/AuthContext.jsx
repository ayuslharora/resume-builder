import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    const userRef = doc(db, "users", userCredential.user.uid);
    const newUserDoc = {
      uid: userCredential.user.uid,
      email: email,
      displayName: name,
      photoURL: null,
      createdAt: serverTimestamp(),
      resumeCount: 0
    };
    await setDoc(userRef, newUserDoc);
    setUserDoc(newUserDoc);
    return userCredential;
  }

  async function login(email, password, name) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (name) {
      try {
        await updateProfile(userCredential.user, { displayName: name });
        const userRef = doc(db, "users", userCredential.user.uid);
        await setDoc(userRef, { displayName: name }, { merge: true });
        // The onAuthStateChanged listener or getDoc will eventually fetch,
        // but we can proactively update local state
        setUserDoc(prev => (prev ? { ...prev, displayName: name } : null));
      } catch (err) {
        console.error("Error updating profile during login:", err);
      }
    }
    return userCredential;
  }

  function logout() {
    return signOut(auth);
  }

  async function updateUserProfile({ displayName, photoURL }) {
    if (!currentUser) return;
    const updates = {};
    const authUpdates = {};
    if (displayName !== undefined) { updates.displayName = displayName; authUpdates.displayName = displayName; }
    if (photoURL !== undefined)    { updates.photoURL    = photoURL;    authUpdates.photoURL    = photoURL;    }
    if (Object.keys(updates).length === 0) return;

    // Optimistic update — reflect the change in UI immediately
    setUserDoc(prev => (prev ? { ...prev, ...updates } : updates));

    // Fire-and-forget persistence: update Firebase Auth + Firestore in background
    // Don't await — ad blockers or network issues shouldn't block the UI
    updateProfile(currentUser, authUpdates).catch(err =>
      console.error("Firebase Auth profile update failed:", err)
    );

    const userRef = doc(db, "users", currentUser.uid);
    setDoc(userRef, updates, { merge: true }).catch(err =>
      console.error("Firestore profile update failed:", err)
    );
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // Always sync the latest Google name + photo into Firestore
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
      }, { merge: true });
    } catch (err) {
      console.error("Could not sync Google profile to Firestore.", err);
    }
    return result;
  }

  useEffect(() => {
    // Hard timeout: if Firebase Auth takes >3s, stop blocking the UI
    const authTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(authTimeout);
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        // Immediately show Firebase Auth data so UI never shows "User"
        setUserDoc(prev => ({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || prev?.displayName || "",
          photoURL: user.photoURL || prev?.photoURL || "",
          ...(prev || {}),
          // Auth values win as the live source of truth on load
          ...(user.displayName ? { displayName: user.displayName } : {}),
          ...(user.photoURL    ? { photoURL:     user.photoURL    } : {}),
        }));

        try {
          const userRef = doc(db, "users", user.uid);
          const d = await getDoc(userRef);
          if (d.exists()) {
            const data = d.data();
            // Sync Google name/photo into Firestore if the stored values are empty/stale
            const updates = {};
            if (!data.displayName && user.displayName) updates.displayName = user.displayName;
            if (!data.photoURL    && user.photoURL)    updates.photoURL    = user.photoURL;
            if (Object.keys(updates).length > 0) {
              await updateDoc(userRef, updates);
              setUserDoc({ ...data, ...updates });
            } else {
              setUserDoc(data);
            }
          } else {
            const newUserDoc = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              createdAt: serverTimestamp(),
              resumeCount: 0
            };
            await setDoc(userRef, newUserDoc);
            setUserDoc(newUserDoc);
          }
        } catch (err) {
          console.error("Firestore error, using Auth profile as fallback.", err);
          // Keep the Auth-seeded userDoc rather than nulling it out
        }
      } else {
        setUserDoc(null);
      }
    });
    return () => { clearTimeout(authTimeout); unsubscribe(); };
  }, []);

  const value = { currentUser, userDoc, login, signup, logout, loginWithGoogle, updateUserProfile, loading };
  // Render children immediately, ProtectedRoute will handle loading
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
