/**
 * 物品相关API
 */

import { request } from '../request'
import type { Item, ItemStats, Category, PageResponse, ItemQueryParams, ItemPublishRequest, CategoryUpdateRequest } from '../../types/models'

/**
 * 获取物品列表（分页）- 兼容原接口
 */
export function getItemList(params: ItemQueryParams): Promise<PageResponse<Item>> {
  return request.get('/is/items', { params })
}

/**
 * 根据分类分页查询物品（搜索接口）- 对接 GET /items，分页用 pageNo
 */
export function searchItems(params: {
  keyword?: string
  categoryId?: number
  status?: number
  minPrice?: number
  maxPrice?: number
  conditionLevel?: string
  isDeposit?: boolean
  location?: string
  pageNo?: number
  pageSize?: number
  sortBy?: string
  isAsc?: boolean
}): Promise<PageResponse<Item>> {
  return request.get('/is/items', { params })
}

/**
 * 获取物品详情
 * 适配后端返回的 ownerName/ownerAvatar 为前端的 username/avatar
 */
export function getItemDetail(itemId: string): Promise<Item> {
  return request.get(`/is/items/${itemId}`).then((data: Record<string, unknown>) => ({
    ...data,
    username: (data.ownerName as string) ?? (data.username as string),
    avatar: (data.ownerAvatar as string) ?? (data.avatar as string)
  })) as Promise<Item>
}

/**
 * 新增物品（POST /is/items）
 * 新增时 body.id 为 null 或不传
 * @returns 新创建的物品唯一 ID
 */
export function publishItem(data: Omit<ItemPublishRequest, 'id'>): Promise<number> {
  return request.post<number>('/is/items', data)
}

/**
 * 更新物品信息（PUT /is/items/{id}）
 * 根据物品 ID 更新已发布物品详情
 * id 使用 string 传递，避免雪花算法等长整型在前端 number 下精度丢失（后几位变 0）
 * @param id 物品 ID（路径参数，字符串形式）
 * @param data 请求体，需包含 id（number 类型）
 * @returns 是否更新成功
 */
export function updateItem(id: string, data: ItemPublishRequest): Promise<boolean> {
  return request.put<boolean>(`/is/items/${id}`, data)
}

/**
 * 删除物品
 */
export function deleteItem(itemId: string): Promise<boolean> {
  return request.delete(`/is/items/${itemId}`)
}

/**
 * 更新物品状态
 */
export function updateItemStatus(itemId: string, status: number, remark?: string): Promise<boolean> {
  return request.put(`/is/items/${itemId}/status`, { status, remark })
}

/**
 * 批量更新物品状态
 */
export function batchUpdateItemStatus(ids: string[], status: number): Promise<boolean> {
  // 手动构建查询字符串，确保ids数组被正确序列化为ids=1&ids=2的形式
  const params = new URLSearchParams()
  ids.forEach(id => params.append('ids', id))
  params.append('status', status.toString())
  return request.put(`/is/items/batch/status?${params.toString()}`)
}

/**
 * 获取分类列表
 */
export function getCategoryList(): Promise<Category[]> {
  return request.get('/is/categories')
}

/**
 * 更新物品分类（PUT /is/categories/{id}）
 * 根据分类 ID 修改现有分类信息，仅用于编辑已有分类。
 * 新增分类请使用对应的新增接口。
 * @param id 分类 ID
 * @param data 要更新的字段（name、description、icon、sortOrder、isActive 均为可选）
 */
export function updateCategory(id: number, data: CategoryUpdateRequest): Promise<void> {
  return request.put(`/is/categories/${id}`, data)
}

/**
 * 获取推荐物品
 */
export function getRecommendedItems(limit: number = 10): Promise<Item[]> {
  return request.get('/is/items/recommended', { params: { limit } })
}

/**
 * 获取最新物品
 */
export function getNewestItems(limit: number = 10): Promise<Item[]> {
  return request.get('/is/items', { params: { sort: 'newest', limit } })
}

/**
 * 获取热门物品
 */
export function getHotItems(days?: number, limit?: number): Promise<Item[]> {
  return request.get('/is/items/hot', { params: { days, limit } })
}

/**
 * 根据用户ID获取物品列表
 */
export function getItemsByUserId(userId: string): Promise<Item[]> {
  return request.get(`/is/items/user/${userId}`)
}

/**
 * 获取我的发布物品列表
 */
export function getMyPublishedItems(): Promise<Item[]> {
  return request.get('/is/items/my')
}

/**
 * 获取物品统计信息
 */
export function getItemStats(itemId?: string): Promise<any> {
  if (itemId) {
    return request.get(`/is/items/stats`, { params: { itemId } })
  } else {
    return request.get('/is/items/stats')
  }
}

/**
 * 导出物品数据
 */
export function exportItems(params?: any): Promise<Blob> {
  return request.get('/is/items/export', {
    params,
    responseType: 'blob'
  })
}