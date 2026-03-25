import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/shared/stores/user'
import router from '@/router'
import { ErrorHandler } from '@/shared/utils/error-handler'
import { generateRequestId } from '@/shared/utils/debounce'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  // 开发环境：使用 /api 代理到本地 Gateway
  // 生产环境：使用 HTTPS API 域名
  baseURL: import.meta.env.MODE === 'development' ? '/api' : import.meta.env.VITE_API_BASE_URL || 'https://api.zmwlovefmn.uk',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 允许携带cookie
})

// 使用store中的统一刷新队列，移除重复的状态管理
// 这里只保留临时队列用于响应拦截器的即时处理

// 创建独立的 Axios 实例用于刷新 token，避免循环调用
const refreshAxios = axios.create({
  baseURL: import.meta.env.MODE === 'development' ? '/api' : import.meta.env.VITE_API_BASE_URL || 'https://api.zmwlovefmn.uk',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'client'
  },
  withCredentials: true
})

// 刷新状态管理
let isRefreshing = false
const refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

// 刷新 token 的核心函数
const refreshToken = async (): Promise<string> => {
  console.log('前端开始刷新 token...')
  
  try {
    const response = await refreshAxios.get('/as/accounts/refresh')
    const res = response.data
    
    // 处理统一响应格式
    if (res && typeof res === 'object' && res.code !== undefined) {
      if (res.code === 0 || res.code === 200) {
        const newToken = res.data
        if (newToken && typeof newToken === 'string') {
          console.log('前端 token 刷新成功')
          // 更新 localStorage
          const userStore = useUserStore()
          userStore.setToken(newToken)
          return newToken
        }
      }
      throw new Error(res.msg || res.message || 'Token 刷新失败')
    }
    
    throw new Error('Token 刷新响应格式错误')
  } catch (error: any) {
    console.error('前端 token 刷新失败:', error)
    throw error
  }
}

// 请求拦截器
service.interceptors.request.use(
  async (config) => {
    const userStore = useUserStore()

    // 检查是否跳过 token 验证（用于登录后获取用户信息）
    const skipTokenCheck = (config as any).skipTokenCheck === true

    if (userStore.token && !skipTokenCheck) {
      // 首先检查token是否已过期，避免竞态条件
      if (userStore.isTokenExpired(userStore.token)) {
        try {
          // token已过期，立即刷新并等待
          const newToken = await userStore.refreshTokenAction(false);
          (config.headers as any) = (config.headers as any) || {};
          (config.headers as any).Authorization = newToken;
        } catch (error) {
          // 刷新失败，跳转到登录页
          router.push('/login');
          return Promise.reject(error);
        }
      } else {
        // token未过期，检查是否即将过期
        if (userStore.shouldRefreshToken(userStore.token)) {
          console.log('Token即将过期，主动刷新token...')

          // 非阻塞刷新 - 不等待结果，避免循环调用
          userStore.refreshTokenAction(false)
            .then(() => {
              console.log('Token主动刷新成功')
            })
            .catch((error) => {
              console.error('Token主动刷新失败:', error)
            })
        }

        // 设置当前有效的token
        (config.headers as any) = (config.headers as any) || {};
        (config.headers as any).Authorization = userStore.token;
      }
    }

    // 即使跳过验证，也要设置 token（如果存在）
    if (userStore.token && skipTokenCheck) {
      (config.headers as any) = (config.headers as any) || {};
      (config.headers as any).Authorization = userStore.token;
    }
    // 添加自定义请求头标识客户端
    (config.headers as any) = (config.headers as any) || {};
    (config.headers as any)['X-Client-Type'] = 'client';
    (config.headers as any)['X-Request-ID'] = generateRequestId();
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 1. 如果返回的是对象，首先检查 code 字段（Gateway统一响应格式）
    if (typeof res === 'object' && res !== null) {
      // 如果有 code 字段，先判断是否成功
      if (res.code !== undefined) {
        if (res.code !== 0 && res.code !== 200) {
          // code 不为 0 或 200，表示失败
          const errorMsg = res.msg || res.message || '请求失败'
          ElMessage.error(errorMsg)
          return Promise.reject(new Error(errorMsg))
        }
        // code 为 0 或 200，表示成功，返回 data 字段
        // data 可能是任意类型：字符串（token）、对象、数组等
        return res.data
      }
      // 没有 code 字段的对象，直接返回
      return res
    }

    // 2. 如果返回的是纯文本，直接返回（理论上不会走到这里）
    if (typeof res === 'string') {
      return res
    }

    // 3. 其他情况直接返回
    return res
  },
  async (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const status = error.response.status
      const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      
      switch (status) {
        case 401: {
          // 登录流程内触发的请求（如登录后立即拉取 /users/me）不触发全局登出与跳转，避免清掉刚写入的 token
          if ((config as any).skipAuthRedirect === true) {
            return Promise.reject(error)
          }
          // 如果已经重试过，直接跳转登录
          if (config._retry) {
            const userStore = useUserStore()
            userStore.resetState()
            router.push('/login')
            return Promise.reject(error)
          }
          
          // 标记为重试请求
          config._retry = true
          
          // 判断当前是否正在刷新
          if (isRefreshing) {
            // 正在刷新，将请求封装成 Promise 存入队列
            console.log('前端检测到正在刷新中，请求加入队列')
            return new Promise((resolve, reject) => {
              refreshQueue.push({
                resolve: (token: string) => {
                  (config.headers as any).Authorization = token
                  resolve(service(config))
                },
                reject
              })
            })
          }
          
          // 启动刷新流程
          isRefreshing = true
          console.log('前端响应拦截器检测到 401，启动刷新流程')
          
          try {
            // 使用独立的 Axios 实例刷新 token
            const newToken = await refreshToken()
            
            // 刷新成功，遍历执行队列里的所有请求
            console.log(`前端刷新成功，执行队列中的 ${refreshQueue.length} 个请求`)
            refreshQueue.forEach(({ resolve }) => {
              resolve(newToken)
            })
            refreshQueue.splice(0, refreshQueue.length)
            
            // 重试当前请求
            config.headers = config.headers || {} as any;
            (config.headers as any).Authorization = newToken
            return service(config)
          } catch (refreshError: any) {
            // 刷新失败，清空队列
            console.error('前端刷新失败，清空队列并跳转登录')
            refreshQueue.forEach(({ reject }) => {
              reject(new Error('Token 刷新失败'))
            })
            refreshQueue.splice(0, refreshQueue.length)
            
            // 清空状态并强制跳转 /login
            const userStore = useUserStore()
            userStore.resetState()
            router.push('/login')
            
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        }
          
        case 403:
        case 404:
        case 500:
        default: {
          const errorMsg = ErrorHandler.handleHttpError(status, error.response.data)
          ElMessage.error(errorMsg)
          break
        }
      }
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

// 封装请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  },
  
  upload<T = any>(url: string, data: FormData, config?: AxiosRequestConfig): Promise<T> {
    const uploadHeaders: any = {
      'Content-Type': 'multipart/form-data'
    };
    
    if (config?.headers) {
      Object.assign(uploadHeaders, config.headers);
    }
    
    return service.post(url, data, {
      ...config,
      headers: uploadHeaders
    })
  }
}

export default service
