<template>
  <div class="search-results-page">
    <!-- 搜索结果头部 -->
    <div class="search-header">
      <div class="container">
        <div class="search-summary">
          <h1>搜索结果</h1>
          <p v-if="searchQuery" class="search-query">
            搜索关键词: <span class="query-text">"{{ searchQuery }}"</span>
          </p>
          <p v-if="total > 0" class="result-count">
            共找到 {{ total }} 个物品
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <div class="container">
        <!-- 简单筛选栏 -->
        <div class="filters-bar">
          <div class="filter-group">
            <el-select
              v-model="filters.categoryId"
              placeholder="选择分类"
              clearable
              style="width: 150px"
              @change="handleFilterChange"
            >
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>

            <el-select
              v-model="filters.status"
              placeholder="选择状态"
              clearable
              style="width: 120px"
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="可借用" :value="1" />
              <el-option label="已借出" :value="2" />
              <el-option label="已下架" :value="3" />
            </el-select>

            <el-button
              type="primary"
              @click="resetFilters"
            >
              重置
            </el-button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-section">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 搜索结果列表 -->
        <div v-else-if="items && items.length > 0" class="results-list">
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
          description="没有找到相关物品"
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Location, View } from '@element-plus/icons-vue'
import { searchItems, getCategoryList } from '@/shared/api/modules/item'

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const items = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const searchQuery = ref(route.query.q as string || '')

// 筛选条件
const filters = ref({
  categoryId: null,
  status: null,
  keyword: searchQuery.value
})

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
 * 获取搜索结果
 */
const fetchItems = async () => {
  try {
    loading.value = true

    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value,
      categoryId: filters.value.categoryId,
      status: filters.value.status
    }

    // 调用后端的 listByCategory 接口
    const response = await searchItems(params)
    items.value = response.list || response.data || []
    total.value = response.total || 0

  } catch (error) {
    console.error('获取搜索结果失败:', error)
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/**
 * 筛选条件变更
 */
const handleFilterChange = () => {
  currentPage.value = 1
  fetchItems()
}

/**
 * 重置筛选条件
 */
const resetFilters = () => {
  filters.value = {
    categoryId: null,
    status: null,
    keyword: searchQuery.value
  }
  currentPage.value = 1
  fetchItems()
}

/**
 * 查看详情
 */
const viewDetail = (item: any) => {
  router.push(`/items/${item.id}`)
}

/**
 * 图片加载错误处理
 */
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder.png'
}

/**
 * 分页变更
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchItems()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 分页大小变更
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchItems()
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
    1: 'available',
    2: 'borrowed',
    3: 'offline'
  }
  return statusMap[item.status] || 'available'
}

/**
 * 状态文本
 */
const statusText = (item: any) => {
  const textMap = {
    1: '可借用',
    2: '已借出',
    3: '已下架'
  }
  return textMap[item.status] || '可借用'
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

// 初始化
onMounted(async () => {
  await loadCategories()
  await fetchItems()
})
</script>

<style scoped>
.search-results-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 搜索结果头部 */
.search-header {
  background-color: #fff;
  padding: 24px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.search-summary h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.search-query {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #606266;
}

.query-text {
  color: #409eff;
  font-weight: 500;
}

.result-count {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

/* 主要内容区 */
.main-content {
  padding: 0 0 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 筛选栏 */
.filters-bar {
  background-color: #fff;
  padding: 16px 20px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* 加载状态 */
.loading-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 搜索结果列表 */
.results-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
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

.status-available {
  background: rgba(103, 194, 58, 0.9);
}

.status-borrowed {
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
  .search-header {
    padding: 16px 0;
  }

  .search-summary h1 {
    font-size: 20px;
  }

  .filters-bar {
    padding: 12px 16px;
  }

  .filter-group {
    gap: 12px;
  }

  .results-list {
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

