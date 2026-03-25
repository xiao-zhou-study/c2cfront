// 页面启动验证工具
import { useUserStore } from '@/shared/stores/user';
import { AUTH_CONFIG } from '@/shared/config/auth-config';
import router from '@/router';

// 应用启动时验证token状态
export const validateAuthOnStartup = async (): Promise<void> => {
  const userStore = useUserStore();
  
  // 启动活动监控
  if (typeof window !== 'undefined') {
    import('@/shared/utils/tab-sync').then(({ activityMonitor }) => {
      activityMonitor.start();
    });
  }
  
  // 验证token状态
  if (userStore.token) {
    try {
      // 检查token是否已过期
      if (userStore.isTokenExpired(userStore.token)) {
        console.log('Token expired during startup, attempting refresh...');
        
        try {
          await userStore.refreshTokenAction(false);
          console.log('Token refreshed successfully on startup');
        } catch (error) {
          console.error('Token refresh failed on startup:', error);
          userStore.resetState();
          router.push('/login');
          return;
        }
      }
      
      // 获取用户信息
      if (!userStore.userInfo || !userStore.userInfo.id) {
        try {
          await userStore.fetchUserInfo();
          console.log('User info fetched on startup');
        } catch (error) {
          console.warn('Failed to fetch user info on startup:', error);
          // 不阻止应用启动，仅记录警告
        }
      }
    } catch (error) {
      console.error('Startup validation failed:', error);
      userStore.resetState();
      router.push('/login');
    }
  }
};

// 页面卸载时清理
export const cleanupOnPageUnload = (): void => {
  if (typeof window !== 'undefined') {
    import('@/shared/utils/tab-sync').then(({ activityMonitor }) => {
      activityMonitor.stop();
    });
  }
};

// 监听页面可见性变化
export const handleVisibilityChange = (): void => {
  if (typeof document === 'undefined') return;
  
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const userStore = useUserStore();
      
      // 页面重新可见时验证token状态
      if (userStore.token && userStore.isTokenExpired(userStore.token)) {
        try {
          await userStore.refreshTokenAction(false);
          console.log('Token refreshed on page visibility change');
        } catch (error) {
          console.error('Token refresh failed on visibility change:', error);
        }
      }
    }
  });
};

// 网络状态监控
export const monitorNetworkStatus = (): void => {
  if (typeof window === 'undefined') return;
  
  // 节流控制，防止网络频繁切换导致请求风暴
  let lastRefreshTime = 0;
  
  window.addEventListener('online', async () => {
    const now = Date.now();
    if (now - lastRefreshTime < AUTH_CONFIG.NETWORK_THROTTLE_DELAY) {
      console.log('Network restore throttled, skipping refresh');
      return;
    }
    
    console.log('Network restored, validating auth...');
    const userStore = useUserStore();
    lastRefreshTime = now;
    
    // 延迟一小段时间，确保网络真正稳定
    setTimeout(async () => {
      if (userStore.token && userStore.isTokenExpired(userStore.token)) {
        try {
          await userStore.refreshTokenAction(false);
          console.log('Token refreshed on network restore');
        } catch (error) {
          console.error('Token refresh failed on network restore:', error);
        }
      }
    }, AUTH_CONFIG.NETWORK_STABILIZE_DELAY);
  });
};