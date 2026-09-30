/**
 * Persistent Storage for FileSystemDirectoryHandle using IndexedDB
 * Allows setting output folder once so users don't have to select it repeatedly
 */

const DB_NAME = 'ai_data_cleaner_db';
const DB_VERSION = 1;
const STORE_NAME = 'folder_handles';
const KEY_NAME = 'default_output_folder';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save directory handle permanently in IndexedDB
 */
export async function saveStoredDirectoryHandle(
  handle: any,
  folderName: string
): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ handle, name: folderName, savedAt: Date.now() }, KEY_NAME);

      req.onsuccess = () => {
        try {
          localStorage.setItem('saved_output_folder_name', folderName);
        } catch (_) {}
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save directory handle in IndexedDB:', err);
  }
}

/**
 * Retrieve saved directory handle from IndexedDB
 */
export async function getStoredDirectoryHandle(): Promise<{
  handle: any;
  name: string;
} | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_NAME);

      req.onsuccess = () => {
        if (req.result && req.result.handle) {
          resolve({
            handle: req.result.handle,
            name: req.result.name || 'Saved Output Folder',
          });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Failed to load directory handle from IndexedDB:', err);
    return null;
  }
}

/**
 * Verify and request permission to write to stored directory handle
 */
export async function verifyDirectoryPermission(
  handle: any,
  readWrite = true
): Promise<boolean> {
  if (!handle || typeof handle.queryPermission !== 'function') {
    return false;
  }

  const options = { mode: readWrite ? 'readwrite' : 'read' };

  try {
    if ((await handle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await handle.requestPermission(options)) === 'granted') {
      return true;
    }
  } catch (err) {
    console.warn('Directory permission query error:', err);
  }
  return false;
}

/**
 * Clear stored directory handle from IndexedDB
 */
export async function clearStoredDirectoryHandle(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(KEY_NAME);

      req.onsuccess = () => {
        try {
          localStorage.removeItem('saved_output_folder_name');
        } catch (_) {}
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear directory handle from IndexedDB:', err);
  }
}

/**
 * Write a Blob directly to a saved directory handle without prompt
 */
export async function saveBlobToDirectory(
  handle: any,
  blob: Blob,
  filename: string
): Promise<boolean> {
  if (!handle) return false;
  try {
    const hasPerm = await verifyDirectoryPermission(handle, true);
    if (!hasPerm) return false;

    const fileHandle = await handle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (err) {
    console.warn(`Failed to write ${filename} to directory handle:`, err);
    return false;
  }
}

/**
 * Write multiple Blobs directly to a saved directory handle
 */
export async function saveMultipleBlobsToDirectory(
  handle: any,
  files: { blob: Blob; filename: string }[]
): Promise<{ success: boolean; writtenCount: number }> {
  if (!handle) return { success: false, writtenCount: 0 };
  try {
    const hasPerm = await verifyDirectoryPermission(handle, true);
    if (!hasPerm) return { success: false, writtenCount: 0 };

    let written = 0;
    for (const item of files) {
      const fileHandle = await handle.getFileHandle(item.filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(item.blob);
      await writable.close();
      written++;
    }
    return { success: true, writtenCount: written };
  } catch (err) {
    console.warn('Failed to write multiple files to directory handle:', err);
    return { success: false, writtenCount: 0 };
  }
}
