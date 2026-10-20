/**
 * Safe Storage Wrapper
 * 
 * Prevents QuotaExceededError or SecurityError on older iPads and Safari
 * in Private Browsing mode when accessing window.localStorage or window.sessionStorage.
 */

const localMemoryStore = new Map<string, string>();
const sessionMemoryStore = new Map<string, string>();

function testLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__synapse_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function testSessionStorage(): boolean {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return false;
    const testKey = '__synapse_test__';
    window.sessionStorage.setItem(testKey, '1');
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const isLocalStorageAvailable = testLocalStorage();
const isSessionStorageAvailable = testSessionStorage();

export const safeStorage = {
  getItem(key: string): string | null {
    if (isLocalStorageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Fall back to memory
      }
    }
    return localMemoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    if (isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fall back to memory
      }
    }
    localMemoryStore.set(key, value);
  },

  removeItem(key: string): void {
    if (isLocalStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fall back to memory
      }
    }
    localMemoryStore.delete(key);
  },

  clear(): void {
    if (isLocalStorageAvailable) {
      try {
        window.localStorage.clear();
      } catch {
        // Fall back to memory
      }
    }
    localMemoryStore.clear();
  }
};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (isSessionStorageAvailable) {
      try {
        return window.sessionStorage.getItem(key);
      } catch {
        // Fall back to memory
      }
    }
    return sessionMemoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    if (isSessionStorageAvailable) {
      try {
        window.sessionStorage.setItem(key, value);
        return;
      } catch {
        // Fall back to memory
      }
    }
    sessionMemoryStore.set(key, value);
  },

  removeItem(key: string): void {
    if (isSessionStorageAvailable) {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        // Fall back to memory
      }
    }
    sessionMemoryStore.delete(key);
  },

  clear(): void {
    if (isSessionStorageAvailable) {
      try {
        window.sessionStorage.clear();
      } catch {
        // Fall back to memory
      }
    }
    sessionMemoryStore.clear();
  }
};
