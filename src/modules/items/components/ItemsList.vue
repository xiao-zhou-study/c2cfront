<template>
  <div class="items-section">
    <div class="section-header">
      <h2 class="section-title">
        {{ searchQuery ? '搜索结果' : '全部物品' }}
        <span class="item-count">({{ items.length }} 个)</span>
      </h2>
    </div>

    <div
      v-if="loading"
      class="loading-container"
    >
      <el-skeleton
        :rows="6"
        animated
      />
    </div>

    <div
      v-else-if="items.length === 0"
      class="empty-container"
    >
      <EmptyState 
        :search-query="searchQuery"
        @navigate-to-publish="handleNavigateToPublish"
      />
    </div>

    <div
      v-else
      :class="['items-grid', `view-${viewMode}`]"
    >
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        @view-detail="handleViewDetail"
        @toggle-favorite="handleToggleFavorite"
      />
    </div>
    
    <!-- 加载更多指示器 -->
    <div
      v-if="loadingMore"
      class="loading-more"
    >
      <el-icon><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    
    <!-- 没有更多数据提示 -->
    <div
      v-if="!hasMore && items.length > 0"
      class="no-more"
    >
      <p>没有更多数据了</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import EmptyState from './EmptyState.vue'
import ItemCard from './ItemCard.vue'
import { useRouter } from 'vue-router'
import type { Item } from '@/shared/types/models'

const router = useRouter()

// Props
interface Props {
  items: Item[]
  searchQuery?: string
  viewMode?: 'grid' | 'list'
  loading?: boolean
  loadingMore?: boolean
  hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  searchQuery: '',
  viewMode: 'grid',
  loading: false,
  loadingMore: false,
  hasMore: true
})

// Emits
const emit = defineEmits<{
  'view-detail': [itemId: string]
  'toggle-favorite': [itemId: string]
}>()

// 方法
const handleViewDetail = (itemId: string) => {
  emit('view-detail', itemId)
}

const handleToggleFavorite = (itemId: string) => {
  emit('toggle-favorite', itemId)
}

const handleNavigateToPublish = () => {
  router.push('/publish')
}
</script>

<style scoped>
.items-section {
  margin-top: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.item-count {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.loading-container {
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
}

.empty-container {
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
}

.items-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
}

.items-grid.view-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.items-grid.view-list {
  grid-template-columns: 1fr;
}

.loading-more,
.no-more {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

.loading-more {
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .items-grid.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .items-grid.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .items-grid.view-grid {
    grid-template-columns: 1fr;
  }
}
</style>