// 用户存储接口定义
interface UserStoreInterface {
  setToken: (token: string) => void;
  logout: () => Promise<void>;
  resetState: () => Promise<void>;
  token: { value: string };
  isLoggedIn: { value: boolean };
  // 本标签页最近一次认证状态变更时间（登录 / 登出 / 刷新）
  lastAuthChangeTime: { value: number };
}

// 多标签页同步管理器
import { AUTH_CONFIG } from '@/shared/config/auth-config';

export class TabSyncManager {
  private channel: BroadcastChannel | null = null;
  private userStore: UserStoreInterface | null = null;
  
  constructor() {
    this.initChannel();
    this.setupStorageListener();
  }
  
  setUserStore(store: UserStoreInterface): void {
    this.userStore = store;
  }
  
  private initChannel(): void {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('auth_sync');
        this.channel.addEventListener('message', this.handleMessage.bind(this));
      }
    } catch (error) {
      console.warn('BroadcastChannel not available:', error);
    }
  }
  
  private async handleMessage(event: MessageEvent): Promise<void> {
    const { type, data } = event.data;
    
    try {
      switch (type) {
        case 'token_refreshed':
          this.handleTokenRefreshed(data.token, data.timestamp);
          break;
        case 'user_logout':
          await this.handleUserLogout(data.timestamp);
          break;
        case 'token_expired':
          await this.handleTokenExpired(data.timestamp);
          break;
      }
    } catch (error) {
      console.error('Error handling tab sync message:', error);
    }
  }
  
  private handleTokenRefreshed(token: string, timestamp: number): void {
    if (!this.userStore) return;

    // 如果这条刷新广播早于本标签最近一次认证变更（例如本地刚登出 / 重新登录），则忽略
    if (timestamp < this.userStore.lastAuthChangeTime.value) {
      console.log('Ignore stale token_refreshed broadcast');
      return;
    }

    if (token !== this.userStore.token.value) {
      this.userStore.setToken(token);
      console.log('Token synced from other tab');
    }
  }
  
  private async handleUserLogout(timestamp: number): Promise<void> {
    if (!this.userStore) return;

    // 如果这条登出广播早于本标签最近一次认证变更（例如本地刚重新登录），则忽略
    if (timestamp < this.userStore.lastAuthChangeTime.value) {
      console.log('Ignore stale user_logout broadcast');
      return;
    }

    if (this.userStore.isLoggedIn) {
      try {
        await this.userStore.logout();
        console.log('Logout synced from other tab');
      } catch (error) {
        console.error('Failed to sync logout:', error);
      }
    }
  }
  
  private async handleTokenExpired(timestamp: number): Promise<void> {
    if (!this.userStore) return;

    // 如果这条过期广播早于本标签最近一次认证变更（例如本地刚重新登录），则忽略
    if (timestamp < this.userStore.lastAuthChangeTime.value) {
      console.log('Ignore stale token_expired broadcast');
      return;
    }

    if (this.userStore.isLoggedIn) {
      try {
        await this.userStore.resetState();
        console.log('Token expired synced from other tab');
      } catch (error) {
        console.error('Failed to sync token expiry:', error);
      }
    }
  }
  
  broadcastTokenRefresh(token: string): void {
    if (this.channel) {
      this.channel.postMessage({
        type: 'token_refreshed',
        data: { token, timestamp: Date.now() }
      });
    }
  }
  
  broadcastLogout(): void {
    if (this.channel) {
      this.channel.postMessage({
        type: 'user_logout',
        data: { timestamp: Date.now() }
      });
    }
  }
  
  broadcastTokenExpired(): void {
    if (this.channel) {
      this.channel.postMessage({
        type: 'token_expired',
        data: { timestamp: Date.now() }
      });
    }
  }
  
  private setupStorageListener(): void {
    try {
      window.addEventListener('storage', (event) => {
        if (event.key === 'auth_token_changed') {
          if (this.userStore) {
            this.userStore.setToken(event.newValue);
          }
        }
      });
    } catch (error) {
      console.warn('Storage listener setup failed:', error);
    }
  }
}

// 活动监控管理器
export class ActivityMonitor {
  private inactivityTimer: any = null;
  private readonly INACTIVITY_TIMEOUT = AUTH_CONFIG.INACTIVITY_TIMEOUT;
  private userStore: UserStoreInterface | null = null;
  private isActive = true;
  
  constructor() {
    this.setupEventListeners();
  }
  
  setUserStore(store: UserStoreInterface): void {
    this.userStore = store;
  }
  
  start(): void {
    this.isActive = true;
    this.resetTimer();
  }
  
  stop(): void {
    this.isActive = false;
    this.clearTimer();
    this.removeEventListeners();
  }
  
  private resetTimer(): void {
    if (!this.isActive) return;
    
    this.clearTimer();
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivity();
    }, this.INACTIVITY_TIMEOUT);
  }
  
  private clearTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
  
  private handleInactivity(): void {
    if (this.userStore && this.userStore.isLoggedIn) {
      console.log('User inactive, logging out...');
      this.userStore.logout();
      // 跳转到登录页面
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
  
  private boundHandleActivity: (() => void) | null = null;
  
  private setupEventListeners(): void {
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'keydown'
    ];
    
    // 确保绑定的函数引用一致
    this.boundHandleActivity = this.handleActivity.bind(this);
    
    events.forEach(event => {
      document.addEventListener(event, this.boundHandleActivity, true);
    });
  }
  
  private removeEventListeners(): void {
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'keydown'
    ];
    
    if (this.boundHandleActivity) {
      events.forEach(event => {
        document.removeEventListener(event, this.boundHandleActivity, true);
      });
      this.boundHandleActivity = null;
    }
  }
  
  private handleActivity(): void {
    this.resetTimer();
  }
}

// 创建全局实例
export const tabSyncManager = new TabSyncManager();
export const activityMonitor = new ActivityMonitor();