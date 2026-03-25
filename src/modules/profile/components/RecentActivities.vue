<template>
  <div class="recent-activities">
    <div class="tab-header">
      <div class="tab-title">
        <h3>最新动态</h3>
        <span class="item-count">({{ activities.length }}条)</span>
      </div>
      <div class="tab-actions">
        <el-button 
          type="primary" 
          size="small" 
          :loading="refreshLoading"
          @click="refreshActivities"
        >
          <el-icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-refresh-cw"
            ><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <div
      v-if="loading"
      class="loading-container"
    >
      <el-skeleton
        :rows="4"
        animated
      />
    </div>
    
    <div
      v-else-if="activities.length === 0"
      class="empty-container"
    >
      <el-empty description="暂无动态" />
    </div>
    
    <div
      v-else
      class="activities-list"
    >
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="activity-card"
      >
        <div class="activity-header">
          <div class="activity-type">
            <el-tag :type="getActivityTypeTag(activity.type)">
              {{ getActivityTypeText(activity.type) }}
            </el-tag>
          </div>
          <div class="activity-time">
            {{ formatTime(activity.created_at) }}
          </div>
        </div>
        <div class="activity-content">
          <p>{{ activity.description }}</p>
        </div>
        <div
          v-if="activity.item"
          class="activity-item"
        >
          <img
            :src="activity.item.image"
            :alt="activity.item.name"
            class="activity-item-image"
          >
          <div class="activity-item-info">
            <div class="activity-item-name">
              {{ activity.item.name }}
            </div>
            <el-button
              size="small"
              @click="viewActivityItem(activity.item.id)"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])

const router = useRouter()
const refreshLoading = ref(false)

const getActivityTypeText = (type) => {
  const typeMap = {
    borrow: '借用',
    publish: '发布',
    return: '归还',
    review: '评价',
    request: '申请',
    approve: '同意',
    reject: '拒绝'
  }
  return typeMap[type] || '其他'
}

const getActivityTypeTag = (type) => {
  const typeMap = {
    borrow: 'primary',
    publish: 'success',
    return: 'info',
    review: 'warning',
    request: 'info',
    approve: 'success',
    reject: 'danger'
  }
  return typeMap[type] || 'default'
}

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  } else if (diff < 30 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

const refreshActivities = async () => {
  try {
    refreshLoading.value = true
    emit('refresh')
    ElMessage.success('刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    refreshLoading.value = false
  }
}

const viewActivityItem = (id) => {
  router.push(`/items/${id}`)
}
</script>

<style scoped>
.recent-activities {
  padding: 24px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #EBEEF5;
}

.tab-title h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.item-count {
  color: #909399;
  font-size: 14px;
  margin-left: 8px;
}

.tab-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-card {
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.activity-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.activity-type {
  font-weight: 600;
}

.activity-time {
  color: #909399;
  font-size: 12px;
}

.activity-content {
  margin-bottom: 16px;
}

.activity-content p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #F5F7FA;
  border-radius: 6px;
}

.activity-item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.activity-item-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-item-name {
  font-weight: 600;
  color: #303133;
}

.loading-container {
  padding: 40px 20px;
}

.empty-container {
  padding: 40px 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .recent-activities {
    padding: 16px;
  }
  
  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .activity-item-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>