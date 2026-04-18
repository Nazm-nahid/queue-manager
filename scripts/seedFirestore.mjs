import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

function parseEnvFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const env = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

const envPath = resolve(process.cwd(), '.env');
const env = parseEnvFile(envPath);

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(`Missing Firebase config keys in .env: ${missingConfig.join(', ')}`);
}

const pumps = [
  {
    id: 'pump-001',
    name: 'Padma Fuel Point Dhanmondi',
    slug: 'padma-fuel-point-dhanmondi',
    address: 'Road 27, Dhanmondi, Dhaka',
    googleMapLink: 'https://maps.google.com/?q=Road+27+Dhanmondi+Dhaka',
    imageUrl:
      'https://images.unsplash.com/photo-1563078840-6e1f1f5f0d84?auto=format&fit=crop&w=900&q=80',
    qrSecretHash: '8f7d4a1c',
    fuelQueues: {
      petrol: {
        dailySerialLimit: 100,
        runningSerial: 22,
        nextSerial: 33,
        serviceMinutesPerVehicle: 3,
      },
      diesel: {
        dailySerialLimit: 80,
        runningSerial: 15,
        nextSerial: 24,
        serviceMinutesPerVehicle: 4,
      },
      octane: {
        dailySerialLimit: 70,
        runningSerial: 9,
        nextSerial: 14,
        serviceMinutesPerVehicle: 5,
      },
    },
  },
  {
    id: 'pump-002',
    name: 'Jamuna Pump Mirpur 10',
    slug: 'jamuna-pump-mirpur-10',
    address: 'Section 10, Mirpur, Dhaka',
    googleMapLink: 'https://maps.google.com/?q=Mirpur+10+Dhaka',
    imageUrl:
      'https://images.unsplash.com/photo-1631021725237-1450fda84f07?auto=format&fit=crop&w=900&q=80',
    qrSecretHash: '5be8122f',
    fuelQueues: {
      petrol: {
        dailySerialLimit: 120,
        runningSerial: 40,
        nextSerial: 63,
        serviceMinutesPerVehicle: 4,
      },
      diesel: {
        dailySerialLimit: 95,
        runningSerial: 29,
        nextSerial: 45,
        serviceMinutesPerVehicle: 5,
      },
      octane: {
        dailySerialLimit: 85,
        runningSerial: 18,
        nextSerial: 27,
        serviceMinutesPerVehicle: 6,
      },
    },
  },
  {
    id: 'pump-003',
    name: 'Shell Chattogram Agrabad',
    slug: 'shell-chattogram-agrabad',
    address: 'Agrabad Access Road, Chattogram',
    googleMapLink: 'https://maps.google.com/?q=Agrabad+Chattogram',
    imageUrl:
      'https://images.unsplash.com/photo-1621983363691-b1620f859d48?auto=format&fit=crop&w=900&q=80',
    qrSecretHash: '9a23d66b',
    fuelQueues: {
      petrol: {
        dailySerialLimit: 90,
        runningSerial: 12,
        nextSerial: 17,
        serviceMinutesPerVehicle: 5,
      },
      diesel: {
        dailySerialLimit: 75,
        runningSerial: 8,
        nextSerial: 12,
        serviceMinutesPerVehicle: 6,
      },
      octane: {
        dailySerialLimit: 60,
        runningSerial: 4,
        nextSerial: 8,
        serviceMinutesPerVehicle: 7,
      },
    },
  },
];

async function seedFirestore() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  for (const pump of pumps) {
    const pumpRef = doc(db, 'pumps', pump.id);
    await setDoc(pumpRef, pump, { merge: true });
    console.log(`Upserted pumps/${pump.id}`);
  }

  console.log(`Done. Seeded ${pumps.length} pump documents to project ${firebaseConfig.projectId}.`);
}

seedFirestore().catch((error) => {
  console.error('Failed to seed Firestore:', error);
  process.exitCode = 1;
});
