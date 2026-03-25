/**
 * 验证工具函数
 */

/**
 * 验证邮箱
 */
export function validateEmail(email: string): boolean {
  const reg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  return reg.test(email)
}

/**
 * 验证手机号
 */
export function validatePhone(phone: string): boolean {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证密码强度（至少6位，包含字母和数字）
 */
export function validatePassword(password: string): boolean {
  const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
  return reg.test(password)
}

/**
 * 验证用户名（3-20位，字母、数字、下划线）
 */
export function validateUsername(username: string): boolean {
  const reg = /^[a-zA-Z0-9_]{3,20}$/
  return reg.test(username)
}

/**
 * 验证身份证号
 */
export function validateIdCard(idCard: string): boolean {
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  return reg.test(idCard)
}

/**
 * 验证学号（8-20位数字或字母）
 */
export function validateStudentId(studentId: string): boolean {
  const reg = /^[a-zA-Z0-9]{8,20}$/
  return reg.test(studentId)
}

/**
 * 验证URL
 */
export function validateUrl(url: string): boolean {
  const reg = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  return reg.test(url)
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; message?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, message: '只支持 JPG、PNG、WEBP 格式的图片' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, message: '图片大小不能超过 5MB' }
  }
  
  return { valid: true }
}

/**
 * 验证价格（大于等于0，最多两位小数）
 */
export function validatePrice(price: number): boolean {
  return price >= 0 && /^\d+(\.\d{1,2})?$/.test(price.toString())
}

/**
 * 验证昵称（2-20个字符）
 */
export function validateNickname(nickname: string): boolean {
  return nickname.length >= 2 && nickname.length <= 20
}

/**
 * 验证必填项
 */
export function validateRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim() !== ''
  }
  return value !== null && value !== undefined
}

/**
 * 验证字符串长度范围
 */
export function validateLength(str: string, min: number, max: number): boolean {
  const len = str.length
  return len >= min && len <= max
}
