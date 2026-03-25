<template>
  <div class="empty-state">
    <div class="empty-icon">
      <el-icon
        :size="64"
        color="#909399"
      >
        <Box />
      </el-icon>
    </div>
    <h3 class="empty-title">
      {{ searchQuery ? '没有找到符合条件的物品' : '暂无物品' }}
    </h3>
    <p class="empty-description">
      {{ searchQuery ? '请尝试修改搜索条件或筛选选项' : '目前还没有发布的物品' }}
    </p>
    <el-button 
      v-if="!searchQuery" 
      type="primary" 
      class="empty-btn"
      @click="handleNavigateToPublish"
    >
      发布第一个物品
    </el-button>
  </div>
</template>

<script setup>
import { Box } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Props
const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['navigate-to-publish'])

// 方法
const handleNavigateToPublish = () => {
  emit('navigate-to-publish')
  router.push('/publish')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.empty-description {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
  max-width: 400px;
}

.empty-btn {
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.empty-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .empty-state {
    padding: 40px 15px;
  }
  
  .empty-title {
    font-size: 18px;
  }
  
  .empty-description {
    font-size: 13px;
  }
}
</style>