<template>
  <div class="my-items-tab">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-radio-group
        v-model="statusFilter"
        @change="handleFilterChange"
      >
        <el-radio-button :label="null">
          全部
        </el-radio-button>
        <el-radio-button :label="1">
          <el-icon><CircleCheckFilled /></el-icon>
          可借用
        </el-radio-button>
        <el-radio-button :label="2">
          <el-icon><WarningFilled /></el-icon>
          已借出
        </el-radio-button>
        <el-radio-button :label="3">
          <el-icon><RemoveFilled /></el-icon>
          已下架
        </el-radio-button>
      </el-radio-group>

      <div class="toolbar-actions">
        <el-button
          :icon="Plus"
          type="primary"
          @click="handlePublish"
        >
          发布物品
        </el-button>
      </div>
    </div>

    <!-- 物品网格 -->
    <div
      v-loading="loading"
      class="items-grid"
    >
      <ItemManageCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        :more-actions="moreActions"
        :hide-toggle-action="true"
        :hide-edit-action="true"
        @click="handleView"
        @more-action="handleAction"
      />
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && filteredItems.length === 0"
      description="暂无物品"
      :image-size="200"
    >
      <el-button
        type="primary"
        :icon="Plus"
        @click="handlePublish"
      >
        发布第一个物品
      </el-button>
    </el-empty>

    <!-- 分页 -->
    <div
      v-if="total > pageSize"
      class="pagination"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  CircleCheckFilled, 
  WarningFilled, 
  RemoveFilled,
  Plus,
  Download,
  Upload,
  CopyDocument,
  Share,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Item } from '@/shared/types/models'
import ItemManageCard from '@/shared/components/ItemManageCard.vue'

interface Props {
  items: Item[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  loading: false
})

const emit = defineEmits<{
  'publish': []
  'view': [item: Item]
  'offline': [item: Item]
  'online': [item: Item]
  'copy': [item: Item]
  'share': [item: Item]
  'delete': [item: Item]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const statusFilter = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(12)

// 更多操作列表
const moreActions = [
  { command: 'online', label: '上架', icon: Upload, divided: false },
  { command: 'offline', label: '下架', icon: Download, divided: false },
  { command: 'copy', label: '复制', icon: CopyDocument, divided: false },
  { command: 'share', label: '分享', icon: Share, divided: false },
  { command: 'delete', label: '删除', icon: Delete, divided: true }
]

const filteredItems = computed(() => {
  let items = props.items
  if (statusFilter.value !== null) {
    items = items.filter(item => item.status === statusFilter.value)
  }
  return items
})

const total = computed(() => filteredItems.value.length)

const handleFilterChange = () => {
  currentPage.value = 1
}

const handlePublish = () => {
  emit('publish')
}

const handleView = (item: Item) => {
  emit('view', item)
}

const handleAction = async ({ command, item }: { command: string, item: Item }) => {
  switch (command) {
    case 'online':
      emit('online', item)
      ElMessage.success('物品已上架')
      break
    case 'offline':
      emit('offline', item)
      ElMessage.success('物品已下架')
      break
    case 'copy':
      emit('copy', item)
      ElMessage.success('已复制物品信息')
      break
    case 'share':
      emit('share', item)
      break
    case 'delete':
      emit('delete', item)
      ElMessage.success('删除成功')
      break
  }
}

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}
</script>

<style scoped>
.my-items-tab {
  padding: var(--spacing-lg);
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

.toolbar-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* 物品网格 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  min-height: 400px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

/* 响应式 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-sm);
  }
}
</style>
