<template>
  <div class="item-rating">
    <div class="rating-summary">
      <div class="rating-overview">
        <div class="overall-score">
          <span class="score-value">{{ item?.rating || 0 }}</span>
          <span class="score-max">/5</span>
        </div>
        <div class="rating-details">
          <el-rate 
            :model-value="item?.rating || 0" 
            disabled 
            show-score
            text-color="#ff9900"
            score-template="{value} 分"
            class="rating-stars"
          />
          <div class="review-count">
            基于 {{ item?.stats?.totalRatings || 0 }} 条评价
          </div>
        </div>
      </div>

      <div
        v-if="ratingDistribution.length > 0"
        class="rating-breakdown"
      >
        <div 
          v-for="(distItem, index) in ratingDistribution" 
          :key="index"
          class="rating-bar"
        >
          <span class="star-level">{{ 5 - index }}星</span>
          <div class="bar-container">
            <div
              class="bar-fill"
              :style="{ width: distItem.percentage + '%' }"
            />
          </div>
          <span class="bar-count">{{ distItem.count }}</span>
        </div>
      </div>
    </div>

    <div class="review-filters">
      <div class="filter-tabs">
        <el-button-group>
          <el-button 
            v-for="filter in reviewFilters" 
            :key="filter.key"
            :type="activeFilter === filter.key ? 'primary' : ''"
            size="small"
            @click="setActiveFilter(filter.key)"
          >
            {{ filter.label }}
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="reviews-list">
      <div 
        v-for="review in filteredReviews" 
        :key="review.id"
        class="review-item"
      >
        <div class="review-header">
          <div class="reviewer-info">
            <el-avatar
              :src="review.reviewer.avatar"
              size="small"
            >
              {{ review.reviewer.name.charAt(0) }}
            </el-avatar>
            <div class="reviewer-details">
              <div class="reviewer-name">
                {{ review.reviewer.name }}
              </div>
              <div class="review-date">
                {{ formatDate(review.date) }}
              </div>
            </div>
          </div>
          <div class="review-rating">
            <el-rate 
              :model-value="review.rating" 
              disabled 
              size="small"
            />
          </div>
        </div>

        <div class="review-content">
          <p class="review-text">
            {{ review.content }}
          </p>
          
          <div
            v-if="review.images && review.images.length > 0"
            class="review-images"
          >
            <div class="image-gallery">
              <img 
                v-for="(image, imgIndex) in review.images" 
                :key="imgIndex"
                :src="image" 
                :alt="'评价图片' + (imgIndex + 1)"
                class="review-image"
                @click="previewImage(image)"
              >
            </div>
          </div>

          <div class="review-actions">
            <el-button 
              size="small" 
              text 
              :class="{ 'is-liked': review.isLiked }"
              @click="handleLike(review)"
            >
              有用 ({{ review.likes || 0 }})
            </el-button>
            
            <el-button 
              size="small" 
              text 
              @click="handleReply(review)"
            >
              <el-icon><ChatDotRound /></el-icon>
              回复
            </el-button>
          </div>
        </div>
      </div>

      <div
        v-if="filteredReviews.length === 0"
        class="no-reviews"
      >
        <el-empty description="暂无相关评价" />
      </div>
    </div>

    <div
      v-if="hasMoreReviews"
      class="load-more"
    >
      <el-button 
        :loading="loadingMore" 
        plain
        @click="loadMoreReviews"
      >
        加载更多评价
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ChatDotRound } from '@element-plus/icons-vue'

const props = defineProps({
  item: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['like', 'reply'])

const activeFilter = ref('all')
const loadingMore = ref(false)
const hasMoreReviews = ref(true)

const reviewFilters = [
  { key: 'all', label: '全部' },
  { key: '5', label: '5星' },
  { key: '4', label: '4星' },
  { key: '3', label: '3星' },
  { key: '2', label: '2星' },
  { key: '1', label: '1星' }
]

// 计算评分分布
const ratingDistribution = computed(() => {
  if (!props.item || !props.item.rating) return []
  
  const distribution = [0, 0, 0, 0, 0] // 1-5星的数量
  const totalReviews = props.item.stats?.totalRatings || 0
  
  // 模拟评分分布数据
  const mockData = [
    { count: Math.floor(totalReviews * 0.1), percentage: 10 },
    { count: Math.floor(totalReviews * 0.15), percentage: 15 },
    { count: Math.floor(totalReviews * 0.2), percentage: 20 },
    { count: Math.floor(totalReviews * 0.25), percentage: 25 },
    { count: Math.floor(totalReviews * 0.3), percentage: 30 }
  ]
  
  return mockData.reverse()
})

// 真实评价数据 - 暂时为空，因为后端接口未提供
const reviews = ref([])

// 根据筛选条件过滤评价
const filteredReviews = computed(() => {
  if (activeFilter.value === 'all') {
    return reviews.value
  }
  return reviews.value.filter(review => 
    review.rating === parseInt(activeFilter.value)
  )
})

const setActiveFilter = (filter) => {
  activeFilter.value = filter
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const previewImage = (imageUrl) => {
  // 图片预览功能
  ElMessage.info('图片预览功能开发中...')
}

const handleLike = (review) => {
  review.isLiked = !review.isLiked
  review.likes += review.isLiked ? 1 : -1
  emit('like', { review, isLiked: review.isLiked })
}

const handleReply = (review) => {
  ElMessageBox.prompt('请输入回复内容', '回复评价', {
    confirmButtonText: '回复',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入回复内容'
  }).then(({ value }) => {
    emit('reply', { review, content: value })
    ElMessage.success('回复已提交')
  }).catch(() => {
    // 用户取消
  })
}

const loadMoreReviews = () => {
  loadingMore.value = true
  // 模拟加载更多数据
  setTimeout(() => {
    loadingMore.value = false
    hasMoreReviews.value = false // 模拟没有更多数据
  }, 1000)
}
</script>

<style scoped>
.item-rating {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.rating-summary {
  margin-bottom: 24px;
}

.rating-overview {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.overall-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  color: #ff9900;
}

.score-max {
  font-size: 24px;
  color: #999;
}

.rating-details {
  flex: 1;
}

.rating-stars {
  margin-bottom: 8px;
}

.review-count {
  font-size: 14px;
  color: #666;
}

.rating-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-level {
  font-size: 14px;
  color: #666;
  min-width: 30px;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #ff9900;
  transition: width 0.3s ease;
}

.bar-count {
  font-size: 14px;
  color: #666;
  min-width: 30px;
  text-align: right;
}

.review-filters {
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 20px;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}

.review-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reviewer-name {
  font-weight: 600;
  color: #1a1a1a;
}

.review-date {
  font-size: 12px;
  color: #999;
}

.review-content {
  color: #4b5563;
}

.review-text {
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.review-images {
  margin-bottom: 16px;
}

.image-gallery {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.review-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.review-image:hover {
  transform: scale(1.05);
}

.review-actions {
  display: flex;
  gap: 16px;
}

.review-actions .el-button.is-liked {
  color: #3b82f6;
}

.no-reviews {
  padding: 40px 0;
  text-align: center;
}

.load-more {
  margin-top: 24px;
  text-align: center;
}

@media (max-width: 768px) {
  .rating-overview {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }
  
  .review-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .image-gallery {
    justify-content: center;
  }
}
</style>