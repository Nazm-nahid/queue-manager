import { ref } from 'vue';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

const googleProvider = new GoogleAuthProvider();

const currentUser = ref<User | null>(null);
const isAuthReady = ref(!auth);

let resolveAuthReady: (() => void) | null = null;
const authReady = new Promise<void>((resolve) => {
  resolveAuthReady = resolve;
});

if (auth) {
  void setPersistence(auth, browserLocalPersistence).catch(() => {
    // Best effort only.
  });

  onAuthStateChanged(auth, (nextUser) => {
    currentUser.value = nextUser;

    if (!isAuthReady.value) {
      isAuthReady.value = true;
      if (resolveAuthReady) {
        resolveAuthReady();
      }
      resolveAuthReady = null;
    }
  });
} else {
  isAuthReady.value = true;
  if (resolveAuthReady) {
    // resolveAuthReady();
  }
  resolveAuthReady = null;
}

function requireAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('AUTH_NOT_CONFIGURED');
  }
}

export function useAuth() {
  async function signInWithGoogle() {
    requireAuth();
    await signInWithPopup(auth!, googleProvider);
  }

  async function signOut() {
    requireAuth();
    await firebaseSignOut(auth!);
  }

  return {
    currentUser,
    isAuthReady,
    signInWithGoogle,
    signOut,
  };
}

export async function waitForAuthReady() {
  if (isAuthReady.value) {
    return;
  }

  await authReady;
}