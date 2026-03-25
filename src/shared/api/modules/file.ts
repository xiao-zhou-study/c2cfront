/**
 * 文件上传相关API
 */

import { request } from '../request'
import type { FileInfo } from '../../types/models'

/**
 * 上传单个文件
 */
export function uploadFile(file: File, module: 'item' | 'user' | 'review' = 'item'): Promise<FileInfo> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('module', module)
  return request.upload('/ss/storage/r2/upload', formData)
}

/**
 * 批量上传文件
 */
export function uploadFiles(files: File[], module: 'item' | 'user' | 'review' = 'item'): Promise<FileInfo[]> {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  formData.append('module', module)
  return request.upload('/ss/storage/r2/upload/batch', formData)
}

/**
 * 删除文件
 */
export function deleteFile(fileId: number): Promise<void> {
  return request.delete(`/ss/storage/r2/${fileId}`)
}

/**
 * 获取文件信息
 */
export function getFileInfo(fileId: number): Promise<FileInfo> {
  return request.get(`/ss/storage/r2/${fileId}`)
}

/**
 * 上传图片（压缩处理）
 */
export function uploadImage(file: File, options?: {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}): Promise<FileInfo> {
  const formData = new FormData()
  formData.append('file', file)
  if (options) {
    formData.append('options', JSON.stringify(options))
  }
  return request.upload('/ss/storage/r2/upload', formData)
}

/**
 * 批量上传图片（返回URL列表）
 */
export function uploadImages(files: File[]): Promise<FileInfo[]> {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  return request.upload('/ss/storage/r2/upload/batch', formData)
}

/**
 * 批量上传文件至 Cloudflare R2，返回公开访问 URL 列表
 * 接口：POST /ss/files/upload/batch，module 为 Query 参数，Body 为 multipart/form-data files
 */
export function uploadImagesReturnUrls(files: File[], module: string = 'items'): Promise<string[]> {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  return request.upload<string[]>('/ss/files/upload/batch', formData, {
    params: { module }
  })
}