import { useState, useEffect } from 'react';

interface StorageItem<T> {
  value: T;
  timestamp: number;
}

interface SetValue<T> {
  (value: T | ((val: T) => T)): void;
}

interface UseLocalStorageError extends Error {
  key: string;
  type: 'read' | 'write';
}

export function useLocalStorage<T>(key: string, initialValue: T): readonly [T, SetValue<T>] {
  // Early return for SSR
  const isBrowser = typeof window !== 'undefined';
  
  const createError = (type: 'read' | 'write', originalError: unknown): UseLocalStorageError => {
    const error = new Error(
      `LocalStorage ${type} error for key "${key}": ${originalError instanceof Error ? originalError.message : 'Unknown error'}`
    ) as UseLocalStorageError;
    error.key = key;
    error.type = type;
    return error;
  };

  const readValue = (): T => {
    if (!isBrowser) {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;

      const stored = JSON.parse(item) as StorageItem<T>;
      return stored.value;
    } catch (error) {
      console.warn(createError('read', error));
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: SetValue<T> = (value) => {
    if (!isBrowser) {
      console.warn(`Cannot set localStorage key "${key}" during SSR`);
      return;
    }

    try {
      // Handle function updates
      const newValue = value instanceof Function ? value(storedValue) : value;
      
      // Create storage item with timestamp
      const item: StorageItem<T> = {
        value: newValue,
        timestamp: Date.now(),
      };

      // Update state
      setStoredValue(newValue);
      
      // Update localStorage
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn(createError('write', error));
    }
  };

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    if (!isBrowser) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return;

      try {
        const newItem = JSON.parse(event.newValue) as StorageItem<T>;
        setStoredValue(newItem.value);
      } catch (error) {
        console.warn(createError('read', error));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, isBrowser]);

  // Read value from localStorage on mount
  useEffect(() => {
    setStoredValue(readValue());
  }, [key]); // Re-run if key changes

  return [storedValue, setValue] as const;
} 