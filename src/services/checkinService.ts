import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from '../composables/useAuth';
import { markBookingAttend } from './bookingService';

export async function saveCheckinToFirebase(pumpId: string, token: string, bookingId?: string) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }

  const { currentUser } = useAuth();
  if (!currentUser.value) {
    throw new Error('AUTH_REQUIRED');
  }

  await addDoc(collection(db, 'checkins'), {
    pumpId,
    token,
    checkedInAt: serverTimestamp(),
  });

  if (bookingId) {
    await markBookingAttend(currentUser.value.uid, bookingId);
  }
}
