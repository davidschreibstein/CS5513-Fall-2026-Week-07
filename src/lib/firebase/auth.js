import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
} from "firebase/auth";

import { auth } from "@/src/lib/firebase/clientApp";

// Subscribes to sign-in and sign-out changes for the shared client Auth instance.
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

// Fires when the ID token is refreshed so the session cookie can stay in sync.
export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb);
}

// Opens the Google sign-in popup.
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
}

// Signs the current user out of Firebase Auth.
export async function signOut() {
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}
