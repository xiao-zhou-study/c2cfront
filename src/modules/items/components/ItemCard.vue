<template>
  <div 
    class="item-card"
    @click="handleCardClick"
  >
    <div class="item-image">
      <img
        :src="getItemImage(item)"
        :alt="item.title"
        class="item-img"
      >
      <div
        class="item-tag"
        :class="{'borrowed': item.status !== 1}"
      >
        {{ item.status === 1 ? '可借用' : '已借出' }}
      </div>
      <div
        class="item-badge"
        :class="{'free-badge': item.price === 0}"
      >
        {{ item.price === 0 ? '免费' : '¥' + item.price + '/' + getBillingText(item.billingType) }}
      </div>
      <div class="item-actions">
        <el-button 
          circle 
          size="small" 
          :type="item.isFavorite ? 'danger' : 'default'"
          class="favorite-btn"
          @click.stop="handleToggleFavorite"
        >
          {{ item.isFavorite ? '★' : '☆' }}
        </el-button>
      </div>
    </div>
    <div class="item-info">
      <div class="item-info-content">
        <div class="item-category">
          {{ item.category?.name || '未分类' }}
        </div>
        <h3 class="item-title">
          {{ item.title }}
        </h3>
        <p class="item-description">
          {{ formatDescription(item.description) }}
        </p>
        <div class="item-meta">
          <div
            v-if="item.stats && item.stats.averageRating > 0"
            class="item-rating"
          >
            <el-rate 
              :model-value="item.stats.averageRating" 
              disabled 
              show-score 
              text-color="#ff9900"
              score-template="{value}"
              :size="14"
            />
          </div>
          <div class="item-location">
            <span>{{ item.location }}</span>
          </div>
        </div>
      </div>
      <div class="item-footer">
        <div class="item-time">
          <span>{{ formatTimeAgo(item.createdAt) }}</span>
        </div>
        <div
          v-if="item.owner"
          class="item-user"
        >
          <el-avatar
            :size="28"
            :src="item.owner.avatarUrl"
          >
            {{ item.owner.username?.charAt(0) || '' }}
          </el-avatar>
          <span class="user-name">{{ item.owner.username }}</span>
        </div>
        <el-button 
          type="primary" 
          size="small"
          class="view-detail-btn"
          @click.stop="handleViewDetail"
        >
          查看详情
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatTimeAgo } from '@/shared/utils/format'
import { BILLING_TYPE_TEXT } from '@/shared/utils/constants'
import type { Item } from '@/shared/types/models'

const router = useRouter()

// Props
interface Props {
  item: Item
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'view-detail': [id: string]
  'toggle-favorite': [id: string]
}>()

// 方法
const handleCardClick = () => {
  emit('view-detail', props.item.id)
}

const handleViewDetail = () => {
  emit('view-detail', props.item.id)
}

const handleToggleFavorite = () => {
  emit('toggle-favorite', props.item.id)
}

// 获取物品图片
const getItemImage = (item: Item) => {
  return item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://via.placeholder.com/400x300'
}

// 获取计费类型文本
const getBillingText = (billingType: string) => {
  return BILLING_TYPE_TEXT[billingType] || '天'
}

// 格式化描述
const formatDescription = (description?: string) => {
  if (!description) return '暂无描述'
  return description.length > 80 ? description.substring(0, 80) + '...' : description
}
</script>

<style scoped>
.item-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.item-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-card:hover .item-img {
  transform: scale(1.05);
}

.item-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  background-color: #67c23a;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.item-tag.borrowed {
  background-color: #f56c6c;
}

.item-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  background-color: #409eff;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.item-badge.free-badge {
  background-color: #e6a23c;
}

.item-actions {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.favorite-btn {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  backdrop-filter: blur(10px);
}

.favorite-btn:hover {
  background-color: rgba(255, 255, 255, 1);
}

.item-info {
  padding: 16px;
}

.item-info-content {
  margin-bottom: 12px;
}

.item-category {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.item-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-rating {
  flex: 1;
}

.item-location {
  font-size: 12px;
  color: #909399;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f7fa;
}

.item-time {
  font-size: 12px;
  color: #909399;
}

.item-user {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  margin: 0 12px;
}

.user-name {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-detail-btn {
  padding: 6px 12px;
  font-size: 12px;
}
</style>