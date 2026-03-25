/**
 * 模拟数据生成器
 * 基于表结构设计生成符合业务逻辑的测试数据
 */

import type { User, UserProfile, UserStats, Item, Category, BorrowOrder, Notification, Review, ReviewStats, ItemStats, FileInfo } from '../types/models'

/**
 * 生成随机整数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 从数组中随机选择一个元素
 */
function randomPick<T>(array: readonly T[]): T {
  return array[randomInt(0, array.length - 1)]
}

/**
 * 从数组中随机选择多个元素
 */
function randomPicks<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * 生成时间戳（毫秒级）
 */
function randomTimestamp(daysAgo: number = 30): number {
  const now = Date.now()
  const offset = randomInt(0, daysAgo * 24 * 60 * 60 * 1000)
  return now - offset
}

// ==================== 基础数据 ====================

const SCHOOLS = ['清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学', '南京大学']
const DEPARTMENTS = ['计算机学院', '软件学院', '电子工程学院', '经管学院', '新闻学院', '外语学院']
const GRADES = ['2021级', '2022级', '2023级', '2024级']
const CAMPUSES = ['本部', '东校区', '西校区', '南校区']

const FIRST_NAMES = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴']
const LAST_NAMES = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '军', '洋', '艳', '勇', '磊', '娟', '涛', '波', '华', '健', '鹏', '超']

const ITEM_TITLES = [
  'iPad Pro 2022款 11英寸',
  'MacBook Air M2 笔记本电脑',
  'AirPods Pro 2代 降噪耳机',
  'Sony WH-1000XM5 头戴式耳机',
  '大学物理教材（第五版）',
  '高等数学上下册',
  '吉他 YAMAHA FG800',
  '尤克里里 入门级',
  '单反相机 Canon EOS R6',
  '索尼微单 A7M4',
  '无人机 DJI Mini 3 Pro',
  '电动滑板车 小米',
  '蓝牙音箱 Bose SoundLink',
  'Switch游戏机 + 健身环',
  'PS5 游戏主机',
  '投影仪 当贝F5',
  '电烤箱 美的',
  '空气炸锅',
  '哑铃套装 10-30kg',
  '瑜伽垫+瑜伽球',
  '露营帐篷 4人',
  '登山包 65L',
  '羽毛球拍 YONEX双拍',
  '篮球 斯伯丁',
  'Kindle Paperwhite 电子书阅读器'
]

const CATEGORIES = [
  { id: 1, name: '电子产品', icon: '📱', description: '手机、电脑、平板等电子设备' },
  { id: 2, name: '数码配件', icon: '🎧', description: '耳机、音箱、充电宝等配件' },
  { id: 3, name: '图书教材', icon: '📚', description: '教材、参考书、课外读物' },
  { id: 4, name: '乐器', icon: '🎸', description: '吉他、钢琴、尤克里里等' },
  { id: 5, name: '摄影器材', icon: '📷', description: '相机、镜头、三脚架等' },
  { id: 6, name: '运动器材', icon: '⚽', description: '球类、健身器材等' },
  { id: 7, name: '游戏娱乐', icon: '🎮', description: '游戏机、桌游等' },
  { id: 8, name: '生活电器', icon: '🏠', description: '小家电、厨房用品等' },
  { id: 9, name: '户外用品', icon: '🏕️', description: '帐篷、登山包等' }
]

const DESCRIPTIONS = [
  '物品保养良好，9成新以上，功能完好。',
  '几乎全新，使用次数很少，无任何损坏。',
  '正常使用痕迹，功能完全正常，性价比高。',
  '外观有轻微使用痕迹，不影响正常使用。',
  '配件齐全，附带原装充电器和包装盒。',
  '限本校学生借用，需要的同学请提前预约。',
  '可长期租借，价格可议，欢迎咨询。'
]

const CONDITION_LEVELS = ['new', '95%', '90%', '80%']

// ==================== 模拟数据生成器 ====================

/**
 * 生成模拟用户
 */
export function generateMockUser(id?: number): User {
  const userId = String(id || randomInt(1, 10000))

  return {
    id: userId,
    username: `user${userId}`,
    email: `user${userId}@example.com`,
    phone: `138${String(randomInt(10000000, 99999999))}`,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    studentId: `2023${String(randomInt(100000, 999999))}`,
    school: randomPick(SCHOOLS),
    department: randomPick(DEPARTMENTS),
    grade: randomPick(GRADES),
    creditScore: randomInt(80, 100),
    isVerified: Math.random() > 0.3,
    status: 1,
    lastLoginAt: randomTimestamp(7),
    createdAt: randomTimestamp(365),
    updatedAt: randomTimestamp(30)
  }
}

/**
 * 生成模拟用户详情
 */
export function generateMockUserProfile(userId: string): UserProfile {
  return {
    id: String(randomInt(1, 10000)),
    userId,
    realName: `${randomPick(FIRST_NAMES)}${randomPick(LAST_NAMES)}`,
    gender: randomPick([0, 1, 2]) as 0 | 1 | 2,
    birthday: `199${randomInt(5, 9)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
    bio: '这个人很懒，什么都没有留下...',
    qq: String(randomInt(100000000, 999999999)),
    wechat: `wx_${randomInt(100000, 999999)}`,
    createdAt: randomTimestamp(365),
    updatedAt: randomTimestamp(30)
  }
}

/**
 * 生成模拟用户统计
 */
export function generateMockUserStats(userId: string): UserStats {
  const published = randomInt(0, 20)
  const borrowed = randomInt(0, 30)
  const lent = randomInt(0, 25)
  const ratings = randomInt(0, 50)
  
  return {
    id: String(randomInt(1, 10000)),
    userId: userId,
    itemsPublished: published,
    itemsBorrowed: borrowed,
    itemsLent: lent,
    totalRatings: ratings,
    averageRating: ratings > 0 ? randomInt(35, 50) / 10 : 0,
    createdAt: randomTimestamp(365),
    updatedAt: randomTimestamp(7)
  }
}

/**
 * 生成模拟分类列表
 */
export function generateMockCategories(): Category[] {
  return CATEGORIES.map(cat => ({
    ...cat,
    id: String(cat.id),
    sortOrder: cat.id,
    isActive: true,
    createdAt: randomTimestamp(365),
    updatedAt: randomTimestamp(30)
  }))
}

/**
 * 生成模拟物品
 */
export function generateMockItem(id?: number): Item {
  const itemId = id || randomInt(1, 10000)
  const categoryId = randomInt(1, CATEGORIES.length)
  const price = randomPick([0, 5, 10, 15, 20, 30, 50])
  const imageCount = randomInt(1, 4)
  const images = Array.from({ length: imageCount }, (_, i) => 
    `https://picsum.photos/800/600?random=${itemId}-${i}`
  )
  
  return {
    id: String(itemId),
    userId: String(randomInt(1, 100)),
    ownerId: String(randomInt(1, 100)),
    title: randomPick(ITEM_TITLES),
    description: randomPicks(DESCRIPTIONS, randomInt(1, 3)).join(' '),
    categoryId: String(categoryId),
    conditionLevel: randomPick(CONDITION_LEVELS) as any,
    images,
    price,
    billingType: randomPick(['per_day', 'per_week', 'per_month']) as any,
    deposit: price > 0 ? price * 10 : 0,
    isNegotiable: Math.random() > 0.5,
    minBorrowDays: randomPick([1, 3, 7]),
    maxBorrowDays: randomPick([7, 15, 30]),
    location: `${randomPick(CAMPUSES)} ${randomInt(1, 10)}号楼`,
    address: '详细地址请联系',
    borrowConditions: '仅限本校学生，需要押金',
    status: randomPick([1, 1, 1, 2, 3]) as 1 | 2 | 3,
    viewCount: randomInt(0, 500),
    favoriteCount: randomInt(0, 50),
    createdAt: randomTimestamp(90),
    updatedAt: randomTimestamp(30),
    owner: generateMockUser(randomInt(1, 100)),
    category: CATEGORIES[categoryId - 1] as any
  }
}

/**
 * 生成模拟物品统计
 */
export function generateMockItemStats(itemId: number): ItemStats {
  const borrowCount = randomInt(0, 20)
  const ratings = randomInt(0, borrowCount)
  
  return {
    id: String(randomInt(1, 10000)),
    itemId: String(itemId),
    viewCount: randomInt(10, 500),
    favoriteCount: randomInt(0, 50),
    borrowCount,
    totalRatings: ratings,
    averageRating: ratings > 0 ? randomInt(35, 50) / 10 : 0,
    createdAt: randomTimestamp(90),
    updatedAt: randomTimestamp(7)
  }
}

/**
 * 生成模拟订单
 */
export function generateMockOrder(id?: number): BorrowOrder {
  const orderId = id || randomInt(1, 10000)
  const itemId = randomInt(1, 1000)
  const borrowerId = randomInt(1, 100)
  const lenderId = randomInt(101, 200)
  const price = randomPick([5, 10, 15, 20, 30])
  const borrowDays = randomPick([3, 7, 14, 30])
  const status = randomPick([1, 2, 3, 4, 5, 6]) as any
  const createdAt = randomTimestamp(60)
  
  return {
    id: String(orderId),
    itemId: String(itemId),
    borrowerId: String(borrowerId),
    lenderId: String(lenderId),
    title: randomPick(ITEM_TITLES),
    price,
    billingType: 'per_day',
    deposit: price * 10,
    borrowDays,
    totalAmount: price * borrowDays,
    purpose: '学习使用',
    status,
    borrowTime: status >= 3 ? createdAt + 86400000 : undefined,
    returnTime: status >= 3 ? createdAt + borrowDays * 86400000 : undefined,
    actualReturnTime: status === 4 ? createdAt + borrowDays * 86400000 : undefined,
    cancelReason: status === 5 || status === 6 ? '时间冲突' : undefined,
    createdAt,
    updatedAt: randomTimestamp(30),
    item: generateMockItem(itemId),
    borrower: generateMockUser(borrowerId),
    lender: generateMockUser(lenderId)
  }
}

/**
 * 生成模拟通知
 */
export function generateMockNotification(id?: number): Notification {
  const notificationId = id || randomInt(1, 10000)
  const types = ['system', 'borrow', 'return', 'review'] as const
  const type = randomPick(types)
  const isRead = Math.random() > 0.3
  const createdAt = randomTimestamp(30)
  
  const titleMap = {
    system: '系统通知',
    borrow: '借用请求',
    return: '归还通知',
    review: '新评价'
  }
  
  const contentMap = {
    system: '欢迎使用校园物品共享平台！',
    borrow: `${randomPick(['张三', '李四', '王五'])}请求借用你的物品`,
    return: `${randomPick(['赵六', '孙七', '周八'])}已归还你的物品`,
    review: `${randomPick(['吴九', '郑十', '王二'])}评价了你的物品`
  }
  
  return {
    id: String(notificationId),
    receiverId: String(randomInt(1, 100)),
    senderId: type !== 'system' ? String(randomInt(1, 100)) : undefined,
    title: titleMap[type],
    content: contentMap[type],
    type,
    relatedId: String(randomInt(1, 1000)),
    relatedType: type === 'borrow' || type === 'return' ? 'order' : 'item',
    isRead,
    readAt: isRead ? createdAt + randomInt(1000, 86400000) : undefined,
    isDeleted: false,
    createdAt,
    updatedAt: createdAt
  }
}

/**
 * 生成模拟评价
 */
export function generateMockReview(itemId?: string, userId?: string): Review {
  const reviewId = String(randomInt(1, 10000))
  const rating = randomPick([3, 4, 5, 5, 5]) as 1 | 2 | 3 | 4 | 5
  
  const comments = [
    '物品很好，和描述一致！',
    '卖家人很好，物品保养得很好。',
    '非常满意，下次还会再借！',
    '物品质量不错，推荐！',
    '很棒的体验，五星好评！'
  ]
  
  return {
    id: reviewId,
    itemId: itemId || String(randomInt(1, 1000)),
    reviewerId: String(randomInt(1, 100)),
    targetUserId: userId || String(randomInt(101, 200)),
    orderId: String(randomInt(1, 1000)),
    rating,
    content: randomPick(comments),
    images: Math.random() > 0.7 ? [`https://picsum.photos/400/300?random=${reviewId}`] : undefined,
    status: 1,
    isAnonymous: Math.random() > 0.8,
    createdAt: randomTimestamp(60),
    updatedAt: randomTimestamp(30),
    reviewer: generateMockUser()
  }
}

/**
 * 生成模拟评价统计
 */
export function generateMockReviewStats(userId: string): ReviewStats {
  const totalReviews = randomInt(0, 50)
  const avgRating = totalReviews > 0 ? randomInt(35, 50) / 10 : 0
  
  return {
    id: String(randomInt(1, 10000)),
    userId: userId,
    totalReviews,
    avgRating,
    oneStarCount: totalReviews > 0 ? Math.floor(totalReviews * 0.1) : 0,
    twoStarCount: totalReviews > 0 ? Math.floor(totalReviews * 0.1) : 0,
    threeStarCount: totalReviews > 0 ? Math.floor(totalReviews * 0.2) : 0,
    fourStarCount: totalReviews > 0 ? Math.floor(totalReviews * 0.3) : 0,
    fiveStarCount: totalReviews > 0 ? Math.floor(totalReviews * 0.3) : 0,
    createdAt: randomTimestamp(365),
    updatedAt: randomTimestamp(7)
  }
}

/**
 * 生成模拟文件信息
 */
export function generateMockFileInfo(id?: number): FileInfo {
  const fileId = id || randomInt(1, 10000)
  const fileName = `image_${fileId}.jpg`
  
  return {
    id: String(fileId),
    originalName: fileName,
    fileName: `upload_${Date.now()}_${fileName}`,
    filePath: `/uploads/images/${fileName}`,
    fileSize: randomInt(100000, 5000000),
    fileType: 'image',
    mimeType: 'image/jpeg',
    md5: Math.random().toString(36).substring(2, 34),
    bucket: 'xy-storage',
    url: `https://picsum.photos/800/600?random=${fileId}`,
    uploaderId: String(randomInt(1, 100)),
    module: randomPick(['item', 'user', 'review']) as any,
    moduleId: String(randomInt(1, 1000)),
    status: 1,
    createdAt: randomTimestamp(90),
    updatedAt: randomTimestamp(30)
  }
}

/**
 * 批量生成模拟数据
 */
export function generateMockList<T>(generator: (id?: number) => T, count: number): T[] {
  return Array.from({ length: count }, (_, i) => generator(i + 1))
}

/**
 * 生成分页数据
 */
export function generateMockPageData<T>(
  generator: (id?: number) => T,
  page: number = 1,
  pageSize: number = 12,
  total?: number
): {
  list: T[]
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
} {
  const totalCount = total || randomInt(50, 200)
  const totalPages = Math.ceil(totalCount / pageSize)
  const startId = (page - 1) * pageSize + 1
  const count = Math.min(pageSize, totalCount - startId + 1)
  
  const dataList = count > 0 ? generateMockList(generator, count) : []
  
  return {
    list: dataList,
    data: dataList, // 添加 data 字段，与 list 相同，用于前端兼容
    total: totalCount,
    page,
    pageSize,
    totalPages
  }
}
