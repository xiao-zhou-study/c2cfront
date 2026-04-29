/**
 * 订单相关API
 * 请求 baseURL 已在 request 中按环境区分：dev 使用 /api 代理，prod 使用 VITE_API_BASE_URL
 */

import { request } from '../request'
import type { BorrowOrder, OrderLog, PageResponse, OrderCreateRequest, CreateBorrowOrderRequest } from '../../types/models'

/** 卖出订单列表项（对应 GET /os/borrow_orders/page/out） */
export interface LendOrderItem {
  id: string
  itemId: string
  itemName: string
  itemImageUrl: string[]
  buyerId: string
  buyerName: string
  buyerAvatarUrl: string
  sellerId: string
  sellerName: string
  sellerAvatarUrl: string
  title: string
  price: number
  status: 1 | 2 | 3 | 4 | 5 | 6 | 7
  purpose?: string
  confirmTime?: number
  payTime?: number
  payTradeNo?: string
  borrowTime?: number
  cancelReason?: string
  version: number
  createdAt: number
  updatedAt: number
}

/**
 * 创建借用订单（对接 POST /os/borrow_orders/create）
 * @returns 订单唯一 ID（字符串）
 */
export function createBorrowOrder(data: CreateBorrowOrderRequest): Promise<string> {
  return request.post<string>('/os/borrow_orders/create', data)
}

/**
 * 创建购买订单（对接 POST /borrow_orders/create）
 * @param itemId 物品ID
 * @returns 订单ID
 */
export function createPurchaseOrder(itemId: string | number): Promise<string> {
  return request.post<string>('/os/borrow_orders/create', null, { params: { itemId } })
}

/**
 * 创建借用订单（旧版兼容，请使用 createBorrowOrder）
 */
export function createOrder(data: OrderCreateRequest): Promise<{id: string}> {
  return request.post('/os', data)
}

/** 后端分页订单项转为前端 BorrowOrder（id 转字符串、billingType 数字转字符串） */
function adaptBorrowOrderFromPage(item: any): BorrowOrder {
  const billingMap: Record<number, 'per_day' | 'per_week' | 'per_month'> = {
    1: 'per_day',
    2: 'per_week',
    3: 'per_month'
  }
  return {
    ...item,
    id: String(item.id ?? ''),
    itemId: String(item.itemId ?? ''),
    borrowerId: String(item.borrowerId ?? ''),
    lenderId: String(item.lenderId ?? ''),
    billingType: billingMap[item.billingType] ?? 'per_day',
    lenderName: item.lenderName,
    lenderAvatar: item.lenderAvatar,
    borrowerName: item.borrowerName,
    borrowerAvatar: item.borrowerAvatar
  } as BorrowOrder
}

/** 买到订单列表项（对应 GET /os/borrow_orders/page/in） */
export interface BorrowOrderItem {
  id: string
  itemId: string
  itemName: string
  itemImageUrl: string[]
  buyerId: string
  buyerName: string
  buyerAvatarUrl: string
  sellerId: string
  sellerName: string
  sellerAvatarUrl: string
  title: string
  price: number
  status: 1 | 2 | 3 | 4 | 5 | 6 | 7
  purpose?: string
  confirmTime?: number
  payTime?: number
  payTradeNo?: string
  borrowTime?: number
  cancelReason?: string
  version: number
  createdAt: number
  updatedAt: number
}

/** 后端分页订单项转为前端 BorrowOrderItem */
function adaptBorrowOrderItem(item: any) {
  return {
    ...item,
    id: String(item.id ?? ''),
    itemId: String(item.itemId ?? ''),
    buyerId: String(item.buyerId ?? ''),
    sellerId: String(item.sellerId ?? '')
  }
}

/**
 * 分页获取我借用的订单（当前用户作为借用人）
 * GET /os/borrow_orders/page/in
 */
export function getBorrowOrdersPageIn(params: {
  pageNo?: number
  pageSize?: number
  status?: number
  keyword?: string
  startTime?: number
  endTime?: number
  sortBy?: string
  isAsc?: boolean
}): Promise<{ total: number; pages: number; list: BorrowOrderItem[] }> {
  return request.get('/os/borrow_orders/page/in', { params }).then((data: any) => {
    const list = (data?.list ?? []).map((item: any) => adaptBorrowOrderItem(item))
    return {
      total: data?.total ?? 0,
      pages: data?.pages ?? 0,
      list
    }
  })
}

/** 后端分页订单项转为前端 LendOrderItem（只做 id 转字符串） */
function adaptLendOrderItem(item: any) {
  return {
    ...item,
    id: String(item.id ?? ''),
    itemId: String(item.itemId ?? ''),
    buyerId: String(item.buyerId ?? ''),
    sellerId: String(item.sellerId ?? '')
  }
}

/** 后端详情接口返回转为前端 BorrowOrder（对接 GET /os/borrow_orders/detail） */
function adaptBorrowOrderFromDetail(data: any): BorrowOrder {
  const billingMap: Record<number, 'per_day' | 'per_week' | 'per_month'> = {
    1: 'per_day',
    2: 'per_week',
    3: 'per_month'
  }
  return {
    ...data,
    id: String(data.id ?? ''),
    itemId: String(data.itemId ?? ''),
    borrowerId: String(data.borrowerId ?? ''),
    lenderId: String(data.lenderId ?? ''),
    billingType: billingMap[data.billingType],
    lenderName: data.lenderName,
    lenderAvatar: data.lenderAvatar,
    // 后端接口字段兼容：buyerName/buyerAvatarUrl → borrowerName/borrowerAvatar
    borrowerName: data.borrowerName ?? data.buyerName,
    borrowerAvatar: data.borrowerAvatar ?? data.buyerAvatarUrl,
    // 物品图片列表
    itemImages: data.itemImageUrl,
    orderNo: data.orderNo,
    version: data.version,
    payTradeNo: data.payTradeNo,
    refundTime: data.refundTime,
    actualReturnTime: data.actualReturnTime,
    plannedStartTime: data.plannedStartTime,
    plannedEndTime: data.plannedEndTime,
    expectReturnTime: data.expectReturnTime,
    confirmTime: data.confirmTime,
    payTime: data.payTime,
    borrowTime: data.borrowTime,
    returnTime: data.actualReturnTime ?? data.returnTime,
    createdAt: data.createdAt ?? 0,
    updatedAt: data.updatedAt ?? 0
  } as BorrowOrder
}

/**
 * 根据订单编号获取借用订单详情（对接 GET /os/borrow_orders/detail）
 * 返回包含物品快照、借贷双方、费用、时间戳、version 等完整数据，适用于详情页及同意/归还/付款前获取 version。
 */
export function getBorrowOrderDetailByOrderNo(orderNo: string): Promise<BorrowOrder> {
  return request
    .get<BorrowOrder>('/os/borrow_orders/detail', { params: { orderNo } })
    .then((data: any) => adaptBorrowOrderFromDetail(data))
}

/**
 * 出借人同意借用订单（对接 PUT /os/borrow_orders/agree）
 * @param orderNo 借用订单编号（商户单号）
 * @param version 乐观锁版本号（通过列表或详情接口获取）
 */
export function agreeBorrowOrder(orderNo: string, version: number): Promise<void> {
  return request.put('/os/borrow_orders/agree', { id: orderNo, version })
}

/**
 * 出借人拒绝借用订单（对接 PUT /os/borrow_orders/reject）
 * @param orderNo 借用订单编号（商户单号）
 * @param reason 拒绝借用的具体原因说明
 * @param version 乐观锁版本号（通过列表或详情接口获取）
 */
export function rejectBorrowOrder(orderNo: string, reason: string, version: number): Promise<void> {
  return request.put('/os/borrow_orders/reject', { id: orderNo, reason, version })
}

/**
 * 借用人取消借用订单（对接 PUT /os/borrow_orders/cancel）
 * 订单处于「待确认」或「待付款」时可主动取消，取消后状态为「已取消」
 * @param orderNo 借用订单编号（商户单号）
 * @param version 乐观锁版本号（通过列表或详情接口获取）
 */
export function cancelBorrowOrder(orderNo: string, version: number): Promise<void> {
  return request.put('/os/borrow_orders/cancel', { id: orderNo, version })
}

/** 支付接口返回：SUCCESS 或支付表单（HTML 或 结构化表单） */
export type PayBorrowOrderResult = string | { formHtml?: string; method?: string; action?: string; fields?: Array<{ name: string; value: string }> }

/**
 * 借用人订单付款（对接 PUT /os/borrow_orders/pay）
 * @param orderNo 借用订单编号（商户单号）
 * @param version 乐观锁版本号（通过详情接口获取）
 * @returns 成功时返回 "SUCCESS"；需跳转支付时返回表单 HTML 或 { method, action, fields }
 */
export function payBorrowOrder(orderNo: string, version: number): Promise<PayBorrowOrderResult> {
  return request.put<PayBorrowOrderResult>('/os/borrow_orders/pay', { id: orderNo, version })
}

/**
 * 分页获取我借出的订单（当前用户作为出借人）
 * GET /os/borrow_orders/page/out
 */
export function getBorrowOrdersPageOut(params: {
  pageNo?: number
  pageSize?: number
  status?: number
  keyword?: string
  startTime?: number
  endTime?: number
  sortBy?: string
  isAsc?: boolean
}): Promise<{ total: number; pages: number; list: LendOrderItem[] }> {
  return request.get('/os/borrow_orders/page/out', { params }).then((data: any) => {
    const list = (data?.list ?? []).map((item: any) => adaptLendOrderItem(item))
    return {
      total: data?.total ?? 0,
      pages: data?.pages ?? 0,
      list
    }
  })
}

/**
 * 获取订单列表
 */
export function getOrderList(params: {
  page?: number
  pageSize?: number
  status?: number
  itemId?: string
  borrowerId?: string
  lenderId?: string
  type?: 'borrow' | 'lend'
}): Promise<PageResponse<BorrowOrder>> {
  return request.get('/os', { params })
}

/**
 * 获取订单详情
 */
export function getOrderDetail(orderId: string): Promise<BorrowOrder> {
  return request.get(`/os/${orderId}`)
}

/**
 * 更新订单信息
 */
export function updateOrder(orderId: string, data: Partial<BorrowOrder>): Promise<boolean> {
  return request.put(`/os/${orderId}`, data)
}

/**
 * 取消订单
 */
export function cancelOrder(orderId: string, reason?: string): Promise<boolean> {
  return request.put('/os/cancel', { orderId, reason })
}

/**
 * 确认订单
 */
export function confirmOrder(orderId: string): Promise<boolean> {
  return request.put('/os/confirm', { orderId })
}

/**
 * 拒绝订单
 */
export function rejectOrder(orderId: string, reason?: string): Promise<boolean> {
  return request.put('/os/reject', { orderId, reason })
}

/**
 * 确认借出物品
 */
export function startBorrow(orderId: string): Promise<boolean> {
  return request.put('/os/borrow', { orderId })
}

/**
 * 买家确认收货（对接 PUT /os/borrow_orders/confirm）
 * @param orderNo 订单编号
 * @param version 乐观锁版本号
 */
export function confirmReceiveOrder(orderNo: string, version: number): Promise<void> {
  return request.put('/os/borrow_orders/confirm', { id: orderNo, version })
}

/**
 * 评价订单（对接 POST /os/borrow_orders/review）
 * @param orderNo 订单编号
 * @param data 评分(1-5)、评价内容、图片、是否匿名
 */
export function reviewOrder(data: {
  id: string
  rating: number
  content?: string
  images?: string[]
  isAnonymous?: boolean
}): Promise<number> {
  return request.post('/os/borrow_orders/review', data)
}

/**
 * 查询支付状态（轮询用）
 * GET /os/borrow_orders/pay/status?orderNo=xxx
 * @returns 订单当前状态码：1-待确认 2-待付款 3-交易中(已支付) 4-待评价 5-已完成 6-已取消 7-已拒绝
 */
export function getPayStatus(orderNo: string): Promise<number> {
  return request.get<number>('/os/borrow_orders/pay/status', { params: { orderNo } })
}

/**
 * 出借人确认归还（旧版兼容，请使用 confirmReturnBorrowOrder）
 * @deprecated 请使用 confirmReturnBorrowOrder(orderNo, version)
 */
export function returnItem(orderId: string): Promise<void> {
  return request.put('/os/borrow_orders/confirm_return', { orderId })
}

/**
 * 根据物品ID查询订单列表
 */
export function getOrdersByItemId(itemId: string): Promise<BorrowOrder[]> {
  return request.get(`/os/item/${itemId}`)
}

/**
 * 获取订单操作日志
 */
export function getOrderLogs(orderId: string): Promise<OrderLog[]> {
  return request.get(`/os/${orderId}/logs`)
}

/**
 * 获取我的借用统计
 */
export function getMyBorrowStats(): Promise<{
  totalBorrowed: number
  borrowing: number
  returned: number
  totalLent: number
  lending: number
  lentReturned: number
}> {
  return request.get('/os/stats')
}