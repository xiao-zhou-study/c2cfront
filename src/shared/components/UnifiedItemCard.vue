<template>
  <ProductCard
    :item="item"
    :view-mode="mappedViewMode"
    :image-ratio="viewMode === 'large' ? '4:3' : '1:1'"
    :show-owner="viewMode === 'list'"
    :show-stats="true"
    :show-rating="true"
    :show-favorite="false"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProductCard from './ProductCard.vue'

/**
 * 统一物品卡片组件（兼容层）
 * 内部使用 ProductCard 实现，保持原有 props 接口
 * 建议新代码直接使用 ProductCard
 */

interface Props {
  /** 物品数据 */
  item: {
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
    owner?: {
      id?: string | number
      username?: string
      nickname?: string
      avatarUrl?: string
      creditScore?: number
    }
    stats?: {
      viewCount?: number
      favoriteCount?: number
      averageRating?: number
      totalRatings?: number
    }
  }
  /** 视图模式: 'grid' | 'list' | 'large' */
  viewMode?: 'grid' | 'list' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'grid'
})

const emit = defineEmits<{
  click: [item: any]
}>()

// 将 'large' 映射为 'grid'（ProductCard 不支持 large，但可以通过 imageRatio 实现）
const mappedViewMode = computed(() => {
  if (props.viewMode === 'large') return 'grid'
  return props.viewMode
})

const handleClick = (item: any) => {
  emit('click', item)
}
</script>