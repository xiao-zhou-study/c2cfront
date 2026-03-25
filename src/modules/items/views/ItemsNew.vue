<template>
  <div class="items-page">
    <div class="main-content">
      <div class="container">
        <!-- 筛选栏 -->
        <div class="filters-bar">
          <div class="filters-inner">
            <div class="filter-label">
              <el-icon><Filter /></el-icon>
              <span>筛选</span>
            </div>
            <div class="filter-group">
              <div class="filter-item filter-item--search">
                <el-input
                  v-model="filters.keyword"
                  placeholder="搜索物品或关键词"
                  clearable
                  class="filter-search-input"
                  @keyup.enter="handleFilterChange"
                  @clear="handleFilterChange"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="filter-item">
                <span class="filter-item-label">分类</span>
                <el-select
                  v-model="filters.categoryId"
                  placeholder="全部分类"
                  clearable
                  class="filter-select"
                  @change="handleFilterChange"
                >
                  <el-option
                    v-for="category in categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  >
                    <div class="category-option">
                      <img
                        v-if="category.icon"
                        :src="category.icon"
                        :alt="category.name"
                        class="category-icon"
                      >
                      <span class="category-name">{{ category.name }}</span>
                    </div>
                  </el-option>
                </el-select>
              </div>
              <div class="filter-item">
                <span class="filter-item-label">状态</span>
                <el-select
                  v-model="filters.status"
                  placeholder="全部状态"
                  clearable
                  class="filter-select filter-select--sm"
                  @change="handleFilterChange"
                >
                  <el-option label="全部" value="" />
                  <el-option label="待售" :value="1" />
                  <el-option label="已售出" :value="2" />
                  <el-option label="已下架" :value="3" />
                </el-select>
              </div>
              <el-button class="btn-reset" @click="resetFilters">
                <el-icon><RefreshRight /></el-icon>
                重置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-section">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 物品列表 -->
        <div v-else-if="items && items.length > 0" class="items-list">
          <div
            v-for="item in items"
            :key="item.id"
            class="item-card"
            @click="viewDetail(item)"
          >
            <!-- 物品图片 -->
            <div class="card-image-wrapper">
              <img
                v-if="item.images && item.images.length > 0"
                :src="itemImage(item)"
                :alt="item.title"
                class="card-image"
                loading="lazy"
                @error="handleImageError"
              >
              <!-- 占位图 -->
              <img
                v-else
                :src="'/placeholder.png'"
                :alt="item.title"
                class="card-image"
                loading="lazy"
              >

              <!-- 状态徽章 -->
              <div
                class="status-badge"
                :class="`status-${statusClass(item)}`"
              >
                {{ statusText(item) }}
              </div>

              <!-- 成色标签 -->
              <div
                v-if="item.conditionLevel"
                class="condition-tag"
                :data-condition="item.conditionLevel"
              >
                {{ conditionText(item) }}
              </div>

              <!-- 所有者头像 (左下角) -->
              <div
                v-if="item.owner"
                class="owner-avatar-wrapper"
              >
                <el-avatar
                  :size="32"
                  :src="item.owner.avatarUrl"
                  bg-color="transparent"
                >
                  {{ item.owner.username?.charAt(0) || 'U' }}
                </el-avatar>
              </div>
            </div>

            <!-- 物品信息 -->
            <div class="card-content">
              <!-- 标题 -->
              <h3 class="card-title line-clamp-2">
                {{ item.title }}
              </h3>

              <!-- 价格和计费方式 -->
              <div class="card-price-row">
                <div class="price-group">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ item.price }}</span>
                  <span class="price-unit">/{{ billingTypeText(item) }}</span>
                </div>
              </div>

              <!-- 位置信息 -->
              <div
                v-if="item.location"
                class="card-location"
              >
                <el-icon><Location /></el-icon>
                <span>{{ item.location }}</span>
              </div>

              <!-- 统计信息 -->
              <div class="card-stats">
                <div class="stat-item">
                  <el-icon><View /></el-icon>
                  <span>{{ formatCount(item.viewCount || item.stats?.viewCount || 0) }}</span>
                </div>
                <div class="stat-item">
                  <span>⭐</span>
                  <span>{{ formatCount(item.favoriteCount || item.stats?.favoriteCount || 0) }}</span>
                </div>
                <div
                  v-if="item.stats?.averageRating"
                  class="stat-item rating"
                >
                  <el-rate
                    :model-value="item.stats.averageRating"
                    disabled
                    show-score
                    :size="14"
                  />
                </div>
              </div>

              <!-- 所有者信息 -->
              <div
                v-if="item.owner"
                class="card-owner-info"
              >
                <el-avatar
                  :size="24"
                  :src="item.owner.avatarUrl"
                  bg-color="transparent"
                >
                  {{ item.owner.username?.charAt(0) || 'U' }}
                </el-avatar>
                <span class="owner-name">{{ item.owner.username }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-else
          description="暂无物品"
          :image-size="120"
        />

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[12, 24, 36]"
            layout="total, sizes, prev, pager, next"
            background
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Location, View, Filter, RefreshRight, Search } from '@element-plus/icons-vue'
import { useItemList } from '../composables/useItemList'
import { getCategoryList } from '@/shared/api/modules/item'

const router = useRouter()

// 使用组合式API
const {
  loading,
  items,
  total,
  currentPage,
  pageSize,
  filters,
  fetchItems,
  toggleFavorite,
  updateFilters,
  resetFilters,
  handlePageChange,
  handleSizeChange
} = useItemList()

// 分类数据
const categories = ref([])

/**
 * 获取分类列表
 */
const loadCategories = async () => {
  try {
    const response = await getCategoryList()
    categories.value = response || []
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

/**
 * 筛选条件变更
 */
const handleFilterChange = () => {
  fetchItems()
}

/**
 * 查看详情
 */
const viewDetail = (item: any) => {
  router.push(`/items/${item.id}`)
}

/**
 * 物品图片
 */
const itemImage = (item: any) => {
  if (item.images && item.images.length > 0) {
    return typeof item.images[0] === 'string'
      ? item.images[0]
      : item.images[0].url
  }
  return '/placeholder.png'
}

/**
 * 状态样式类
 */
const statusClass = (item: any) => {
  const statusMap = {
    1: 'for-sale',
    2: 'sold',
    3: 'offline'
  }
  return statusMap[item.status] || 'for-sale'
}

/**
 * 状态文本
 */
const statusText = (item: any) => {
  const textMap = {
    1: '待售',
    2: '已售出',
    3: '已下架'
  }
  return textMap[item.status] || '待售'
}

/**
 * 成色文本
 */
const conditionText = (item: any) => {
  const conditionMap = {
    'new': '全新',
    '95%': '95新',
    '90%': '九成新',
    '80%': '八成新',
    '70%': '七成新',
    'below60%': '六成以下'
  }
  return conditionMap[item.conditionLevel] || item.conditionLevel
}

/**
 * 计费方式文本
 */
const billingTypeText = (item: any) => {
  const typeMap = {
    'per_day': '天',
    'per_week': '周',
    'per_month': '月'
  }
  return typeMap[item.billingType] || '天'
}

/**
 * 格式化数量
 */
const formatCount = (count: number) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

/**
 * 图片加载错误处理
 */
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder.png'
}

// 初始化
onMounted(async () => {
  await loadCategories()
  await fetchItems()
})
</script>

<style scoped>
.items-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4ff 0%, #f5f7fa 24%);
}

.main-content {
  padding: 0 0 40px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.filters-bar {
  background: #fff;
  padding: 24px 32px;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.filters-inner {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  width: 100%;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.filter-label .el-icon {
  font-size: 16px;
  color: var(--el-color-primary);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item-label {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
}

.filter-select {
  width: 180px;
}

.filter-select--sm {
  width: 140px;
}

/* 分类选项样式 */
.category-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
}

.filter-item--search {
  flex: 1;
  min-width: 240px;
}

.filter-search-input {
  width: 100%;
}

.btn-reset {
  margin-left: 8px;
  flex-shrink: 0;
}

.btn-reset .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 加载状态 */
.loading-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 物品列表 */
.items-list {
  display: grid;
  /* 默认4列布局，最小4列 */
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

/* 当视口足够宽时（缩放较小时），显示5列，最大5列 */
@media (min-width: 1600px) {
  .items-list {
    grid-template-columns: repeat(5, 1fr);
  }
}

.item-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 图片区域 */
.card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 比例 */
  overflow: hidden;
  background: #f5f7fa;
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-card:hover .card-image {
  transform: scale(1.05);
}

/* 状态徽章 */
.status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  backdrop-filter: blur(4px);
}

.status-for-sale {
  background: rgba(103, 194, 58, 0.9);
}

.status-sold {
  background: rgba(230, 162, 60, 0.9);
}

.status-offline {
  background: rgba(144, 147, 153, 0.9);
}

/* 成色标签 */
.condition-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  color: white;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

/* 不同成色级别的背景颜色 */
.condition-tag[data-condition="new"] {
  background: rgba(64, 158, 255, 0.9); /* 蓝色 - 全新 */
}

.condition-tag[data-condition="95%"] {
  background: rgba(103, 194, 58, 0.9); /* 绿色 - 95新 */
}

.condition-tag[data-condition="90%"] {
  background: rgba(230, 162, 60, 0.9); /* 橙色 - 九成新 */
}

.condition-tag[data-condition="80%"] {
  background: rgba(245, 108, 108, 0.9); /* 红色 - 八成新 */
}

.condition-tag[data-condition="70%"] {
  background: rgba(144, 147, 153, 0.9); /* 灰色 - 七成新 */
}

.condition-tag[data-condition="below60%"] {
  background: rgba(92, 99, 115, 0.9); /* 深灰色 - 六成以下 */
}

/* 所有者头像 */
.owner-avatar-wrapper {
  position: absolute;
  bottom: 8px;
  left: 8px;
  border-radius: 50%;
}

/* 内容区域 */
.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 价格行 */
.card-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.price-group {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: 14px;
  color: #f56c6c;
  font-weight: 600;
}

.price-value {
  font-size: 20px;
  color: #f56c6c;
  font-weight: 600;
  font-family: 'Arial', sans-serif;
}

.price-unit {
  font-size: 12px;
  color: #909399;
}

/* 位置 */
.card-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.card-location .el-icon {
  font-size: 14px;
}

/* 统计信息 */
.card-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.stat-item .el-icon {
  font-size: 14px;
}

.stat-item.rating {
  margin-left: auto;
}

/* 所有者信息 */
.card-owner-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.owner-name {
  font-size: 12px;
  color: #606266;
}

/* 分页 */
.pagination-section {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filters-bar {
    padding: 14px 16px;
  }

  .filters-inner {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-group {
    gap: 12px;
  }

  .filter-item {
    flex-wrap: wrap;
  }

  .filter-select {
    width: 100%;
  }

  .filter-select--sm {
    width: 100%;
  }

  .items-list {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .card-image-wrapper {
    padding-top: 75%; /* 4:3 比例 */
  }

  .card-content {
    padding: 12px;
  }
}
</style>
