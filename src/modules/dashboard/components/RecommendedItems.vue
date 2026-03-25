<template>
  <div class="recommended-items-section">
    <div class="section-header">
      <h2 class="section-title">
        🔥 热门
      </h2>
      <el-button
        text
        class="view-all-btn"
        @click="handleViewAll"
      >
        查看全部 →
      </el-button>
    </div>
    <div class="items-container">
      <div
        v-loading="loading"
        class="items-grid"
      >
        <UnifiedItemCard
          v-for="item in recommendedItems"
          :key="item.id"
          :item="item"
          view-mode="grid"
          @click="handleItemClick"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>
      <div
        v-if="loadingMore"
        class="loading-more"
      >
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div
        v-if="!hasMore && recommendedItems.length > 0"
        class="no-more"
      >
        没有更多数据了
      </div>
      <!-- 加载更多触发器 -->
      <div
        v-if="hasMore && recommendedItems.length > 0"
        ref="loadMoreTrigger"
        class="load-more-trigger"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import UnifiedItemCard from '@/shared/components/UnifiedItemCard.vue'
import { itemApi } from '@/shared/api'
import { mockItemService } from '@/shared/services/mockService'
import type { Item } from '@/shared/types/models'
import { ElMessage, ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

// 是否使用mock数据（后端未就绪时设置为true）
const useMock = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(8)
const recommendedItems = ref<Item[]>([])
const loadMoreObserver = ref<IntersectionObserver | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

// 暴露事件
const emit = defineEmits(['navigate', 'item-click'])

// 加载推荐物品：对接 GET /items 分页接口
const loadRecommendedItems = async () => {
  loading.value = true
  try {
    if (useMock.value) {
      const response = await mockItemService.getItemList({
        page: page.value,
        pageSize: pageSize.value,
        sortBy: 'popular'
      })
      if (page.value === 1) {
        recommendedItems.value = response.data
      } else {
        recommendedItems.value = [...recommendedItems.value, ...response.data]
      }
      hasMore.value = recommendedItems.value.length < response.total
    } else {
      const res = await itemApi.searchItems({
        pageNo: page.value,
        pageSize: pageSize.value,
        sortBy: 'created_at',
        isAsc: false
      })
      const list = res.list || []
      const total = res.total || 0
      if (page.value === 1) {
        recommendedItems.value = list
      } else {
        recommendedItems.value = [...recommendedItems.value, ...list]
      }
      hasMore.value = recommendedItems.value.length < total
    }
  } catch (error) {
    console.error('加载推荐物品失败:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多数据
const loadMoreItems = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  page.value += 1
  await loadRecommendedItems()
}

// 设置加载更多观察器
const setupLoadMoreObserver = () => {
  if (!loadMoreTrigger.value || !hasMore.value) return

  // 先清理旧的观察器
  cleanupLoadMoreObserver()

  loadMoreObserver.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMore.value && !loadingMore.value) {
        loadMoreItems()
      }
    },
    {
      rootMargin: '100px'
    }
  )

  loadMoreObserver.value.observe(loadMoreTrigger.value)
}

// 清理加载更多观察器
const cleanupLoadMoreObserver = () => {
  if (loadMoreObserver.value) {
    loadMoreObserver.value.disconnect()
    loadMoreObserver.value = null
  }
}

const handleViewAll = () => {
  emit('navigate', '/items?filter=recommended')
}

const handleItemClick = (item: Item) => {
  emit('item-click', item.id)
  emit('navigate', `/items/${item.id}`)
}

const handleToggleFavorite = (item: Item) => {
  ElMessage.success(item.isFavorite ? '已添加到收藏' : '已取消收藏')
}

// 监听 hasMore 变化，当没有更多数据时清理观察器
watch(hasMore, (newHasMore) => {
  if (!newHasMore) {
    cleanupLoadMoreObserver()
  }
})

// 组件挂载时加载数据
onMounted(async () => {
  await loadRecommendedItems()
  await nextTick()
  setupLoadMoreObserver()
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  cleanupLoadMoreObserver()
})
</script>

<style scoped>
/* 热门推荐 */
.recommended-items-section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.view-all-btn {
  color: var(--brand-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
}

.view-all-btn:hover {
  color: var(--brand-primary-hover);
  transform: translateX(4px);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

/* 响应式 */
@media (max-width: 1200px) {
  .items-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

/* 加载更多触发器 */
.load-more-trigger {
  height: 20px;
  width: 100%;
}

/* 加载更多 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-small);
}

.loading-icon {
  margin-right: 8px;
  animation: rotate 1s linear infinite;
}

/* 没有更多 */
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  color: var(--text-placeholder);
  font-size: var(--font-size-small);
}

/* 旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
