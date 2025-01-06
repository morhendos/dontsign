import { useState, useCallback, useEffect } from 'react';

export interface UseLocalStorageOptions<T> {
  key: string;
  initialValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export const useLocalStorage = <T>({ 
  key, 
  initialValue,
  serialize = JSON.stringify,
  deserialize = JSON.parse
}: UseLocalStorageOptions<T>) => {
  // Get initial value from storage or use provided initialValue
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update storage when value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, serialize(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, value]);

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [value, setValue, remove] as const;
};