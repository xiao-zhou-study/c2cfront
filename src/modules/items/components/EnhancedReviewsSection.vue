<template>
  <div class="enhanced-reviews-section">
    <!-- 评价概览 -->
    <div class="reviews-overview">
      <div class="overall-rating">
        <div class="rating-number">
          {{ overallRating }}
        </div>
        <el-rate 
          :model-value="overallRating" 
          disabled 
          show-score
          :score-template="`${overallRating}分`"
        />
        <div class="rating-count">
          共 {{ totalReviews }} 条评价
        </div>
      </div>

      <div class="rating-distribution">
        <div 
          v-for="item in ratingDistribution" 
          :key="item.star"
          class="rating-bar"
        >
          <span class="star-label">{{ item.star }}星</span>
          <el-progress 
            :percentage="item.percentage" 
            :stroke-width="8"
            :show-text="false"
          />
          <span class="count-label">{{ item.count }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选和排序 -->
    <div class="reviews-toolbar">
      <el-radio-group
        v-model="filterStar"
        size="small"
        @change="handleFilterChange"
      >
        <el-radio-button :label="0">
          全部
        </el-radio-button>
        <el-radio-button :label="5">
          5星
        </el-radio-button>
        <el-radio-button :label="4">
          4星
        </el-radio-button>
        <el-radio-button :label="3">
          3星
        </el-radio-button>
        <el-radio-button :label="2">
          2星
        </el-radio-button>
        <el-radio-button :label="1">
          1星
        </el-radio-button>
      </el-radio-group>

      <el-select
        v-model="sortBy"
        size="small"
        @change="handleSortChange"
      >
        <el-option
          label="最新发布"
          value="newest"
        />
        <el-option
          label="评分最高"
          value="highest"
        />
        <el-option
          label="评分最低"
          value="lowest"
        />
      </el-select>
    </div>

    <!-- 评价列表 -->
    <div
      v-loading="loading"
      class="reviews-list"
    >
      <div 
        v-for="review in displayReviews" 
        :key="review.id"
        class="review-item"
      >
        <div class="review-header">
          <el-avatar
            :size="48"
            :src="review.reviewer.avatarUrl"
          >
            {{ review.reviewer.nickname?.charAt(0) || review.reviewer.username.charAt(0) }}
          </el-avatar>
          
          <div class="reviewer-info">
            <div class="reviewer-name">
              {{ review.reviewer.nickname || review.reviewer.username }}
              <VerifiedBadge
                v-if="review.reviewer.isVerified"
                size="small"
              />
            </div>
            <div class="review-meta">
              <el-rate 
                :model-value="review.rating" 
                disabled 
                size="small"
              />
              <span class="review-date">{{ formatDate(review.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="review-content">
          <p>{{ review.comment }}</p>
        </div>

        <div
          v-if="review.images && review.images.length > 0"
          class="review-images"
        >
          <el-image
            v-for="(image, index) in review.images"
            :key="index"
            :src="image"
            :preview-src-list="review.images"
            :initial-index="index"
            fit="cover"
            class="review-image"
          />
        </div>

        <div class="review-footer">
          <el-button 
            text 
            size="small"
            :icon="review.isHelpful ? StarFilled : Star"
            @click="handleHelpful(review.id)"
          >
            有用 ({{ review.helpfulCount || 0 }})
          </el-button>
          <el-button 
            text 
            size="small"
            :icon="ChatDotRound"
          >
            回复 ({{ review.replyCount || 0 }})
          </el-button>
        </div>

        <!-- 回复列表 -->
        <div
          v-if="review.replies && review.replies.length > 0"
          class="replies-list"
        >
          <div 
            v-for="reply in review.replies" 
            :key="reply.id"
            class="reply-item"
          >
            <el-avatar
              :size="32"
              :src="reply.user.avatarUrl"
            >
              {{ reply.user.nickname?.charAt(0) || reply.user.username.charAt(0) }}
            </el-avatar>
            <div class="reply-content">
              <div class="reply-header">
                <span class="reply-author">{{ reply.user.nickname || reply.user.username }}</span>
                <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p class="reply-text">
                {{ reply.content }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-if="!loading && displayReviews.length === 0"
        description="暂无评价"
      />
    </div>

    <!-- 分页 -->
    <div
      v-if="totalReviews > pageSize"
      class="reviews-pagination"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalReviews"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Star, StarFilled, ChatDotRound } from '@element-plus/icons-vue'
import VerifiedBadge from '@/shared/components/VerifiedBadge.vue'

interface Reviewer {
  id: string
  username: string
  nickname?: string
  avatarUrl: string
  isVerified: boolean
}

interface Reply {
  id: string
  user: Reviewer
  content: string
  createdAt: number
}

interface Review {
  id: string
  reviewer: Reviewer
  rating: number
  comment: string
  images?: string[]
  createdAt: number
  helpfulCount?: number
  isHelpful?: boolean
  replyCount?: number
  replies?: Reply[]
}

interface Props {
  reviews: Review[]
  overallRating?: number
  totalReviews?: number
}

const props = withDefaults(defineProps<Props>(), {
  reviews: () => [],
  overallRating: 0,
  totalReviews: 0
})

const emit = defineEmits<{
  'helpful': [reviewId: string]
  'load-more': []
}>()

// 响应式数据
const loading = ref(false)
const filterStar = ref(0)
const sortBy = ref('newest')
const currentPage = ref(1)
const pageSize = ref(10)

// 评分分布
const ratingDistribution = computed(() => {
  const dist = [5, 4, 3, 2, 1].map(star => {
    const count = props.reviews.filter(r => Math.floor(r.rating) === star).length
    const percentage = props.totalReviews > 0 ? (count / props.totalReviews) * 100 : 0
    return { star, count, percentage }
  })
  return dist
})

// 显示的评价列表
const displayReviews = computed(() => {
  let filtered = props.reviews

  // 星级筛选
  if (filterStar.value > 0) {
    filtered = filtered.filter(r => Math.floor(r.rating) === filterStar.value)
  }

  // 排序
  if (sortBy.value === 'highest') {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating)
  } else if (sortBy.value === 'lowest') {
    filtered = [...filtered].sort((a, b) => a.rating - b.rating)
  } else {
    filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt)
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 方法
const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSortChange = () => {
  currentPage.value = 1
}

const handlePageChange = () => {
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = () => {
  currentPage.value = 1
}

const handleHelpful = (reviewId: string) => {
  emit('helpful', reviewId)
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - timestamp
  const days = Math.floor(diff / 86400000)

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.enhanced-reviews-section {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

/* 评价概览 */
.reviews-overview {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-2xl);
  padding: var(--spacing-lg);
  background: var(--bg-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.overall-rating {
  text-align: center;
}

.rating-number {
  font-size: 64px;
  font-weight: 700;
  color: var(--brand-primary);
  line-height: 1;
  margin-bottom: var(--spacing-sm);
}

.rating-count {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
}

.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  justify-content: center;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.star-label {
  width: 40px;
  font-size: 14px;
  color: var(--text-secondary);
}

.rating-bar .el-progress {
  flex: 1;
}

.count-label {
  width: 40px;
  text-align: right;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 工具栏 */
.reviews-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

/* 评价列表 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.review-item {
  padding: var(--spacing-lg);
  background: var(--bg-light);
  border-radius: var(--radius-md);
}

.review-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.reviewer-info {
  flex: 1;
}

.reviewer-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.review-date {
  font-size: 13px;
  color: var(--text-placeholder);
}

.review-content {
  margin-bottom: var(--spacing-md);
}

.review-content p {
  margin: 0;
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.6;
}

/* 评价图片 */
.review-images {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.review-image {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.review-footer {
  display: flex;
  gap: var(--spacing-md);
}

/* 回复列表 */
.replies-list {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color-light);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.reply-item {
  display: flex;
  gap: var(--spacing-sm);
}

.reply-content {
  flex: 1;
  background: #fff;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.reply-author {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.reply-date {
  font-size: 12px;
  color: var(--text-placeholder);
}

.reply-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 分页 */
.reviews-pagination {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

/* 响应式 */
@media (max-width: 768px) {
  .reviews-overview {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .reviews-toolbar {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .review-images {
    overflow-x: auto;
  }
}
</style>
