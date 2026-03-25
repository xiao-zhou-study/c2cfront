<template>
  <div class="carousel-section">
    <div class="carousel-container">
      <!-- 左侧轮播图 -->
      <div class="carousel-wrapper">
        <el-carousel
          ref="carouselRef"
          :interval="5000"
          :autoplay="true"
          arrow="hover"
          indicator-position="none"
          class="main-carousel"
          @change="handleCarouselChange"
        >
          <el-carousel-item
            v-for="(item, index) in carouselItems"
            :key="index"
          >
            <div
              class="carousel-item"
              :style="{ backgroundImage: `url(${item.image})` }"
              @click="handleCarouselClick(item)"
            >
              <div class="carousel-content">
                <h2 class="carousel-title">
                  {{ item.title }}
                </h2>
                <p class="carousel-description">
                  {{ item.description }}
                </p>
                <el-button
                  v-if="item.buttonText"
                  type="primary"
                  size="large"
                  class="carousel-button"
                  @click.stop="item.buttonAction"
                >
                  {{ item.buttonText }}
                </el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
        
        <!-- 自定义圆点指示器 -->
        <div class="carousel-indicators">
          <span
            v-for="(item, index) in carouselItems"
            :key="index"
            class="indicator-dot"
            :class="{ active: currentIndex === index }"
            @click="goToSlide(index)"
          />
        </div>
      </div>

      <!-- 右侧分类列表 -->
      <div class="categories-wrapper">
        <div class="categories-header">
          <h2 class="categories-title">热门分类</h2>
        </div>
        <div class="categories-grid">
          <div
            v-for="(category, index) in visibleCategories"
            :key="category.id"
            class="category-item"
            @click="handleCategoryClick(category)"
          >
            <span class="category-icon">
              <!-- 判断是图片URL还是emoji表情 -->
              <img
                v-if="isImageUrl(category.icon)"
                :src="category.icon"
                :alt="category.name"
                class="icon-image"
              >
              <span v-else>{{ category.icon }}</span>
            </span>
            <span class="category-name">{{ category.name }}</span>
          </div>
          
          <!-- 更多按钮 -->
          <div
            v-if="hasMoreCategories"
            class="category-item more-item"
            @click="showAllCategories"
          >
            <span class="category-icon">📦</span>
            <span class="category-name">更多</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCategoryList } from '@/shared/api/modules/item'

const currentIndex = ref(0)

const carouselItems = ref([
  {
    image: 'https://r2.zmwlovefmn.uk/front/pexels-solo-rossi-27257371-18636192.jpg',
    title: '校园二手交易平台',
    description: '让闲置好物找到新主人，买卖更轻松',
    buttonText: '立即开始',
    buttonSize: 'large',
    buttonAction: () => navigateTo('/items')
  },
  {
    image: 'https://r2.zmwlovefmn.uk/front/photo-1542744095-291d1f67b221.jpg',
    title: '出售你的闲置物品',
    description: '一键发布，快速变现，让闲置物品重获价值',
    buttonText: '发布商品',
    buttonAction: () => navigateTo('/publish')
  },
  {
    image: 'https://r2.zmwlovefmn.uk/front/pexels-the-design-lady-746806315-28503355.jpg',
    title: '热门商品推荐',
    description: '发现同学们都在买的优质二手好物',
    buttonText: '浏览热门',
    buttonAction: () => navigateTo('/items?sort=popular')
  },
])

// 分类数据（从接口获取）
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

    // 映射数据格式
    categories.value = activeCategories.map(cat => ({
      id: cat.id.toString(),
      name: cat.name,
      icon: cat.icon || '📦', // 使用后端的 icon 字段
      itemCount: cat.itemCount || 0
    }))
  } catch (error) {
    console.error('加载分类失败:', error)
    // 失败时使用默认分类
    categories.value = [
      { id: 'electronics', name: '电子产品', icon: '📱' },
      { id: 'books', name: '图书教材', icon: '📚' },
      { id: 'clothing', name: '服饰鞋包', icon: '👕' },
      { id: 'phone', name: '手机数码', icon: '📞' },
      { id: 'sports', name: '运动装备', icon: '⚽' },
      { id: 'daily', name: '生活用品', icon: '🏠' },
      { id: 'beauty', name: '美妆护肤', icon: '💄' },
      { id: 'food', name: '食品零食', icon: '🍔' },
    ]
  }
}

// 显示的最大分类数量（包括"更多"按钮）
const maxVisibleCategories = ref(11)

// 可见的分类
const visibleCategories = computed(() => {
  return categories.value.slice(0, maxVisibleCategories.value)
})

// 是否有更多分类
const hasMoreCategories = computed(() => {
  return categories.value.length > maxVisibleCategories.value
})

// 暴露方法给父组件
const emit = defineEmits(['navigate'])

const navigateTo = (path) => {
  emit('navigate', path)
}

const handleCarouselClick = (item) => {
  if (item.buttonAction) {
    item.buttonAction()
  }
}

const handleCarouselChange = (index) => {
  currentIndex.value = index
}

const carouselRef = ref(null)

const goToSlide = (index) => {
  currentIndex.value = index
  if (carouselRef.value) {
    carouselRef.value.setActiveItem(index)
  }
}

const handleCategoryClick = (category) => {
  navigateTo(`/items?category=${category.id}`)
}

const showAllCategories = () => {
  navigateTo('/items')
}

// 组件挂载时加载数据
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
/* 轮播图区域 */
.carousel-section {
  position: relative;
  margin-bottom: 1.5rem;
}

.carousel-container {
  display: flex;
  gap: 1.5rem;
  align-items: stretch;
}

/* 左侧轮播图包装器 - 占1/3 */
.carousel-wrapper {
  flex: 0 0 33.333%;
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-deep);
}

.main-carousel {
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: 320px;
}

/* 设置轮播容器高度 */
.main-carousel :deep(.el-carousel__container) {
  height: 100%;
}

.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-lg);
  cursor: pointer;
  transition: transform var(--transition-base);
}

.carousel-item:hover {
  transform: scale(1.02);
}

.carousel-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 100%);
  z-index: 1;
}

.carousel-content {
  position: relative;
  z-index: 2;
  color: white;
}

.carousel-title {
  font-size: clamp(18px, 2vw, 24px);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.2;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.carousel-description {
  font-size: clamp(12px, 1.2vw, 14px);
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.4;
  opacity: 0.95;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
}

.carousel-button {
  font-size: 13px;
  padding: 8px 20px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-base);
  transition: all var(--transition-base);
}

.carousel-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* 自定义圆点指示器 */
.carousel-indicators {
  position: absolute;
  bottom: var(--spacing-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
  z-index: 10;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all var(--transition-base);
}

.indicator-dot:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.indicator-dot.active {
  width: 18px;
  border-radius: 3px;
  background: white;
}

/* 右侧分类列表 - 占2/3 */
.categories-wrapper {
  flex: 0 0 66.666%;
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-base);
}

.categories-header {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid #f0f0f0;
}

.categories-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.categories-title::before {
  content: '🔥';
  font-size: 20px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: #ffffff;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 2px solid #f0f0f0;
}

.category-item:hover {
  background: #e6f9f5;
  border-color: #03a688;
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.category-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-image {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
}

.more-item {
  background: linear-gradient(135deg, #e6f9f5 0%, #b4f3e6 100%);
  border: 2px dashed #03a688;
}

.more-item:hover {
  background: linear-gradient(135deg, #b4f3e6 0%, #7ee7cd 100%);
  border-style: solid;
}

/* 响应式 */
@media (max-width: 1200px) {
  .carousel-container {
    flex-direction: column;
  }
  
  .carousel-wrapper {
    flex: 0 0 100%;
  }
  
  .categories-wrapper {
    flex: 0 0 100%;
  }
  
  .main-carousel {
    height: 280px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .main-carousel {
    height: 200px;
  }
  
  .carousel-section {
    margin-bottom: 1rem;
  }
  
  .carousel-container {
    gap: 1rem;
  }
  
  .carousel-item {
    padding: 0 var(--spacing-md);
  }
  
  .carousel-title {
    font-size: clamp(16px, 4vw, 20px);
  }
  
  .carousel-description {
    font-size: 12px;
    margin-bottom: var(--spacing-sm);
  }
  
  .carousel-button {
    padding: 6px 16px;
    font-size: 12px;
  }
  
  .carousel-indicators {
    bottom: var(--spacing-sm);
  }
  
  .categories-wrapper {
    padding: var(--spacing-md);
  }
  
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
  }
  
  .category-item {
    padding: var(--spacing-sm);
  }
  
  .category-icon {
    font-size: 24px;
  }
  
  .category-name {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
