/**
 * 用户相关API
 */

import { request } from '../request'
import type { User, UserProfile, UserStats } from '../../types/models'

/**
 * 获取当前登录用户信息
 * @param skipTokenCheck - 是否跳过请求拦截器中的 token 校验（登录后立即拉取时使用）
 * @param skipAuthRedirect - 401 时不执行全局登出/跳转登录（登录流程内调用时传 true，避免清掉刚写入的 token）
 */
export function getCurrentUserInfo(skipTokenCheck = false, skipAuthRedirect = false): Promise<User> {
  return request.get(`/us/users/me`, { skipTokenCheck, skipAuthRedirect } as any)
}

/**
 * 获取用户信息
 */
export function getUserInfo(userId: string): Promise<User> {
  return request.get(`/us/users/${userId}`)
}

/**
 * 更新用户基本信息
 */
export function updateUserInfo(userId: string, data: Partial<User>): Promise<User> {
  return request.put(`/us/users/${userId}`, data)
}

/**
 * 获取用户详细资料
 */
export function getUserProfile(userId: string): Promise<UserProfile> {
  return request.get(`/us/users/${userId}/profile`)
}

/**
 * 更新用户详细资料
 */
export function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  return request.put(`/us/users/${userId}/profile`, data)
}

/**
 * 获取用户统计信息
 */
export function getUserStats(userId: string): Promise<UserStats> {
  return request.get(`/us/users/${userId}/stats`)
}

/**
 * 根据用户ID批量查询用户信息
 */
export function getUsersByIds(ids: string[]): Promise<User[]> {
  return request.get('/us/users/list', { params: { ids } })
}

/**
 * 上传用户头像
 */
export function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('module', 'user')

  return request.upload('/ss/files/upload', formData)
}

/**
 * 修改密码
 */
export function changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
  return request.post('/us/users/change-password', data)
}

/**
 * 实名认证
 */
export function verifyIdentity(data: { realName: string; idCard: string }): Promise<void> {
  return request.post('/us/users/verify', data)
}

/**
 * 添加管理员
 */
export function addStaff(data: Partial<User>): Promise<void> {
  return request.post('/us/users/addStaff', data)
}
