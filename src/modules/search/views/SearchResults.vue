<template>
  <div class="search-results-page">
    <!-- 搜索结果头部 -->
    <div class="search-header">
      <div class="container">
        <div class="search-summary">
          <h1>搜索结果</h1>
          <p
            v-if="searchQuery"
            class="search-query"
          >
            搜索关键词: <span class="query-text">"{{ searchQuery }}"</span>
          </p>
          <p
            v-if="total > 0"
            class="result-count"
          >
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
              <el-option
                label="全部"
                value=""
              />
              <el-option
                label="待售"
                :value="1"
              />
              <el-option
                label="已售出"
                :value="2"
              />
              <el-option
                label="已下架"
                :value="3"
              />
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
        <div
          v-if="loading"
          class="loading-section"
        >
          <el-skeleton
            :rows="6"
            animated
          />
        </div>

        <!-- 搜索结果列表 -->
        <div
          v-else-if="items && items.length > 0"
          class="results-grid"
        >
          <ProductCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            :show-owner="true"
            :show-stats="true"
            @click="viewDetail"
          />
        </div>

        <!-- 空状态 -->
        <el-empty
          v-else
          description="没有找到相关物品"
          :image-size="120"
        />

        <!-- 分页 -->
        <div
          v-if="total > 0"
          class="pagination-section"
        >
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
import { useRoute, useRouter } from 'vue-router'
import { searchItems, getCategoryList } from '@/shared/api/modules/item'
import ProductCard from '@/shared/components/ProductCard.vue'

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const items = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const searchQuery = ref(route.query.q as string || '')

// 筛选条件
const filters = ref({
  categoryId: null as number | null,
  status: null as number | null,
  keyword: searchQuery.value
})

// 分类数据
const categories = ref<any[]>([])

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
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value,
      categoryId: filters.value.categoryId,
      status: filters.value.status || undefined
    }

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

// 初始化
onMounted(async () => {
  await loadCategories()
  await fetchItems()
})
</script>

<style scoped>
.search-results-page {
  min-height: 100vh;
  background-color: var(--bg-base);
}

/* 搜索结果头部 */
.search-header {
  background-color: var(--bg-white);
  padding: var(--spacing-lg) 0;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--spacing-md);
}

.search-summary h1 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.search-query {
  margin: 0 0 4px 0;
  font-size: var(--font-size-base);
  color: var(--text-regular);
}

.query-text {
  color: var(--brand-primary);
  font-weight: var(--font-weight-medium);
}

.result-count {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

/* 主要内容区 */
.main-content {
  padding: 0 0 var(--spacing-2xl) 0;
}

.container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* 筛选栏 */
.filters-bar {
  background-color: var(--bg-white);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

/* 加载状态 */
.loading-section {
  background-color: var(--bg-white);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
}

/* 搜索结果网格 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

/* 分页 */
.pagination-section {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-header {
    padding: var(--spacing-md) 0;
  }

  .search-summary h1 {
    font-size: var(--font-size-medium);
  }

  .filters-bar {
    padding: var(--spacing-sm);
  }

  .filter-group {
    gap: var(--spacing-sm);
  }

  .results-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
}
</style>