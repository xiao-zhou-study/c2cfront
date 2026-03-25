<template>
  <div
    class="item-card"
    @click="handleClick"
  >
    <!-- 图片区域 -->
    <div class="item-image-wrapper">
      <el-image
        :src="item.images?.[0] || defaultImage"
        fit="cover"
        class="item-image"
        lazy
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
            <span>暂无图片</span>
          </div>
        </template>
      </el-image>
      
      <!-- 状态标签 -->
      <div
        class="status-tag"
        :class="`status-${item.status}`"
      >
        {{ statusText }}
      </div>
      
      <!-- 收藏按钮 -->
      <div
        class="favorite-btn"
        @click.stop="toggleFavorite"
      >
        <el-icon :class="{ active: item.isFavorite }">
          <StarFilled v-if="item.isFavorite" />
          <Star v-else />
        </el-icon>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="item-content">
      <!-- 标题 -->
      <h3
        class="item-title"
        :title="item.title"
      >
        {{ item.title }}
      </h3>

      <!-- 描述 -->
      <p class="item-description">
        {{ truncatedDescription }}
      </p>

      <!-- 标签 -->
      <div class="item-tags">
        <el-tag
          v-if="item.conditionLevel"
          size="small"
          type="success"
        >
          {{ formatCondition(item.conditionLevel) }}
        </el-tag>
        <el-tag
          v-if="item.category"
          size="small"
          type="info"
        >
          {{ item.category.name }}
        </el-tag>
        <el-tag
          v-if="item.location"
          size="small"
        >
          <el-icon><Location /></el-icon>
          {{ item.location }}
        </el-tag>
      </div>

      <!-- 底部信息 -->
      <div class="item-footer">
        <div class="price-info">
          <span class="price">{{ priceText }}</span>
          <span
            v-if="item.billingType"
            class="billing-type"
          >
            /{{ billingTypeText }}
          </span>
        </div>
        
        <div class="item-stats">
          <span class="stat-item">
            <el-icon><View /></el-icon>
            {{ item.viewCount || 0 }}
          </span>
          <span class="stat-item">
            <el-icon><Star /></el-icon>
            {{ item.favoriteCount || 0 }}
          </span>
        </div>
      </div>

      <!-- 用户信息 -->
      <div
        v-if="item.owner"
        class="owner-info"
      >
        <el-avatar
          :size="24"
          :src="item.owner.avatarUrl"
        >
          {{ item.owner.username?.charAt(0) || '' }}
        </el-avatar>
        <span class="owner-name">{{ item.owner.username }}</span>
        <el-rate
          v-if="item.stats && item.stats.averageRating > 0"
          :model-value="item.stats.averageRating"
          disabled
          size="small"
          show-score
          text-color="#ff9900"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Picture, Star, StarFilled, Location, View } from '@element-plus/icons-vue'
import { ITEM_STATUS_TEXT, BILLING_TYPE_UNIT } from '@/shared/utils/constants'
import type { Item } from '@/shared/types/models'

interface Props {
  item: Item
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'click': [item: Item]
  'toggle-favorite': [item: Item]
}>()

// 默认图片
const defaultImage = 'https://via.placeholder.com/300x200?text=暂无图片'

// 状态文本
const statusText = computed(() => {
  return ITEM_STATUS_TEXT[props.item.status] || '未知'
})

// 价格文本
const priceText = computed(() => {
  if (props.item.price === 0) return '免费'
  return `¥${props.item.price.toFixed(2)}`
})

// 计费类型文本
const billingTypeText = computed(() => {
  return BILLING_TYPE_UNIT[props.item.billingType] || ''
})

// 截断描述
const truncatedDescription = computed(() => {
  const desc = props.item.description || ''
  if (desc.length <= 50) return desc
  return desc.substring(0, 50) + '...'
})

// 成色格式化
const formatCondition = (level: string | number) => {
  const key = String(level)
  const conditionMap = {
    'new': '全新',
    '95%': '几乎全新',
    '90%': '九成新',
    '80%': '八成新',
    '70%': '七成新',
    'below60%': '七成以下'
  }
  return conditionMap[key] || key
}

// 点击事件
const handleClick = () => {
  emit('click', props.item)
}

// 收藏切换
const toggleFavorite = () => {
  emit('toggle-favorite', props.item)
}
</script>

<style scoped>
.item-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 图片区域 */
.item-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 66.67%; /* 3:2 比例 */
  overflow: hidden;
  background: #f5f7fa;
}

.item-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.image-error .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

/* 状态标签 */
.status-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  backdrop-filter: blur(4px);
}

.status-tag.status-1 {
  background: rgba(103, 194, 58, 0.9);
}

.status-tag.status-2 {
  background: rgba(230, 162, 60, 0.9);
}

.status-tag.status-3 {
  background: rgba(144, 147, 153, 0.9);
}

/* 收藏按钮 */
.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.favorite-btn .el-icon {
  font-size: 18px;
  color: #909399;
  transition: color 0.3s ease;
}

.favorite-btn .el-icon.active {
  color: #f56c6c;
}

/* 内容区域 */
.item-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-description {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 标签 */
.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.item-tags .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 底部信息 */
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
}

.billing-type {
  font-size: 12px;
  color: #909399;
}

.item-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.stat-item .el-icon {
  font-size: 14px;
}

/* 用户信息 */
.owner-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.owner-name {
  font-size: 12px;
  color: #606266;
  flex: 1;
}

.owner-info .el-rate {
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .item-content {
    padding: 12px;
  }

  .item-title {
    font-size: 14px;
  }

  .price {
    font-size: 18px;
  }
}
</style>
