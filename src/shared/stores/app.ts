import { defineStore } from 'pinia'
import { ref } from 'vue'

type DeviceType = 'desktop' | 'tablet' | 'mobile'

export const useAppStore = defineStore('app', () => {
  // 状态
  const loading = ref(false)
  const pageLoading = ref(false)
  const sidebarCollapsed = ref(false)
  const device = ref<DeviceType>('desktop')
  
  // 设置加载状态
  const setLoading = (value: boolean) => {
    loading.value = value
  }
  
  // 设置页面加载状态
  const setPageLoading = (value: boolean) => {
    pageLoading.value = value
  }
  
  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  // 设置设备类型
  const setDevice = (deviceType: DeviceType) => {
    device.value = deviceType
  }
  
  return {
    // 状态
    loading,
    pageLoading,
    sidebarCollapsed,
    device,
    
    // 方法
    setLoading,
    setPageLoading,
    toggleSidebar,
    setDevice
  }
})
