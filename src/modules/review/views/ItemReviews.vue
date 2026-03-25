<template>
  <div class="item-reviews-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">
              首页
            </el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: `/items/${itemId}` }">
              物品详情
            </el-breadcrumb-item>
            <el-breadcrumb-item>用户评价</el-breadcrumb-item>
          </el-breadcrumb>
          <h1 class="page-title">
            用户评价
          </h1>
        </div>
        <div class="header-right">
          <el-button
            v-if="canWriteReview"
            type="primary"
            @click="showReviewForm"
          >
            <el-icon><EditPen /></el-icon>
            写评价
          </el-button>
        </div>
      </div>

      <!-- 物品信息概要 -->
      <el-card
        v-if="itemInfo"
        class="item-summary"
      >
        <div class="item-content">
          <div class="item-image">
            <img
              :src="itemInfo.images[0]"
              :alt="itemInfo.name"
            >
          </div>
          <div class="item-details">
            <h2 class="item-name">
              {{ itemInfo.name }}
            </h2>
            <p class="item-price">
              ¥{{ itemInfo.price }}
            </p>
            <p class="item-description">
              {{ itemInfo.description }}
            </p>
            <div class="item-meta">
              <span class="location">{{ itemInfo.location }}</span>
              <span class="category">{{ itemInfo.category?.name }}</span>
              <span
                class="status"
                :class="itemInfo.status"
              >{{ getStatusText(itemInfo.status) }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 评价统计概览 -->
      <ReviewStats
        v-if="reviewStats"
        :stats="reviewStats"
      />

      <!-- 评价列表 -->
      <ReviewList
        type="item"
        :target-id="itemId"
        :show-stats="false"
        :show-filters="true"
        :show-actions="true"
        :show-item-info="false"
        :can-review="canWriteReview"
        @write-review="showReviewForm"
        @reply="handleReply"
        @report="handleReport"
      />
    </div>

    <!-- 评价表单对话框 -->
    <ReviewForm
      v-model="reviewFormVisible"
      :item-info="itemInfo"
      :order-id="userOrderId"
      @success="handleReviewSuccess"
    />

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复评价"
      width="500px"
    >
      <el-form
        :model="replyForm"
        label-width="60px"
      >
        <el-form-item
          label="回复内容"
          required
        >
          <el-input
            v-model="replyForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容..."
            :maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submittingReply"
            @click="submitReply"
          >
            发送回复
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen } from '@element-plus/icons-vue'
import ReviewStats from '../components/ReviewStats.vue'
import ReviewList from '../components/ReviewList.vue'
import ReviewForm from '../components/ReviewForm.vue'
import {
  getItemReviews,
  getReviewStats as getItemReviewStats,
  canReview as checkCanReview,
  reportReview
} from '@/shared/api/modules/review'
import { getItemDetail } from '@/shared/api/modules/item'
import type { Review } from '@/shared/types/models'

// 路由
const route = useRoute()
const itemId = route.params.id as string

// 响应式数据
const itemInfo = ref<any>(null)
const reviewStats = ref<any>(null)
const canWriteReview = ref(false)
const userOrderId = ref<string>()
const reviewFormVisible = ref(false)
const replyDialogVisible = ref(false)
const submittingReply = ref(false)

// 回复表单
const replyForm = ref({
  reviewId: '',
  content: ''
})

// 方法
const loadItemInfo = async () => {
  try {
    const response = await getItemDetail(itemId)
    itemInfo.value = response
  } catch (error) {
    console.error('加载物品信息失败:', error)
    ElMessage.error('加载物品信息失败')
  }
}

const loadReviewStats = async () => {
  try {
    const response = await getItemReviewStats(itemId)
    reviewStats.value = response
  } catch (error) {
    console.error('加载评价统计失败:', error)
  }
}

const checkReviewPermission = async () => {
  try {
    // 这里需要从订单列表中找到相关的订单ID
    // 暂时使用模拟数据
    const response = await checkCanReview('123') // 需要实际的订单ID
    canWriteReview.value = response.canReview
    if (response.canReview) {
      userOrderId.value = '123' // 需要实际的订单ID
    }
  } catch (error) {
    console.error('检查评价权限失败:', error)
  }
}

const showReviewForm = () => {
  if (!canWriteReview.value) {
    ElMessage.warning('您还没有完成交易，无法评价')
    return
  }
  reviewFormVisible.value = true
}

const handleReviewSuccess = (review: any) => {
  ElMessage.success('评价提交成功')
  // 重新加载评价统计
  loadReviewStats()
}

const handleReply = (review: Review) => {
  replyForm.value.reviewId = review.id
  replyForm.value.content = ''
  replyDialogVisible.value = true
}

const handleReport = (review: Review) => {
  ElMessageBox.confirm(
    '确定要举报这条评价吗？',
    '举报评价',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await reportReview(review.id, {
        reason: '不当内容'
      })
      ElMessage.success('举报成功，我们会尽快处理')
    } catch (error) {
      console.error('举报失败:', error)
      ElMessage.error('举报失败，请重试')
    }
  })
}

const submitReply = async () => {
  if (!replyForm.value.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  submittingReply.value = true

  try {
    // TODO: 后端尚未实现评价回复功能，暂时注释掉
    // await createReviewReply(replyForm.value.reviewId, {
    //   content: replyForm.value.content
    // })

    ElMessage.info('评价回复功能开发中')
    replyDialogVisible.value = false
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败，请重试')
  } finally {
    submittingReply.value = false
  }
}

const getStatusText = (status: string) => {
  const statusMap = {
    available: '可用',
    reserved: '已预留',
    borrowed: '已借出',
    unavailable: '不可用'
  }
  return statusMap[status] || status
}

// 生命周期
onMounted(() => {
  Promise.all([
    loadItemInfo(),
    loadReviewStats(),
    checkReviewPermission()
  ])
})
</script>

<style scoped>
.item-reviews-page {
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 10px 0 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  flex-shrink: 0;
}

.item-summary {
  margin-bottom: 20px;
}

.item-content {
  display: flex;
  gap: 20px;
}

.item-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
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
}

.item-name {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.item-price {
  margin: 0 0 15px;
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

.item-description {
  margin: 0 0 15px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.item-meta span {
  font-size: 14px;
  color: #909399;
}

.item-meta .status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.item-meta .status.available {
  background-color: #67c23a;
}

.item-meta .status.reserved {
  background-color: #e6a23c;
}

.item-meta .status.borrowed {
  background-color: #409eff;
}

.item-meta .status.unavailable {
  background-color: #f56c6c;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .header-right {
    align-self: flex-end;
  }
  
  .item-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .item-image {
    width: 100%;
    height: 200px;
  }
  
  .item-meta {
    justify-content: flex-start;
  }
}
</style>