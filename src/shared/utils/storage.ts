// LRU缓存项接口
interface CacheItem<V> {
  value: V;
  timestamp: number;
  accessCount: number;
}

// 增强的存储工具类
import { AUTH_CONFIG } from '@/shared/config/auth-config';

class Storage {
  private memoryCache = new Map<string, CacheItem<any>>();
  private isLocalStorageAvailable = this.checkLocalStorageAvailability();

  private checkLocalStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  get<T = any>(key: string, defaultValue: T = '' as T): T {
    try {
      // 优先从内存缓存读取
      const cacheItem = this.memoryCache.get(key);
      if (cacheItem) {
        // 更新访问统计
        cacheItem.accessCount++;
        cacheItem.timestamp = Date.now();
        
        // 检查是否过期
        if (Date.now() - cacheItem.timestamp < AUTH_CONFIG.CACHE_TTL) {
          return cacheItem.value;
        } else {
          // 过期则删除
          this.memoryCache.delete(key);
        }
      }
      
      if (!this.isLocalStorageAvailable) {
        return defaultValue;
      }
      
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      
      const parsed = JSON.parse(value);
      this.setCacheItem(key, parsed);
      return parsed as T;
    } catch (error) {
      console.warn('Storage get error:', error);
      return defaultValue;
    }
  }
  
  set(key: string, value: any): void {
    try {
    // 更新内存缓存
    this.setCacheItem(key, value);
    
    if (!this.isLocalStorageAvailable) {
      return;
    }
    
    // 检查存储空间
    const serialized = JSON.stringify(value);
    if (serialized.length > AUTH_CONFIG.MAX_STORAGE_SIZE) {
      console.warn('Storage value too large, skipping localStorage');
      return;
    }
      
      localStorage.setItem(key, serialized);
      
      // 触发跨标签页同步
      this.broadcastStorageChange(key, value);
    } catch (error) {
      console.warn('Storage set error:', error);
      // 清理存储空间后重试
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanupStorage();
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (retryError) {
          console.error('Storage retry failed:', retryError);
        }
      }
    }
  }

  // 设置缓存项，包含LRU管理
  private setCacheItem<V>(key: string, value: V): void {
    // 如果缓存已满，清理最少使用的项
    if (this.memoryCache.size >= AUTH_CONFIG.MAX_CACHE_SIZE) {
      this.evictLRU();
    }
    
    const cacheItem: CacheItem<V> = {
      value,
      timestamp: Date.now(),
      accessCount: 1
    };
    
    this.memoryCache.set(key, cacheItem);
  }

  // LRU淘汰策略：移除最少使用的缓存项
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestScore = Infinity;
    
    for (const [key, item] of this.memoryCache.entries()) {
      // 综合考虑时间戳和访问次数
      const score = item.timestamp - (item.accessCount * 1000);
      if (score < oldestScore) {
        oldestScore = score;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      console.debug(`Evicted LRU cache item: ${oldestKey}`);
    }
  }
  
  remove(key: string): void {
    try {
      // 从内存缓存删除
      this.memoryCache.delete(key);
      
      if (!this.isLocalStorageAvailable) {
        return;
      }
      
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Storage remove error:', error);
    }
  }

  // 清理过期缓存
  private cleanExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > AUTH_CONFIG.CACHE_TTL) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.memoryCache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.debug(`Cleaned up ${expiredKeys.length} expired cache items`);
    }
  }
  
  clear(): void {
    try {
      this.memoryCache.clear();
      
      if (!this.isLocalStorageAvailable) {
        return;
      }
      
      localStorage.clear();
    } catch (error) {
      console.warn('Storage clear error:', error);
    }
  }
  
  private cleanupStorage(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('draft_') || key.includes('temp_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleaned up ${keysToRemove.length} storage items`);
    } catch (error) {
      console.warn('Storage cleanup failed:', error);
    }
  }
  
  // 跨标签页同步
  private broadcastStorageChange(key: string, value: any): void {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('storage_sync');
        channel.postMessage({ type: 'storage_change', key, value, timestamp: Date.now() });
        channel.close();
      }
    } catch (error) {
      console.warn('Broadcast channel not available:', error);
    }
  }
  
  // 监听跨标签页变化
  setupTabSync(): void {
    try {
      // 监听localStorage变化
      window.addEventListener('storage', (event) => {
        if (event.key && event.key !== null) {
          // 更新内存缓存
          if (event.newValue !== null) {
            try {
              const parsed = JSON.parse(event.newValue);
              this.setCacheItem(event.key, parsed);
            } catch (parseError) {
              console.warn('Failed to parse storage change:', parseError);
              this.memoryCache.delete(event.key);
            }
          } else {
            this.memoryCache.delete(event.key);
          }
        }
      });
      
      // 监听BroadcastChannel
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('storage_sync');
        channel.addEventListener('message', (event) => {
          if (event.data.type === 'storage_change') {
            this.setCacheItem(event.data.key, event.data.value);
          }
        });
      }
      
      // 定期清理过期缓存
      setInterval(() => {
        this.cleanExpiredCache();
      }, 5 * 60 * 1000); // 每5分钟清理一次
    } catch (error) {
      console.warn('Tab sync setup failed:', error);
    }
  }
}

// 创建单例
const storage = new Storage();
storage.setupTabSync();

export { storage };