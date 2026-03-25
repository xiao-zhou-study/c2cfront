<template>
  <div class="enhanced-sort-view-options">
    <div class="result-summary">
      <span class="result-text">找到</span>
      <span class="result-count">{{ totalCount }}</span>
      <span class="result-text">件物品</span>
    </div>

    <div class="options-group">
      <!-- 排序选项 -->
      <el-dropdown
        trigger="click"
        @command="handleSortChange"
      >
        <el-button class="sort-button">
          <el-icon><Sort /></el-icon>
          <span>{{ currentSortLabel }}</span>
          <el-icon class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item 
              v-for="option in sortOptions" 
              :key="option.value"
              :command="option.value"
              :class="{ 'is-active': sortBy === option.value }"
            >
              <el-icon>
                <component :is="option.icon" />
              </el-icon>
              <span>{{ option.label }}</span>
              <el-icon
                v-if="sortBy === option.value"
                class="check-icon"
              >
                <Check />
              </el-icon>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 视图切换 -->
      <div class="view-toggle">
        <el-tooltip
          content="网格视图"
          placement="top"
        >
          <el-button
            :type="viewMode === 'grid' ? 'primary' : ''"
            :icon="Grid"
            @click="handleViewChange('grid')"
          />
        </el-tooltip>
        <el-tooltip
          content="列表视图"
          placement="top"
        >
          <el-button
            :type="viewMode === 'list' ? 'primary' : ''"
            :icon="List"
            @click="handleViewChange('list')"
          />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Sort, 
  ArrowDown, 
  Grid, 
  List, 
  Clock,
  TrendCharts,
  PriceTag,
  Star,
  Check
} from '@element-plus/icons-vue'

// Props
interface Props {
  sortBy?: string
  viewMode?: 'grid' | 'list' | 'large'
  totalCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  sortBy: 'comprehensive',
  viewMode: 'grid',
  totalCount: 0
})

// Emits
const emit = defineEmits<{
  'update:sortBy': [value: string]
  'update:viewMode': [value: 'grid' | 'list' | 'large']
  'sort-change': []
  'view-change': []
}>()

// 排序选项配置
const sortOptions = [
  {
    label: '综合排序',
    value: 'comprehensive',
    icon: TrendCharts,
    description: '根据多个因素综合排序'
  },
  {
    label: '最新发布',
    value: 'newest',
    icon: Clock,
    description: '按发布时间从新到旧'
  },
  {
    label: '价格从低到高',
    value: 'price_asc',
    icon: PriceTag,
    description: '价格升序排列'
  },
  {
    label: '价格从高到低',
    value: 'price_desc',
    icon: PriceTag,
    description: '价格降序排列'
  },
  {
    label: '最受欢迎',
    value: 'popularity',
    icon: TrendCharts,
    description: '按浏览量和收藏数'
  },
  {
    label: '评分最高',
    value: 'rating',
    icon: Star,
    description: '按平均评分从高到低'
  }
]

// 计算属性
const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.value === props.sortBy)
  return option?.label || '综合排序'
})

// 方法
const handleSortChange = (command: string) => {
  emit('update:sortBy', command)
  emit('sort-change')
}

const handleViewChange = (mode: 'grid' | 'list' | 'large') => {
  emit('update:viewMode', mode)
  emit('view-change')
}
</script>

<style scoped>
.enhanced-sort-view-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 2px solid var(--border-color-light);
  margin-bottom: var(--spacing-lg);
}

/* 结果摘要 */
.result-summary {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  font-size: 14px;
}

.result-text {
  color: var(--text-secondary);
}

.result-count {
  font-size: 24px;
  font-weight: 700;
  color: var(--brand-primary);
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 选项组 */
.options-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* 排序按钮 */
.sort-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-md);
  height: 36px;
}

.dropdown-icon {
  margin-left: var(--spacing-xs);
  transition: transform 0.3s ease;
}

.sort-button:hover .dropdown-icon {
  transform: translateY(2px);
}

/* 下拉菜单项 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--brand-primary);
  background: var(--brand-primary-light);
}

.check-icon {
  margin-left: auto;
  color: var(--brand-primary);
}

/* 视图切换 */
.view-toggle {
  display: flex;
  gap: 0;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-toggle .el-button {
  border: none;
  border-radius: 0;
  border-right: 1px solid var(--border-color);
}

.view-toggle .el-button:last-child {
  border-right: none;
}

.view-toggle .el-button:hover {
  background: var(--bg-hover);
}

.view-toggle .el-button--primary {
  background: var(--brand-primary);
  color: #fff;
}

/* 响应式 */
@media (max-width: 768px) {
  .enhanced-sort-view-options {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .result-summary {
    justify-content: center;
  }

  .options-group {
    justify-content: space-between;
  }

  .sort-button {
    flex: 1;
  }
}
</style>
