import { computed } from 'vue'
import { useUserStore } from '@/shared/stores/user'
import { ElMessage } from 'element-plus'

/**
 * 用户相关的 composable
 * 现在基于 Pinia store，提供更简洁的 API
 */
export function useUser() {
  const userStore = useUserStore()

  // 计算属性
  const userInfo = computed(() => userStore.userInfo)
  const userStats = computed(() => userStore.userInfo.stats || {
    published: 0,
    borrowed: 0,
    borrowing: 0,
    reviews: 0
  })
  const userDisplayName = computed(() => userStore.userName)

  // 更新用户信息（封装 store 方法）
  const updateProfile = async (newInfo) => {
    try {
      await userStore.updateUserInfo(newInfo)
      ElMessage.success('用户信息更新成功')
      return userStore.userInfo
    } catch (error) {
      ElMessage.error('用户信息更新失败')
      throw error
    }
  }

  // 更新头像
  const updateAvatar = async (avatarUrl) => {
    try {
      await userStore.updateAvatar(avatarUrl)
      ElMessage.success('头像更新成功')
      return avatarUrl
    } catch (error) {
      ElMessage.error('头像更新失败')
      throw error
    }
  }

  // 修改密码
  const updatePassword = async (passwordData) => {
    try {
      const { changePassword } = await import('@/shared/api/modules/user')
      await changePassword(passwordData)
      ElMessage.success('密码修改成功')
      return true
    } catch (error) {
      ElMessage.error('密码修改失败')
      throw error
    }
  }

  return {
    // 状态
    userInfo,
    userStats,
    userDisplayName,
    
    // 方法
    updateProfile,
    updateAvatar,
    updatePassword,
    
    // 直接暴露 store（如果需要访问更多功能）
    userStore
  }
}