"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Always start from `initialValue` on both server and the client's first (hydration) render.
  // Reading localStorage synchronously in the initializer would make the very first client
  // render diverge from the server-rendered markup whenever the stored value differs from
  // `initialValue` (e.g. a user who switched away from the default language), which React
  // reports as a hydration mismatch. Instead, the real stored value is applied in an effect
  // below, after hydration completes.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
    // Only re-sync from storage when the key itself changes; not on every storedValue update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    // This effect ensures that the state is updated if localStorage changes from another tab/window.
    // It's optional and can be removed if not needed.
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);


  return [storedValue, setValue];
}

export default useLocalStorage;
