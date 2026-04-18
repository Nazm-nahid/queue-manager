import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  runTransaction,
  type DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useAuth } from '../composables/useAuth';
import type { FuelType, Pump } from '../data/mockPumps';

export type TakeSerialResult = {
  bookingId: string;
  createdAtMs: number;
  serial: number;
  runningSerial: number;
  remainingSlots: number;
  etaMinutes: number;
  pumpName: string;
  pumpLocation: string;
};

function assertDbReady() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }
}

function toPump(docId: string, data: DocumentData): Pump {
  return {
    id: String(data.id || docId),
    name: String(data.name || ''),
    slug: String(data.slug || ''),
    address: String(data.address || ''),
    googleMapLink: String(data.googleMapLink || ''),
    imageUrl: String(data.imageUrl || ''),
    fuelQueues: data.fuelQueues,
  } as Pump;
}

export async function fetchPumpsFromFirebase(): Promise<Pump[]> {
  assertDbReady();

  const snapshot = await getDocs(collection(db!, 'pumps'));
  return snapshot.docs.map((pumpDoc) => toPump(pumpDoc.id, pumpDoc.data()));
}

export async function fetchPumpByIdFromFirebase(pumpId: string): Promise<Pump | null> {
  assertDbReady();

  const pumpRef = doc(db!, 'pumps', pumpId);
  const pumpSnap = await getDoc(pumpRef);
  if (!pumpSnap.exists()) {
    return null;
  }

  return toPump(pumpSnap.id, pumpSnap.data());
}

export async function takeSerialFromFirebase(pumpId: string, fuelType: FuelType): Promise<TakeSerialResult> {
  assertDbReady();

  const { currentUser } = useAuth();
  if (!currentUser.value) {
    throw new Error('AUTH_REQUIRED');
  }
  const userId = currentUser.value.uid;

  const pumpRef = doc(db!, 'pumps', pumpId);

  return runTransaction(db!, async (transaction) => {
    const pumpSnap = await transaction.get(pumpRef);

    if (!pumpSnap.exists()) {
      throw new Error('PUMP_NOT_FOUND');
    }

    const pump = toPump(pumpSnap.id, pumpSnap.data());
    const fuelQueue = pump.fuelQueues[fuelType];

    if (!fuelQueue) {
      throw new Error('FUEL_QUEUE_NOT_FOUND');
    }

    if (fuelQueue.nextSerial > fuelQueue.dailySerialLimit) {
      throw new Error('SERIAL_LIMIT_REACHED');
    }

    const serial = fuelQueue.nextSerial;
    const createdAtMs = Date.now();
    transaction.update(pumpRef, {
      [`fuelQueues.${fuelType}.nextSerial`]: serial + 1,
    });

    const bookingRef = doc(collection(db!, 'users', userId, 'serialBookings'));
    transaction.set(bookingRef, {
      id: bookingRef.id,
      pumpId,
      serial,
      fuelType,
      pumpName: pump.name,
      pumpLocation: pump.address,
      runningSerial: fuelQueue.runningSerial,
      remainingSlots: Math.max(fuelQueue.dailySerialLimit - serial, 0),
      etaMinutes: Math.max(serial - fuelQueue.runningSerial, 0) * fuelQueue.serviceMinutesPerVehicle,
      createdAt: serverTimestamp(),
      createdAtMs,
      userId,
    });

    const queueGap = Math.max(serial - fuelQueue.runningSerial, 0);

    return {
      bookingId: bookingRef.id,
      createdAtMs,
      serial,
      runningSerial: fuelQueue.runningSerial,
      remainingSlots: Math.max(fuelQueue.dailySerialLimit - serial, 0),
      etaMinutes: queueGap * fuelQueue.serviceMinutesPerVehicle,
      pumpName: pump.name,
      pumpLocation: pump.address,
    };
  });
}
