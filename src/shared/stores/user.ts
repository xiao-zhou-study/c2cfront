import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { getUserAvatar } from '@/shared/utils/images.js';
import { login as loginApi } from '@/shared/api/modules/auth';
import { getCurrentUserInfo } from '@/shared/api/modules/user';
import { LoginRequest, User } from '@/shared/types/models';
import { storage } from '@/shared/utils/storage';
import { STORAGE_KEY } from '@/shared/utils/constants';
import { AUTH_CONFIG, REFRESH_FAILURE_FACTOR } from '@/shared/config/auth-config';
import { ErrorHandler } from '@/shared/utils/error-handler';
import { debounce } from '@/shared/utils/debounce';
import { tabSyncManager, activityMonitor } from '@/shared/utils/tab-sync';
import service from '../api/request';

// 扩展的用户信息类型（User + UserProfile + UserStats 合并）
export interface UserExtended extends User {
  realName?: string
  gender?: 0 | 1 | 2
  birthday?: string
  bio?: string
  qq?: string
  wechat?: string
  itemsPublished?: number
  itemsBorrowed?: number
  itemsLent?: number
  totalRatings?: number
  averageRating?: number
}

// 解析 JWT token 的过期时间
const getTokenExpireTime = (token: string): number | null => {
  try {
    console.log('Parsing token expire time for token:', token.substring(0, 20) + '...');

    // 基础格式验证
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token structure: expected 3 parts, got', parts.length);
      return null;
    }

    // 解析payload
    const payloadStr = atob(parts[1]);
    const payload = JSON.parse(payloadStr);

    console.log('JWT payload:', payload);

    // 验证必要字段
    if (!payload || typeof payload.exp !== 'number') {
      console.error('Invalid JWT payload: missing or invalid exp field');
      return null;
    }

    // 将秒转换为毫秒
    const expireTime = payload.exp * 1000;
    console.log('Token expire time:', new Date(expireTime).toLocaleString());
    return expireTime;
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
};

// 判断 token 是否已过期
const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  const expireTime = getTokenExpireTime(token);
  if (!expireTime) {
    // 如果无法解析过期时间，假设token有效，避免登录失败
    console.warn('Token过期时间无法解析，假设有效');
    return false;
  }

  return expireTime < Date.now();
};

// 判断 token 是否即将过期（提前2分钟刷新）
const isTokenExpiringSoon = (token: string): boolean => {
  if (!token) return false;
  
  const expireTime = getTokenExpireTime(token);
  if (!expireTime) return false;
  
  // 提前2分钟（120000ms）刷新
  return expireTime - Date.now() < 2 * 60 * 1000;
};

export const useUserStore = defineStore('user', () => {
  const token = ref(storage.get(STORAGE_KEY.TOKEN, ''));
  const userInfo = ref<UserExtended>({} as UserExtended);
  // 记录本标签页最近一次认证状态变更时间（登录 / 登出 / token 刷新）
  const lastAuthChangeTime = ref<number>(Date.now());

  // 统一的刷新状态管理
  const isRefreshing = ref(false);
  const refreshPromise = ref<Promise<string> | null>(null);
  const lastRefreshTime = ref(0);
  const refreshFailureCount = ref(0);

  // 简化的请求队列管理
  const refreshRequestQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];;

  // 设置token（用于token刷新）- 提前定义以避免初始化错误
  const setToken = (newToken: string) => {
    token.value = newToken
    storage.set(STORAGE_KEY.TOKEN, newToken)
    lastAuthChangeTime.value = Date.now()
  }

  // 清除token - 用于登录前清除旧token
  const clearToken = () => {
    token.value = ''
    storage.remove(STORAGE_KEY.TOKEN)
    lastAuthChangeTime.value = Date.now()
  }

  // 登出 - 提前定义以避免初始化错误
  const logout = async () => {
    const currentUserId = userInfo.value.id || userInfo.value.studentId || 'anonymous'
    const draftKey = `draft_item_${currentUserId}`
    localStorage.removeItem(draftKey)

    token.value = ''
    userInfo.value = {
      id: '',
      username: '',
      email: undefined,
      phone: undefined,
      avatarUrl: undefined,
      studentId: undefined,
      school: undefined,
      department: undefined,
      grade: undefined,
      creditScore: 100,
      isVerified: false,
      status: 1,
      lastLoginAt: undefined,
      createdAt: 0,
      updatedAt: 0,
      realName: undefined,
      gender: undefined,
      birthday: undefined,
      bio: undefined,
      qq: undefined,
      wechat: undefined,
      itemsPublished: 0,
      itemsBorrowed: 0,
      itemsLent: 0,
      totalRatings: 0,
      averageRating: 0
    }

    storage.remove(STORAGE_KEY.TOKEN)
    lastAuthChangeTime.value = Date.now()
    tabSyncManager.broadcastLogout();
  }

  // 重置状态（用于token刷新失败）- 提前定义以避免初始化错误
  const resetState = async () => {
    token.value = ''
    userInfo.value = {
      id: '',
      username: '',
      email: undefined,
      phone: undefined,
      avatarUrl: undefined,
      studentId: undefined,
      school: undefined,
      department: undefined,
      grade: undefined,
      creditScore: 100,
      isVerified: false,
      status: 1,
      lastLoginAt: undefined,
      createdAt: 0,
      updatedAt: 0,
      realName: undefined,
      gender: undefined,
      birthday: undefined,
      bio: undefined,
      qq: undefined,
      wechat: undefined,
      itemsPublished: 0,
      itemsBorrowed: 0,
      itemsLent: 0,
      totalRatings: 0,
      averageRating: 0
    }

    storage.remove(STORAGE_KEY.TOKEN)
    lastAuthChangeTime.value = Date.now()
    tabSyncManager.broadcastTokenExpired();
  }

  // 计算属性
  const isLoggedIn = computed(() => {
    const hasToken = !!token.value;
    const isExpired = isTokenExpired(token.value);
    const result = hasToken && !isExpired;
    console.log('isLoggedIn computed:', { hasToken, isExpired, result, token: token.value?.substring(0, 20) + '...' });
    return result;
  });
  const userName = computed(() => userInfo.value.username || userInfo.value.studentId || '未登录');
  const userAvatar = computed(() => userInfo.value.avatarUrl || getUserAvatar(userInfo.value.id || userInfo.value.studentId, 200));
  const userId = computed(() => userInfo.value.id || userInfo.value.studentId || '');

  // 初始化多标签页同步和活动监控
  tabSyncManager.setUserStore({ setToken, logout, resetState, token, isLoggedIn, lastAuthChangeTime });
  activityMonitor.setUserStore({ setToken, logout, resetState, token, isLoggedIn, lastAuthChangeTime });

  // 简化的刷新策略 - 只在token即将过期时刷新
  const shouldRefreshToken = (tokenStr: string): boolean => {
    // 如果刚登录不久（1分钟内），不主动刷新
    if (Date.now() - lastRefreshTime.value < 60 * 1000) {
      return false;
    }

    const expireTime = getTokenExpireTime(tokenStr);
    if (!expireTime) return false;

    const timeUntilExpiry = expireTime - Date.now();
    // 提前2分钟刷新
    return timeUntilExpiry < 2 * 60 * 1000;
  };

  // 执行刷新的核心逻辑 - 使用独立的 axios 实例，避免循环调用
  const performRefresh = async (): Promise<string> => {
    console.log('开始刷新token，当前token:', token.value.substring(0, 20) + '...');

    // 创建一个独立的 axios 实例，不使用请求拦截器，避免循环刷新
    // baseURL 与全局请求配置保持一致：开发环境走 /api 代理，生产环境使用 VITE_API_BASE_URL
    const refreshAxios = axios.create({
      baseURL: import.meta.env.MODE === 'development'
        ? '/api'
        : (import.meta.env.VITE_API_BASE_URL as string) || 'https://api.zmwlovefmn.uk',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'client' // 必须添加此头，后端用于区分客户端
      },
      withCredentials: true // 允许携带 cookie（refresh token 在 cookie 中）
    });

    const response = await refreshAxios.get('/as/accounts/refresh') as any;

    // 根据后端统一响应格式（code, data, msg）提取 token
    const { data: res } = response;
    if (!res || res.code !== 0 && res.code !== 200) {
      const errorMsg = res?.msg || res?.message || 'Token刷新失败';
      console.error('Token刷新失败:', errorMsg);
      throw new Error(errorMsg);
    }

    // 从响应数据中提取 token
    const tokenData = res.data;
    if (!tokenData || typeof tokenData !== 'string') {
      console.error('获取的token无效:', tokenData);
      throw new Error('获取的token无效');
    }

    console.log('获取到新token:', tokenData.substring(0, 20) + '...');
    return tokenData;
  };

  // 处理刷新成功
  const handleRefreshSuccess = (newToken: string): void => {
    token.value = newToken;
    storage.set(STORAGE_KEY.TOKEN, newToken);
    lastRefreshTime.value = Date.now();
    lastAuthChangeTime.value = Date.now();

    console.log('Token已更新到store:', token.value.substring(0, 20) + '...');

    // 广播token刷新到其他标签页
    tabSyncManager.broadcastTokenRefresh(newToken);

    // 解决所有等待的请求
    refreshRequestQueue.forEach(({ resolve }) => resolve(newToken));
    refreshRequestQueue.length = 0;
  };

  // 处理刷新失败
  const handleRefreshFailure = async (error: Error): Promise<void> => {
    console.error('刷新token失败:', error);

    // 拒绝所有等待的请求
    refreshRequestQueue.forEach(({ reject }) => reject(error));
    refreshRequestQueue.length = 0;
  };

  // 主动刷新token - 简化版本
  const refreshTokenAction = async (autoRedirect = true): Promise<string> => {
    // 如果已经在刷新中，加入队列等待
    if (isRefreshing.value && refreshPromise.value) {
      console.log('Token正在刷新中，等待结果...');
      return new Promise((resolve, reject) => {
        refreshRequestQueue.push({ resolve, reject });

        // 设置超时保护，防止一直卡住
        setTimeout(() => {
          // 从队列中移除这个请求
          const index = refreshRequestQueue.findIndex(
            req => req.resolve === resolve && req.reject === reject
          );
          if (index !== -1) {
            refreshRequestQueue.splice(index, 1);
            reject(new Error('Token刷新超时'));
          }
        }, 10000); // 10秒超时
      });
    }

    isRefreshing.value = true;

    // 设置超时保护
    const timeoutTimer = setTimeout(() => {
      console.error('Token刷新超时，重置状态');
      isRefreshing.value = false;
      refreshPromise.value = null;

      // 拒绝所有等待的请求
      refreshRequestQueue.forEach(({ reject }) => reject(new Error('Token刷新超时')));
      refreshRequestQueue.length = 0;
    }, 15000); // 15秒超时

    try {
      refreshPromise.value = performRefresh();
      const newToken = await refreshPromise.value;

      clearTimeout(timeoutTimer);
      handleRefreshSuccess(newToken);
      refreshFailureCount.value = 0;

      return newToken;
    } catch (error) {
      clearTimeout(timeoutTimer);
      refreshFailureCount.value++;
      await handleRefreshFailure(error as Error);

      // 失败次数过多时重置状态
      if (refreshFailureCount.value >= 3) {
        await resetState();
        if (autoRedirect) {
          window.location.href = '/login';
        }
      }

      throw error;
    } finally {
      isRefreshing.value = false;
      refreshPromise.value = null;
    }
  };

  const login = async (loginData: LoginRequest) => {
    const tokenString = await loginApi(loginData);
    storage.set(STORAGE_KEY.TOKEN, tokenString);
    token.value = tokenString;
    lastRefreshTime.value = Date.now(); // 设置最后刷新时间，避免登录后立即触发刷新
    lastAuthChangeTime.value = Date.now();

    try {
      // 登录后立即拉取用户信息：跳过 token 检查，且 401 时不触发全局登出/跳转，避免清掉刚写入的 token
      const userInfoData = await getCurrentUserInfo(true, true);
      userInfo.value = userInfoData as UserExtended;
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }

    return { token: tokenString };
  }
  
  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      // 使用 /users/me 接口获取当前用户的完整信息
      const userInfoData = await getCurrentUserInfo()

      // 处理日期格式（LocalDate -> string）
      const formatDate = (date: any) => {
        if (!date) return ''
        if (typeof date === 'string') return date
        if (date instanceof Date) return date.toISOString().split('T')[0]
        if (date && date.year && date.month && date.day) {
          // 处理LocalDate对象 { year, monthValue, day }
          const year = date.year
          const month = String(date.monthValue || date.month).padStart(2, '0')
          const day = String(date.day).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        return String(date)
      }

      // 格式化日期字段（后端可能返回 User + UserProfile + UserStats 的合并数据）
      const formattedUserInfo: any = {
        ...userInfoData
      }

      // 如果存在 birthday 字段，则格式化它
      if ('birthday' in userInfoData && userInfoData.birthday) {
        formattedUserInfo.birthday = formatDate(userInfoData.birthday)
      }

      // 更新状态（不存储到localStorage）
      userInfo.value = formattedUserInfo as any

      return { user: formattedUserInfo }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      // 即使失败也返回本地状态
      return { user: userInfo.value }
    }
  }
  
  // 更新用户信息
  const updateUserInfo = async (data: Partial<User>) => {
    try {
      // 调用后端API更新用户信息
      const { updateUserInfo: updateUserInfoApi } = await import('@/shared/api/modules/user')
      const userId = userInfo.value.id || ''
      const updatedUser = await updateUserInfoApi(userId, data)

      // 更新本地状态（不存储到localStorage）
      userInfo.value = { ...userInfo.value, ...updatedUser, updatedAt: Date.now() }

      return userInfo.value
    } catch (error) {
      console.error('Failed to update user info:', error)
      throw error
    }
  }
  

  
  return {
    // 状态
    token,
    userInfo,
    isRefreshing,
    refreshFailureCount,
    lastAuthChangeTime,
    // 计算属性
    isLoggedIn,
    userName,
    userAvatar,
    userId,
    // 方法
    login,
    logout,
    fetchUserInfo,
    updateUserInfo,
    setToken,
    clearToken,
    resetState,
    refreshTokenAction,
    // 辅助函数
    isTokenExpired,
    isTokenExpiringSoon,
    shouldRefreshToken
  };
});