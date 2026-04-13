/**
 * 聊天相关API（经 gateway，路径 /ns/chat/**）
 */

import { request } from '../request'
import { getUserInfo } from './user'

/** 会话信息 */
export interface ChatSession {
  userId: string | number
  online: boolean
  lastMessage: {
    msgId: string
    content: string
    from: string | number
    timestamp: string | number
  } | null
  unreadCount: number
  /** 扩展字段：用户信息 */
  userName?: string
  userAvatar?: string
}

/**
 * 获取会话列表（自动注入用户信息）
 */
export async function getChatSessions(userId: string | number): Promise<ChatSession[]> {
  const res = await request.get<any>('/ns/chat/sessions', { params: { userId } })
  let list: any[] = Array.isArray(res) ? res : (res?.data || [])

  // 批量查询用户信息
  if (list.length > 0) {
    const userIds = list.map(s => String(s.userId))
    const userMap: Record<string, { username?: string; avatarUrl?: string }> = {}

    // 并行查询每个用户信息
    const userPromises = userIds.map(id => getUserInfo(id).catch(() => null))
    const users = await Promise.all(userPromises)
    users.forEach((user, i) => {
      if (user) {
        userMap[userIds[i]] = {
          username: user.username,
          avatarUrl: user.avatarUrl
        }
      }
    })

    // 注入用户信息到会话
    list = list.map(session => ({
      ...session,
      userName: userMap[String(session.userId)]?.username || `用户${session.userId}`,
      userAvatar: userMap[String(session.userId)]?.avatarUrl || ''
    }))
  }

  return list
}

/**
 * 分页获取聊天记录（调用此接口会自动清除未读消息数）
 */
export async function getChatHistory(
  userId1: string | number,
  userId2: string | number,
  page = 0,
  size = 20
): Promise<{ list: string[]; total: number; page: number; size: number }> {
  const res = await request.get<any>('/ns/chat/history', { params: { userId1, userId2, page, size } })

  // res 来自 axios 拦截器，已提取过一次 data
  // Gateway: { code, msg, data: { code, message, data: [...], total } }
  // axios 返回: { code, message, data: [...], total } 即 res
  const list = Array.isArray(res?.data) ? res.data : []

  return {
    list,
    total: Number(res?.total || list.length),
    page: Number(res?.page || page),
    size: Number(res?.size || size)
  }
}

/**
 * 查询用户是否在线
 */
export async function checkOnline(userId: string | number): Promise<boolean> {
  const res = await request.get<any>('/ns/chat/online', { params: { userId } })
  return res === true || res?.data === true
}
