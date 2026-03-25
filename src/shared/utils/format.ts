/**
 * 格式化工具函数
 */

import { 
  BILLING_TYPE_UNIT, 
  CONDITION_LEVEL_TEXT, 
  ORDER_STATUS_TEXT, 
  GENDER_TEXT, 
  RATING_TEXT 
} from './constants.js'

/**
 * 格式化时间戳为日期字符串
 */
export function formatDate(timestamp: number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = new Date(timestamp)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化时间戳为日期字符串
 * 支持毫秒级时间戳（后端常用），若传入秒级（数值 < 1e12）会自动按秒转毫秒
 */
export function formatTimestamp(
  timestamp: number | string | undefined | null,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (timestamp === undefined || timestamp === null || timestamp === '') return '-'
  const ts = Number(timestamp)
  if (Number.isNaN(ts)) return '-'
  // 毫秒级通常 >= 1e12，小于则按秒级处理
  const ms = ts >= 1e12 ? ts : ts * 1000
  return formatDate(ms, format)
}

/**
 * 格式化相对时间（多久前）
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 格式化价格
 */
export function formatPrice(price: number, billingType?: string): string {
  const unit = billingType ? BILLING_TYPE_UNIT[billingType as keyof typeof BILLING_TYPE_UNIT] : ''
  
  if (price === 0) {
    return '免费'
  }
  
  return `¥${price.toFixed(2)}${unit ? '/' + unit : ''}`
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 格式化手机号（中间四位隐藏）
 */
export function formatPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

/**
 * 格式化身份证号（隐藏部分信息）
 */
export function formatIdCard(idCard: string): string {
  if (!idCard || idCard.length !== 18) return idCard
  return `${idCard.slice(0, 6)}********${idCard.slice(14)}`
}

/**
 * 格式化物品成色
 */
export function formatCondition(condition: string): string {
  return CONDITION_LEVEL_TEXT[condition as keyof typeof CONDITION_LEVEL_TEXT] || condition
}

/**
 * 格式化订单状态
 */
export function formatOrderStatus(status: number): string {
  return ORDER_STATUS_TEXT[status as keyof typeof ORDER_STATUS_TEXT] || '未知状态'
}

/**
 * 格式化性别
 */
export function formatGender(gender: number): string {
  return GENDER_TEXT[gender as keyof typeof GENDER_TEXT] || '保密'
}

/**
 * 格式化评分文本
 */
export function formatRating(rating: number): string {
  return RATING_TEXT[rating as keyof typeof RATING_TEXT] || ''
}

/**
 * 格式化数字（千分位）
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0%'
  return ((value / total) * 100).toFixed(decimals) + '%'
}

/**
 * 截断文本
 */
export function truncate(text: string, length: number = 50): string {
  if (!text) return ''
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * 高亮关键词
 */
export function highlightKeyword(text: string, keyword: string): string {
  if (!keyword) return text
  const reg = new RegExp(keyword, 'gi')
  return text.replace(reg, match => `<span class="highlight">${match}</span>`)
}
