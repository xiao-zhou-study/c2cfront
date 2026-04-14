<template>
  <div class="items-page">
    <div class="items-container">
      <!-- 顶部搜索栏 -->
      <el-card
        class="search-bar"
        shadow="hover"
      >
        <div class="search-row">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索你想要的物品..."
            clearable
            size="large"
            class="search-input"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon color="var(--brand-primary)">
                <Search />
              </el-icon>
            </template>
            <template #suffix>
              <el-button
                type="primary"
                size="default"
                @click="handleSearch"
              >
                搜索
              </el-button>
            </template>
          </el-input>
          <el-button
            type="info"
            plain
            circle
            @click="resetFilters"
          >
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </div>
      </el-card>

      <!-- 主内容区域 -->
      <div class="main-area">
        <!-- 左侧筛选面板 -->
        <el-card
          class="filter-panel"
          shadow="hover"
        >
          <el-collapse
            v-model="activeCollapse"
            class="filter-collapse"
          >
            <!-- 分类筛选 -->
            <el-collapse-item
              title="物品分类"
              name="category"
            >
              <template #title>
                <div class="collapse-title">
                  <el-icon><Grid /></el-icon>
                  <span>物品分类</span>
                </div>
              </template>
              <el-menu
                :default-active="filters.categoryId || 'all'"
                class="category-menu"
                @select="selectCategory"
              >
                <el-menu-item index="all">
                  <el-icon><Menu /></el-icon>
                  <span>全部分类</span>
                </el-menu-item>
                <el-menu-item
                  v-for="category in categories"
                  :key="category.id"
                  :index="String(category.id)"
                >
                  <el-avatar
                    v-if="category.icon"
                    :src="category.icon"
                    :size="20"
                    shape="square"
                  />
                  <span>{{ category.name }}</span>
                </el-menu-item>
              </el-menu>
            </el-collapse-item>

            <!-- 状态筛选 -->
            <el-collapse-item
              title="物品状态"
              name="status"
            >
              <template #title>
                <div class="collapse-title">
                  <el-icon><CircleCheck /></el-icon>
                  <span>物品状态</span>
                </div>
              </template>
              <el-menu
                :default-active="filters.status || 'all'"
                class="category-menu"
                @select="selectStatus"
              >
                <el-menu-item index="all">
                  <el-icon><Grid /></el-icon>
                  <span>全部状态</span>
                </el-menu-item>
                <el-menu-item index="1">
                  <el-icon><CircleCheck /></el-icon>
                  <span>待售中</span>
                </el-menu-item>
                <el-menu-item index="2">
                  <el-icon><SuccessFilled /></el-icon>
                  <span>已售出</span>
                </el-menu-item>
                <el-menu-item index="3">
                  <el-icon><CircleClose /></el-icon>
                  <span>已下架</span>
                </el-menu-item>
              </el-menu>
            </el-collapse-item>
          </el-collapse>
        </el-card>

        <!-- 右侧物品列表 -->
        <div class="items-area">
          <!-- 结果统计 -->
          <el-card
            class="result-bar"
            shadow="never"
          >
            <el-space>
              <el-icon color="var(--brand-primary)">
                <Goods />
              </el-icon>
              <span class="result-text">
                找到 <strong>{{ total }}</strong> 件物品
              </span>
            </el-space>
          </el-card>

          <!-- 加载骨架屏 -->
          <div
            v-if="loading"
            class="skeleton-grid"
          >
            <el-card
              v-for="i in 6"
              :key="i"
              shadow="hover"
              class="skeleton-card"
            >
              <el-skeleton
                :rows="4"
                animated
              />
            </el-card>
          </div>

          <!-- 物品卡片网格 -->
          <div
            v-else-if="items && items.length > 0"
            class="items-grid"
          >
            <el-card
              v-for="item in items"
              :key="item.id"
              shadow="hover"
              class="item-card"
              @click="viewDetail(item)"
            >
              <ProductCard
                :item="item"
                :show-owner="false"
                :show-stats="false"
                :show-rating="false"
                :show-favorite="false"
              />
            </el-card>
          </div>

          <!-- 空状态 -->
          <el-card
            v-else
            shadow="never"
            class="empty-card"
          >
            <el-empty
              description="暂无符合条件的物品"
              :image-size="180"
            >
              <template #description>
                <p class="empty-tip">
                  试试调整筛选条件，或者搜索其他关键词
                </p>
              </template>
              <el-button
                type="primary"
                round
                @click="resetFilters"
              >
                清空筛选条件
              </el-button>
            </el-empty>
          </el-card>

          <!-- 分页 -->
          <el-card
            v-if="total > 0 && !loading"
            shadow="never"
            class="pagination-card"
          >
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[12, 24, 48]"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Grid, CircleCheck, RefreshRight, Goods, Menu, SuccessFilled, CircleClose } from '@element-plus/icons-vue'
import { useItemList } from '../composables/useItemList'
import { getCategoryList } from '@/shared/api/modules/item'
import ProductCard from '@/shared/components/ProductCard.vue'

const router = useRouter()

const {
  loading,
  items,
  total,
  currentPage,
  pageSize,
  filters,
  fetchItems,
  resetFilters,
  handlePageChange,
  handleSizeChange
} = useItemList()

const categories = ref<any[]>([])
const activeCollapse = ref(['category', 'status'])

const loadCategories = async () => {
  try {
    const response = await getCategoryList()
    categories.value = response || []
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const selectCategory = (index: string) => {
  filters.value.categoryId = index === 'all' ? null : Number(index) as any
  handleSearch()
}

const selectStatus = (index: string) => {
  filters.value.status = index === 'all' ? null : Number(index) as any
  handleSearch()
}

const handleSearch = () => {
  fetchItems()
}

const viewDetail = (item: any) => {
  router.push(`/items/${item.id}`)
}

onMounted(async () => {
  await loadCategories()
  await fetchItems()
})
</script>

<style scoped>
.items-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f5ff 0%, #ffffff 100%);
}

.items-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* ==================== 顶部搜索栏 ==================== */

.search-bar {
  border-radius: 16px;
  border: none;
}

.search-bar :deep(.el-card__body) {
  padding: var(--spacing-md) var(--spacing-lg);
}

.search-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.search-input {
  flex: 1;
}

.search-input :deep(.el-input__wrapper) {
  padding: 8px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:focus-within) {
  border-color: var(--brand-primary);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
}

.search-input :deep(.el-input__prefix) {
  margin-right: 12px;
}

.search-input :deep(.el-input__suffix) {
  margin-left: 12px;
}

/* ==================== 主内容区域 ==================== */

.main-area {
  display: flex;
  gap: var(--spacing-lg);
}

/* ==================== 左侧筛选面板 ==================== */

.filter-panel {
  width: 260px;
  flex-shrink: 0;
  border-radius: 16px;
  border: none;
}

.filter-panel :deep(.el-card__body) {
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-collapse {
  border: none;
}

.filter-collapse :deep(.el-collapse-item__header) {
  background: transparent;
  border: none;
  padding: var(--spacing-sm);
  font-weight: 600;
}

.filter-collapse :deep(.el-collapse-item__wrap) {
  border: none;
}

.filter-collapse :deep(.el-collapse-item__content) {
  padding: var(--spacing-xs) var(--spacing-sm);
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-primary);
}

.collapse-title .el-icon {
  color: var(--brand-primary);
}

/* 分类菜单 */
.category-menu {
  border: none;
  background: transparent;
  max-height: 200px;
  overflow-y: auto;
}

.category-menu :deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.3s ease;
}

.category-menu :deep(.el-menu-item:hover) {
  background: var(--brand-primary-light);
}

.category-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, var(--brand-primary) 0%, #409eff 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.category-menu :deep(.el-menu-item .el-avatar) {
  margin-right: 8px;
}

/* ==================== 右侧物品列表 ==================== */

.items-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* 结果统计栏 */
.result-bar {
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
}

.result-bar :deep(.el-card__body) {
  padding: var(--spacing-sm) var(--spacing-md);
}

.result-text {
  color: var(--text-secondary);
}

.result-text strong {
  color: var(--brand-primary);
  font-size: 18px;
}

/* 骨架屏 */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.skeleton-card {
  border-radius: 12px;
}

/* 物品网格 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.item-card {
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.item-card :deep(.el-card__body) {
  padding: 0;
}

/* 空状态 */
.empty-card {
  border-radius: 16px;
  border: none;
  min-height: 400px;
}

.empty-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-tip {
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  margin: var(--spacing-xs) 0 var(--spacing-sm);
}

/* 分页 */
.pagination-card {
  border-radius: 12px;
  border: none;
}

.pagination-card :deep(.el-card__body) {
  padding: var(--spacing-md);
  display: flex;
  justify-content: center;
}

/* ==================== 响应式设计 ==================== */

@media (max-width: 1000px) {
  .main-area {
    flex-direction: column;
  }

  .filter-panel {
    width: 100%;
  }

  .filter-collapse {
    display: flex;
    gap: var(--spacing-md);
  }

  .filter-collapse :deep(.el-collapse-item) {
    flex: 1;
    min-width: 200px;
  }

  .filter-collapse :deep(.el-collapse-item__header) {
    display: none;
  }

  .filter-collapse :deep(.el-collapse-item__wrap) {
    border: none;
    height: auto !important;
  }

  .filter-collapse :deep(.el-collapse-item__content) {
    display: block !important;
    padding-bottom: 0 !important;
  }

  .category-menu {
    max-height: none;
  }

  .items-grid,
  .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .items-container {
    padding: var(--spacing-sm);
  }

  .search-bar :deep(.el-card__body) {
    padding: var(--spacing-sm);
  }

  .search-row {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .search-row :deep(.el-button) {
    width: 100%;
  }

  .filter-collapse {
    flex-direction: column;
  }

  .filter-collapse :deep(.el-collapse-item) {
    min-width: 100%;
  }

  .category-menu {
    flex-direction: row;
    flex-wrap: wrap;
    display: flex;
    gap: 4px;
  }

  .category-menu :deep(.el-menu-item) {
    width: auto;
    min-width: 80px;
    flex: 1;
    text-align: center;
  }

  .items-grid,
  .skeleton-grid {
    grid-template-columns: 1fr;
  }

  .pagination-card :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>