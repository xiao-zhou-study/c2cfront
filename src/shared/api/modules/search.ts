/**
 * 搜索相关API
 */

import { request } from '../request'
import type { Item, User, PageResponse } from '../../types/models'

export interface SearchParams {
  q?: string
  type?: 'items' | 'users' | 'all'
  category?: number
  minPrice?: number
  maxPrice?: number
  statuses?: string
  location?: string
  publishTime?: string
  sortBy?: 'default' | 'price_asc' | 'price_desc' | 'newest' | 'most_viewed'
  page?: number
  pageSize?: number
}

export interface SearchResult {
  items?: Item[]
  users?: User[]
  total: number
  itemsCount?: number
  usersCount?: number
}

export interface SearchHistoryItem {
  id: number
  keyword: string
  time: number
  resultCount?: number
  hasFilters?: boolean
  filters?: any
}

export interface SavedSearch {
  id?: number
  name: string
  conditions: SearchParams
  createdAt?: number
}

export interface PopularKeyword {
  keyword: string
  count: number
  trend?: 'up' | 'down' | 'stable'
}

/**
 * 通用搜索接口
 */
export function search(params: SearchParams): Promise<SearchResult> {
  return request.get('/is/search', { params })
}

/**
 * 搜索建议
 */
export function getSearchSuggestions(keyword: string, limit?: number): Promise<string[]> {
  return request.get('/is/search/suggestions', { params: { keyword, limit } })
}

/**
 * 获取热门搜索关键词
 */
export function getPopularKeywords(limit?: number): Promise<PopularKeyword[]> {
  return request.get('/is/search/popular', { params: { limit } })
}

/**
 * 获取搜索历史
 */
export function getSearchHistory(limit?: number): Promise<SearchHistoryItem[]> {
  return request.get('/is/search/history', { params: { limit } })
}

/**
 * 添加搜索历史
 */
export function addSearchHistory(data: {
  keyword: string
  resultCount?: number
  filters?: any
}): Promise<boolean> {
  return request.post('/is/search/history', data)
}

/**
 * 删除搜索历史
 */
export function deleteSearchHistory(id: number): Promise<boolean> {
  return request.delete(`/is/search/history/${id}`)
}

/**
 * 清空搜索历史
 */
export function clearSearchHistory(): Promise<boolean> {
  return request.delete('/is/search/history')
}

/**
 * 获取保存的搜索
 */
export function getSavedSearches(): Promise<SavedSearch[]> {
  return request.get('/is/search/saved')
}

/**
 * 保存搜索条件
 */
export function saveSearchConditions(data: SavedSearch): Promise<{ id: number }> {
  return request.post('/is/search/saved', data)
}

/**
 * 删除保存的搜索
 */
export function deleteSavedSearch(id: number): Promise<boolean> {
  return request.delete(`/is/search/saved/${id}`)
}

/**
 * 获取搜索统计
 */
export function getSearchStats(): Promise<{
  totalSearches: number
  todaySearches: number
  uniqueKeywords: number
  savedSearches: number
}> {
  return request.get('/is/search/stats')
}

/**
 * 导出搜索历史
 */
export function exportSearchHistory(): Promise<Blob> {
  return request.get('/is/search/history/export', {
    responseType: 'blob'
  })
}