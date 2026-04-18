import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

export async function saveCheckinToFirebase(pumpId: string, token: string) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }

  await addDoc(collection(db, 'checkins'), {
    pumpId,
    token,
    checkedInAt: serverTimestamp(),
  });
}
