<template>
  <div class="hot-categories-section">
    <div class="section-header">
      <h2 class="section-title">
        热门分类
      </h2>
      <el-button
        text
        class="view-all-btn"
        @click="handleViewAll"
      >
        查看全部
      </el-button>
    </div>
    <div class="categories-grid">
      <div 
        v-for="category in categories" 
        :key="category.id" 
        class="category-card"
        @click="handleCategoryClick(category.id)"
      >
        <div class="category-icon-wrapper">
          <div class="category-icon">
            <!-- 判断是图片URL还是emoji表情 -->
            <img
              v-if="isImageUrl(category.emoji)"
              :src="category.emoji"
              :alt="category.name"
              class="icon-image"
            >
            <span
              v-else
              class="icon-emoji"
            >{{ category.emoji }}</span>
          </div>
        </div>
        <div class="category-info">
          <h3 class="category-name">
            {{ category.name }}
          </h3>
          <p class="category-count">
            <span class="count-number">{{ category.itemCount }}</span> 件物品
          </p>
        </div>
        <div
          v-if="category.isHot"
          class="category-badge"
        >
          <span class="badge-text">🔥 热门</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategoryList } from '@/shared/api/modules/item'

const categories = ref([])

// 判断是否是图片URL
const isImageUrl = (url) => {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

// 从后端加载分类数据
const loadCategories = async () => {
  try {
    const data = await getCategoryList()
    // 过滤出启用的分类
    const activeCategories = data.filter(cat => cat.isActive)

    // 映射数据格式，适配组件需要
    categories.value = activeCategories.map(cat => ({
      id: cat.id.toString(), // 转换为字符串用于路由
      name: cat.name,
      emoji: cat.icon || '📦', // 使用后端的 icon 字段，如果没有则使用默认图标
      itemCount: cat.itemCount || 0, // 使用后端的 itemCount，如果没有则默认为0
      isHot: false // 后端没有此字段，暂时设为false
    }))
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 暴露事件
const emit = defineEmits(['navigate', 'category-click'])

const handleViewAll = () => {
  emit('navigate', '/items?category=all')
}

const handleCategoryClick = (categoryId) => {
  emit('category-click', categoryId)
  emit('navigate', `/items?category=${categoryId}`)
}

// 组件挂载时加载数据
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
/* 热门分类导航 */
.hot-categories-section {
  margin-bottom: 1.5rem;
}

.hot-categories-section .section-header {
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

/* 桌面端: 4x3 网格 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.category-card {
  position: relative;
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-base);
  border: 2px solid transparent;
}

.category-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-hover);
  border-color: var(--brand-primary);
}

.category-card:hover .category-icon {
  transform: scale(1.1);
}

.category-card:hover .icon-emoji {
  transform: scale(1.2);
}

.category-icon-wrapper {
  margin-bottom: var(--spacing-md);
}

.category-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.icon-emoji {
  font-size: 40px;
  transition: transform var(--transition-base);
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.category-info {
  margin-top: var(--spacing-sm);
}

.category-name {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  transition: color var(--transition-base);
}

.category-card:hover .category-name {
  color: var(--brand-primary);
}

.category-count {
  font-size: var(--font-size-extra-small);
  color: var(--text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.count-number {
  font-weight: var(--font-weight-bold);
  color: var(--brand-primary);
  font-family: var(--font-family-number);
}

/* 热门徽章 */
.category-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-text {
  font-size: 11px;
  color: white;
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式 - 平板端: 3列 */
@media (max-width: 1024px) and (min-width: 769px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 响应式 - 移动端: 2x4 网格 */
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .category-card {
    padding: var(--spacing-md);
  }
  
  .category-icon {
    width: 60px;
    height: 60px;
  }
  
  .icon-emoji {
    font-size: 30px;
  }
  
  .category-name {
    font-size: var(--font-size-base);
  }
  
  .category-count {
    font-size: 11px;
  }
}
</style>