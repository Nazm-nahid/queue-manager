import { collection, onSnapshot, orderBy, query, type DocumentData } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import type { FuelType } from '../data/mockPumps';

export type SerialBookingRecord = {
  id: string;
  pumpId: string;
  serial: number;
  fuelType: FuelType;
  pumpName: string;
  pumpLocation: string;
  runningSerial: number;
  remainingSlots: number;
  etaMinutes: number;
};

function assertDbReady() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }
}

function toSerialBooking(docId: string, data: DocumentData): SerialBookingRecord {
  return {
    id: String(data.id || docId),
    pumpId: String(data.pumpId || ''),
    serial: Number(data.serial || 0),
    fuelType: String(data.fuelType || '') as FuelType,
    pumpName: String(data.pumpName || ''),
    pumpLocation: String(data.pumpLocation || ''),
    runningSerial: Number(data.runningSerial || 0),
    remainingSlots: Number(data.remainingSlots || 0),
    etaMinutes: Number(data.etaMinutes || 0),
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