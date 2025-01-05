import { type StorageOptions, type StoredAnalysis } from '../types';

const DEFAULT_OPTIONS: Required<StorageOptions> = {
  maxItems: 10,
  storageKey: 'dontsign_analyses'
};

export const storage = {
  get: (options: StorageOptions = {}) => {
    const { storageKey } = { ...DEFAULT_OPTIONS, ...options };
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as StoredAnalysis[]) : [];
    } catch (error) {
      console.error('[Storage] Error reading storage:', error);
      return [];
    }
  },

  set: (analyses: StoredAnalysis[], options: StorageOptions = {}) => {
    const { maxItems, storageKey } = { ...DEFAULT_OPTIONS, ...options };
    try {
      // Keep only the latest maxItems
      const trimmed = analyses.slice(0, maxItems);
      localStorage.setItem(storageKey, JSON.stringify(trimmed));
      return true;
    } catch (error) {
      console.error('[Storage] Error writing storage:', error);
      return false;
    }
  },

  add: (analysis: StoredAnalysis, options: StorageOptions = {}) => {
    const current = storage.get(options);
    const updated = [analysis, ...current];
    return storage.set(updated, options);
  },

  clear: (options: StorageOptions = {}) => {
    const { storageKey } = { ...DEFAULT_OPTIONS, ...options };
    try {
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
      return false;
    }
  }
};
