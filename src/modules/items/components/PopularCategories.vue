<template>
  <div class="popular-categories-section">
    <div class="section-header">
      <h2 class="section-title">
        热门分类
      </h2>
      <p class="section-description">
        浏览热门物品分类
      </p>
    </div>
    <div class="categories-grid">
      <div 
        v-for="category in popularCategories" 
        :key="category.id" 
        class="category-card"
        @click="handleCategoryClick(category.id)"
      >
        <h3 class="category-name">
          {{ category.name }}
        </h3>
        <span class="category-count">{{ category.itemCount }} 个物品</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits(['category-click'])

// 计算属性 - 热门分类
const popularCategories = computed(() => {
  return props.categories.map(category => ({
    ...category,
    itemCount: Math.floor(Math.random() * 100) + 1
  })).sort((a, b) => b.itemCount - a.itemCount).slice(0, 4)
})

// 方法
const handleCategoryClick = (categoryId) => {
  emit('category-click', categoryId)
}
</script>

<style scoped>
.popular-categories-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-header {
  text-align: center;
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.section-description {
  margin: 0;
  font-size: 16px;
  color: #909399;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.category-card {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.category-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.category-count {
  font-size: 14px;
  opacity: 0.9;
}
</style>