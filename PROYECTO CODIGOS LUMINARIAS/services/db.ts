
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { StoredImage } from '../types';

const DB_NAME = 'image-processor-db';
const STORE_NAME = 'images';
const DB_VERSION = 1;

interface ImageDB extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: StoredImage;
  };
}

let dbPromise: Promise<IDBPDatabase<ImageDB>> | null = null;

const getDb = (): Promise<IDBPDatabase<ImageDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<ImageDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

export const setImage = async (image: StoredImage): Promise<void> => {
  const db = await getDb();
  await db.put(STORE_NAME, image);
};

export const getAllImages = async (): Promise<StoredImage[]> => {
  const db = await getDb();
  return db.getAll(STORE_NAME);
};

export const clearAllImages = async (): Promise<void> => {
  const db = await getDb();
  await db.clear(STORE_NAME);
};
