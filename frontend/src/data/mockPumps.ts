export type Pump = {
  id: string;
  name: string;
  slug: string;
  address: string;
  googleMapLink: string;
  imageUrl: string;
  dailySerialLimit: number;
  runningSerial: number;
  nextSerial: number;
  serviceMinutesPerVehicle: number;
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
    dailySerialLimit: 100,
    runningSerial: 22,
    nextSerial: 33,
    serviceMinutesPerVehicle: 3,
  },
  {
    id: 'pump-002',
    name: 'Jamuna Pump Mirpur 10',
    slug: 'jamuna-pump-mirpur-10',
    address: 'Section 10, Mirpur, Dhaka',
    googleMapLink: 'https://maps.google.com/?q=Mirpur+10+Dhaka',
    imageUrl:
      'https://images.unsplash.com/photo-1631021725237-1450fda84f07?auto=format&fit=crop&w=900&q=80',
    dailySerialLimit: 120,
    runningSerial: 40,
    nextSerial: 63,
    serviceMinutesPerVehicle: 4,
  },
  {
    id: 'pump-003',
    name: 'Shell Chattogram Agrabad',
    slug: 'shell-chattogram-agrabad',
    address: 'Agrabad Access Road, Chattogram',
    googleMapLink: 'https://maps.google.com/?q=Agrabad+Chattogram',
    imageUrl:
      'https://images.unsplash.com/photo-1621983363691-b1620f859d48?auto=format&fit=crop&w=900&q=80',
    dailySerialLimit: 90,
    runningSerial: 12,
    nextSerial: 17,
    serviceMinutesPerVehicle: 5,
  },
];
