/**
 * 常量定义
 */

// API配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10010'

// 存储键名
export const STORAGE_KEY = {
  TOKEN: 'xy_token',
  USER: 'xy_user',
  REFRESH_TOKEN: 'xy_refresh_token'
} as const

// 分页配置
export const PAGE_SIZE = 12
export const PAGE_SIZES = [12, 24, 48, 96]

// 订单状态（与后端一致：1-8）
export const ORDER_STATUS = {
  PENDING: 1,              // 待确认
  WAIT_PAY: 2,             // 待付款
  BORROWING: 3,            // 借用中
  WAIT_RETURN_CONFIRM: 4,   // 待归还确认
  COMPLETED: 5,            // 已完成
  CANCELLED: 6,            // 已取消
  REJECTED: 7,             // 已拒绝
  DISPUTE: 8               // 争议中
} as const

export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING]: '待确认',
  [ORDER_STATUS.WAIT_PAY]: '待付款',
  [ORDER_STATUS.BORROWING]: '借用中',
  [ORDER_STATUS.WAIT_RETURN_CONFIRM]: '待归还确认',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REJECTED]: '已拒绝',
  [ORDER_STATUS.DISPUTE]: '争议中'
}

export const ORDER_STATUS_COLOR = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.WAIT_PAY]: 'warning',
  [ORDER_STATUS.BORROWING]: 'primary',
  [ORDER_STATUS.WAIT_RETURN_CONFIRM]: 'info',
  [ORDER_STATUS.COMPLETED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'info',
  [ORDER_STATUS.REJECTED]: 'danger',
  [ORDER_STATUS.DISPUTE]: 'danger'
}

// 物品状态
export const ITEM_STATUS = {
  AVAILABLE: 1,     // 可借用
  BORROWED: 2,      // 已借出
  OFFLINE: 3        // 已下架
} as const

export const ITEM_STATUS_TEXT = {
  [ITEM_STATUS.AVAILABLE]: '可借用',
  [ITEM_STATUS.BORROWED]: '已借出',
  [ITEM_STATUS.OFFLINE]: '已下架'
}

export const ITEM_STATUS_COLOR = {
  [ITEM_STATUS.AVAILABLE]: 'success',
  [ITEM_STATUS.BORROWED]: 'warning',
  [ITEM_STATUS.OFFLINE]: 'info'
}

// 用户状态
export const USER_STATUS = {
  NORMAL: 1,        // 正常
  DISABLED: 2       // 禁用
} as const

// 性别
export const GENDER = {
  SECRET: 0,        // 保密
  MALE: 1,          // 男
  FEMALE: 2         // 女
} as const

export const GENDER_TEXT = {
  [GENDER.SECRET]: '保密',
  [GENDER.MALE]: '男',
  [GENDER.FEMALE]: '女'
}

// 物品成色
export const CONDITION_LEVEL = {
  NEW: 'new',
  NINETY: '90%',
  NINETY_FIVE: '95%',
  EIGHTY: '80%',
  SEVENTY: '70%',
  BELOW_SIXTY: 'below60%'
} as const

export const CONDITION_LEVEL_TEXT = {
  [CONDITION_LEVEL.NEW]: '全新',
  [CONDITION_LEVEL.NINETY]: '九成新',
  [CONDITION_LEVEL.NINETY_FIVE]: '九五新',
  [CONDITION_LEVEL.EIGHTY]: '八成新',
  [CONDITION_LEVEL.SEVENTY]: '七成新',
  [CONDITION_LEVEL.BELOW_SIXTY]: '六成新以下'
}

export const CONDITION_LEVEL_OPTIONS = [
  { value: CONDITION_LEVEL.NEW, label: '全新' },
  { value: CONDITION_LEVEL.NINETY_FIVE, label: '九五新' },
  { value: CONDITION_LEVEL.NINETY, label: '九成新' },
  { value: CONDITION_LEVEL.EIGHTY, label: '八成新' },
  { value: CONDITION_LEVEL.SEVENTY, label: '七成新' },
  { value: CONDITION_LEVEL.BELOW_SIXTY, label: '六成新以下' }
]

// 计费类型
export const BILLING_TYPE = {
  PER_DAY: 'per_day',
  PER_WEEK: 'per_week',
  PER_MONTH: 'per_month'
} as const

export const BILLING_TYPE_TEXT = {
  [BILLING_TYPE.PER_DAY]: '按天',
  [BILLING_TYPE.PER_WEEK]: '按周',
  [BILLING_TYPE.PER_MONTH]: '按月'
}

export const BILLING_TYPE_UNIT = {
  [BILLING_TYPE.PER_DAY]: '天',
  [BILLING_TYPE.PER_WEEK]: '周',
  [BILLING_TYPE.PER_MONTH]: '月'
}

// 通知类型
export const NOTIFICATION_TYPE = {
  SYSTEM: 'system',
  BORROW: 'borrow',
  RETURN: 'return',
  REVIEW: 'review',
  COMMENT: 'comment',
  LIKE: 'like'
} as const

export const NOTIFICATION_TYPE_TEXT = {
  [NOTIFICATION_TYPE.SYSTEM]: '系统通知',
  [NOTIFICATION_TYPE.BORROW]: '借用通知',
  [NOTIFICATION_TYPE.RETURN]: '归还通知',
  [NOTIFICATION_TYPE.REVIEW]: '评价通知',
  [NOTIFICATION_TYPE.COMMENT]: '评论通知',
  [NOTIFICATION_TYPE.LIKE]: '点赞通知'
}

// 评分星级
export const RATING_STARS = [1, 2, 3, 4, 5] as const

export const RATING_TEXT = {
  1: '很差',
  2: '较差',
  3: '一般',
  4: '满意',
  5: '非常满意'
}

// 文件类型
export const FILE_MODULE = {
  ITEM: 'item',
  USER: 'user',
  REVIEW: 'review'
} as const

// 图片上传限制
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5MB
export const IMAGE_MAX_COUNT = 6
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/jpg,image/webp'
