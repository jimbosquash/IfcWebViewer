// src/indexedDBUtils.ts

import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'SiaDB';
const STORE_NAME = 'buildingElementAlias';

// Initialize the database
export async function initDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
                console.log('indexedDB created')
            }
        },
    });
}

// Save dictionary or settings to IndexedDB
export async function saveToDB(key: string, value: any) {
    const db = await initDB();
    await db.put(STORE_NAME, value, key);
}

// Retrieve dictionary or settings from IndexedDB
export async function getFromDB<T>(key: string): Promise<T | null> {
    const db = await initDB();
    return await db.get(STORE_NAME, key);
}

// Delete an item from IndexedDB
export async function deleteFromDB(key: string) {
    const db = await initDB();
    await db.delete(STORE_NAME, key);
}

// Clear all data from IndexedDB
export async function clearDB() {
    const db = await initDB();
    await db.clear(STORE_NAME);
}

// Get the total number of items in the store
export async function getItemCount(): Promise<number> {
    const db = await initDB();
    const items = await db.getAllKeys(STORE_NAME);
    return items.length;
}

// Get all keys from the store
export async function getAllKeys(): Promise<string[]> {
    const db = await initDB();
    const keys = await db.getAllKeys(STORE_NAME);

    // Filter and cast only string keys
    return keys.map((key) => key.toString());
}

// // Add multiple entries in one transaction (only if they don't exist)
// export async function addNewEntries(elementCodes: string[]) {
//     const db = await initDB();
//     const existingKeys = await getAllKeys(); // Get all existing keys
  
//     // Step 1: Remove duplicates from input, keeping the first occurrence only
//     const uniqueElements = Array.from(new Set(elementCodes.filter((e) => e.trim() !== '')));
  
//     // Step 2: Filter out elements that already exist in the database
//     const newElements = uniqueElements.filter((element) => !existingKeys.includes(element));
  
//     let startingValue: number = existingKeys.length;
  
//     if (newElements.length > 0) {
//       console.log('New elements for DB:', newElements.length);
  
//       const tx = db.transaction(STORE_NAME, 'readwrite');
//       for (const element of newElements) {
//         // Increment value starting from the current database length
//         await tx.store.put(++startingValue, element);
//       }
//       await tx.done; // Ensure the transaction completes
//     }
  
//     return newElements.length; // Return the number of new elements added
//   }

  export async function getValuesByKeys(
    keys: string[]
  ): Promise<Map<string, { alias: string; color: string }>> {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.store;
  
    const result = new Map<string, { alias: string; color: string }>();
  
    for (const key of keys) {
      const value = await store.get(key);
      if (value) {
        result.set(key, value); // Store alias and color together
      }
    }
  
    await tx.done;
    return result;
  }

  export async function addOrUpdateEntry(
    key: string,
    value: { alias: string; color: string }
  ): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.store;
  
    await store.put(value, key); // Add or update the entry
  
    await tx.done; // Ensure the transaction completes
  }

  export async function addOrUpdateEntries(
    entries: Array<{ key: string; value: { alias: string; color: string } }>
  ): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.store;
  
    for (const { key, value } of entries) {
      await store.put(value, key); // Add or update each entry
    }
  
    await tx.done; // Ensure the transaction completes
  }

  export async function getValueByKey(
    key: string
  ): Promise<{ alias: string; color: string } | undefined> {
    const db = await initDB();
    const value = await db.get(STORE_NAME, key); // Directly get the value
    return value || undefined; // Return value or undefined if not found
  }
  
