<template>
  <div class="my-reviews-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>我的评价</h1>
        <p class="page-desc">
          管理您发布和收到的评价
        </p>
      </div>

      <!-- 标签切换 -->
      <el-tabs
        v-model="activeTab"
        @tab-change="handleTabChange"
      >
        <el-tab-pane
          label="我发出的评价"
          name="sent"
        >
          <template #label>
            <span>我发出的评价</span>
            <el-badge
              v-if="sentCount > 0"
              :value="sentCount"
            />
          </template>
        </el-tab-pane>
        <el-tab-pane
          label="我收到的评价"
          name="received"
        >
          <template #label>
            <span>我收到的评价</span>
            <el-badge
              v-if="receivedCount > 0"
              :value="receivedCount"
            />
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 筛选条件 -->
      <div class="filter-bar">
        <div class="filter-left">
          <el-select
            v-model="filterRating"
            placeholder="筛选评分"
            clearable
            style="width: 120px"
          >
            <el-option
              label="全部评分"
              value=""
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
          
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </div>
        
        <div class="filter-right">
          <el-button @click="resetFilters">
            重置
          </el-button>
          <el-button
            type="primary"
            @click="exportReviews"
          >
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <!-- 评价列表 -->
      <div class="reviews-container">
        <div
          v-if="loading"
          class="loading-container"
        >
          <el-skeleton
            :rows="5"
            animated
          />
        </div>
        
        <div
          v-else-if="currentReviews.length > 0"
          class="review-list"
        >
          <div
            v-for="review in currentReviews"
            :key="review.id"
            class="review-item"
          >
            <!-- 评价头部 -->
            <div class="review-header">
              <div class="user-info">
                <div class="user-avatar">
                  <img
                    :src="review.reviewer?.avatarUrl || review.reviewer?.avatar || '/default-avatar.png'"
                    :alt="review.reviewer?.username"
                  >
                </div>
                <div class="user-details">
                  <div class="user-name">
                    {{ activeTab === 'sent' ? '评价给：' + review.targetUser?.username : '来自：' + review.reviewer?.username }}
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
              
              <div class="review-actions">
                <el-button
                  v-if="activeTab === 'sent'"
                  type="text"
                  size="small"
                  @click="editReview(review)"
                >
                  编辑
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="viewDetail(review)"
                >
                  详情
                </el-button>
                <el-button
                  v-if="activeTab === 'sent'"
                  type="text"
                  size="small"
                  @click="deleteReview(review)"
                >
                  删除
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
                  v-for="(image, imageIndex) in review.images"
                  :key="imageIndex"
                  class="review-image"
                  @click="previewImage(review.images, Number(imageIndex))"
                >
                  <img
                    :src="image"
                    :alt="`评价图片${Number(imageIndex) + 1}`"
                  >
                </div>
              </div>

              <!-- 物品信息 -->
              <div
                v-if="review.item"
                class="review-item-info"
              >
                <div class="item-image">
                  <img
                    :src="review.item.images[0]"
                    :alt="review.item.title || review.item.name"
                  >
                </div>
                <div class="item-details">
                  <div class="item-name">
                    {{ review.item.title || review.item.name }}
                  </div>
                  <div class="item-price">
                    ¥{{ review.item.price }}
                  </div>
                  <div class="order-info">
                    订单号：{{ review.orderId }}
                  </div>
                </div>
              </div>

              <!-- 标签 -->
              <div
                v-if="review.tags && review.tags.length > 0"
                class="review-tags"
              >
                <el-tag
                  v-for="tag in review.tags"
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ getTagName(tag) }}
                </el-tag>
              </div>
            </div>

            <!-- 回复 -->
            <div
              v-if="review.replies && review.replies.length > 0"
              class="review-replies"
            >
              <div class="replies-header">
                <span class="replies-title">{{ review.replies.length }} 条回复</span>
              </div>
              <div
                v-for="reply in review.replies"
                :key="reply.id"
                class="reply-item"
              >
                <div class="reply-header">
                  <span class="reply-user">{{ reply.user?.nickname }}</span>
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
          :description="emptyDescription"
        >
          <el-button
            v-if="activeTab === 'sent'"
            type="primary"
            @click="$router.push('/items')"
          >
            去评价
          </el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div
        v-if="!loading && currentReviews.length > 0"
        class="pagination"
      >
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="currentTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { useUserStore } from '@/shared/stores/user'
import { 
  getMyReviews,
  getUserReviews,
  deleteReview as deleteReviewApi,
  exportReviews as exportReviewsApi
} from '@/shared/api/modules/review'

// 用户 store
const userStore = useUserStore()

// 路由
const router = useRouter()

// 响应式数据
const activeTab = ref<'sent' | 'received'>('sent')
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const filterRating = ref('')
const dateRange = ref<[string, string] | null>(null)

const sentReviews = ref<any[]>([])
const receivedReviews = ref<any[]>([])
const sentCount = ref(0)
const receivedCount = ref(0)

// 图片预览
const previewImages = reactive({
  show: false,
  urls: [] as string[],
  index: 0
})

// 计算属性
const currentReviews = computed(() => {
  return activeTab.value === 'sent' ? sentReviews.value : receivedReviews.value
})

const currentTotal = computed(() => {
  return activeTab.value === 'sent' ? sentCount.value : receivedCount.value
})

const emptyDescription = computed(() => {
  if (activeTab.value === 'sent') {
    return '您还没有发表过评价'
  } else {
    return '您还没有收到过评价'
  }
})

// 方法
const loadSentReviews = async () => {
  try {
    const response = await getMyReviews({
      page: currentPage.value,
      pageSize: pageSize.value,
      rating: filterRating.value ? parseInt(filterRating.value) : undefined
    })

    sentReviews.value = response.list || response.data || []
    sentCount.value = response.total
  } catch (error) {
    console.error('加载发出的评价失败:', error)
    ElMessage.error('加载评价列表失败')
  }
}

const loadReceivedReviews = async () => {
  try {
    // 这里需要获取当前用户ID
    const userId = getCurrentUserId()
    if (!userId) return

    const response = await getUserReviews(userId, {
      page: currentPage.value,
      pageSize: pageSize.value,
      rating: filterRating.value ? parseInt(filterRating.value) : undefined
    })

    receivedReviews.value = response.list || response.data || []
    receivedCount.value = response.total
  } catch (error) {
    console.error('加载收到的评价失败:', error)
    ElMessage.error('加载评价列表失败')
  }
}

const handleTabChange = (tabName: string) => {
  if (tabName === 'sent' || tabName === 'received') {
    activeTab.value = tabName as 'sent' | 'received'
    currentPage.value = 1
    loadReviews()
  }
}

const loadReviews = () => {
  loading.value = true
  
  if (activeTab.value === 'sent') {
    loadSentReviews()
  } else {
    loadReceivedReviews()
  }
  
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const resetFilters = () => {
  filterRating.value = ''
  dateRange.value = null
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

const editReview = (review: any) => {
  // 跳转到评价编辑页面
  router.push({
    path: `/reviews/${review.id}/edit`,
    query: { from: 'my-reviews' }
  })
}

const viewDetail = (review: any) => {
  // 跳转到评价详情页面
  router.push(`/reviews/${review.id}`)
}

const deleteReview = (review: any) => {
  ElMessageBox.confirm(
    '确定要删除这条评价吗？删除后无法恢复。',
    '删除评价',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteReviewApi(review.id)
      ElMessage.success('评价删除成功')
      loadReviews()
    } catch (error) {
      console.error('删除评价失败:', error)
      ElMessage.error('删除评价失败，请重试')
    }
  })
}

const exportReviews = async () => {
  try {
    const response = await exportReviewsApi({
      type: activeTab.value,
      rating: filterRating.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    })
    
    // 创建下载链接
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `评价记录_${activeTab.value === 'sent' ? '发出' : '收到'}_${new Date().toLocaleDateString()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

const previewImage = (images: string[], index: number) => {
  previewImages.urls = images
  previewImages.index = index
  previewImages.show = true
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

const getTagName = (tagId: string) => {
  const tagMap: { [key: string]: string } = {
    'quality_good': '质量好',
    'price_reasonable': '价格合理',
    'fast_delivery': '发货快',
    'good_service': '服务好',
    'as_described': '符合描述',
    'good_condition': '成色好',
    'practical': '实用',
    'well_packaged': '包装好'
  }
  return tagMap[tagId] || tagId
}

const getCurrentUserId = (): string | null => {
  // 从 user store 获取当前用户ID
  const id = userStore.userInfo.id
  if (!id) return null
  return String(id)
}

// 生命周期
onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
.my-reviews-page {
  padding: 20px 0;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.page-desc {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 10px;
}

.reviews-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.loading-container {
  padding: 40px 0;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
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

.review-item-info {
  display: flex;
  gap: 10px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 15px;
}

.item-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
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
  margin-bottom: 2px;
}

.order-info {
  font-size: 12px;
  color: #909399;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.review-replies {
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.replies-header {
  margin-bottom: 10px;
}

.replies-title {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
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
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filter-left {
    flex-direction: column;
    align-items: stretch;
  }
  
  .review-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .review-actions {
    align-self: flex-end;
  }
  
  .review-item-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>