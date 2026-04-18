export type FuelType = 'diesel' | 'petrol' | 'octane';

export type FuelQueueInfo = {
  dailySerialLimit: number;
  runningSerial: number;
  nextSerial: number;
  serviceMinutesPerVehicle: number;
};

export type Pump = {
  id: string;
  name: string;
  slug: string;
  address: string;
  googleMapLink: string;
  imageUrl: string;
  qrSecretHash: string;
  fuelQueues: Record<FuelType, FuelQueueInfo>;
};

export const pumps: Pump[] = [
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
