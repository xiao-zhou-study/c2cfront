<template>
  <div class="sort-view-section">
    <div class="sort-options">
      <span class="sort-label">排序方式:</span>
      <el-select 
        v-model="localSortBy" 
        class="sort-select" 
        @change="handleSortChange"
      >
        <el-option
          label="最新发布"
          value="newest"
        />
        <el-option
          label="价格从低到高"
          value="price_asc"
        />
        <el-option
          label="价格从高到低"
          value="price_desc"
        />
        <el-option
          label="热度最高"
          value="popularity"
        />
      </el-select>
    </div>
    <div class="view-options">
      <div class="view-toggle">
        <span class="view-label">视图:</span>
        <el-switch
          v-model="localViewMode"
          active-value="grid"
          inactive-value="list"
          active-text="网格"
          inactive-text="列表"
          inline-prompt
          style="margin-left: 8px;"
          @change="handleViewModeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  sortBy: {
    type: String,
    default: 'newest'
  },
  viewMode: {
    type: String,
    default: 'grid'
  }
})

// Emits
const emit = defineEmits([
  'update:sortBy',
  'update:viewMode',
  'sort-change',
  'view-mode-change'
])

// 响应式数据
const localSortBy = ref(props.sortBy)
const localViewMode = ref(props.viewMode)

// 监听props变化
watch(() => props.sortBy, (newSortBy) => {
  localSortBy.value = newSortBy
})

watch(() => props.viewMode, (newViewMode) => {
  localViewMode.value = newViewMode
})

// 监听本地数据变化并同步到父组件
watch(localSortBy, (newSortBy) => {
  emit('update:sortBy', newSortBy)
})

watch(localViewMode, (newViewMode) => {
  emit('update:viewMode', newViewMode)
})

// 方法
const handleSortChange = () => {
  emit('sort-change')
}

const handleViewModeChange = () => {
  emit('view-mode-change')
}
</script>

<style scoped>
.sort-view-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.sort-select {
  width: 160px;
}

.view-options {
  display: flex;
  align-items: center;
}

.view-toggle {
  display: flex;
  align-items: center;
}

.view-label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .sort-view-section {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .sort-options {
    justify-content: space-between;
  }

  .view-options {
    justify-content: center;
  }
}
</style>