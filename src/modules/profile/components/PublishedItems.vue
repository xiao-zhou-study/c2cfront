<template>
  <div class="published-items">
    <!-- 工具栏 -->
    <div class="toolbar-section">
      <div class="toolbar-left">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索物品名称"
            size="default"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
      <div class="toolbar-right">
        <el-select
          v-model="statusFilter"
          size="default"
          class="status-select"
          @change="filterPublishedItems"
        >
          <el-option
            label="全部状态"
            value="all"
          />
          <el-option
            label="上架中"
            :value="1"
          />
          <el-option
            label="已借出"
            :value="2"
          />
          <el-option
            label="已下架"
            :value="3"
          />
        </el-select>
        <el-button
          type="primary"
          class="publish-btn"
          @click="goToPublish"
        >
          <span class="publish-btn-icon">+</span>
          <span class="publish-btn-text">发布物品</span>
        </el-button>
        <el-button
          type="primary"
          :loading="refreshLoading"
          @click="refreshPublishedItems"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <div class="skeleton-grid">
        <div
          v-for="i in 4"
          :key="i"
          class="skeleton-card"
        >
          <el-skeleton
            :rows="3"
            animated
          />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="filteredItems.length === 0"
      class="empty-container"
    >
      <div class="empty-illustration">
        <el-icon class="empty-icon">
          <Box />
        </el-icon>
      </div>
      <h3 class="empty-title">
        暂无发布的物品
      </h3>
      <p class="empty-description">
        您还没有发布任何物品，快去发布吧！
      </p>
      <el-button
        type="primary"
        class="publish-btn"
        @click="goToPublish"
      >
        <span class="publish-btn-icon">+</span>
        <span class="publish-btn-text">发布物品</span>
      </el-button>
    </div>

    <!-- 物品列表 -->
    <div
      v-else
      class="items-grid"
    >
      <ItemManageCard
        v-for="(item, index) in filteredItems"
        :key="item.id"
        :item="item"
        :more-actions="moreActions"
        :style="{ animationDelay: `${index * 0.05}s` }"
        @click="viewItem(item.id)"
        @toggle="handleToggle"
        @edit="editItem"
        @more-action="handleMoreAction"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Search, Refresh, Box, CopyDocument, Delete } from '@element-plus/icons-vue'
import ItemManageCard from '@/shared/components/ItemManageCard.vue'

const props = defineProps({
  publishedItems: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'item-action'])

const router = useRouter()
const statusFilter = ref('all')
const searchKeyword = ref('')
const refreshLoading = ref(false)

// 更多操作列表
const moreActions = [
  { command: 'duplicate', label: '复制', icon: CopyDocument, divided: false },
  { command: 'delete', label: '删除', icon: Delete, divided: true }
]

const filteredItems = computed(() => {
  let items = props.publishedItems

  // 先按状态筛选（使用数字状态）
  if (statusFilter.value !== 'all') {
    items = items.filter(item => item.status === statusFilter.value)
  }

  // 再按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    items = items.filter(item =>
      item.title && item.title.toLowerCase().includes(keyword)
    )
  }

  return items
})

const filterPublishedItems = () => {
  // 触发计算属性重新计算
}

const refreshPublishedItems = async () => {
  try {
    refreshLoading.value = true
    emit('refresh')
    ElMessage.success('刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    refreshLoading.value = false
  }
}

const handleItemAction = async (command) => {
  const { action, item } = command

  try {
    switch (action) {
      case 'toggle':
        await ElMessageBox.confirm(
          `确认${item.status === 1 ? '下架' : '上架'}此物品吗？`,
          '确认操作',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        emit('item-action', { action: 'toggle', item })
        ElMessage.success('操作成功')
        break

      case 'duplicate':
        router.push({
          path: '/publish',
          query: { duplicate: item.id }
        })
        break

      case 'delete':
        // 仅向父组件派发删除意图，由 usePublishedItems.deleteItem 统一做一次确认并调用接口
        emit('item-action', { action: 'delete', item })
        break
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const viewItem = (id) => {
  router.push(`/items/${id}`)
}

const handleToggle = (item) => {
  handleItemAction({ action: 'toggle', item })
}

const editItem = (item) => {
  router.push(`/publish?edit=${item.id}`)
}

const goToPublish = () => {
  router.push('/publish')
}

const handleMoreAction = ({ command, item }) => {
  handleItemAction({ action: command, item })
}
</script>

<style scoped>
.published-items {
  padding: 24px;
}

/* 工具栏区域 */
.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.search-box {
  flex: 2;
  max-width: 480px;
}

:deep(.search-input) {
  border-radius: 8px;
}

:deep(.search-input .el-input__wrapper) {
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:deep(.search-input .el-input__wrapper:hover),
:deep(.search-input .el-input__wrapper.is-focus) {
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
  border-color: #409EFF;
}

.status-select {
  width: 120px;
  min-width: 120px;
}

:deep(.status-select .el-input__wrapper) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right .el-button {
  height: 40px;
}

.publish-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  border: none;
}

.publish-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 166, 136, 0.3);
}

.publish-btn-icon {
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
}

.publish-btn-text {
  line-height: 1;
}

/* 加载状态 */
.loading-container {
  padding: 40px 20px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.skeleton-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  border-radius: 12px;
}

.empty-illustration {
  margin-bottom: 24px;
}

.empty-icon {
  font-size: 80px;
  color: #d0d0d0;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.empty-description {
  font-size: 14px;
  color: #909399;
  margin: 0 0 24px;
  line-height: 1.6;
}

/* 物品网格：默认一行四个 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

/* 响应式：小屏时最多一行五个 */
@media (max-width: 1200px) {
  .items-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .published-items {
    padding: 16px;
  }

  .toolbar-section {
    flex-direction: column;
    gap: 16px;
  }

  .toolbar-left {
    width: 100%;
    flex-direction: column;
  }

  .search-box {
    max-width: 100%;
  }

  .status-select {
    width: 100%;
    min-width: auto;
  }

  .toolbar-right {
    width: 100%;
  }

  .toolbar-right .el-button {
    width: 100%;
  }

  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .empty-container {
    padding: 60px 20px;
  }

  .empty-icon {
    font-size: 60px;
  }
}
</style>
