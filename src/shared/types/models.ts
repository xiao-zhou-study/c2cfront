/**
 * 数据模型类型定义
 * 基于数据库设计自动生成
 */

// ==================== 用户相关模型 ====================

/**
 * 用户基本信息
 * 对应数据库 users 表 + user_stats 表的合并视图
 */
export interface User {
  id: string
  username: string
  email?: string // 改为可选，SQL中为NULL
  phone?: string
  avatarUrl?: string
  studentId?: string
  school?: string
  department?: string
  grade?: string
  creditScore: number
  isVerified: boolean
  status: 1 | 2 // 1:正常 2:禁用
  lastLoginAt?: number
  createdAt: number
  updatedAt: number
  // 来自user_stats表的字段（当后端查询用户时可能会返回）
  averageRating?: number
  totalRatings?: number
  itemsPublished?: number
  itemsBorrowed?: number
  itemsLent?: number
}

/**
 * 用户详细信息
 * 对应数据库 user_profiles 表
 */
export interface UserProfile {
  id: string
  userId: string
  realName?: string
  gender?: 0 | 1 | 2 // 0:保密 1:男 2:女
  birthday?: string // date类型
  bio?: string
  qq?: string
  wechat?: string
  createdAt: number
  updatedAt: number
}

/**
 * 用户统计信息
 */
export interface UserStats {
  id: string
  userId: string
  itemsPublished: number
  itemsBorrowed: number
  itemsLent: number
  totalRatings: number
  averageRating: number
  createdAt: number
  updatedAt: number
}

// ==================== 物品相关模型 ====================

/**
 * 物品分类
 */
export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  sortOrder: number
  isActive: boolean
  itemCount?: number
  createdAt: number
  updatedAt: number
}

/**
 * 更新物品分类请求体（PUT /is/categories/{id}）
 * 所有字段均为可选，只传需要修改的字段
 */
export interface CategoryUpdateRequest {
  name?: string
  description?: string
  icon?: string
  sortOrder?: number
  isActive?: boolean
}

/**
 * 物品信息
 * 对应后端 ItemsVO
 */
export interface Item {
  id: string
  userId: string // 物品所有者ID（逻辑外键，关联users表id）
  username?: string // 用户昵称
  avatar?: string // 用户头像
  title: string // 物品标题
  description?: string // 物品详细描述
  categoryId?: string // 物品分类ID
  categoryName?: string // 分类名称
  conditionLevel?: 0 | 1 | 2 // 物品成色：0-全新 1-九成新 2-八成新（对应后端 BRAND_NEW/ALMOST_NEW/GENTLY_USED）
  images?: string[] // 物品图片URL集合
  price: number // 租赁单价（元）
  billingType?: 'per_day' | 'per_week' | 'per_month' // 计费类型
  deposit: number // 押金金额（元）
  isNegotiable: boolean // 价格是否可议：FALSE-不可议，TRUE-可议
  minBorrowDays?: number // 最小租赁天数
  maxBorrowDays?: number // 最大租赁天数
  location?: string // 物品所在位置
  address?: string // 详细地址
  borrowConditions?: string // 借用条件
  status?: 1 | 2 | 3 // 物品状态：1-可借用, 2-已借出, 3-已下架
  viewCount?: number // 浏览次数
  favoriteCount?: number // 收藏次数
  // 兼容字段（保持向后兼容）
  ownerId?: string
  name?: string
  createdAt?: number
  updatedAt?: number
  // 扩展字段
  owner?: User
  category?: Category
  stats?: ItemStats
  isFavorite?: boolean // 前端状态：当前用户是否收藏
}

/**
 * 物品统计信息
 */
export interface ItemStats {
  id: string
  itemId: string
  viewCount: number
  favoriteCount: number
  borrowCount: number
  totalRatings: number
  averageRating: number
  createdAt: number
  updatedAt: number
}

// ==================== 订单相关模型 ====================

/**
 * 借用订单
 */
export interface BorrowOrder {
  id: string
  itemId: string
  borrowerId: string
  lenderId: string
  title: string
  price: number
  billingType: 'per_day' | 'per_week' | 'per_month'
  deposit: number
  borrowDays: number
  totalAmount: number
  purpose?: string
  status: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 // 1-待确认 2-待付款 3-借用中 4-待归还确认 5-已完成 6-已取消 7-已拒绝 8-争议中
  borrowTime?: number
  returnTime?: number
  actualReturnTime?: number
  cancelReason?: string
  createdAt: number
  updatedAt: number
  // 扩展字段
  item?: Item
  borrower?: User
  lender?: User
  /** 出借人姓名（分页接口直接返回，避免嵌套） */
  lenderName?: string
  /** 出借人头像（分页接口直接返回） */
  lenderAvatar?: string
  /** 借用人姓名（分页接口直接返回，如“我借出的”列表） */
  borrowerName?: string
  /** 借用人头像（分页接口直接返回） */
  borrowerAvatar?: string
  /** 物品名称（列表/详情接口返回） */
  itemName?: string
  /** 物品图片列表（列表/详情接口返回） */
  itemImages?: string[]
  /** 订单号 */
  orderNo?: string
  /** 计划开始/结束时间、预计归还时间（毫秒时间戳） */
  plannedStartTime?: number
  plannedEndTime?: number
  expectReturnTime?: number
  /** 确认时间、支付时间（毫秒时间戳） */
  confirmTime?: number
  payTime?: number
  /** 支付流水号（详情接口返回） */
  payTradeNo?: string
  /** 押金退还时间（毫秒时间戳） */
  refundTime?: number
  /** 乐观锁版本号，用于同意/归还/付款等操作（详情接口返回） */
  version?: number
}

/**
 * 订单日志
 */
export interface OrderLog {
  id: string
  orderId: string
  operatorId: string
  action: string
  remark?: string
  createdAt: number
  // 扩展字段
  operator?: User
}

// ==================== 通知相关模型 ====================

/**
 * 通知消息
 */
export interface Notification {
  id: string
  receiverId: string
  senderId?: string
  title: string
  content?: string
  type: 'system' | 'borrow' | 'return' | 'review' | 'comment' | 'like'
  relatedId?: string
  relatedType?: 'item' | 'order' | 'review'
  isRead: boolean
  readAt?: number
  isDeleted: boolean
  createdAt: number
  updatedAt: number
  // 扩展字段
  sender?: User
  status?: number // 通知状态：1-已发布 2-草稿
  isGlobal?: boolean // 是否全局通知
  createdByName?: string // 创建人姓名
  actions?: Array<{
    key: string
    label: string
    type?: string
    url?: string
    markRead?: boolean
  }> // 通知操作按钮
}

/**
 * 通知模板
 */
export interface NotificationTemplate {
  id: string
  code: string
  name: string
  titleTemplate: string
  contentTemplate: string
  type: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

// ==================== 文件相关模型 ====================

/**
 * 文件信息
 */
export interface FileInfo {
  id: string
  originalName: string
  fileName: string
  filePath: string
  fileSize: number
  fileType?: string
  mimeType?: string
  md5?: string
  bucket?: string
  url?: string
  uploaderId?: string
  module?: 'item' | 'user' | 'review'
  moduleId?: string
  status: 1 | 2 // 1:正常 2:已删除
  createdAt: number
  updatedAt: number
}

/**
 * 文件引用关系
 */
export interface FileReference {
  id: string
  fileId: string
  module: 'item' | 'user' | 'review'
  moduleId: string
  fieldName?: string
  sortOrder: number
  createdAt: number
}

// ==================== 评价相关模型 ====================

/**
 * 评价信息
 * 对应数据库 reviews 表
 */
export interface Review {
  id: string
  itemId: string
  reviewerId: string
  targetUserId: string
  orderId?: string
  rating: 1 | 2 | 3 | 4 | 5
  content?: string
  images?: string[] // JSON类型
  status: 1 | 2 // 1:正常 2:已删除
  isAnonymous: boolean
  createdAt: number
  updatedAt: number
  // 扩展字段
  item?: Item & { name?: string } // 物品可能包含 name 字段用于显示
  reviewer?: User & { avatar?: string } // 评价者可能包含 avatar 字段
  targetUser?: User
  order?: BorrowOrder
  replies?: Array<{
    id: string
    userId: string
    reviewId: string
    content: string
    createdAt: number
    updatedAt: number
    user?: User & { nickname?: string }
  }> // 评价回复列表
  tags?: string[] // 评价标签
}

/**
 * 评价统计
 */
export interface ReviewStats {
  id: string
  userId: string
  totalReviews: number
  avgRating: number
  oneStarCount: number
  twoStarCount: number
  threeStarCount: number
  fourStarCount: number
  fiveStarCount: number
  createdAt: number
  updatedAt: number
  // 前端扩展字段
  averageRating?: number // 与 avgRating 相同，用于前端兼容
  ratingDistribution?: Record<number, number> // 星级分布，索引为星级
}

// ==================== 认证相关模型 ====================

/**
 * 认证令牌
 */
export interface AuthToken {
  id: string
  userId: string
  token: string
  refreshToken?: string
  expiresAt: number
  refreshExpiresAt?: number
  tokenType?: string
  scopes?: string
  createdAt: number
  updatedAt: number
}

/**
 * 角色
 */
export interface Role {
  id: number
  name: string
  description?: string
  createdAt: number
  updatedAt: number
}

/**
 * 用户角色关联
 */
export interface UserRole {
  id: number
  userId: number
  roleId: number
  createdAt: number
}

// ==================== DTO（数据传输对象）====================

/**
 * 登录请求
 */
export interface LoginRequest {
  type: number // 登录方式：1-密码登录; 2-验证码登录
  email?: string // 邮箱
  studentId?: string // 学号
  phone?: string // 手机号
  password: string // 密码
  rememberMe?: boolean // 7天免密登录，默认false
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  username: string
  email: string
  password: string
  studentId: string
  department: string
  school?: string // 学校（前端扩展，后端可选用）
  type: number // 1-普通学生,2-管理员
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  refreshToken?: string
  user: User
  expiresIn?: number
  tokenType?: string
}

/**
 * 物品查询参数
 */
export interface ItemQueryParams {
  page?: number
  pageSize?: number
  categoryId?: number
  status?: number
  keyword?: string
  minPrice?: number
  maxPrice?: number
  ownerId?: number
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popularity'
}

/** 计费类型枚举值（与后端 BillingType 一致） */
export const BillingTypeValue = {
  PER_DAY: 1,
  PER_WEEK: 2,
  PER_MONTH: 3
} as const

/**
 * 物品发布/更新请求（对接 POST /is/items）
 * 新增时 id 为 null/不传，更新时必填
 */
export interface ItemPublishRequest {
  id?: number | null
  title: string
  description: string
  categoryId: number
  conditionLevel: number // 0-全新, 1-九成新, 2-八成新
  images: string[]
  price: number
  location: string
  address?: string
}

/**
 * 订单创建请求（前端旧版，仅作兼容）
 */
export interface OrderCreateRequest {
  itemId: string
  borrowDays: number
  purpose?: string
}

/**
 * 创建借用订单接口请求体（对接 POST /os/borrow_orders/create）
 * 字段均以 String 传递：itemId、plannedStartTime(毫秒)、plannedEndTime(毫秒)、purpose
 */
export interface CreateBorrowOrderRequest {
  itemId: string
  plannedStartTime: string
  plannedEndTime: string
  purpose: string
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  data?: T[] // 前端兼容字段，与 list 相同
}

/**
 * 统一响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp: number
}







