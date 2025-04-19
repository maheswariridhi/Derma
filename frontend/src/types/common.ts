// Define a Timestamp interface that matches Firebase/Firestore Timestamp structure
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
  toMillis: () => number;
}

// Helper function to convert Date to Timestamp-like object
export function dateToTimestamp(date: Date): Omit<Timestamp, 'toDate' | 'toMillis'> {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000
  };
}

// Helper function to convert Timestamp to Date
export function timestampToDate(timestamp: Timestamp): Date {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
}

// Create a complete Timestamp object with methods
export function createTimestamp(date: Date): Timestamp {
  const base = dateToTimestamp(date);
  return {
    ...base,
    toDate: () => new Date(base.seconds * 1000 + base.nanoseconds / 1000000),
    toMillis: () => base.seconds * 1000 + base.nanoseconds / 1000000
  };
} 