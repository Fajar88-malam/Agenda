/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing Firebase app instance if already initialized
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Desired Google Workspace Scopes
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents'
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
// Set custom parameters to ensure prompt
provider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

// Flag to track sign-in progress
let isSigningIn = false;
// In-memory access token cache (NEVER stored in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

export interface GoogleAuthUserInfo {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export const DEFAULT_SUPERADMIN_EMAIL = 'sangpujangga.malam88@gmail.com';

/**
 * Check whether a given user email is in the authorized operator whitelist.
 */
export const isEmailAuthorized = (
  email: string | null | undefined,
  allowedList?: string[]
): boolean => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === DEFAULT_SUPERADMIN_EMAIL.toLowerCase()) return true;
  if (cleanEmail === 'smpnegeripacet@gmail.com') return true;
  if (allowedList && Array.isArray(allowedList)) {
    return allowedList.some(item => item.trim().toLowerCase() === cleanEmail);
  }
  return false;
};

/**
 * Initialize auth state listener. Clears cached token when user signs out.
 */
export const initAuth = (
  onAuthChange: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
      cachedAccessToken = null;
    }
    onAuthChange(user, cachedAccessToken);
  });
};

/**
 * Sign in with Google using popup and request Drive + Docs scopes.
 */
export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google OAuth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Returns current in-memory access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Set or refresh in-memory access token manually if needed.
 */
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Sign out from Google & Firebase and wipe cached token.
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};
