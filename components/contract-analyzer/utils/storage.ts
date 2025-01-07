import { type StorageOptions, type StoredAnalysis } from '../types';

const DEFAULT_OPTIONS: Required<StorageOptions> = {
  maxItems: 10,
  storageKey: 'dontsign_analyses'
};

const isBrowser = typeof window !== 'undefined';

export const storage = {
  get: (options: StorageOptions = {}) => {
    if (!isBrowser) return [];
    
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
    if (!isBrowser) return false;

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
    const updated = [analysis, ...current.filter(a => a.fileHash !== analysis.fileHash)];
    return storage.set(updated, options);
  },

  update: (fileHash: string, options: StorageOptions = {}) => {
    const current = storage.get(options);
    const existingIndex = current.findIndex(a => a.fileHash === fileHash);
    if (existingIndex === -1) return false;

    // Move to top with updated timestamp
    const item = current[existingIndex];
    const updated = [
      { ...item, analyzedAt: new Date().toISOString() },
      ...current.slice(0, existingIndex),
      ...current.slice(existingIndex + 1)
    ];

    return storage.set(updated, options);
  },

  clear: (options: StorageOptions = {}) => {
    if (!isBrowser) return false;

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