<template>
  <div
    class="product-card"
    :class="[
      `product-card--${viewMode}`,
      { 'product-card--clickable': clickable }
    ]"
    @click="handleClick"
  >
    <!-- 图片区域 -->
    <div
      class="product-card__image-wrapper"
      :style="imageWrapperStyle"
    >
      <!-- 图片 -->
      <img
        v-if="displayImage"
        :src="displayImage"
        :alt="item.title"
        class="product-card__image"
        loading="lazy"
        @error="handleImageError"
      >
      <!-- 占位图 -->
      <div
        v-else
        class="product-card__placeholder"
      >
        <el-icon :size="48">
          <Picture />
        </el-icon>
      </div>

      <!-- 状态徽章 -->
      <div
        class="product-card__status"
        :class="`product-card__status--${statusClass}`"
      >
        {{ statusText }}
      </div>

      <!-- 收藏按钮 -->
      <button
        v-if="showFavorite"
        class="product-card__favorite"
        :class="{ 'product-card__favorite--active': isFavorited }"
        @click.stop="handleFavorite"
      >
        <el-icon :size="18">
          <StarFilled v-if="isFavorited" />
          <Star v-else />
        </el-icon>
      </button>
    </div>

    <!-- 信息区域 -->
    <div class="product-card__content">
      <!-- 标题 -->
      <h3 class="product-card__title line-clamp-2">
        {{ item.title }}
      </h3>

      <!-- 价格 -->
      <div class="product-card__price-row">
        <div class="product-card__price">
          <span class="product-card__price-symbol">¥</span>
          <span class="product-card__price-value">{{ formatPrice(item.price) }}</span>
          <span class="product-card__price-unit">{{ billingUnit }}</span>
        </div>
        <div
          v-if="item.deposit"
          class="product-card__deposit"
        >
          押金 ¥{{ formatPrice(item.deposit) }}
        </div>
      </div>

      <!-- 位置 -->
      <div
        v-if="item.location && showLocation"
        class="product-card__location"
      >
        <el-icon :size="14">
          <Location />
        </el-icon>
        <span>{{ item.location }}</span>
      </div>

      <!-- 所有者信息 -->
      <div
        v-if="showOwner && ownerInfo"
        class="product-card__owner"
      >
        <el-avatar
          :size="20"
          :src="ownerInfo.avatarUrl"
          class="product-card__owner-avatar"
        >
          {{ ownerInfo.username?.charAt(0) || 'U' }}
        </el-avatar>
        <span class="product-card__owner-name">{{ ownerInfo.username || ownerInfo.nickname || '用户' }}</span>
      </div>

      <!-- 统计信息 -->
      <div
        v-if="showStats && showRating && averageRating"
        class="product-card__stats"
      >
        <span class="product-card__rating">
          <el-rate
            :model-value="averageRating"
            disabled
            :size="12"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Location, Picture, Star, StarFilled } from '@element-plus/icons-vue'
import { ITEM_STATUS } from '@/shared/utils/constants'

// ==================== 类型定义 ====================

interface OwnerInfo {
  id?: string | number
  username?: string
  nickname?: string
  avatarUrl?: string
  creditScore?: number
}

interface ItemStats {
  viewCount?: number
  favoriteCount?: number
  averageRating?: number
  totalRatings?: number
}

interface ItemData {
  id: string | number
  title: string
  images?: string[] | { url: string }[]
  price: number
  deposit?: number
  billingType?: 'per_day' | 'per_week' | 'per_month'
  conditionLevel?: number | string
  location?: string
  status?: 1 | 2 | 3
  viewCount?: number
  favoriteCount?: number
  isFavorite?: boolean
  owner?: OwnerInfo
  stats?: ItemStats
}

interface Props {
  /** 物品数据 */
  item: ItemData
  /** 视图模式 */
  viewMode?: 'grid' | 'list' | 'compact'
  /** 是否展示所有者 */
  showOwner?: boolean
  /** 是否展示统计信息 */
  showStats?: boolean
  /** 是否展示评分 */
  showRating?: boolean
  /** 是否展示位置 */
  showLocation?: boolean
  /** 是否展示收藏按钮 */
  showFavorite?: boolean
  /** 图片比例 */
  imageRatio?: '1:1' | '4:3' | '16:9'
  /** 是否可点击 */
  clickable?: boolean
}

// ==================== Props & Emits ====================

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'grid',
  showOwner: true,
  showStats: true,
  showRating: true,
  showLocation: true,
  showFavorite: false,
  imageRatio: '1:1',
  clickable: true
})

const emit = defineEmits<{
  click: [item: ItemData]
  favorite: [item: ItemData, isFavorited: boolean]
}>()

// ==================== 计算属性 ====================

/** 图片地址 */
const displayImage = computed(() => {
  const images = props.item.images
  if (!images || images.length === 0) return null

  const firstImage = images[0]
  return typeof firstImage === 'string' ? firstImage : firstImage.url
})

/** 图片包装器样式 */
const imageWrapperStyle = computed(() => {
  const ratioMap = {
    '1:1': '100%',
    '4:3': '75%',
    '16:9': '56.25%'
  }
  return {
    paddingTop: ratioMap[props.imageRatio]
  }
})

/** 状态样式类 */
const statusClass = computed(() => {
  const status = props.item.status ?? ITEM_STATUS.FOR_SALE
  const classMap: Record<number, string> = {
    [ITEM_STATUS.FOR_SALE]: 'for-sale',
    [ITEM_STATUS.SOLD]: 'sold',
    [ITEM_STATUS.OFF_SHELF]: 'off-shelf'
  }
  return classMap[status] || 'for-sale'
})

/** 状态文本 */
const statusText = computed(() => {
  const status = props.item.status ?? ITEM_STATUS.FOR_SALE
  const textMap: Record<number, string> = {
    [ITEM_STATUS.FOR_SALE]: '待售',
    [ITEM_STATUS.SOLD]: '已售出',
    [ITEM_STATUS.OFF_SHELF]: '已下架'
  }
  return textMap[status] || '待售'
})

/** 计费单位 */
const billingUnit = computed(() => {
  const unitMap: Record<string, string> = {
    'per_day': '天',
    'per_week': '周',
    'per_month': '月'
  }
  return unitMap[props.item.billingType || 'per_day'] || '天'
})

/** 所有者信息 */
const ownerInfo = computed(() => props.item.owner)

/** 平均评分 */
const averageRating = computed(() =>
  props.item.stats?.averageRating || 0
)

/** 是否已收藏 */
const isFavorited = ref(props.item.isFavorite || false)

// ==================== 方法 ====================

/** 格式化价格 */
const formatPrice = (price: number) => {
  return Number(price).toFixed(price % 1 === 0 ? 0 : 2)
}

/** 图片加载失败 */
const handleImageError = () => {
  // 图片加载失败时，displayImage 会被替换为 null，显示占位图
}

/** 点击卡片 */
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.item)
  }
}

/** 点击收藏 */
const handleFavorite = () => {
  isFavorited.value = !isFavorited.value
  emit('favorite', props.item, isFavorited.value)
}
</script>

<style scoped>
/* ==================== 卡片基础样式 ==================== */

.product-card {
  position: relative;
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-base);
  transition: all var(--transition-base);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card--clickable {
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

/* ==================== 图片区域 ==================== */

.product-card__image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.product-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.product-card:hover .product-card__image {
  transform: scale(1.05);
}

.product-card__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-placeholder);
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

/* ==================== 状态徽章 ==================== */

.product-card__status {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-extra-small);
  font-weight: var(--font-weight-medium);
  color: white;
  backdrop-filter: blur(8px);
  z-index: 2;
}

.product-card__status--for-sale {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.9) 0%, rgba(85, 165, 48, 0.9) 100%);
}

.product-card__status--sold {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.9) 0%, rgba(200, 140, 50, 0.9) 100%);
}

.product-card__status--off-shelf {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.9) 0%, rgba(120, 123, 130, 0.9) 100%);
}

/* ==================== 收藏按钮 ==================== */

.product-card__favorite {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  z-index: 2;
}

.product-card__favorite:hover {
  background: white;
  color: var(--color-danger);
}

.product-card__favorite--active {
  background: var(--color-danger);
  color: white;
}

.product-card__favorite--active:hover {
  background: var(--color-danger);
  color: white;
}

/* ==================== 内容区域 ==================== */

.product-card__content {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
  min-height: 0;
}

/* ==================== 标题 ==================== */

.product-card__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.5;
}

/* ==================== 价格 ==================== */

.product-card__price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.product-card__price {
  display: flex;
  align-items: baseline;
  gap: 1px;
}

.product-card__price-symbol {
  font-size: var(--font-size-base);
  color: var(--brand-primary);
  font-weight: var(--font-weight-medium);
}

.product-card__price-value {
  font-size: 20px;
  color: var(--brand-primary);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-number);
}

.product-card__price-unit {
  font-size: var(--font-size-extra-small);
  color: var(--text-secondary);
  margin-left: 2px;
}

.product-card__deposit {
  font-size: var(--font-size-extra-small);
  color: var(--text-secondary);
  padding: 2px 6px;
  background: var(--bg-base);
  border-radius: var(--radius-sm);
}

/* ==================== 位置 ==================== */

.product-card__location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-extra-small);
  color: var(--text-secondary);
}

/* ==================== 所有者 ==================== */

.product-card__owner {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.product-card__owner-avatar {
  flex-shrink: 0;
}

.product-card__owner-name {
  font-size: var(--font-size-extra-small);
  color: var(--text-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== 统计信息 ==================== */

.product-card__stats {
  display: flex;
  align-items: center;
  padding-top: var(--spacing-xs);
  margin-top: auto;
  border-top: 1px solid var(--border-extra-light);
}

.product-card__rating :deep(.el-rate__icon) {
  font-size: 12px;
}

/* ==================== 列表视图 ==================== */

.product-card--list {
  flex-direction: row;
}

.product-card--list .product-card__image-wrapper {
  width: 180px;
  padding-top: 0;
  height: 180px;
  flex-shrink: 0;
}

.product-card--list .product-card__image,
.product-card--list .product-card__placeholder {
  position: static;
  width: 100%;
  height: 100%;
}

.product-card--list .product-card__content {
  flex: 1;
  padding: var(--spacing-md);
}

.product-card--list .product-card__title {
  font-size: var(--font-size-small);
}

/* ==================== 紧凑视图 ==================== */

.product-card--compact {
  flex-direction: row;
  gap: var(--spacing-sm);
}

.product-card--compact .product-card__image-wrapper {
  width: 80px;
  padding-top: 0;
  height: 80px;
  flex-shrink: 0;
}

.product-card--compact .product-card__image,
.product-card--compact .product-card__placeholder {
  position: static;
  width: 100%;
  height: 100%;
}

.product-card--compact .product-card__content {
  flex: 1;
  padding: var(--spacing-xs);
  gap: 2px;
}

.product-card--compact .product-card__title {
  font-size: var(--font-size-extra-small);
}

.product-card--compact .product-card__price-value {
  font-size: 16px;
}

.product-card--compact .product-card__stats,
.product-card--compact .product-card__deposit,
.product-card--compact .product-card__location {
  display: none;
}

/* ==================== 响应式 ==================== */

@media (max-width: 768px) {
  .product-card--list {
    flex-direction: column;
  }

  .product-card--list .product-card__image-wrapper {
    width: 100%;
    padding-top: 75%;
    height: auto;
  }

  .product-card--list .product-card__image,
  .product-card--list .product-card__placeholder {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .product-card__favorite {
    opacity: 1;
  }
}
</style>