<template>
  <div class="review-records-tab">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-radio-group
        v-model="typeFilter"
        @change="handleFilterChange"
      >
        <el-radio-button :label="null">
          全部
        </el-radio-button>
        <el-radio-button label="given">
          我发布的评价
        </el-radio-button>
        <el-radio-button label="received">
          我收到的评价
        </el-radio-button>
      </el-radio-group>

      <el-select
        v-model="ratingFilter"
        placeholder="评分筛选"
        clearable
        @change="handleFilterChange"
      >
        <el-option
          label="全部评分"
          :value="null"
        />
        <el-option
          label="5星"
          :value="5"
        />
        <el-option
          label="4星"
          :value="4"
        />
        <el-option
          label="3星"
          :value="3"
        />
        <el-option
          label="2星"
          :value="2"
        />
        <el-option
          label="1星"
          :value="1"
        />
      </el-select>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          ⭐
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ stats.averageRating }}
          </div>
          <div class="stat-label">
            平均评分
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          📝
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ stats.totalReviews }}
          </div>
          <div class="stat-label">
            总评价数
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          👍
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ stats.positiveRate }}%
          </div>
          <div class="stat-label">
            好评率
          </div>
        </div>
      </div>
    </div>

    <!-- 评价列表 -->
    <div
      v-loading="loading"
      class="reviews-list"
    >
      <div
        v-for="review in filteredReviews"
        :key="review.id"
        class="review-card"
      >
        <div class="review-header">
          <el-avatar
            :size="48"
            :src="review.user.avatarUrl"
          >
            {{ review.user.nickname?.charAt(0) }}
          </el-avatar>
          <div class="review-user-info">
            <div class="user-name">
              {{ review.user.nickname || review.user.username }}
            </div>
            <div class="review-meta">
              <el-rate
                v-model="review.rating"
                disabled
                size="small"
              />
              <span class="review-date">{{ formatDate(review.createdAt) }}</span>
            </div>
          </div>
          <el-tag
            v-if="review.type === 'received'"
            type="success"
          >
            收到的评价
          </el-tag>
          <el-tag
            v-else
            type="primary"
          >
            发出的评价
          </el-tag>
        </div>

        <div class="review-item-info">
          <img
            :src="getItemImage(review.item)"
            :alt="review.item.title"
            class="item-thumb"
          >
          <div class="item-info">
            <div class="item-title">
              {{ review.item.title }}
            </div>
            <div class="item-price">
              ¥{{ review.item.price }}/{{ getBillingTypeText(review.item.billingType) }}
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

        <div
          v-if="review.reply"
          class="review-reply"
        >
          <div class="reply-header">
            <el-icon><ChatDotRound /></el-icon>
            <span>回复:</span>
          </div>
          <p class="reply-content">
            {{ review.reply }}
          </p>
        </div>

        <div class="review-actions">
          <el-button
            v-if="!review.reply && review.type === 'received'"
            text
            size="small"
            @click="handleReply(review)"
          >
            回复
          </el-button>
          <el-button
            text
            size="small"
            @click="handleViewOrder(review)"
          >
            查看订单
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredReviews.length === 0"
        description="暂无评价记录"
        :image-size="200"
      />
    </div>

    <!-- 分页 -->
    <div
      v-if="total > pageSize"
      class="pagination"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
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
import { ChatDotRound } from '@element-plus/icons-vue'

interface User {
  id: number
  username: string
  nickname?: string
  avatarUrl: string
}

interface Item {
  id: number
  title: string
  images: string[]
  price: number
  billingType: string
}

interface Review {
  id: number
  user: User
  item: Item
  rating: number
  comment: string
  images?: string[]
  reply?: string
  createdAt: number
  type: 'given' | 'received'
}

interface Stats {
  averageRating: number
  totalReviews: number
  positiveRate: number
}

interface Props {
  reviews: Review[]
  stats: Stats
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  reviews: () => [],
  stats: () => ({ averageRating: 0, totalReviews: 0, positiveRate: 0 }),
  loading: false
})

const emit = defineEmits<{
  'reply': [review: Review]
  'view-order': [review: Review]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const typeFilter = ref<string | null>(null)
const ratingFilter = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

const filteredReviews = computed(() => {
  let reviews = props.reviews
  
  if (typeFilter.value) {
    reviews = reviews.filter(r => r.type === typeFilter.value)
  }
  
  if (ratingFilter.value !== null) {
    reviews = reviews.filter(r => Math.floor(r.rating) === ratingFilter.value)
  }
  
  return reviews
})

const total = computed(() => filteredReviews.value.length)

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleReply = (review: Review) => {
  emit('reply', review)
}

const handleViewOrder = (review: Review) => {
  emit('view-order', review)
}

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const getItemImage = (item: Item) => {
  return item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://via.placeholder.com/100x100'
}

const getBillingTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'per_day': '天',
    'per_week': '周',
    'per_month': '月'
  }
  return typeMap[type] || '天'
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
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<template>
  <div class="review-records-tab">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-radio-group v-model="typeFilter" @change="handleFilterChange">
        <el-radio-button :label="null">全部</el-radio-button>
        <el-radio-button label="given">我发布的评价</el-radio-button>
        <el-radio-button label="received">我收到的评价</el-radio-button>
      </el-radio-group>

      <el-select v-model="ratingFilter" placeholder="评分筛选" clearable @change="handleFilterChange">
        <el-option label="全部评分" :value="null" />
        <el-option label="5星" :value="5" />
        <el-option label="4星" :value="4" />
        <el-option label="3星" :value="3" />
        <el-option label="2星" :value="2" />
        <el-option label="1星" :value="1" />
      </el-select>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.averageRating }}</div>
          <div class="stat-label">平均评分</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalReviews }}</div>
          <div class="stat-label">总评价数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👍</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.positiveRate }}%</div>
          <div class="stat-label">好评率</div>
        </div>
      </div>
    </div>

    <!-- 评价列表 -->
    <div v-loading="loading" class="reviews-list">
      <div
        v-for="review in filteredReviews"
        :key="review.id"
        class="review-card"
      >
        <div class="review-header">
          <el-avatar :size="48" :src="review.user.avatarUrl">
            {{ review.user.nickname?.charAt(0) }}
          </el-avatar>
          <div class="review-user-info">
            <div class="user-name">{{ review.user.nickname || review.user.username }}</div>
            <div class="review-meta">
              <el-rate v-model="review.rating" disabled size="small" />
              <span class="review-date">{{ formatDate(review.createdAt) }}</span>
            </div>
          </div>
          <el-tag v-if="review.type === 'received'" type="success">收到的评价</el-tag>
          <el-tag v-else type="primary">发出的评价</el-tag>
        </div>

        <div class="review-item-info">
          <img :src="getItemImage(review.item)" :alt="review.item.title" class="item-thumb">
          <div class="item-info">
            <div class="item-title">{{ review.item.title }}</div>
            <div class="item-price">¥{{ review.item.price }}/{{ getBillingTypeText(review.item.billingType) }}</div>
          </div>
        </div>

        <div class="review-content">
          <p>{{ review.comment }}</p>
        </div>

        <div v-if="review.images && review.images.length > 0" class="review-images">
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

        <div v-if="review.reply" class="review-reply">
          <div class="reply-header">
            <el-icon><ChatDotRound /></el-icon>
            <span>回复:</span>
          </div>
          <p class="reply-content">{{ review.reply }}</p>
        </div>

        <div class="review-actions">
          <el-button v-if="!review.reply && review.type === 'received'" text size="small" @click="handleReply(review)">
            回复
          </el-button>
          <el-button text size="small" @click="handleViewOrder(review)">
            查看订单
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredReviews.length === 0"
        description="暂无评价记录"
        :image-size="200"
      />
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
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
import { ChatDotRound } from '@element-plus/icons-vue'

interface User {
  id: number
  username: string
  nickname?: string
  avatarUrl: string
}

interface Item {
  id: number
  title: string
  images: string[]
  price: number
  billingType: string
}

interface Review {
  id: number
  user: User
  item: Item
  rating: number
  comment: string
  images?: string[]
  reply?: string
  createdAt: number
  type: 'given' | 'received'
}

interface Stats {
  averageRating: number
  totalReviews: number
  positiveRate: number
}

interface Props {
  reviews: Review[]
  stats: Stats
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  reviews: () => [],
  stats: () => ({ averageRating: 0, totalReviews: 0, positiveRate: 0 }),
  loading: false
})

const emit = defineEmits<{
  'reply': [review: Review]
  'view-order': [review: Review]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const typeFilter = ref<string | null>(null)
const ratingFilter = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

const filteredReviews = computed(() => {
  let reviews = props.reviews
  
  if (typeFilter.value) {
    reviews = reviews.filter(r => r.type === typeFilter.value)
  }
  
  if (ratingFilter.value !== null) {
    reviews = reviews.filter(r => Math.floor(r.rating) === ratingFilter.value)
  }
  
  return reviews
})

const total = computed(() => filteredReviews.value.length)

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleReply = (review: Review) => {
  emit('reply', review)
}

const handleViewOrder = (review: Review) => {
  emit('view-order', review)
}

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const getItemImage = (item: Item) => {
  return item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://via.placeholder.com/100x100'
}

const getBillingTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'per_day': '天',
    'per_week': '周',
    'per_month': '月'
  }
  return typeMap[type] || '天'
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
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
.review-records-tab {
  padding: var(--spacing-lg);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  color: #fff;
}

.stat-icon {
  font-size: 32px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 评价列表 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  min-height: 400px;
}

.review-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.review-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.review-user-info {
  flex: 1;
}

.user-name {
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
  color: var(--text-secondary);
}

.review-item-info {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-md);
}

.item-thumb {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.item-price {
  font-size: 13px;
  color: var(--danger-color);
  font-weight: 600;
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

.review-reply {
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--brand-primary);
  margin-bottom: var(--spacing-md);
}

.reply-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-primary);
  margin-bottom: var(--spacing-xs);
}

.reply-content {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.review-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color-light);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

/* 响应式 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .review-header {
    flex-wrap: wrap;
  }
}
</style>

<style scoped>
.review-records-tab {
  padding: var(--spacing-lg);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  color: #fff;
}

.stat-icon {
  font-size: 32px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 评价列表 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  min-height: 400px;
}

.review-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.review-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.review-user-info {
  flex: 1;
}

.user-name {
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
  color: var(--text-secondary);
}

.review-item-info {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-md);
}

.item-thumb {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.item-price {
  font-size: 13px;
  color: var(--danger-color);
  font-weight: 600;
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

.review-reply {
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--brand-primary);
  margin-bottom: var(--spacing-md);
}

.reply-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-primary);
  margin-bottom: var(--spacing-xs);
}

.reply-content {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.review-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color-light);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color-light);
}

/* 响应式 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .review-header {
    flex-wrap: wrap;
  }
}
</style>
