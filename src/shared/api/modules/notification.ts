/**
 * 通知相关API
 */

import { request } from '../request'
import type { Notification, PageResponse } from '../../types/models'

/**
 * 获取通知列表
 */
export function getNotificationList(params: {
  page?: number
  pageSize?: number
  type?: string
  isRead?: boolean
}): Promise<PageResponse<Notification>> {
  return request.get('/ns/notifications', { params })
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount(): Promise<{ count: number }> {
  return request.get('/ns/notifications/unread-count')
}

/**
 * 标记通知为已读
 */
export function markAsRead(notificationId: number): Promise<void> {
  return request.post(`/ns/notifications/${notificationId}/read`)
}

/**
 * 标记所有通知为已读
 */
export function markAllAsRead(): Promise<void> {
  return request.post('/ns/notifications/read-all')
}

/**
 * 删除通知
 */
export function deleteNotification(notificationId: number): Promise<void> {
  return request.delete(`/ns/notifications/${notificationId}`)
}

/**
 * 清空所有通知
 */
export function clearAllNotifications(): Promise<void> {
  return request.post('/ns/notifications/clear-all')
}

/**
 * 获取最新通知（用于实时推送）
 */
export function getLatestNotifications(limit: number = 5): Promise<Notification[]> {
  return request.get('/ns/notifications/latest', { params: { limit } })
}

/**
 * 系统通知（公告）数据模型
 */
export interface SystemBroadcast {
  id: number
  title: string
  content: string
  category: number
  createdAt: number
  isRead: boolean
}

/**
 * 获取用户近三月通知列表
 * GET /ns/system_broadcasts/user/list
 */
export function getUserBroadcastList(): Promise<SystemBroadcast[]> {
  return request.get('/ns/system_broadcasts/user/list')
}

/**
 * 标记公告为已读
 * POST /ns/user_broadcast_status/read
 * @param broadcastIds 待标记为已读的公告 ID 列表
 */
export function markBroadcastsAsRead(broadcastIds: number[]): Promise<void> {
  return request.post('/ns/user_broadcast_status/read', broadcastIds)
}

/**
 * 公告详情（查看公告详情接口返回）
 */
export interface BroadcastDetail {
  id: number
  title: string
  content: string
  category: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

/**
 * 根据公告 ID 获取公告完整详情
 * GET /ns/system_broadcasts/detail?id=xxx
 */
export function getBroadcastDetail(id: number): Promise<BroadcastDetail> {
  return request.get('/ns/system_broadcasts/detail', { params: { id } })
}