// utils/db.ts
const DB_NAME = 'StressTrackerDB';
const READINGS_STORE = 'stressReadings';
const STREAK_STORE = 'streakData';
const DB_VERSION = 2; // Increment version to add new store

export interface StressReading {
  id?: number;
  time: string;
  timestamp: number;
  stress: number;
  label: string;
  message: string;
}

export interface StreakData {
  currentStreak: number;
  lastCheckDate: string;
  bestStreak: number;
  totalCalmDays: number;
  weeklyCalendar: { [key: string]: boolean };
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stressReadings store if it doesn't exist
      if (!db.objectStoreNames.contains(READINGS_STORE)) {
        const objectStore = db.createObjectStore(READINGS_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create streakData store if it doesn't exist
      if (!db.objectStoreNames.contains(STREAK_STORE)) {
        db.createObjectStore(STREAK_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Stress Readings functions
export const addReading = async (reading: StressReading): Promise<number> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([READINGS_STORE], 'readwrite');
    const store = transaction.objectStore(READINGS_STORE);
    const request = store.add(reading);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

export const getAllReadings = async (): Promise<StressReading[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([READINGS_STORE], 'readonly');
    const store = transaction.objectStore(READINGS_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const clearAllReadings = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([READINGS_STORE], 'readwrite');
    const store = transaction.objectStore(READINGS_STORE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getRecentReadings = async (limit: number = 10): Promise<StressReading[]> => {
  const allReadings = await getAllReadings();
  return allReadings
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .reverse();
};

// Streak Data functions
export const saveStreakData = async (data: StreakData): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STREAK_STORE], 'readwrite');
    const store = transaction.objectStore(STREAK_STORE);
    const request = store.put({ id: 'streakData', ...data });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const loadStreakData = async (): Promise<StreakData | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STREAK_STORE], 'readonly');
    const store = transaction.objectStore(STREAK_STORE);
    const request = store.get('streakData');

    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        const { id, ...data } = result;
        resolve(data as StreakData);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};