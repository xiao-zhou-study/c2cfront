/**
 * Mock数据服务
 * 提供模拟API响应，用于前端开发和测试
 * 当后端API未就绪时使用
 */

import { 
  generateMockUser, 
  generateMockUserProfile, 
  generateMockUserStats,
  generateMockCategories,
  generateMockItem,
  generateMockItemStats,
  generateMockOrder,
  generateMockNotification,
  generateMockReview,
  generateMockReviewStats,
  generateMockList,
  generateMockPageData
} from '../utils/mockData'
import type { 
  User, 
  UserProfile, 
  UserStats, 
  Item, 
  Category, 
  BorrowOrder, 
  Notification, 
  Review,
  ReviewStats,
  ItemStats,
  PageResponse,
  LoginResponse
} from '../types/models'

/**
 * 延迟模拟网络请求
 */
function delay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟API响应包装
 */
async function mockResponse<T>(data: T, delayMs: number = 500): Promise<T> {
  await delay(delayMs)
  return data
}

// ==================== 认证相关 Mock ====================

export const mockAuthService = {
  /**
   * 模拟登录
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const user = generateMockUser(1)
    user.username = username
    
    return mockResponse({
      token: `mock_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    })
  },

  /**
   * 模拟注册
   */
  async register(data: any): Promise<User> {
    const user = generateMockUser()
    return mockResponse({ ...user, ...data })
  },

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<User> {
    return mockResponse(generateMockUser(1))
  }
}

// ==================== 用户相关 Mock ====================

export const mockUserService = {
  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string): Promise<User> {
    return mockResponse(generateMockUser(parseInt(userId, 10)))
  },

  /**
   * 获取用户详情
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    return mockResponse(generateMockUserProfile(userId))
  },

  /**
   * 获取用户统计
   */
  async getUserStats(userId: string): Promise<UserStats> {
    return mockResponse(generateMockUserStats(userId))
  },

  /**
   * 更新用户信息
   */
  async updateUserInfo(userId: string, data: Partial<User>): Promise<User> {
    const user = generateMockUser(parseInt(userId, 10))
    return mockResponse({ ...user, ...data })
  },

  /**
   * 更新用户详情
   */
  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const profile = generateMockUserProfile(userId)
    return mockResponse({ ...profile, ...data })
  }
}

// ==================== 物品相关 Mock ====================

export const mockItemService = {
  /**
   * 获取物品列表
   */
  async getItemList(params: {
    page?: number
    pageSize?: number
    categoryId?: number
    status?: number
    keyword?: string
    sortBy?: string
  }): Promise<PageResponse<Item>> {
    const { page = 1, pageSize = 12 } = params
    // 确保至少返回一些数据
    const total = 24
    return mockResponse(generateMockPageData(generateMockItem, page, pageSize, total))
  },

  /**
   * 获取物品详情
   */
  async getItemDetail(itemId: string): Promise<Item> {
    const item = generateMockItem(parseInt(itemId, 10))
    item.stats = generateMockItemStats(parseInt(itemId, 10))
    return mockResponse(item)
  },

  /**
   * 获取物品统计
   */
  async getItemStats(itemId: string): Promise<ItemStats> {
    return mockResponse(generateMockItemStats(parseInt(itemId, 10)))
  },

  /**
   * 获取分类列表
   */
  async getCategoryList(): Promise<Category[]> {
    return mockResponse(generateMockCategories())
  },

  /**
   * 获取推荐物品
   */
  async getRecommendedItems(limit: number = 10): Promise<Item[]> {
    return mockResponse(generateMockList(generateMockItem, limit))
  },

  /**
   * 获取最新物品
   */
  async getNewestItems(limit: number = 10): Promise<Item[]> {
    return mockResponse(generateMockList(generateMockItem, limit))
  },

  /**
   * 获取热门物品
   */
  async getHotItems(limit: number = 10): Promise<Item[]> {
    return mockResponse(generateMockList(generateMockItem, limit))
  },

  /**
   * 获取我的收藏
   */
  async getMyFavorites(params: { page?: number; pageSize?: number }): Promise<PageResponse<Item>> {
    const { page = 1, pageSize = 12 } = params
    return mockResponse(generateMockPageData(generateMockItem, page, pageSize, 20))
  },

  /**
   * 发布物品
   */
  async publishItem(data: any): Promise<Item> {
    const item = generateMockItem()
    return mockResponse({ ...item, ...data })
  },

  /**
   * 更新物品
   */
  async updateItem(itemId: number, data: any): Promise<Item> {
    const item = generateMockItem(itemId)
    return mockResponse({ ...item, ...data })
  }
}

// ==================== 订单相关 Mock ====================

export const mockOrderService = {
  /**
   * 获取订单列表
   */
  async getOrderList(params: {
    page?: number
    pageSize?: number
    status?: number
    type?: 'borrow' | 'lend'
  }): Promise<PageResponse<BorrowOrder>> {
    const { page = 1, pageSize = 10 } = params
    return mockResponse(generateMockPageData(generateMockOrder, page, pageSize))
  },

  /**
   * 获取订单详情
   */
  async getOrderDetail(orderId: string): Promise<BorrowOrder> {
    return mockResponse(generateMockOrder(parseInt(orderId)))
  },

  /**
   * 创建订单
   */
  async createOrder(data: any): Promise<BorrowOrder> {
    const order = generateMockOrder()
    return mockResponse({ ...order, ...data, status: 1 })
  },

  /**
   * 获取借用统计
   */
  async getMyBorrowStats(): Promise<{
    totalBorrowed: number
    borrowing: number
    returned: number
    totalLent: number
    lending: number
    lentReturned: number
  }> {
    return mockResponse({
      totalBorrowed: 15,
      borrowing: 3,
      returned: 12,
      totalLent: 20,
      lending: 5,
      lentReturned: 15
    })
  }
}

// ==================== 通知相关 Mock ====================

export const mockNotificationService = {
  /**
   * 获取通知列表
   */
  async getNotificationList(params: {
    page?: number
    pageSize?: number
    type?: string
    isRead?: boolean
  }): Promise<PageResponse<Notification>> {
    const { page = 1, pageSize = 20 } = params
    return mockResponse(generateMockPageData(generateMockNotification, page, pageSize, 50))
  },

  /**
   * 获取未读数量
   */
  async getUnreadCount(): Promise<{ count: number }> {
    return mockResponse({ count: Math.floor(Math.random() * 10) })
  },

  /**
   * 获取最新通知
   */
  async getLatestNotifications(limit: number = 5): Promise<Notification[]> {
    return mockResponse(generateMockList(generateMockNotification, limit))
  }
}

// ==================== 评价相关 Mock ====================

export const mockReviewService = {
  /**
   * 获取物品评价列表
   */
  async getItemReviews(itemId: string, params?: {
    page?: number
    pageSize?: number
  }): Promise<PageResponse<Review>> {
    const { page = 1, pageSize = 10 } = params || {}
    return mockResponse(generateMockPageData(() => generateMockReview(itemId), page, pageSize, 30))
  },

  /**
   * 获取用户评价列表
   */
  async getUserReviews(userId: string, params?: {
    page?: number
    pageSize?: number
    rating?: number
    sortBy?: string
  }): Promise<PageResponse<Review>> {
    const { page = 1, pageSize = 10 } = params || {}
    return mockResponse(generateMockPageData(() => generateMockReview(undefined, userId), page, pageSize))
  },

  /**
   * 获取评价统计
   */
  async getReviewStats(userId: string): Promise<ReviewStats> {
    return mockResponse(generateMockReviewStats(userId))
  },

  /**
   * 创建评价
   */
  async createReview(data: any): Promise<Review> {
    const review = generateMockReview()
    return mockResponse({ ...review, ...data })
  }
}

// ==================== 导出统一服务 ====================

export const mockService = {
  auth: mockAuthService,
  user: mockUserService,
  item: mockItemService,
  order: mockOrderService,
  notification: mockNotificationService,
  review: mockReviewService
}

export default mockService

