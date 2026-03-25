<template>
  <div class="review-list">
    <!-- 评价统计概览 -->
    <div
      v-if="showStats && stats"
      class="review-stats"
    >
      <div class="stats-overview">
        <div class="overall-rating">
          <div class="rating-score">
            {{ stats.avgRating.toFixed(1) }}
          </div>
          <el-rate
            v-model="stats.avgRating"
            disabled
            show-score
          />
          <div class="total-reviews">
            {{ stats.totalReviews }} 条评价
          </div>
        </div>
        
        <div class="rating-distribution">
          <div
            v-for="star in 5"
            :key="star"
            class="rating-bar"
          >
            <span class="star-label">{{ 6 - star }}星</span>
            <div class="bar-container">
              <div class="bar-background" />
              <div
                class="bar-fill"
                :style="{ width: getStarPercentage(6 - star) + '%' }"
              />
            </div>
            <span class="star-count">{{ getStarCount(6 - star) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div
      v-if="showFilters"
      class="review-filters"
    >
      <div class="filter-left">
        <el-radio-group
          v-model="currentFilter"
          @change="handleFilterChange"
        >
          <el-radio-button label="all">
            全部
          </el-radio-button>
          <el-radio-button label="5">
            5星
          </el-radio-button>
          <el-radio-button label="4">
            4星
          </el-radio-button>
          <el-radio-button label="3">
            3星
          </el-radio-button>
          <el-radio-button label="2">
            2星
          </el-radio-button>
          <el-radio-button label="1">
            1星
          </el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="filter-right">
        <el-select
          v-model="sortBy"
          style="width: 150px"
          @change="handleSortChange"
        >
          <el-option
            label="默认排序"
            value="default"
          />
          <el-option
            label="评分从高到低"
            value="rating_desc"
          />
          <el-option
            label="评分从低到高"
            value="rating_asc"
          />
          <el-option
            label="最新评价"
            value="newest"
          />
          <el-option
            label="最老评价"
            value="oldest"
          />
        </el-select>
      </div>
    </div>

    <!-- 评价列表 -->
    <div class="reviews-container">
      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="loading-container"
      >
        <el-skeleton
          :rows="3"
          animated
        />
      </div>

      <!-- 评价项 -->
      <div
        v-else-if="reviews.length > 0"
        class="review-items"
      >
        <div
          v-for="review in reviews"
          :key="review.id"
          class="review-item"
        >
          <!-- 评价头部 -->
          <div class="review-header">
            <div class="user-info">
              <div class="user-avatar">
                <img
                  :src="review.reviewer.avatarUrl || review.reviewer.avatar || '/default-avatar.png'"
                  :alt="review.reviewer.username"
                >
              </div>
              <div class="user-details">
                <div class="user-name">
                  {{ review.isAnonymous ? '匿名用户' : review.reviewer.username }}
                </div>
                <div class="review-meta">
                  <el-rate
                    v-model="review.rating"
                    disabled
                    size="small"
                  />
                  <span class="review-time">{{ formatTime(review.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div
              v-if="showActions"
              class="review-actions"
            >
              <el-button
                type="text"
                size="small"
                @click="handleReply(review)"
              >
                回复
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="handleReport(review)"
              >
                举报
              </el-button>
            </div>
          </div>

          <!-- 评价内容 -->
          <div class="review-content">
            <p
              v-if="review.content"
              class="review-text"
            >
              {{ review.content }}
            </p>
            
            <!-- 评价图片 -->
            <div
              v-if="review.images && review.images.length > 0"
              class="review-images"
            >
              <div 
                v-for="(image, index) in review.images.slice(0, 3)" 
                :key="index"
                class="review-image"
                @click="previewImage(review.images, index)"
              >
                <img
                  :src="image"
                  :alt="`评价图片${index + 1}`"
                >
                <div
                  v-if="index === 2 && review.images.length > 3"
                  class="more-images"
                >
                  +{{ review.images.length - 3 }}
                </div>
              </div>
            </div>

            <!-- 物品信息 -->
            <div
              v-if="showItemInfo && review.item"
              class="review-item"
            >
              <div class="item-image">
                <img
                  :src="review.item.images[0]"
                  :alt="review.item.title || review.item.name"
                >
              </div>
              <div class="item-info">
                <div class="item-name">
                  {{ review.item.title || review.item.name }}
                </div>
                <div class="item-price">
                  ¥{{ review.item.price }}
                </div>
              </div>
            </div>
          </div>

          <!-- 评价回复 -->
          <div
            v-if="review.replies && review.replies.length > 0"
            class="review-replies"
          >
            <div
              v-for="reply in review.replies"
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-header">
                <span class="reply-user">{{ reply.user?.nickname || reply.user?.username || '用户' }}</span>
                <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
              </div>
              <div class="reply-content">
                {{ reply.content }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else
        description="暂无评价"
      >
        <el-button
          v-if="canReview"
          type="primary"
          @click="$emit('write-review')"
        >
          写评价
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div
      v-if="!loading && reviews.length > 0"
      class="pagination"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 图片预览 -->
    <el-image-viewer 
      v-if="previewImages.show"
      :url-list="previewImages.urls"
      :initial-index="previewImages.index"
      @close="previewImages.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Review, ReviewStats } from '@/shared/types/models'
import { getItemReviews, getUserReviews, getMyReviews, getReviewStats } from '@/shared/api/modules/review'

// Props
interface Props {
  type: 'item' | 'user' | 'my'
  targetId?: number | string
  showStats?: boolean
  showFilters?: boolean
  showActions?: boolean
  showItemInfo?: boolean
  canReview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStats: true,
  showFilters: true,
  showActions: true,
  showItemInfo: false,
  canReview: false
})

// Emits
const emit = defineEmits<{
  'write-review': []
  'reply': [review: Review]
  'report': [review: Review]
}>()

// 响应式数据
const loading = ref(true)
const reviews = ref<Review[]>([])
const stats = ref<ReviewStats | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentFilter = ref('all')
const sortBy = ref('default')

// 图片预览
const previewImages = reactive({
  show: false,
  urls: [] as string[],
  index: 0
})

// 方法
const loadReviews = async () => {
  loading.value = true

  try {
    let response
    const targetId = props.targetId ? String(props.targetId) : undefined

    // 根据类型调用不同的API
    if (props.type === 'item' && targetId) {
      response = await getItemReviews(targetId, {
        page: currentPage.value,
        pageSize: pageSize.value,
        rating: currentFilter.value === 'all' ? undefined : parseInt(currentFilter.value),
        sortBy: sortBy.value
      })
    } else if (props.type === 'user' && targetId) {
      response = await getUserReviews(targetId, {
        page: currentPage.value,
        pageSize: pageSize.value,
        rating: currentFilter.value === 'all' ? undefined : parseInt(currentFilter.value),
        sortBy: sortBy.value
      })
    } else {
      response = await getMyReviews({
        page: currentPage.value,
        pageSize: pageSize.value,
        rating: currentFilter.value === 'all' ? undefined : parseInt(currentFilter.value),
        sortBy: sortBy.value
      })
    }

    reviews.value = response.list || response.data || []
    total.value = response.total

  } catch (error) {
    console.error('加载评价列表失败:', error)
    ElMessage.error('加载评价列表失败，请重试')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  if (!props.showStats || !props.targetId || props.type !== 'user') return
  
  try {
    const targetId = String(props.targetId)
    const response = await getReviewStats(targetId)
    stats.value = response
  } catch (error) {
    console.error('加载评价统计失败:', error)
  }
}

const handleFilterChange = () => {
  currentPage.value = 1
  loadReviews()
}

const handleSortChange = () => {
  currentPage.value = 1
  loadReviews()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadReviews()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadReviews()
}

const handleReply = (review: Review) => {
  emit('reply', review)
}

const handleReport = (review: Review) => {
  emit('report', review)
}

const previewImage = (images: string[], index: number) => {
  previewImages.urls = images
  previewImages.index = index
  previewImages.show = true
}

const getPercentage = (count: number) => {
  if (!stats.value || stats.value.totalReviews === 0) return 0
  return (count / stats.value.totalReviews) * 100
}

const getStarPercentage = (star: number) => {
  if (!stats.value || stats.value.totalReviews === 0) return 0
  const count = getStarCount(star)
  return (count / stats.value.totalReviews) * 100
}

const getStarCount = (star: number) => {
  if (!stats.value) return 0
  switch (star) {
    case 1: return stats.value.oneStarCount
    case 2: return stats.value.twoStarCount
    case 3: return stats.value.threeStarCount
    case 4: return stats.value.fourStarCount
    case 5: return stats.value.fiveStarCount
    default: return 0
  }
}

const formatTime = (time: string | number) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 监听props变化
watch(
  () => [props.type, props.targetId],
  () => {
    currentPage.value = 1
    loadReviews()
    if (props.showStats && props.targetId) {
      loadStats()
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  loadReviews()
  if (props.showStats && props.targetId) {
    loadStats()
  }
})
</script>

<style scoped>
.review-list {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.review-stats {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.stats-overview {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.overall-rating {
  text-align: center;
  min-width: 120px;
}

.rating-score {
  font-size: 48px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 10px;
}

.total-reviews {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.rating-distribution {
  flex: 1;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.star-label {
  width: 30px;
  font-size: 14px;
  color: #606266;
}

.bar-container {
  flex: 1;
  height: 8px;
  position: relative;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f0f0f0;
}

.bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: #409eff;
  transition: width 0.3s ease;
}

.star-count {
  width: 40px;
  text-align: right;
  font-size: 14px;
  color: #909399;
}

.review-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.reviews-container {
  margin-top: 20px;
}

.loading-container {
  padding: 20px 0;
}

.review-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.review-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review-time {
  font-size: 12px;
  color: #909399;
}

.review-actions {
  display: flex;
  gap: 10px;
}

.review-content {
  margin-bottom: 15px;
}

.review-text {
  margin: 0 0 15px;
  line-height: 1.6;
  color: #606266;
}

.review-images {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.review-image {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.review-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.review-image:hover img {
  transform: scale(1.1);
}

.more-images {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 2px;
}

.review-item-info {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.item-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 2px;
}

.item-price {
  font-size: 12px;
  color: #f56c6c;
  font-weight: 500;
}

.review-replies {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.reply-item {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.reply-user {
  font-weight: 500;
  color: #409eff;
  font-size: 14px;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-overview {
    flex-direction: column;
    gap: 20px;
  }
  
  .review-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filter-left {
    overflow-x: auto;
  }
  
  .review-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .review-actions {
    align-self: flex-end;
  }
}
</style>