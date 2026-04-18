# Firebase Backend Setup

## 1) Create Firebase project
- Go to Firebase console and create a project.
- Add a Web app.
- Copy config values into `.env` from `.env.example`.

## 2) Enable Firestore
- In Firebase console, open Firestore Database.
- Create database in production or test mode.

## 2.5) Enable Google authentication
- In Firebase console, open Authentication.
- Enable the Google provider.
- Add your support email if prompted.

## 3) Create `pumps` collection
Use document id as `pump-001`, `pump-002`, etc.

Example pump document:

```json
{
  "id": "pump-001",
  "name": "Padma Fuel Point Dhanmondi",
  "slug": "padma-fuel-point-dhanmondi",
  "address": "Road 27, Dhanmondi, Dhaka",
  "googleMapLink": "https://maps.google.com/?q=Road+27+Dhanmondi+Dhaka",
  "imageUrl": "https://images.unsplash.com/photo-1563078840-6e1f1f5f0d84?auto=format&fit=crop&w=900&q=80",
  "fuelQueues": {
    "petrol": {
      "dailySerialLimit": 100,
      "runningSerial": 22,
      "nextSerial": 33,
      "serviceMinutesPerVehicle": 3
    },
    "diesel": {
      "dailySerialLimit": 80,
      "runningSerial": 15,
      "nextSerial": 24,
      "serviceMinutesPerVehicle": 4
    },
    "octane": {
      "dailySerialLimit": 70,
      "runningSerial": 9,
      "nextSerial": 14,
      "serviceMinutesPerVehicle": 5
    }
  }
}
```

## 4) Optional `checkins` collection
The app writes check-ins with fields:
- `pumpId`
- `token`
- `checkedInAt`

## 5) Basic Firestore rules for development

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pumps/{pumpId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /checkins/{checkinId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Use stricter rules before production.
