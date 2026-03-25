import { request } from '@/shared/api/request';
import type { LoginRequest, RegisterRequest, User } from '@/shared/types/models';
import type { AxiosRequestConfig } from 'axios';

export const login = async (loginData: LoginRequest): Promise<string> => {
  // 登录接口，后端返回 { code, msg, data: token }
  // 响应拦截器已经提取了 data 字段，这里直接返回 token 字符串
  return request.post('/as/accounts/login', loginData) as Promise<string>;
};

// 用户注册
export const register = async (data: RegisterRequest): Promise<void> => {
  try {
    await request.post('/us/users/register', data);
  } catch (error) {
    console.error('注册请求失败:', error);
    throw error;
  }
};

// 用户登出
export const logout = async (): Promise<void> => {
  try {
    await request.post('/as/accounts/logout');
  } catch (error) {
    console.error('登出请求失败:', error);
    throw error;
  }
};

// 刷新token
export const refreshToken = async (refreshToken?: string): Promise<string> => {
  // 刷新token接口不需要传递参数，后端会从cookie中获取
  // 后端返回 { code, msg, data: token }
  // 响应拦截器已经提取了 data 字段，这里直接返回 token 字符串
  return request.get('/as/accounts/refresh') as Promise<string>;
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  try {
    return await request.get('/us/users/detail/true', {
      data: { email: '', password: '' } // 需要发送空的数据体，因为后端接口需要POST
    });
  } catch (error) {
    console.error('获取当前用户信息请求失败:', error);
    throw error;
  }
};