/**
 * 评价相关API
 */

import { request } from '../request'
import type { Review, ReviewStats, PageResponse } from '../../types/models'

/**
 * 创建评价
 */
export function createReview(data: {
  itemId: string
  targetUserId: string
  orderId: string
  rating: number
  content?: string
  images?: string[]
  isAnonymous?: boolean
}): Promise<Review> {
  return request.post('/rs/reviews/reviews', data)
}

/**
 * 获取物品评价列表
 */
export function getItemReviews(itemId: string, params?: {
  page?: number
  pageSize?: number
  rating?: number
  sortBy?: string
}): Promise<PageResponse<Review>> {
  return request.get(`/rs/reviews/item/${itemId}`, params ? { params } : undefined)
}

/**
 * 获取用户收到的评价列表
 */
export function getUserReviews(userId: string, params?: {
  page?: number
  pageSize?: number
  rating?: number
  sortBy?: string
}): Promise<PageResponse<Review>> {
  return request.get(`/rs/reviews/user/${userId}`, params ? { params } : undefined)
}

/**
 * 获取我发出的评价列表
 */
export function getMyReviews(params?: {
  page?: number
  pageSize?: number
  rating?: number
  sortBy?: string
}): Promise<PageResponse<Review>> {
  return request.get('/rs/reviews/my-reviews', params ? { params } : undefined)
}

/**
 * 获取评价统计
 */
export function getReviewStats(userId: string): Promise<ReviewStats> {
  return request.get(`/rs/reviews/reviews/stats/${userId}`)
}

/**
 * 删除评价
 */
export function deleteReview(reviewId: string): Promise<void> {
  return request.delete(`/rs/reviews/reviews/${reviewId}`)
}

/**
 * 检查是否可以评价
 */
export function canReview(orderId: string): Promise<{ canReview: boolean; reason?: string }> {
  return request.get(`/rs/reviews/can-review/${orderId}`)
}

/**
 * 更新评价
 */
export function updateReview(reviewId: string, data: {
  rating: number
  content?: string
  images?: string[]
  tags?: string[]
  isAnonymous?: boolean
}): Promise<Review> {
  return request.put(`/rs/reviews/reviews/${reviewId}`, data)
}

/**
 * 举报评价
 */
export function reportReview(reviewId: string, data: {
  reason: string
  description?: string
}): Promise<boolean> {
  return request.post(`/rs/reviews/reviews/${reviewId}/report`, data)
}

/**
 * 上传评价图片
 */
export function uploadReviewImage(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)

  return request.upload('/ss/files/upload', formData)
}

/**
 * 导出评价数据
 */
export function exportReviews(params?: {
  type?: 'sent' | 'received'
  rating?: string
  startDate?: string
  endDate?: string
}): Promise<Blob> {
  return request.get('/rs/reviews/reviews/export', {
    params,
    responseType: 'blob'
  })
}