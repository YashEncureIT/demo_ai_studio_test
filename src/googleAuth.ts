import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google OAuth Provider
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/tasks");
provider.addScope("https://www.googleapis.com/auth/tasks.readonly");

// Memory caches
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedGoogleUser: User | null = null;

// On Auth State Changed Listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedGoogleUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Fallback or request login if token went missing
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedGoogleUser = null;
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Initiate Google Sign-In via popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to retrieve API access token from Google Credentials");
    }
    cachedGoogleUser = result.user;
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Firebase/Google Sign-In Exception:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve token in-memory
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Retrieve authenticated Google user in-memory
export const getGoogleUser = (): User | null => {
  return cachedGoogleUser;
};

// Logout
export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  cachedGoogleUser = null;
};
