/**
 * 博客/讨论区相关API
 */

import { request } from '../request'

/**
 * 话题相关接口
 */

// 话题请求参数类型
export interface TopicAddOrUpdateRequest {
  id?: number | null
  categoryId: number
  title: string
  content: string
}

// 话题列表查询参数
export interface TopicListParams {
  pageNo?: number
  pageSize?: number
  sortBy?: string
  isAsc?: boolean
  keyword?: string
}

// 话题响应类型
export interface Topic {
  id: number
  categoryId: number
  categoryName: string
  userId: number
  userAvatar: string
  userNickname: string
  title: string
  content: string
  viewCount: number
  commentCount: number
  createTime: number
  updateTime: number
}

// 分页响应类型
export interface PageResponse<T> {
  total: number
  pages: number
  list: T[]
}

/**
 * 新增或修改话题
 * POST /cs/topics/addOrUpdate
 */
export function addOrUpdateTopic(data: TopicAddOrUpdateRequest): Promise<void> {
  return request.post('/cs/topics/addOrUpdate', data)
}

/**
 * 删除话题
 * DELETE /cs/topics/delete?id={id}
 */
export function deleteTopic(id: number): Promise<void> {
  return request.delete('/cs/topics/delete', { params: { id } })
}

/**
 * 分页获取话题列表
 * GET /cs/topics/list
 */
export function getTopicList(params: TopicListParams): Promise<PageResponse<Topic>> {
  return request.get('/cs/topics/list', { params })
}

/**
 * 获取话题详情
 * GET /cs/topics/getTopicDetail?id={id}
 */
export function getTopicDetail(id: number): Promise<Topic> {
  return request.get('/cs/topics/getTopicDetail', {
    params: { id }
  })
}

/**
 * 分类相关接口
 */

// 分类响应类型
export interface Category {
  id: number
  name: string
  description: string
  sortOrder: number
  createTime: number
}

/**
 * 获取分类列表
 * GET /cs/categories/list
 */
export function getCategoryList(): Promise<Category[]> {
  return request.get('/cs/categories/list')
}

/**
 * 评论相关接口
 */

// 评论请求参数类型
export interface CommentAddRequest {
  topicId: number
  content: string
}

// 评论列表查询参数
export interface CommentPageParams {
  topicId: number
  pageNo?: number
  pageSize?: number
  sortBy?: string
  isAsc?: boolean
}

// 评论响应类型
export interface Comment {
  id: number
  topicId: number
  userId: number
  username: string
  avatar: string
  content: string
  createTime: number
}

/**
 * 新增评论
 * POST /cs/comments
 */
export function addComment(data: CommentAddRequest): Promise<void> {
  return request.post('/cs/comments', data)
}

/**
 * 删除评论
 * DELETE /cs/comments/delete?id={id}
 */
export function deleteComment(id: number): Promise<void> {
  return request.delete('/cs/comments/delete', { params: { id } })
}

/**
 * 分页获取话题评论
 * GET /cs/comments/page
 */
export function getCommentPage(params: CommentPageParams): Promise<PageResponse<Comment>> {
  return request.get('/cs/comments/page', { params })
}
