// IndexedDB 存储方案 - 替代 React Native AsyncStorage

interface DatabaseConfig {
  name: string;
  version: number;
  stores: StoreConfig[];
}

interface StoreConfig {
  name: string;
  keyPath: string;
  indexes?: IndexConfig[];
}

interface IndexConfig {
  name: string;
  keyPath: string;
  options?: IDBIndexParameters;
}

// 数据库配置
const DATABASE_CONFIG: DatabaseConfig = {
  name: 'MoodGuardDB',
  version: 1,
  stores: [
    {
      name: 'emotions',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'date', keyPath: 'date' },
        { name: 'timestamp', keyPath: 'timestamp' },
      ],
    },
    {
      name: 'pressureAssessments',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'date', keyPath: 'date' },
      ],
    },
    {
      name: 'psychologicalTools',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'toolType', keyPath: 'toolType' },
        { name: 'timestamp', keyPath: 'timestamp' },
      ],
    },
    {
      name: 'userSettings',
      keyPath: 'userId',
    },
    {
      name: 'parentMonitoring',
      keyPath: 'id',
      indexes: [
        { name: 'parentId', keyPath: 'parentId' },
        { name: 'studentId', keyPath: 'studentId' },
        { name: 'date', keyPath: 'date' },
      ],
    },
  ],
};

class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private initialized = false;

  // 初始化数据库
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_CONFIG.name, DATABASE_CONFIG.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建或更新对象存储
        for (const storeConfig of DATABASE_CONFIG.stores) {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath,
            });

            // 创建索引
            if (storeConfig.indexes) {
              for (const indexConfig of storeConfig.indexes) {
                store.createIndex(
                  indexConfig.name,
                  indexConfig.keyPath,
                  indexConfig.options
                );
              }
            }
          }
        }
      };
    });
  }

  // 确保数据库已初始化
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized || !this.db) {
      await this.init();
    }
  }

  // 添加数据
  async add<T>(storeName: string, data: T): Promise<string> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string);
    });
  }

  // 获取数据
  async get<T>(storeName: string, key: string): Promise<T | null> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  // 更新数据
  async update<T>(storeName: string, data: T): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // 删除数据
  async delete(storeName: string, key: string): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // 获取所有数据
  async getAll<T>(storeName: string): Promise<T[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // 根据索引查询数据
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    key: any
  ): Promise<T[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // 根据索引范围查询数据
  async getByIndexRange<T>(
    storeName: string,
    indexName: string,
    range: IDBKeyRange
  ): Promise<T[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // 清空存储
  async clear(storeName: string): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // 获取存储数量
  async count(storeName: string, indexName?: string, key?: any): Promise<number> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      let request: IDBRequest<number>;
      if (indexName && key !== undefined) {
        const index = store.index(indexName);
        request = index.count(key);
      } else {
        request = store.count();
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // 检查数据库是否支持
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  // 删除整个数据库
  async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DATABASE_CONFIG.name);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = null;
        this.initialized = false;
        resolve();
      };
    });
  }
}

// 创建全局实例
export const indexedDBStorage = new IndexedDBStorage();

// 导出类型
export interface MediaItem {
  type: 'image' | 'video' | 'drawing';
  data: string; // base64 data or URL
  thumbnail?: string;
}

export interface EmotionRecord {
  id: string;
  userId: string;
  emotion: string;
  intensity: number;
  description?: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  tags?: string[];
  media?: MediaItem[];
}

export interface PressureAssessment {
  id: string;
  userId: string;
  score: number;
  factors: string[];
  suggestions: string[];
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface PsychologicalToolRecord {
  id: string;
  userId: string;
  toolType: string;
  duration: number;
  result?: any;
  timestamp: number;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  reminderTime?: string;
}

export interface ParentMonitoringRecord {
  id: string;
  parentId: string;
  studentId: string;
  studentName: string;
  emotionSummary: string;
  pressureLevel: number;
  lastActivity: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
}