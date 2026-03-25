<template>
  <div 
    class="unified-item-card" 
    :class="{ 'list-view': viewMode === 'list', 'large-view': viewMode === 'large' }"
    @click="handleClick"
  >
    <!-- 物品图片 -->
    <div class="card-image-wrapper">
      <img
        v-if="item.images && item.images.length > 0"
        :src="itemImage"
        :alt="item.title"
        class="card-image"
        loading="lazy"
      >
      <!-- 占位图 -->
      <img
        v-else
        :src="itemImage"
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
      
      <!-- 成色标签 -->
      <div
        v-if="item.conditionLevel !== undefined && item.conditionLevel !== null"
        class="condition-tag"
        :data-condition="conditionLevelKey"
      >
        {{ conditionText }}
      </div>
      
      <!-- 所有者头像 (左下角) -->
      <div
        v-if="item.owner"
        class="owner-avatar-wrapper"
      >
        <el-avatar
          :size="32"
          :src="item.owner.avatarUrl"
          bg-color="transparent"
        >
          {{ item.owner.username?.charAt(0) || 'U' }}
        </el-avatar>
      </div>
    </div>
    
    <!-- 物品信息 -->
    <div class="card-content">
      <!-- 标题 -->
      <h3 class="card-title line-clamp-2">
        {{ item.title }}
      </h3>
      
      <!-- 价格和计费方式 -->
      <div class="card-price-row">
        <div class="price-group">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ item.price }}</span>
          <span class="price-unit">/{{ billingTypeText }}</span>
        </div>
      </div>
      
      <!-- 位置信息 -->
      <div
        v-if="item.location"
        class="card-location"
      >
        <el-icon><Location /></el-icon>
        <span>{{ item.location }}</span>
      </div>
      
      <!-- 统计信息 -->
      <div class="card-stats">
        <div class="stat-item">
          <el-icon><View /></el-icon>
          <span>{{ formatCount(item.viewCount || item.stats?.viewCount || 0) }}</span>
        </div>
        <div class="stat-item">
          <span>⭐</span>
          <span>{{ formatCount(item.favoriteCount || item.stats?.favoriteCount || 0) }}</span>
        </div>
        <div
          v-if="item.stats?.averageRating"
          class="stat-item rating"
        >
          <el-rate 
            :model-value="item.stats.averageRating" 
            disabled 
            show-score
            :size="14"
          />
        </div>
      </div>
      
      <!-- 所有者信息 (列表视图时显示) -->
      <div
        v-if="viewMode === 'list' && item.owner"
        class="card-owner-info"
      >
        <el-avatar
          :size="24"
          :src="item.owner.avatarUrl"
          bg-color="transparent"
        >
          {{ item.owner.username?.charAt(0) || 'U' }}
        </el-avatar>
        <span class="owner-name">{{ item.owner.username }}</span>
        <CreditBadge
          v-if="item.owner.creditScore"
          :score="item.owner.creditScore"
          mode="compact"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Location, View } from '@element-plus/icons-vue'
import CreditBadge from './CreditBadge.vue'

const props = defineProps({
  /**
   * 物品数据
   */
  item: {
    type: Object,
    required: true
  },
  /**
   * 视图模式: 'grid' | 'list' | 'large'
   */
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list', 'large'].includes(value)
  }
})

const emit = defineEmits(['click'])

// 物品图片
const itemImage = computed(() => {
  if (props.item.images && props.item.images.length > 0) {
    return typeof props.item.images[0] === 'string' 
      ? props.item.images[0] 
      : props.item.images[0].url
  }
  return 'https://via.placeholder.com/300x300?text=No+Image'
})

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

// 成色文本（与后端枚举保持一致）
// BRAND_NEW(0, "全新"), ALMOST_NEW(1, "九成新"), GENTLY_USED(2, "八成新")
const conditionText = computed(() => {
  const level = props.item.conditionLevel

  if (level === 0 || level === 'BRAND_NEW') {
    return '全新'
  }
  if (level === 1 || level === 'ALMOST_NEW') {
    return '九成新'
  }
  if (level === 2 || level === 'GENTLY_USED') {
    return '八成新'
  }

  return ''
})

// 成色级别 key，用于 data-condition 做不同背景色
const conditionLevelKey = computed(() => {
  const level = props.item.conditionLevel
  if (level === 0 || level === 'BRAND_NEW') return 'brand-new'
  if (level === 1 || level === 'ALMOST_NEW') return 'almost-new'
  if (level === 2 || level === 'GENTLY_USED') return 'gently-used'
  return ''
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

// 格式化数量
const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count
}

// 点击卡片
const handleClick = () => {
  emit('click', props.item)
}
</script>

<style scoped>
.unified-item-card {
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

.unified-item-card:hover {
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

.unified-item-card:hover .card-image {
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

/* 成色标签 */
.condition-tag {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-extra-small);
  color: white;
  font-weight: var(--font-weight-medium);
  backdrop-filter: blur(4px);
}

/* 不同成色级别的背景颜色 */
/* BRAND_NEW(0) 全新、ALMOST_NEW(1) 九成新、GENTLY_USED(2) 八成新 */
.condition-tag[data-condition="brand-new"] {
  background: rgba(64, 158, 255, 0.9); /* 蓝色 - 全新 */
}

.condition-tag[data-condition="almost-new"] {
  background: rgba(103, 194, 58, 0.9); /* 绿色 - 九成新 */
}

.condition-tag[data-condition="gently-used"] {
  background: rgba(230, 162, 60, 0.9); /* 橙色 - 八成新 */
}

/* 所有者头像 */
.owner-avatar-wrapper {
  position: absolute;
  bottom: var(--spacing-sm);
  left: var(--spacing-sm);
  border-radius: 50%;
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

.negotiable-tag {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-extra-small);
  background: var(--color-warning-light);
  color: white;
}

/* 位置 */
.card-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-extra-small);
  color: var(--text-secondary);
}

.card-location .el-icon {
  font-size: 14px;
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

.stat-item.rating {
  margin-left: auto;
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
}

/* 快捷操作 */
.card-actions {
  position: absolute;
  top: 50%;
  right: var(--spacing-md);
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-base);
}

/* 列表视图样式 */
.unified-item-card.list-view {
  flex-direction: row;
}

.unified-item-card.list-view .card-image-wrapper {
  width: 200px;
  padding-top: 0;
  height: 200px;
  flex-shrink: 0;
}

.unified-item-card.list-view .card-image {
  position: static;
}

.unified-item-card.list-view .card-content {
  flex: 1;
}

.unified-item-card.list-view .card-title {
  font-size: var(--font-size-medium);
}

/* 大图视图样式 */
.unified-item-card.large-view .card-image-wrapper {
  padding-top: 75%; /* 4:3 比例 */
}

.unified-item-card.large-view .card-title {
  font-size: var(--font-size-small);
}

/* 响应式 */
@media (max-width: 768px) {
  .unified-item-card.list-view {
    flex-direction: column;
  }
  
  .unified-item-card.list-view .card-image-wrapper {
    width: 100%;
    padding-top: 100%;
    height: auto;
  }
  
  .card-actions {
    opacity: 1;
    visibility: visible;
  }
}
</style>
