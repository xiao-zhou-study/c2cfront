<template>
  <div class="review-records">
    <!-- 工具栏 -->
    <div class="toolbar-section">
      <div class="toolbar-left">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索评价内容"
            size="default"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
      <div class="toolbar-right">
        <el-select
          v-model="ratingFilter"
          size="default"
          class="rating-select"
          @change="filterReviews"
        >
          <el-option
            label="全部评分"
            value="all"
          />
          <el-option
            label="5星"
            value="5"
          />
          <el-option
            label="4星"
            value="4"
          />
          <el-option
            label="3星"
            value="3"
          />
          <el-option
            label="2星"
            value="2"
          />
          <el-option
            label="1星"
            value="1"
          />
        </el-select>
        <el-button
          type="primary"
          :loading="refreshLoading"
          @click="refreshReviewRecords"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <div class="skeleton-grid">
        <div
          v-for="i in 3"
          :key="i"
          class="skeleton-card"
        >
          <el-skeleton
            :rows="4"
            animated
          />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="filteredReviews.length === 0"
      class="empty-container"
    >
      <div class="empty-illustration">
        <el-icon class="empty-icon">
          <ChatDotRound />
        </el-icon>
      </div>
      <h3 class="empty-title">
        暂无收到的评价
      </h3>
      <p class="empty-description">
        您还没有收到任何评价，继续努力吧！
      </p>
    </div>

    <!-- 评价列表 -->
    <div
      v-else
      class="reviews-grid"
    >
      <div
        v-for="(review, index) in filteredReviews"
        :key="review.id"
        class="review-card"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <div class="review-header">
          <div class="reviewer-info">
            <img
              :src="review.reviewer.avatar"
              :alt="review.reviewer.name"
              class="reviewer-avatar"
            >
            <div class="reviewer-details">
              <div class="reviewer-name">
                {{ review.reviewer.name }}
              </div>
              <div class="review-date">
                <el-icon><Clock /></el-icon>
                {{ formatDate(review.created_at) }}
              </div>
            </div>
          </div>
          <div class="rating-display">
            <div class="stars">
              <el-icon
                v-for="i in 5"
                :key="i"
                class="star-icon"
                :class="{ 'star-filled': i <= review.rating }"
              >
                <StarFilled v-if="i <= review.rating" />
                <Star v-else />
              </el-icon>
            </div>
            <span class="rating-text">{{ review.rating }}.0</span>
          </div>
        </div>

        <div class="review-content">
          <p>{{ review.comment }}</p>
        </div>

        <div class="review-item-info">
          <div class="item-info">
            <el-icon><Box /></el-icon>
            <span>{{ review.item.name }}</span>
          </div>
          <div class="review-actions">
            <el-button
              v-if="!review.replied"
              type="primary"
              @click="replyReview(review.id)"
            >
              <el-icon><ChatLineRound /></el-icon>
              回复
            </el-button>
          </div>
        </div>

        <div
          v-if="review.reply"
          class="review-reply"
        >
          <div class="reply-header">
            <div class="reply-label">
              <el-icon><ChatDotRound /></el-icon>
              我的回复
            </div>
            <div class="reply-date">
              {{ formatDate(review.reply.created_at) }}
            </div>
          </div>
          <div class="reply-content">
            {{ review.reply.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  ChatDotRound,
  Clock,
  Star,
  StarFilled,
  Box,
  ChatLineRound
} from '@element-plus/icons-vue'

const props = defineProps({
  reviewRecords: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'reply-review'])

const ratingFilter = ref('all')
const searchKeyword = ref('')
const refreshLoading = ref(false)

const filteredReviews = computed(() => {
  let reviews = props.reviewRecords

  // 按评分筛选
  if (ratingFilter.value !== 'all') {
    reviews = reviews.filter(review => review.rating === parseInt(ratingFilter.value))
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    reviews = reviews.filter(review =>
      review.comment && review.comment.toLowerCase().includes(keyword) ||
      review.item.name && review.item.name.toLowerCase().includes(keyword)
    )
  }

  return reviews
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const filterReviews = () => {
  // 触发计算属性重新计算
}

const refreshReviewRecords = async () => {
  try {
    refreshLoading.value = true
    emit('refresh')
    ElMessage.success('刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    refreshLoading.value = false
  }
}

const replyReview = (id) => {
  emit('reply-review', id)
}
</script>

<style scoped>
.review-records {
  padding: 24px;
}

/* 工具栏区域 */
.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.search-box {
  flex: 2;
  max-width: 480px;
}

:deep(.search-input) {
  border-radius: 8px;
}

:deep(.search-input .el-input__wrapper) {
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:deep(.search-input .el-input__wrapper:hover),
:deep(.search-input .el-input__wrapper.is-focus) {
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
  border-color: #409EFF;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.rating-select {
  width: 120px;
  min-width: 120px;
}

:deep(.rating-select .el-input__wrapper) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* 加载状态 */
.loading-container {
  padding: 40px 20px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  border-radius: 12px;
}

.empty-illustration {
  margin-bottom: 24px;
}

.empty-icon {
  font-size: 80px;
  color: #d0d0d0;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.empty-description {
  font-size: 14px;
  color: #909399;
  margin: 0;
  line-height: 1.6;
}

/* 评价网格 */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

/* 评价卡片 */
.review-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideIn 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.review-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.review-card:hover .reviewer-avatar {
  transform: scale(1.05);
}

/* 头部区域 */
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 0;
  margin-bottom: 16px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer-name {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.review-date {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}

.review-date .el-icon {
  font-size: 12px;
}

.rating-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star-icon {
  font-size: 16px;
  color: #DCDFE6;
  transition: all 0.3s ease;
}

.star-icon.star-filled {
  color: #FFC107;
}

.rating-text {
  font-size: 20px;
  font-weight: 700;
  color: #FFC107;
  line-height: 1;
}

/* 评价内容 */
.review-content {
  padding: 0 20px 16px;
}

.review-content p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

/* 物品信息 */
.review-item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #F5F7FA;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
}

.item-info .el-icon {
  font-size: 16px;
  color: #409EFF;
}

.review-actions {
  display: flex;
}

:deep(.review-actions .el-button) {
  padding: 8px 20px;
  font-size: 13px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.review-actions .el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.review-actions .el-button .el-icon) {
  margin-right: 4px;
  font-size: 14px;
}

/* 回复区域 */
.review-reply {
  margin: 0 20px 20px;
  padding: 16px;
  background: linear-gradient(135deg, #F0F7FF 0%, #F5F9FF 100%);
  border-radius: 12px;
  border-left: 4px solid #409EFF;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reply-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #409EFF;
  font-size: 13px;
}

.reply-label .el-icon {
  font-size: 14px;
}

.reply-date {
  color: #909399;
  font-size: 12px;
}

.reply-content {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .reviews-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .review-records {
    padding: 16px;
  }

  .toolbar-section {
    flex-direction: column;
    gap: 16px;
  }

  .toolbar-left {
    width: 100%;
    flex-direction: column;
  }

  .search-box {
    max-width: 100%;
  }

  .rating-select {
    width: 100%;
    min-width: auto;
  }

  .toolbar-right {
    width: 100%;
  }

  .toolbar-right .el-button {
    width: 100%;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
  }

  .review-header {
    flex-direction: column;
    gap: 12px;
  }

  .review-item-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .empty-container {
    padding: 60px 20px;
  }

  .empty-icon {
    font-size: 60px;
  }
}
</style>