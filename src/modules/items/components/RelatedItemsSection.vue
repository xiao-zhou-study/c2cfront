<template>
  <div class="related-items-section">
    <div class="section-header">
      <h3 class="section-title">
        🔗 {{ title }}
      </h3>
      <el-button 
        v-if="showViewAll"
        text 
        @click="handleViewAll"
      >
        查看全部 →
      </el-button>
    </div>

    <div
      v-loading="loading"
      class="items-scroll-container"
    >
      <div class="items-scroll">
        <UnifiedItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          view-mode="grid"
          class="scroll-item"
          @click="handleItemClick"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>

      <!-- 滚动按钮 -->
      <button 
        v-if="showScrollButtons && canScrollLeft"
        class="scroll-btn prev-btn"
        @click="scrollLeft"
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <button 
        v-if="showScrollButtons && canScrollRight"
        class="scroll-btn next-btn"
        @click="scrollRight"
      >
        <el-icon><ArrowRight /></el-icon>
      </button>
    </div>

    <!-- 空状态 -->
    <el-empty 
      v-if="!loading && items.length === 0"
      description="暂无相关物品"
      :image-size="120"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import UnifiedItemCard from '@/shared/components/UnifiedItemCard.vue'
import type { Item } from '@/shared/types/models'

interface Props {
  items: Item[]
  title?: string
  loading?: boolean
  showViewAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  title: '相关推荐',
  loading: false,
  showViewAll: true
})

const emit = defineEmits<{
  'view-all': []
  'item-click': [item: Item]
  'toggle-favorite': [item: Item]
}>()

// 响应式数据
const scrollContainer = ref<HTMLElement>()
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const showScrollButtons = ref(false)

// 方法
const handleViewAll = () => {
  emit('view-all')
}

const handleItemClick = (item: Item) => {
  emit('item-click', item)
}

const handleToggleFavorite = (item: Item) => {
  emit('toggle-favorite', item)
}

const scrollLeft = () => {
  const container = document.querySelector('.items-scroll')
  if (container) {
    container.scrollBy({
      left: -300,
      behavior: 'smooth'
    })
  }
}

const scrollRight = () => {
  const container = document.querySelector('.items-scroll')
  if (container) {
    container.scrollBy({
      left: 300,
      behavior: 'smooth'
    })
  }
}

const updateScrollButtons = () => {
  const container = document.querySelector('.items-scroll') as HTMLElement
  if (!container) return

  canScrollLeft.value = container.scrollLeft > 0
  canScrollRight.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 1
  showScrollButtons.value = container.scrollWidth > container.clientWidth
}

// 生命周期
onMounted(() => {
  const container = document.querySelector('.items-scroll')
  if (container) {
    container.addEventListener('scroll', updateScrollButtons)
    updateScrollButtons()
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateScrollButtons)
  }
})

onUnmounted(() => {
  const container = document.querySelector('.items-scroll')
  if (container) {
    container.removeEventListener('scroll', updateScrollButtons)
  }
  window.removeEventListener('resize', updateScrollButtons)
})
</script>

<style scoped>
.related-items-section {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.items-scroll-container {
  position: relative;
}

.items-scroll {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  padding: var(--spacing-xs) 0;
  margin: 0 -4px;
  
  /* 隐藏滚动条但保持功能 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.items-scroll::-webkit-scrollbar {
  display: none;
}

.scroll-item {
  flex-shrink: 0;
  width: 280px;
}

/* 滚动按钮 */
.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  color: var(--text-primary);
}

.scroll-btn:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.prev-btn {
  left: -20px;
}

.next-btn {
  right: -20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .scroll-item {
    width: 200px;
  }

  .scroll-btn {
    display: none;
  }
}
</style>
