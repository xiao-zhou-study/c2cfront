/**
 * API配置
 * 根据后端gateway路由配置定义API路径前缀
 */

// Gateway路由前缀配置
export const API_ROUTES = {
  // 认证服务路由 - /as/**
  AUTH: '/as',

  // 用户服务路由 - /us/**
  USER: '/us',

  // 物品服务路由 - /is/**
  ITEM: '/is',

  // 订单服务路由 - /os/**
  ORDER: '/os',

  // 存储服务路由 - /ss/**
  STORAGE: '/ss',

  // 评价服务路由 - /rs/** (实际Controller路径是/reviews，所以完整路径是/rs/reviews)
  REVIEW: '/rs',

  // 通知服务路由 - /ns/** (实际Controller路径是/notifications，所以完整路径是/ns/notifications)
  NOTIFICATION: '/ns',

  // 博客/讨论区服务路由 - /cs/**
  BLOG: '/cs'
} as const

// API端点配置
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: `${API_ROUTES.AUTH}/accounts/login`,
    ADMIN_LOGIN: `${API_ROUTES.AUTH}/accounts/admin/login`,
    REGISTER: `${API_ROUTES.USER}/users/register`,
    LOGOUT: `${API_ROUTES.AUTH}/accounts/logout`,
    REFRESH: `${API_ROUTES.AUTH}/accounts/refresh`
  },

  // 用户相关
  USER: {
    INFO: (userId: number) => `${API_ROUTES.USER}/users/${userId}`,
    PROFILE: (userId: number) => `${API_ROUTES.USER}/users/${userId}/profile`,
    STATS: (userId: number) => `${API_ROUTES.USER}/users/${userId}/stats`,
    UPDATE_INFO: (userId: number) => `${API_ROUTES.USER}/users/${userId}`,
    UPDATE_PROFILE: (userId: number) => `${API_ROUTES.USER}/users/${userId}/profile`,
    AVATAR: `${API_ROUTES.USER}/users/avatar`,
    CHANGE_PASSWORD: `${API_ROUTES.USER}/users/change-password`,
    VERIFY: `${API_ROUTES.USER}/users/verify`,
    DETAIL: (isStaff: boolean) => `${API_ROUTES.USER}/users/detail/${isStaff}`,
    LIST: `${API_ROUTES.USER}/users/list`,
    ADD_STAFF: `${API_ROUTES.USER}/users/addStaff`
  },

  // 物品相关
  ITEM: {
    LIST: `${API_ROUTES.ITEM}/items`,
    DETAIL: (itemId: number) => `${API_ROUTES.ITEM}/items/${itemId}`,
    CREATE: `${API_ROUTES.ITEM}/items`,
    UPDATE: (itemId: number) => `${API_ROUTES.ITEM}/items/${itemId}`,
    DELETE: (itemId: number) => `${API_ROUTES.ITEM}/items/${itemId}`,
    CATEGORIES: `${API_ROUTES.ITEM}/categories`,
    RECOMMENDED: `${API_ROUTES.ITEM}/items/recommended`,
    NEWEST: `${API_ROUTES.ITEM}/items`,
    HOT: `${API_ROUTES.ITEM}/items/hot`,
    USER_ITEMS: (userId: number) => `${API_ROUTES.ITEM}/items/user/${userId}`,
    STATS: `${API_ROUTES.ITEM}/items/stats`,
    UPDATE_STATUS: (itemId: number) => `${API_ROUTES.ITEM}/items/${itemId}/status`,
    BATCH_UPDATE_STATUS: `${API_ROUTES.ITEM}/items/batch/status`
  },

  // 订单相关
  ORDER: {
    CREATE: `${API_ROUTES.ORDER}`,
    LIST: `${API_ROUTES.ORDER}`,
    DETAIL: (orderId: number) => `${API_ROUTES.ORDER}/${orderId}`,
    UPDATE: (orderId: number) => `${API_ROUTES.ORDER}/${orderId}`,
    CANCEL: `${API_ROUTES.ORDER}/cancel`,
    CONFIRM: `${API_ROUTES.ORDER}/confirm`,
    REJECT: `${API_ROUTES.ORDER}/reject`,
    BORROW: `${API_ROUTES.ORDER}/borrow`,
    RETURN: `${API_ROUTES.ORDER}/return`,
    ITEM_ORDERS: (itemId: number) => `${API_ROUTES.ORDER}/item/${itemId}`,
    LOGS: (orderId: number) => `${API_ROUTES.ORDER}/${orderId}/logs`,
    STATS: `${API_ROUTES.ORDER}/stats`
  },

  // 存储相关
  STORAGE: {
    UPLOAD: `${API_ROUTES.STORAGE}/files/upload`,
    UPLOAD_BATCH: `${API_ROUTES.STORAGE}/files/upload/batch`,
    DELETE: (fileId: string) => `${API_ROUTES.STORAGE}/files/${fileId}`,
    INFO: (fileId: string) => `${API_ROUTES.STORAGE}/files/${fileId}`
  },

  // 评价相关
  REVIEW: {
    CREATE: `${API_ROUTES.REVIEW}/reviews/reviews`,
    ITEM_REVIEWS: (itemId: number) => `${API_ROUTES.REVIEW}/reviews/item/${itemId}`,
    USER_REVIEWS: (userId: number) => `${API_ROUTES.REVIEW}/reviews/user/${userId}`,
    MY_REVIEWS: `${API_ROUTES.REVIEW}/reviews/my-reviews`,
    STATS: (userId: number) => `${API_ROUTES.REVIEW}/reviews/reviews/stats/${userId}`,
    DELETE: (reviewId: number) => `${API_ROUTES.REVIEW}/reviews/reviews/${reviewId}`,
    UPDATE: (reviewId: number) => `${API_ROUTES.REVIEW}/reviews/reviews/${reviewId}`,
    CAN_REVIEW: (orderId: number) => `${API_ROUTES.REVIEW}/reviews/can-review/${orderId}`,
    REPORT: (reviewId: number) => `${API_ROUTES.REVIEW}/reviews/reviews/${reviewId}/report`
  },

  // 通知相关
  NOTIFICATION: {
    LIST: `${API_ROUTES.NOTIFICATION}/notifications`,
    UNREAD_COUNT: `${API_ROUTES.NOTIFICATION}/notifications/unread-count`,
    MARK_READ: (notificationId: string) => `${API_ROUTES.NOTIFICATION}/notifications/${notificationId}/read`,
    MARK_ALL_READ: `${API_ROUTES.NOTIFICATION}/notifications/read-all`,
    DELETE: (notificationId: string) => `${API_ROUTES.NOTIFICATION}/notifications/${notificationId}`,
    CLEAR_ALL: `${API_ROUTES.NOTIFICATION}/notifications/clear-all`,
    LATEST: `${API_ROUTES.NOTIFICATION}/notifications/latest`
  },

  // 博客/讨论区相关
  BLOG: {
    TOPIC_ADD_OR_UPDATE: `${API_ROUTES.BLOG}/topics/addOrUpdate`,
    TOPIC_DELETE: `${API_ROUTES.BLOG}/topics/delete`,
    TOPIC_LIST: `${API_ROUTES.BLOG}/topics/list`,
    COMMENT_ADD: `${API_ROUTES.BLOG}/comments`,
    COMMENT_DELETE: `${API_ROUTES.BLOG}/comments/delete`,
    COMMENT_PAGE: `${API_ROUTES.BLOG}/comments/page`
  }
} as const