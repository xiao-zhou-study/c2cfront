<template>
  <div class="filter-card">
    <h3 class="filter-title">
      筛选选项
    </h3>
    <div class="filter-tabs">
      <el-tabs
        v-model="localActiveFilterTab"
        class="filter-tabs-container"
      >
        <el-tab-pane
          label="分类"
          name="category"
        >
          <div class="filter-options">
            <el-checkbox-group
              v-model="localSelectedCategories"
              @change="handleFilterChange"
            >
              <el-checkbox 
                v-for="category in categories" 
                :key="category.id" 
                :label="category.id"
                class="filter-checkbox"
              >
                {{ category.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-tab-pane>
        <el-tab-pane
          label="价格"
          name="price"
        >
          <div class="price-range">
            <div class="price-slider-container">
              <div class="price-markers">
                <span class="price-marker-left">¥{{ localPriceRange[0] }}</span>
                <span class="price-separator"> - </span>
                <span class="price-marker-right">¥{{ localPriceRange[1] }}</span>
              </div>
              <el-slider
                v-model="localPriceRange"
                range
                :min="0"
                :max="500"
                :step="10"
                class="price-slider"
                @change="handlePriceChange"
              />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane
          label="状态"
          name="status"
        >
          <div class="filter-options">
            <el-radio-group
              v-model="localSelectedStatus"
              class="status-options"
              @change="handleFilterChange"
            >
              <el-radio
                :label="null"
                class="status-radio"
              >
                全部状态
              </el-radio>
              <el-radio
                :label="ITEM_STATUS.AVAILABLE"
                class="status-radio"
              >
                可借用
              </el-radio>
              <el-radio
                :label="ITEM_STATUS.BORROWED"
                class="status-radio"
              >
                已借出
              </el-radio>
            </el-radio-group>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="filter-actions">
      <el-button
        type="primary"
        class="apply-btn"
        @click="applyFilters"
      >
        应用筛选
      </el-button>
      <el-button
        class="reset-btn"
        @click="resetFilters"
      >
        重置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ITEM_STATUS } from '@/shared/utils/constants'
import type { Category } from '@/shared/types/models'

// Props
interface Props {
  categories: Category[]
  selectedCategories?: number[]
  priceRange?: [number, number]
  selectedStatus?: number | null
  activeFilterTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategories: () => [],
  priceRange: () => [0, 500],
  selectedStatus: null,
  activeFilterTab: 'category'
})

// Emits
const emit = defineEmits<{
  'update:selectedCategories': [categories: number[]]
  'update:priceRange': [range: [number, number]]
  'update:selectedStatus': [status: number | null]
  'update:activeFilterTab': [tab: string]
  'filter-change': []
  'reset': []
}>()

// 响应式数据
const localPriceRange = ref<[number, number]>([...props.priceRange])
const localSelectedStatus = ref<number | null>(props.selectedStatus)
const localSelectedCategories = ref<number[]>([...props.selectedCategories])
const localActiveFilterTab = ref(props.activeFilterTab)

// 监听props变化
watch(() => props.priceRange, (newRange) => {
  localPriceRange.value = [...newRange]
})

watch(() => props.selectedStatus, (newStatus) => {
  localSelectedStatus.value = newStatus
})

watch(() => props.selectedCategories, (newCategories) => {
  localSelectedCategories.value = [...newCategories]
})

watch(() => props.activeFilterTab, (newTab) => {
  localActiveFilterTab.value = newTab
})

// 监听本地数据变化并同步到父组件
watch(localPriceRange, (newRange) => {
  emit('update:priceRange', newRange)
})

watch(localSelectedStatus, (newStatus) => {
  emit('update:selectedStatus', newStatus)
})

watch(localSelectedCategories, (newCategories) => {
  emit('update:selectedCategories', newCategories)
})

watch(localActiveFilterTab, (newTab) => {
  emit('update:activeFilterTab', newTab)
})

// 方法
const handleFilterChange = () => {
  emit('filter-change')
}

const handlePriceChange = () => {
  emit('filter-change')
}

const applyFilters = () => {
  emit('filter-change')
}

const resetFilters = () => {
  localPriceRange.value = [0, 500]
  localSelectedStatus.value = null
  emit('update:selectedCategories', [])
  emit('reset')
}
</script>

<style scoped>
.filter-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filter-title {
  margin: 0;
  padding: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.filter-tabs {
  padding: 20px;
}

.filter-tabs-container {
  width: 100%;
}

.filter-options {
  margin-top: 15px;
}

.filter-checkbox {
  margin-bottom: 12px;
  display: block;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-radio {
  display: block;
}

.price-range {
  margin-top: 15px;
}

.price-slider-container {
  padding: 0 10px;
}

.price-markers {
  text-align: center;
  margin-bottom: 15px;
  font-size: 14px;
  color: #606266;
}

.price-marker-left,
.price-marker-right {
  font-weight: 600;
  color: #409eff;
}

.price-separator {
  margin: 0 8px;
  color: #909399;
}

.price-slider {
  margin: 10px 0;
}

.filter-actions {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 10px;
}

.apply-btn {
  flex: 1;
}

.reset-btn {
  flex: 1;
}
</style>