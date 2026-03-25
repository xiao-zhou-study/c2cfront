<template>
  <div
    v-if="totalItems > 0 && !loading"
    class="pagination-section"
  >
    <el-pagination
      v-model:current-page="localCurrentPage"
      v-model:page-size="localPageSize"
      :page-sizes="pageSizes"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalItems"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 12
  },
  totalItems: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
  pageSizes: {
    type: Array,
    default: () => [12, 24, 36]
  }
})

// Emits
const emit = defineEmits([
  'update:currentPage',
  'update:pageSize',
  'size-change',
  'current-change'
])

// 响应式数据
const localCurrentPage = ref(props.currentPage)
const localPageSize = ref(props.pageSize)

// 监听props变化
watch(() => props.currentPage, (newPage) => {
  localCurrentPage.value = newPage
})

watch(() => props.pageSize, (newSize) => {
  localPageSize.value = newSize
})

// 监听本地数据变化并同步到父组件
watch(localCurrentPage, (newPage) => {
  emit('update:currentPage', newPage)
})

watch(localPageSize, (newSize) => {
  emit('update:pageSize', newSize)
})

// 方法
const handleSizeChange = (size) => {
  emit('size-change', size)
}

const handleCurrentChange = (current) => {
  emit('current-change', current)
}
</script>

<style scoped>
.pagination-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pagination-section {
    padding: 15px 10px;
  }
  
  .pagination {
    font-size: 12px;
  }
}
</style>