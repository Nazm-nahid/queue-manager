import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, type DocumentData } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import type { FuelType } from '../data/mockPumps';

export type BookingStatus = 'pending' | 'attend' | 'skipped';

export type SerialBookingRecord = {
  id: string;
  pumpId: string;
  createdAtMs: number;
  serial: number;
  fuelType: FuelType;
  pumpName: string;
  pumpLocation: string;
  runningSerial: number;
  remainingSlots: number;
  etaMinutes: number;
  status: BookingStatus;
};

function assertDbReady() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }
}

function toSerialBooking(docId: string, data: DocumentData): SerialBookingRecord {
  const fallbackCreatedAtMs =
    data.createdAt && typeof data.createdAt.toMillis === 'function' ? Number(data.createdAt.toMillis()) : 0;
  const createdAtMs = Number(data.createdAtMs || fallbackCreatedAtMs || Date.now());

  return {
    id: String(data.id || docId),
    pumpId: String(data.pumpId || ''),
    createdAtMs,
    serial: Number(data.serial || 0),
    fuelType: String(data.fuelType || '') as FuelType,
    pumpName: String(data.pumpName || ''),
    pumpLocation: String(data.pumpLocation || ''),
    runningSerial: Number(data.runningSerial || 0),
    remainingSlots: Number(data.remainingSlots || 0),
    etaMinutes: Number(data.etaMinutes || 0),
    status: String(data.status || 'pending') as BookingStatus,
  };
}

export function watchUserBookings(uid: string, onChange: (bookings: SerialBookingRecord[]) => void) {
  assertDbReady();

  const bookingsRef = collection(db!, 'users', uid, 'serialBookings');
  const bookingsQuery = query(bookingsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(bookingsQuery, (snapshot) => {
    onChange(snapshot.docs.map((bookingDoc) => toSerialBooking(bookingDoc.id, bookingDoc.data())));
  });
}

export async function markBookingSkipped(uid: string, bookingId: string) {
  assertDbReady();

  const bookingRef = doc(db!, 'users', uid, 'serialBookings', bookingId);
  await updateDoc(bookingRef, {
    status: 'skipped',
    skippedAt: serverTimestamp(),
  });
}

export async function markBookingAttend(uid: string, bookingId: string) {
  assertDbReady();

  const bookingRef = doc(db!, 'users', uid, 'serialBookings', bookingId);
  await updateDoc(bookingRef, {
    status: 'attend',
    attendedAt: serverTimestamp(),
  });
}