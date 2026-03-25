// 认证相关配置常量
export const AUTH_CONFIG = {
  // Token相关
  TOKEN_CACHE_TTL: 5 * 60 * 1000, // 5分钟缓存
  MAX_REFRESH_FAILURES: 3, // 最大刷新失败次数
  
  // 刷新策略
  DEFAULT_REFRESH_THRESHOLD: 2 * 60 * 1000, // 默认2分钟提前刷新
  MIN_REFRESH_INTERVAL: 30 * 1000, // 最小刷新间隔30秒
  REFRESH_DEBOUNCE_DELAY: 1000, // 刷新防抖延迟1秒
  
  // 队列管理
  QUEUE_TIMEOUT: 10 * 1000, // 队列超时10秒
  MAX_QUEUE_SIZE: 50, // 最大队列长度
  
  // 网络状态
  NETWORK_THROTTLE_DELAY: 3000, // 网络恢复节流3秒
  NETWORK_STABILIZE_DELAY: 1000, // 网络稳定延迟1秒
  
  // 活动监控
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30分钟无活动登出
  
  // 错误处理
  ERROR_SUPPRESSION_DURATION: 5000, // 5秒内相同错误不重复显示
  MAX_ERROR_COUNT: 3, // 最大错误计数
  
  // 存储限制
  MAX_STORAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_CACHE_SIZE: 100, // 最大缓存项数
  CACHE_TTL: 10 * 60 * 1000, // 10分钟缓存过期
  
  // 重试机制
  MAX_RETRIES: 3, // 最大重试次数
  BASE_RETRY_DELAY: 1000, // 基础重试延迟1秒
} as const;

// 刷新失败的递进系数
export const REFRESH_FAILURE_FACTOR = 1.5; // 失败次数越多，提前刷新越早

// Token验证相关
export const TOKEN_PATTERNS = {
  EXPIRED: [
    '登录超时',
    '无效的token',
    'token已过期',
    'expired',
    'invalid token',
    'unauthorized'
  ],
  NETWORK: [
    'timeout',
    'network',
    'fetch'
  ]
} as const;