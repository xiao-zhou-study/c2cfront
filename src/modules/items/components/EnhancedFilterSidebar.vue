<template>
  <div class="enhanced-filter-sidebar">
    <div class="filter-header">
      <h3 class="filter-title">
        筛选条件
      </h3>
      <div class="header-actions">
        <el-button
          text
          size="small"
          @click="handleCollapseAll"
        >
          收起
        </el-button>
        <el-button
          text
          size="small"
          @click="handleReset"
        >
          重置
        </el-button>
      </div>
    </div>

    <!-- 激活的筛选标签 -->
    <div
      v-if="activeFiltersCount > 0"
      class="active-filters"
    >
      <div class="active-filters-header">
        <span class="count-badge">{{ activeFiltersCount }}</span>
        <span>个筛选条件</span>
      </div>
      <div class="filter-tags">
        <el-tag
          v-if="localFilters.categoryId"
          closable
          @close="clearFilter('categoryId')"
        >
          分类: {{ getCategoryName(localFilters.categoryId) }}
        </el-tag>
        <el-tag
          v-if="localFilters.status !== null && localFilters.status !== undefined"
          closable
          @close="clearFilter('status')"
        >
          状态: {{ getStatusText(localFilters.status) }}
        </el-tag>
        <el-tag
          v-if="localFilters.condition"
          closable
          @close="clearFilter('condition')"
        >
          成色: {{ getConditionText(localFilters.condition) }}
        </el-tag>
        <el-tag
          v-if="localFilters.minPrice || localFilters.maxPrice"
          closable
          @close="clearFilter('price')"
        >
          价格: ¥{{ localFilters.minPrice || 0 }}-{{ localFilters.maxPrice || '不限' }}
        </el-tag>
        <el-tag
          v-if="localFilters.hasDeposit !== null && localFilters.hasDeposit !== undefined"
          closable
          @close="clearFilter('hasDeposit')"
        >
          {{ localFilters.hasDeposit ? '需要押金' : '无需押金' }}
        </el-tag>
      </div>
    </div>

    <!-- 筛选区块 -->
    <div class="filter-sections">
      <!-- 分类筛选 -->
      <div class="filter-section">
        <div
          class="section-title"
          @click="toggleSection('category')"
        >
          <span>分类</span>
          <el-icon :class="{ rotated: expandedSections.category }">
            <ArrowDown />
          </el-icon>
        </div>
        <transition name="el-fade-in">
          <div
            v-show="expandedSections.category"
            class="section-content"
          >
            <el-radio-group 
              v-model="localFilters.categoryId" 
              @change="handleCategoryChange"
            >
              <el-radio
                :label="null"
                class="filter-radio"
              >
                全部分类
              </el-radio>
              <el-radio
                v-for="category in categories"
                :key="category.id"
                :label="category.id"
                class="filter-radio"
              >
                {{ category.name }}
                <span class="item-count">({{ category.itemCount || 0 }})</span>
              </el-radio>
            </el-radio-group>
          </div>
        </transition>
      </div>

      <!-- 状态筛选 -->
      <div class="filter-section">
        <div
          class="section-title"
          @click="toggleSection('status')"
        >
          <span>物品状态</span>
          <el-icon :class="{ rotated: expandedSections.status }">
            <ArrowDown />
          </el-icon>
        </div>
        <transition name="el-fade-in">
          <div
            v-show="expandedSections.status"
            class="section-content"
          >
            <el-radio-group 
              v-model="localFilters.status" 
              @change="handleFilterChange"
            >
              <el-radio
                :label="null"
                class="filter-radio"
              >
                全部状态
              </el-radio>
              <el-radio
                :label="1"
                class="filter-radio"
              >
                <el-icon color="var(--success-color)">
                  <CircleCheckFilled />
                </el-icon>
                可借用
              </el-radio>
              <el-radio
                :label="2"
                class="filter-radio"
              >
                <el-icon color="var(--warning-color)">
                  <WarningFilled />
                </el-icon>
                已借出
              </el-radio>
              <el-radio
                :label="3"
                class="filter-radio"
              >
                <el-icon color="var(--info-color)">
                  <RemoveFilled />
                </el-icon>
                已下架
              </el-radio>
            </el-radio-group>
          </div>
        </transition>
      </div>

      <!-- 价格筛选 -->
      <div class="filter-section">
        <div
          class="section-title"
          @click="toggleSection('price')"
        >
          <span>价格范围</span>
          <el-icon :class="{ rotated: expandedSections.price }">
            <ArrowDown />
          </el-icon>
        </div>
        <transition name="el-fade-in">
          <div
            v-show="expandedSections.price"
            class="section-content"
          >
            <div class="price-display">
              <span class="price-label">¥{{ localFilters.minPrice || 0 }}</span>
              <span class="price-separator">-</span>
              <span class="price-label">¥{{ localFilters.maxPrice || 999 }}</span>
              <span class="price-unit">/天</span>
            </div>
            <el-slider
              v-model="priceRange"
              range
              :min="0"
              :max="999"
              :step="10"
              :show-tooltip="true"
              @change="handlePriceChange"
            />
            <div class="price-inputs">
              <el-input-number
                v-model="localFilters.minPrice"
                :min="0"
                :max="localFilters.maxPrice || 999"
                placeholder="最低"
                size="small"
                controls-position="right"
                @change="handleFilterChange"
              />
              <span>~</span>
              <el-input-number
                v-model="localFilters.maxPrice"
                :min="localFilters.minPrice || 0"
                :max="9999"
                placeholder="最高"
                size="small"
                controls-position="right"
                @change="handleFilterChange"
              />
            </div>
          </div>
        </transition>
      </div>

      <!-- 成色筛选 -->
      <div class="filter-section">
        <div
          class="section-title"
          @click="toggleSection('condition')"
        >
          <span>物品成色</span>
          <el-icon :class="{ rotated: expandedSections.condition }">
            <ArrowDown />
          </el-icon>
        </div>
        <transition name="el-fade-in">
          <div
            v-show="expandedSections.condition"
            class="section-content"
          >
            <el-radio-group 
              v-model="localFilters.condition" 
              @change="handleFilterChange"
            >
              <el-radio
                :label="null"
                class="filter-radio"
              >
                全部成色
              </el-radio>
              <el-radio
                label="全新"
                class="filter-radio"
              >
                <span class="condition-badge new">全新</span>
              </el-radio>
              <el-radio
                label="几乎全新"
                class="filter-radio"
              >
                <span class="condition-badge almost-new">几乎全新</span>
              </el-radio>
              <el-radio
                label="轻微使用痕迹"
                class="filter-radio"
              >
                <span class="condition-badge light">轻微使用痕迹</span>
              </el-radio>
              <el-radio
                label="明显使用痕迹"
                class="filter-radio"
              >
                <span class="condition-badge used">明显使用痕迹</span>
              </el-radio>
            </el-radio-group>
          </div>
        </transition>
      </div>

      <!-- 押金筛选 -->
      <div class="filter-section">
        <div
          class="section-title"
          @click="toggleSection('deposit')"
        >
          <span>押金要求</span>
          <el-icon :class="{ rotated: expandedSections.deposit }">
            <ArrowDown />
          </el-icon>
        </div>
        <transition name="el-fade-in">
          <div
            v-show="expandedSections.deposit"
            class="section-content"
          >
            <el-radio-group 
              v-model="localFilters.hasDeposit" 
              @change="handleFilterChange"
            >
              <el-radio
                :label="null"
                class="filter-radio"
              >
                全部
              </el-radio>
              <el-radio
                :label="false"
                class="filter-radio"
              >
                <el-icon color="var(--success-color)">
                  <SuccessFilled />
                </el-icon>
                无需押金
              </el-radio>
              <el-radio
                :label="true"
                class="filter-radio"
              >
                <el-icon color="var(--warning-color)">
                  <InfoFilled />
                </el-icon>
                需要押金
              </el-radio>
            </el-radio-group>
          </div>
        </transition>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { debounce } from '@/shared/utils/debounce'
import { 
  ArrowDown, 
  CircleCheckFilled, 
  WarningFilled, 
  RemoveFilled,
  SuccessFilled,
  InfoFilled
} from '@element-plus/icons-vue'
import type { Category } from '@/shared/types/models'

// Props
interface FilterOptions {
  categoryId?: number | null
  status?: number | null
  minPrice?: number | null
  maxPrice?: number | null
  condition?: string | null
  hasDeposit?: boolean | null
}

interface Props {
  categories?: Category[]
  filters?: FilterOptions
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  filters: () => ({})
})

// Emits
const emit = defineEmits<{
  'update:filters': [filters: FilterOptions]
  'filter-change': []
}>()

// 响应式数据
const localFilters = reactive<FilterOptions>({
  categoryId: props.filters.categoryId || null,
  status: props.filters.status || null,
  minPrice: props.filters.minPrice || null,
  maxPrice: props.filters.maxPrice || null,
  condition: props.filters.condition || null,
  hasDeposit: props.filters.hasDeposit || null
})

const expandedSections = reactive({
  category: true,
  status: true,
  price: false,
  condition: false,
  deposit: false
})

const priceRange = ref<[number, number]>([
  localFilters.minPrice || 0,
  localFilters.maxPrice || 999
])


// 计算属性
const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.categoryId) count++
  if (localFilters.status !== null && localFilters.status !== undefined) count++
  if (localFilters.condition) count++
  if (localFilters.minPrice || localFilters.maxPrice) count++
  if (localFilters.hasDeposit !== null && localFilters.hasDeposit !== undefined) count++
  return count
})

// 监听器
watch(() => props.filters, (newFilters) => {
  Object.assign(localFilters, newFilters)
  priceRange.value = [
    newFilters.minPrice || 0,
    newFilters.maxPrice || 999
  ]
}, { deep: true })

// 方法
const toggleSection = (section: keyof typeof expandedSections) => {
  expandedSections[section] = !expandedSections[section]
}

const handleFilterChange = () => {
  emit('update:filters', { ...localFilters })
  emit('filter-change')
}

const handleCategoryChange = debounce(() => {
  handleFilterChange()
}, 300)

const handlePriceChange = (value: [number, number]) => {
  localFilters.minPrice = value[0]
  localFilters.maxPrice = value[1]
  handleFilterChange()
}

const clearFilter = (filterType: string) => {
  switch (filterType) {
    case 'categoryId':
      localFilters.categoryId = null
      break
    case 'status':
      localFilters.status = null
      break
    case 'condition':
      localFilters.condition = null
      break
    case 'price':
      localFilters.minPrice = null
      localFilters.maxPrice = null
      priceRange.value = [0, 999]
      break
    case 'hasDeposit':
      localFilters.hasDeposit = null
      break
  }
  handleFilterChange()
}

const handleReset = () => {
  Object.assign(localFilters, {
    categoryId: null,
    status: null,
    minPrice: null,
    maxPrice: null,
    condition: null,
    hasDeposit: null
  })
  priceRange.value = [0, 999]
  handleFilterChange()
}

const handleCollapseAll = () => {
  Object.keys(expandedSections).forEach(key => {
    expandedSections[key as keyof typeof expandedSections] = false
  })
}

// 辅助方法
const getCategoryName = (id: string | number | null) => {
  if (id === null) return '未知分类'
  const category = props.categories.find(c => c.id === String(id))
  return category?.name || '未知分类'
}

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '可借用',
    2: '已借出',
    3: '已下架'
  }
  return statusMap[status] || '未知状态'
}

const getConditionText = (condition: string) => {
  return condition || '未知成色'
}
</script>

<style scoped>
.enhanced-filter-sidebar {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 头部 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-xl);
  background: #0da6fb;
  color: #fff;
  margin-bottom: var(--spacing-md);
}

.filter-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.header-actions .el-button {
  background: #f5f5f5;
  color: #000000;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.header-actions .el-button:hover {
  background: #e8e8e8;
  color: #000000;
}

/* 激活的筛选 */
.active-filters {
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-bottom: 1px solid var(--border-color-light);
}

.active-filters-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
  font-size: 13px;
  color: var(--text-secondary);
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--brand-primary);
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

/* 筛选区块 */
.filter-sections {
  max-height: 400px;
  overflow-y: auto;
}

.filter-section {
  border-bottom: 1px solid var(--border-color-light);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s ease;
  user-select: none;
}

.section-title:hover {
  background: var(--bg-hover);
}

.section-title .el-icon {
  transition: transform 0.3s ease;
}

.section-title .el-icon.rotated {
  transform: rotate(180deg);
}

.section-content {
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xl);
}

/* 单选组 */
.filter-radio {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
}

.item-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-placeholder);
}

/* 价格筛选 */
.price-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
}

.price-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand-primary);
}

.price-separator {
  color: var(--text-placeholder);
}

.price-unit {
  font-size: 12px;
  color: var(--text-secondary);
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.price-inputs .el-input-number {
  flex: 1;
}

/* 成色徽章 */
.condition-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.condition-badge.new {
  background: var(--success-color-light);
  color: var(--success-color);
}

.condition-badge.almost-new {
  background: #d4edda;
  color: #28a745;
}

.condition-badge.light {
  background: #fff3cd;
  color: #ffc107;
}

.condition-badge.used {
  background: #f8d7da;
  color: #dc3545;
}


/* 滚动条 */
.filter-sections::-webkit-scrollbar {
  width: 6px;
}

.filter-sections::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.filter-sections::-webkit-scrollbar-thumb:hover {
  background: var(--text-placeholder);
}
</style>
