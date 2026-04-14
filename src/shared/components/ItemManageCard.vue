<template>
  <div
    class="item-manage-card-wrapper"
    @click="handleClick"
  >
    <el-card
      class="item-manage-card"
      shadow="hover"
    >
      <!-- 待售状态：卡片右上角三个点操作按钮 -->
      <div
        v-if="item.status === 1"
        class="corner-dropdown"
        @click.stop
        @mouseenter.stop
        @mouseover.stop
      >
        <el-dropdown
          trigger="hover"
          placement="bottom-end"
          @command="handleCommand"
        >
          <button class="more-btn">
            <el-icon><MoreFilled /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="toggle">
                <el-icon><Switch /></el-icon>
                下架
              </el-dropdown-item>
              <el-dropdown-item command="edit">
                <el-icon><Edit /></el-icon>
                编辑
              </el-dropdown-item>
              <el-dropdown-item
                v-for="action in filteredMoreActions"
                :key="action.command"
                :command="action.command"
                :divided="action.divided"
              >
                <el-icon v-if="action.icon">
                  <component :is="action.icon" />
                </el-icon>
                <span :class="{ 'danger-text': action.command === 'delete' }">
                  {{ action.label }}
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 图片区域 -->
      <div class="card-image-wrapper">
        <el-image
          :src="displayImage"
          :alt="item.title"
          fit="cover"
          class="card-image"
          lazy
        >
          <template #placeholder>
            <div class="image-placeholder">
              <el-icon
                :size="32"
                color="var(--text-placeholder)"
              >
                <Picture />
              </el-icon>
            </div>
          </template>
          <template #error>
            <div class="image-placeholder">
              <el-icon
                :size="32"
                color="var(--text-placeholder)"
              >
                <Picture />
              </el-icon>
            </div>
          </template>
        </el-image>

        <!-- 已售出/已下架状态：右上角显示状态徽章 -->
        <el-tag
          v-if="item.status !== 1"
          :type="statusTagType"
          size="small"
          effect="dark"
          class="status-tag"
        >
          {{ statusText }}
        </el-tag>

        <!-- 已下架状态：左上角显示上架按钮 -->
        <button
          v-if="item.status === 3"
          class="上架-btn"
          @click.stop="handle上架"
        >
          <el-icon><SwitchButton /></el-icon>
          上架
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="card-content">
        <!-- 标题 -->
        <div class="card-title">
          {{ item.title }}
        </div>

        <!-- 价格 -->
        <div class="card-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ formatPrice }}</span>
          <span class="price-unit">/{{ billingTypeText }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, MoreFilled, Edit, Switch, SwitchButton } from '@element-plus/icons-vue'
import { itemApi } from '../api'

interface ItemData {
  id: string | number
  title: string
  images?: string[] | { url: string }[]
  price: number
  billingType?: 'per_day' | 'per_week' | 'per_month'
  status?: 1 | 2 | 3
  viewCount?: number
  favoriteCount?: number
  owner?: {
    username?: string
    avatarUrl?: string
  }
  username?: string
  avatar?: string
}

interface ActionItem {
  command: string
  label: string
  icon?: any
  divided?: boolean
}

const props = withDefaults(defineProps<{
  item: ItemData
  moreActions?: ActionItem[]
}>(), {
  moreActions: () => []
})

const emit = defineEmits<{
  click: [item: ItemData]
  toggle: [item: ItemData]
  edit: [item: ItemData]
  'more-action': [{ command: string, item: ItemData }]
}>()

const router = useRouter()

// 过滤掉复制按钮
const filteredMoreActions = computed(() => {
  return props.moreActions.filter(action =>
    action.command !== 'copy' && !action.label?.includes('复制')
  )
})

// 显示图片
const displayImage = computed(() => {
  const images = props.item.images
  if (!images || images.length === 0) return ''
  const firstImage = images[0]
  return typeof firstImage === 'string' ? firstImage : firstImage.url
})

// 状态样式
const statusTagType = computed(() => {
  const typeMap: Record<number, 'warning' | 'info'> = {
    2: 'warning',
    3: 'info'
  }
  return typeMap[props.item.status || 2] || 'warning'
})

const statusText = computed(() => {
  const textMap: Record<number, string> = {
    2: '已售出',
    3: '已下架'
  }
  return textMap[props.item.status || 2] || '已售出'
})

// 计费方式
const billingTypeText = computed(() => {
  const typeMap: Record<string, string> = {
    'per_day': '天',
    'per_week': '周',
    'per_month': '月'
  }
  return typeMap[props.item.billingType || 'per_day'] || '天'
})

// 格式化价格
const formatPrice = computed(() => {
  const price = props.item.price
  return Number(price).toFixed(price % 1 === 0 ? 0 : 2)
})

// 点击卡片
const handleClick = () => {
  emit('click', props.item)
}

// 上架操作
const handle上架 = () => {
  emit('toggle', props.item)
}

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'toggle':
      emit('toggle', props.item)
      break
    case 'edit':
      try {
        const itemDetail = await itemApi.getItemDetail(String(props.item.id))
        router.push({
          path: '/publish',
          query: { edit: String(props.item.id) },
          state: { item: itemDetail as any }
        })
        ElMessage.success('正在加载编辑页面...')
      } catch (error) {
        console.error('获取物品详情失败:', error)
        ElMessage.error('加载编辑数据失败')
      }
      break
    default:
      emit('more-action', { command, item: props.item })
  }
}
</script>

<style scoped>
.item-manage-card-wrapper {
  position: relative;
  cursor: pointer;
}

.item-manage-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  overflow: hidden;
}

.item-manage-card-wrapper:hover .item-manage-card {
  transform: translateY(-4px);
}

.item-manage-card :deep(.el-card__body) {
  padding: 0;
}

/* 卡片右上角下拉菜单 */
.corner-dropdown {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
}

.more-btn {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.more-btn:hover {
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.more-btn .el-icon {
  font-size: 12px;
  color: var(--text-regular);
}

/* 图片区域 */
.card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.card-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 状态徽章 */
.status-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  border-radius: 6px;
  font-size: 12px;
}

/* 上架按钮（左上角） */
.上架-btn {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-hover) 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: white;
  transition: all 0.2s ease;
}

.上架-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.上架-btn .el-icon {
  font-size: 12px;
}

/* 内容区域 */
.card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 1px;
}

.price-symbol {
  font-size: 12px;
  color: var(--brand-primary);
  font-weight: 500;
}

.price-value {
  font-size: 18px;
  color: var(--brand-primary);
  font-weight: 600;
  font-family: var(--font-family-number);
}

.price-unit {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 删除文字红色 */
.danger-text {
  color: var(--color-danger);
}

/* 响应式 */
@media (max-width: 480px) {
  .card-content {
    padding: 8px;
    gap: 6px;
  }

  .card-title {
    font-size: 13px;
  }

  .price-value {
    font-size: 16px;
  }

  .more-btn {
    width: 18px;
    height: 18px;
  }

  .more-btn .el-icon {
    font-size: 10px;
  }
}
</style>