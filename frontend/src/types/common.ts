// Replace Firebase Timestamp with a simpler interface
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

// Helper function to convert Date to Timestamp-like object
export function dateToTimestamp(date: Date): Timestamp {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000
  };
}

// Helper function to convert Timestamp to Date
export function timestampToDate(timestamp: Timestamp): Date {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
} 