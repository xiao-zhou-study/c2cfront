<template>
  <div 
    class="item-manage-card" 
    @click="handleClick"
  >
    <!-- 物品图片 -->
    <div class="card-image-wrapper">
      <img
        v-if="item.images && item.images.length > 0"
        :src="item.images[0]"
        :alt="item.title"
        class="card-image"
        loading="lazy"
      >
      <!-- 占位图 -->
      <img
        v-else
        :src="'https://via.placeholder.com/400x400?text=暂无图片'"
        :alt="item.title"
        class="card-image"
        loading="lazy"
      >
      
      <!-- 状态徽章 -->
      <div
        class="status-badge"
        :class="`status-${statusClass}`"
      >
        {{ statusText }}
      </div>
    </div>
    
    <!-- 物品信息 -->
    <div class="card-content">
      <!-- 标题 -->
      <h3 class="card-title">
        {{ item.title }}
      </h3>
      
      <!-- 价格行 -->
      <div class="card-price-row">
        <div class="price-group">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ item.price }}</span>
          <span class="price-unit">/{{ billingTypeText }}</span>
        </div>
      </div>
      
      <!-- 统计信息 -->
      <div class="card-stats">
        <div class="stat-item">
          <el-icon><View /></el-icon>
          <span>{{ item.viewCount || 0 }}</span>
        </div>
        <div class="stat-item">
          <span>⭐</span>
          <span>{{ item.favoriteCount || 0 }}</span>
        </div>
      </div>
      
      <!-- 所有者信息 -->
      <div
        v-if="ownerName"
        class="card-owner-info"
      >
        <el-avatar
          :size="24"
          :src="ownerAvatar"
        >
          {{ ownerName?.charAt(0) || 'U' }}
        </el-avatar>
        <span class="owner-name">{{ ownerName }}</span>
      </div>
      
      <!-- 操作按钮 -->
      <div class="card-actions">
        <!-- 上架/下架按钮 -->
        <el-button
          v-if="!hideToggleAction"
          size="small"
          :type="item.status === 1 ? 'primary' : 'success'"
          @click.stop="handleToggle"
        >
          <el-icon>
            <Switch v-if="item.status === 1" />
            <SwitchButton v-else />
          </el-icon>
          {{ item.status === 1 ? '下架' : '上架' }}
        </el-button>

        <!-- 编辑按钮 -->
        <el-button
          v-if="!hideEditAction"
          size="small"
          @click.stop="handleEdit"
        >
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>

        <!-- 更多操作按钮 -->
        <el-button
          v-for="action in filteredMoreActions"
          v-show="!hideMoreAction"
          :key="action.command"
          size="small"
          :type="getActionButtonType(action)"
          @click.stop="handleMoreAction(action.command)"
        >
          <el-icon v-if="action.icon">
            <component :is="action.icon" />
          </el-icon>
          {{ action.label }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, Edit, MoreFilled, Switch, SwitchButton } from '@element-plus/icons-vue'
import { itemApi } from '../api'

const router = useRouter()

const props = defineProps({
  /**
   * 物品数据
   */
  item: {
    type: Object,
    required: true
  },
  /**
   * 更多操作列表
   */
  moreActions: {
    type: Array,
    default: () => []
  },
  /**
   * 是否隐藏上/下架按钮
   */
  hideToggleAction: {
    type: Boolean,
    default: false
  },
  /**
   * 是否隐藏编辑按钮
   */
  hideEditAction: {
    type: Boolean,
    default: false
  },
  /**
   * 是否隐藏更多操作
   */
  hideMoreAction: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'toggle', 'edit', 'more-action'])

// 过滤掉复制按钮
const filteredMoreActions = computed(() => {
  return props.moreActions.filter(action =>
    action.command !== 'copy' && !action.label?.includes('复制')
  )
})

// 获取按钮类型
const getActionButtonType = (action) => {
  if (action.command === 'delete' || action.label?.includes('删除')) {
    return 'danger'
  }
  return action.type || 'default'
}

// 状态文本和样式
const statusClass = computed(() => {
  const statusMap = {
    1: 'available',
    2: 'borrowed',
    3: 'offline'
  }
  return statusMap[props.item.status] || 'available'
})

const statusText = computed(() => {
  const textMap = {
    1: '可借用',
    2: '已借出',
    3: '已下架'
  }
  return textMap[props.item.status] || '可借用'
})

// 计费方式文本
const billingTypeText = computed(() => {
  const typeMap = {
    'per_day': '天',
    'per_week': '周',
    'per_month': '月'
  }
  return typeMap[props.item.billingType] || '天'
})

// 兼容两种数据结构：item.owner 或顶层 username/avatar
const ownerName = computed(() => {
  return props.item.owner?.username || props.item.username
})

const ownerAvatar = computed(() => {
  return props.item.owner?.avatarUrl || props.item.avatar
})

// 点击卡片
const handleClick = () => {
  emit('click', props.item)
}

// 上架/下架
const handleToggle = () => {
  emit('toggle', props.item)
}

// 编辑
const handleEdit = async () => {
  try {
    // 调用后端API获取完整的物品详情
    // 注意：响应拦截器已经解包了res.data，所以itemDetail就是物品数据对象
    const itemDetail = await itemApi.getItemDetail(props.item.id)
    
    console.log('获取到的物品详情数据:', itemDetail)

    // 跳转到发布页面，传递编辑模式和完整的物品数据
    router.push({
      path: '/publish',
      query: {
        edit: props.item.id
      },
      state: {
        item: itemDetail  // 直接使用itemDetail，因为响应拦截器已经解包
      }
    })

    ElMessage.success('正在加载编辑页面...')
  } catch (error) {
    console.error('获取物品详情失败:', error)
    ElMessage.error('加载编辑数据失败，请稍后重试')
  }
}

// 更多操作
const handleMoreAction = (command) => {
  emit('more-action', { command, item: props.item })
}
</script>

<style scoped>
.item-manage-card {
  position: relative;
  background: var(--bg-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-base);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-manage-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

/* 图片区域 */
.card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 比例 */
  overflow: hidden;
  background: var(--bg-base);
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.item-manage-card:hover .card-image {
  transform: scale(1.05);
}

/* 状态徽章 */
.status-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-extra-small);
  font-weight: var(--font-weight-medium);
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

/* 内容区域 */
.card-content {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex: 1;
}

.card-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: var(--line-height-base);
}

/* 价格行 */
.card-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.price-group {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: var(--font-size-small);
  color: var(--brand-primary);
  font-weight: var(--font-weight-bold);
}

.price-value {
  font-size: 20px;
  color: var(--brand-primary);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-number);
}

.price-unit {
  font-size: var(--font-size-extra-small);
  color: var(--text-secondary);
}

/* 统计信息 */
.card-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--border-extra-light);
  margin-top: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-extra-small);
  color: var(--text-secondary);
}

.stat-item .el-icon {
  font-size: 14px;
}

/* 所有者信息 */
.card-owner-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-extra-light);
}

.owner-name {
  font-size: var(--font-size-extra-small);
  color: var(--text-regular);
  flex: 1;
}

/* 操作按钮区域 */
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-extra-light);
}

.card-actions :deep(.el-button) {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-extra-small);
}

/* 当按钮太多时，让它们能够换行 */
@media (max-width: 480px) {
  .card-actions {
    gap: var(--spacing-xs);
  }

  .card-actions :deep(.el-button) {
    min-width: 80px;
    flex: none;
  }
}
</style>
