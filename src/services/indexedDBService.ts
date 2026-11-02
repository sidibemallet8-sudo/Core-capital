/**
 * CORE CAPITAL V3 — Moteur de Persistance Hors-Ligne IndexedDB
 * Permet à l'utilisateur de consulter et d'éditer ses données financières
 * même sans aucune connexion internet (mode 100% autonome).
 */

const DB_NAME = 'CoreCapitalDB_V3';
const DB_VERSION = 1;

export const STORES = {
  USER_PROFILE: 'user_profile',
  INCOME_SOURCES: 'income_sources',
  TRANSACTIONS: 'transactions',
  SCHEDULED_EXPENSES: 'scheduled_expenses',
  SAVINGS_GOALS: 'savings_goals',
  MARKET_ASSETS: 'market_assets',
  MARKET_ALERTS: 'market_alerts',
  PROJECTS: 'projects',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

class IndexedDBStorageEngine {
  private db: IDBDatabase | null = null;
  private isAvailable: boolean = true;
  private initPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isAvailable = false;
    }
  }

  public async getDB(): Promise<IDBDatabase | null> {
    if (!this.isAvailable) return null;
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          Object.values(STORES).forEach((store) => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store, { keyPath: 'id' });
            }
          });
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };

        request.onerror = (e) => {
          console.warn('[CORE CAPITAL IndexedDB] Erreur d’ouverture, bascule vers LocalStorage:', e);
          this.isAvailable = false;
          resolve(null);
        };
      } catch (err) {
        console.warn('[CORE CAPITAL IndexedDB] Exception au démarrage:', err);
        this.isAvailable = false;
        resolve(null);
      }
    });

    return this.initPromise;
  }

  public async getAll<T>(storeName: StoreName, fallbackData: T[] = []): Promise<T[]> {
    const db = await this.getDB();
    if (!db) {
      try {
        const ls = localStorage.getItem(`cc_${storeName}`);
        return ls ? JSON.parse(ls) : fallbackData;
      } catch {
        return fallbackData;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => {
          const res = req.result as T[];
          if (!res || res.length === 0) {
            resolve(fallbackData);
          } else {
            resolve(res);
          }
        };

        req.onerror = () => {
          resolve(fallbackData);
        };
      } catch (err) {
        console.warn(`Erreur getAll sur ${storeName}:`, err);
        resolve(fallbackData);
      }
    });
  }

  public async put<T extends { id: string }>(storeName: StoreName, item: T): Promise<void> {
    // Miroir LocalStorage pour résilience maximale
    try {
      const items = await this.getAll<T>(storeName, []);
      const index = items.findIndex((i) => i.id === item.id);
      if (index >= 0) items[index] = item;
      else items.unshift(item);
      localStorage.setItem(`cc_${storeName}`, JSON.stringify(items));
    } catch {}

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async bulkPut<T extends { id: string }>(storeName: StoreName, items: T[]): Promise<void> {
    try {
      localStorage.setItem(`cc_${storeName}`, JSON.stringify(items));
    } catch {}

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        items.forEach((item) => store.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async delete(storeName: StoreName, id: string): Promise<void> {
    try {
      const items = await this.getAll<{ id: string }>(storeName, []);
      const filtered = items.filter((i) => i.id !== id);
      localStorage.setItem(`cc_${storeName}`, JSON.stringify(filtered));
    } catch {}

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async clearStore(storeName: StoreName): Promise<void> {
    try {
      localStorage.removeItem(`cc_${storeName}`);
    } catch {}

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

export const indexedDBService = new IndexedDBStorageEngine();
