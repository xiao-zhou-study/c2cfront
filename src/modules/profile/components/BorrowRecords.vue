<template>
  <div class="borrow-records">

    <div class="search-bar">
      <div class="search-bar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="按物品名称或卖家搜索"
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button
          type="primary"
          :loading="borrowLoading"
          @click="() => fetchBorrowOrders(true)"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      <div class="search-bar-right">
        <el-select
          v-model="timeFilter"
          placeholder="按时间筛选"
          clearable
          class="time-select"
          @change="() => fetchBorrowOrders(true)"
        >
          <el-option label="全部时间" value="" />
          <el-option label="最近7天" value="7" />
          <el-option label="最近30天" value="30" />
          <el-option label="最近90天" value="90" />
        </el-select>
      </div>
    </div>

    <el-tabs
      v-model="borrowStatusFilter"
      class="status-tabs"
      @tab-change="() => fetchBorrowOrders(true)"
    >
      <el-tab-pane label="全部" :name="0" />
      <el-tab-pane label="待确认" :name="1" />
      <el-tab-pane label="待付款" :name="2" />
      <el-tab-pane label="交易中" :name="3" />
      <el-tab-pane label="待评价" :name="4" />
      <el-tab-pane label="已完成" :name="5" />
      <el-tab-pane label="已取消" :name="6" />
      <el-tab-pane label="已拒绝" :name="7" />
    </el-tabs>

    <div
      v-if="borrowLoading"
      class="loading-wrap"
    >
      <el-skeleton :rows="4" animated />
    </div>
    <div
      v-else-if="borrowOrders.length === 0"
      class="empty-wrap"
    >
      <el-empty description="暂无买到记录" />
    </div>
    <div
      v-else
      class="order-cards"
    >
      <div
        v-for="order in borrowOrders"
        :key="order.id"
        class="order-card"
        @click="openDetail(order)"
      >
        <div class="card-main">
          <div class="order-row">
            <span class="label">物品：</span>
            <span class="value">{{ order.itemName }}</span>
          </div>
          <div class="order-row">
            <span class="label">卖家：</span>
            <span class="value">{{ order.sellerName }}</span>
          </div>
          <div class="order-row">
            <span class="label price">¥{{ order.price }}</span>
          </div>
          <div class="order-row">
            <el-tag :type="statusTagType(order.status)">
              {{ statusText(order.status) }}
            </el-tag>
            <span class="muted time">{{ formatTimestamp(order.createdAt) }}</span>
          </div>
        </div>
        <div class="card-actions">
          <el-button
            size="default"
            type="primary"
            @click.stop="openDetail(order)"
          >
            查看详情
          </el-button>
        </div>
      </div>
      <div
        v-if="total > pageSize"
        class="pagination-wrap"
      >
        <el-pagination
          :current-page="pageNo"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="onPageChange"
        />
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="520px"
      class="order-detail-dialog"
      destroy-on-close
      @closed="detailOrder = null"
    >
      <div
        v-if="detailLoading"
        class="detail-loading"
      >
        <el-skeleton :rows="6" animated />
      </div>
      <template v-else-if="detailOrder">
        <div class="detail-card">
          <!-- 商品信息 -->
          <div class="detail-item-card">
            <div class="detail-item-cover-wrap">
              <el-image
                v-if="firstDetailImage"
                :src="firstDetailImage"
                fit="cover"
                class="detail-item-cover"
              >
                <template #error>
                  <div class="detail-cover-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div
                v-else
                class="detail-cover-placeholder"
              >
                <el-icon><Picture /></el-icon>
              </div>
            </div>
            <div class="detail-item-info">
              <div class="detail-title-row">
                <h3 class="detail-item-title">{{ detailOrder.itemName }}</h3>
                <el-tag
                  class="detail-status-badge"
                  :type="statusTagType(detailOrder.status)"
                >
                  {{ statusText(detailOrder.status) }}
                </el-tag>
              </div>
              <p class="detail-order-no">订单号：{{ detailOrder.id }}</p>
              <div class="detail-price-row">
                <span class="detail-price">¥{{ detailOrder.price }}</span>
              </div>
              <p
                v-if="detailOrder.purpose"
                class="detail-purpose"
              >
                用途：{{ detailOrder.purpose }}
              </p>
            </div>
          </div>

          <!-- 卖家信息 -->
          <div class="detail-party">
            <div class="detail-party-label">卖家</div>
            <div class="detail-party-info">
              <el-avatar
                :size="40"
                :src="detailOrder.sellerAvatarUrl"
                class="detail-party-avatar"
              >
                {{ (detailOrder.sellerName || '卖').slice(0, 1) }}
              </el-avatar>
              <span class="detail-party-name">{{ detailOrder.sellerName }}</span>
            </div>
            <p
              v-if="detailOrder.purpose"
              class="detail-party-extra"
            >
              用途：{{ detailOrder.purpose }}
            </p>
            <p class="detail-party-extra">
              创建时间：{{ formatTimestamp(detailOrder.createdAt) }}
            </p>
          </div>

          <!-- 时间线 -->
          <el-descriptions
            title="订单时间"
            :column="2"
            border
            size="small"
            class="detail-section"
          >
            <el-descriptions-item label="创建时间">{{ formatTimestamp(detailOrder.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="确认时间">{{ formatTimestamp(detailOrder.confirmTime) }}</el-descriptions-item>
            <el-descriptions-item label="付款时间">{{ formatTimestamp(detailOrder.payTime) }}</el-descriptions-item>
            <el-descriptions-item label="交易时间">{{ formatTimestamp(detailOrder.borrowTime) }}</el-descriptions-item>
          </el-descriptions>

          <!-- 操作按钮 -->
          <div class="detail-actions">
            <template v-if="detailOrder.status === 1">
              <el-button
                type="warning"
                plain
                :loading="detailActionLoading === 'cancel'"
                @click="handleDetailCancel"
              >
                取消申请
              </el-button>
            </template>
            <template v-else-if="detailOrder.status === 2">
              <el-button
                type="primary"
                :loading="detailActionLoading === 'pay'"
                @click="handleDetailPay"
              >
                去付款
              </el-button>
              <el-button
                type="default"
                plain
                :loading="detailActionLoading === 'cancel'"
                @click="handleDetailCancel"
              >
                取消申请
              </el-button>
            </template>
            <template v-else-if="detailOrder.status === 3">
              <el-button
                type="primary"
                :loading="detailActionLoading === 'confirm'"
                @click="handleDetailConfirmReceive"
              >
                确认收货
              </el-button>
            </template>
            <template v-else-if="detailOrder.status === 4">
              <el-button
                type="primary"
                :loading="detailActionLoading === 'review'"
                @click="handleDetailReview"
              >
                去评价
              </el-button>
            </template>
            <template v-else-if="detailOrder.status === 5">
              <span class="detail-actions-tip">交易已完成</span>
            </template>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 评价弹窗 -->
    <el-dialog
      v-model="reviewVisible"
      title="评价订单"
      width="480px"
      class="review-dialog"
      destroy-on-close
    >
      <div class="review-form">
        <div class="review-item">
          <span class="review-label">物品名称</span>
          <span class="review-value">{{ detailOrder?.itemName || '未知物品' }}</span>
        </div>
        <div class="review-item">
          <span class="review-label">评分</span>
          <el-rate
            v-model="reviewForm.rating"
            :max="5"
            show-text
            :texts="['极差', '差', '一般', '满意', '非常满意']"
          />
        </div>
        <div class="review-item">
          <span class="review-label">评价内容</span>
          <el-input
            v-model="reviewForm.content"
            type="textarea"
            :rows="4"
            placeholder="分享你的购物体验吧…"
            maxlength="200"
            show-word-limit
          />
        </div>
        <div class="review-item">
          <label class="review-label review-checkbox-label">
            <el-checkbox v-model="reviewForm.isAnonymous" />
            匿名评价
          </label>
        </div>
      </div>
      <template #footer>
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="detailActionLoading === 'review'"
          :disabled="!reviewForm.rating"
          @click="submitReview"
        >
          提交评价
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, Picture } from '@element-plus/icons-vue'
import { orderApi } from '@/shared/api'
import { usePay } from '@/modules/orders/composables/usePay'
import type { BorrowOrderItem } from '@/shared/api/modules/order'
import { formatTimestamp } from '@/shared/utils/format'

const borrowLoading = ref(false)
const borrowOrders = ref<BorrowOrderItem[]>([])
const borrowStatusFilter = ref(0)
const searchKeyword = ref('')
const timeFilter = ref('')
const pageNo = ref(1)
const pageSize = ref(20)
const total = ref(0)

const router = useRouter()
const { paying, startPay } = usePay()

const detailVisible = ref(false)
const detailOrder = ref<BorrowOrderItem | null>(null)
const detailLoading = ref(false)
const detailActionLoading = ref<string | null>(null)

const reviewVisible = ref(false)
const reviewForm = ref({ rating: 0, content: '', isAnonymous: false })

const firstDetailImage = computed(() => {
  const imgs = detailOrder.value?.itemImageUrl
  if (imgs && imgs.length > 0) return imgs[0]
  return ''
})

function getTimeRange(): { startTime?: number; endTime?: number } {
  const days = timeFilter.value ? Number(timeFilter.value) : 0
  if (days <= 0) return {}
  const endTime = Date.now()
  const startTime = endTime - days * 24 * 60 * 60 * 1000
  return { startTime, endTime }
}

function statusText(status: number) {
  const map: Record<number, string> = {
    1: '待确认',
    2: '待付款',
    3: '交易中',
    4: '待评价',
    5: '已完成',
    6: '已取消',
    7: '已拒绝'
  }
  return map[status] ?? '未知'
}

function statusTagType(status: number) {
  const map: Record<number, string> = {
    1: 'warning',
    2: 'warning',
    3: 'primary',
    4: 'info',
    5: 'success',
    6: 'default',
    7: 'danger'
  }
  return map[status] ?? 'info'
}

async function fetchBorrowOrders(resetPage = false) {
  if (resetPage) pageNo.value = 1
  try {
    borrowLoading.value = true
    const { startTime, endTime } = getTimeRange()
    const res = await orderApi.getBorrowOrdersPageIn({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value.trim() || undefined,
      startTime,
      endTime,
      status: borrowStatusFilter.value || undefined
    })
    borrowOrders.value = res?.list ?? []
    total.value = res?.total ?? 0
  } catch (e) {
    console.error('获取买到记录失败:', e)
    ElMessage.error('获取买到记录失败')
    borrowOrders.value = []
    total.value = 0
  } finally {
    borrowLoading.value = false
  }
}

function onPageChange(p: number) {
  pageNo.value = p
  fetchBorrowOrders()
}

function openDetail(order: BorrowOrderItem) {
  detailOrder.value = order
  detailVisible.value = true
}

async function handleDetailCancel() {
  const order = detailOrder.value
  if (!order) return
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', {
      confirmButtonText: '确定取消',
      cancelButtonText: '我再想想',
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    detailActionLoading.value = 'cancel'
    await orderApi.cancelBorrowOrder(order.id, order.version)
    ElMessage.success('已取消订单')
    detailVisible.value = false
    await fetchBorrowOrders(true)
  } catch (e) {
    console.error('取消订单失败:', e)
  } finally {
    detailActionLoading.value = null
  }
}

async function handleDetailPay() {
  const order = detailOrder.value
  if (!order) return

  // 先打开空白窗口（必须在点击事件中同步执行，避免浏览器弹窗拦截）
  const win = window.open('', '_blank')
  if (!win) {
    ElMessage.warning('请允许浏览器弹窗，否则无法完成支付')
    return
  }

  try {
    detailActionLoading.value = 'pay'
    detailVisible.value = false
    await startPay(order.id, order.version, win)
  } catch (e: any) {
    win.close()
    console.error('发起支付失败:', e)
  } finally {
    detailActionLoading.value = null
  }
}

async function handleDetailConfirmReceive() {
  const order = detailOrder.value
  if (!order) return
  try {
    detailActionLoading.value = 'confirm'
    await orderApi.confirmReceiveOrder(order.id, order.version)
    ElMessage.success('已确认收货')
    detailVisible.value = false
    await fetchBorrowOrders(true)
  } catch (e) {
    console.error('确认收货失败:', e)
  } finally {
    detailActionLoading.value = null
  }
}

function handleDetailReview() {
  reviewForm.value = { rating: 0, content: '', isAnonymous: false }
  reviewVisible.value = true
}

async function submitReview() {
  const order = detailOrder.value
  if (!order) return
  if (!reviewForm.value.rating) {
    ElMessage.warning('请先评分')
    return
  }
  try {
    detailActionLoading.value = 'review'
    await orderApi.reviewOrder({
      id: order.id,
      rating: reviewForm.value.rating,
      content: reviewForm.value.content.trim() || undefined,
      isAnonymous: reviewForm.value.isAnonymous
    })
    ElMessage.success('评价已提交')
    reviewVisible.value = false
    detailVisible.value = false
    await fetchBorrowOrders(true)
  } catch (e) {
    console.error('评价失败:', e)
  } finally {
    detailActionLoading.value = null
  }
}

async function refresh() {
  await fetchBorrowOrders(true)
}

onMounted(() => {
  fetchBorrowOrders(true)
})

defineExpose({ refresh })
</script>

<style scoped>
.borrow-records {
  padding: 0 4px;
}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 240px;
}

.search-bar-right {
  margin-left: auto;
}

.time-select {
  width: 140px;
}

.status-tabs {
  margin-bottom: 16px;
}

.status-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

.status-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0;
  overflow: visible;
}

.status-tabs :deep(.el-tabs__nav-scroll) {
  padding: 0;
  overflow: visible;
}

.status-tabs :deep(.el-tabs__nav) {
  padding: 0;
  margin: 0;
  gap: 8px;
  width: 100%;
}

.status-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.status-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

.status-tabs :deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.status-tabs :deep(.el-tabs__item:first-child) {
  margin-left: 0;
}

.status-tabs :deep(.el-tabs__item:last-child) {
  margin-right: 0;
}

.status-tabs :deep(.el-tabs__item.is-active) {
  color: white;
  background: linear-gradient(135deg, #409EFF 0%, #66B1FF 100%);
}

.status-tabs :deep(.el-tabs__content) {
  display: none;
}

.loading-wrap,
.empty-wrap {
  padding: 24px 0;
}

.order-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.order-card {
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  cursor: pointer;
}

.order-card:hover {
  border-color: #c0c4cc;
  background: #f5f7fa;
}

.card-main {
  flex: 1;
  min-width: 0;
}

.order-row {
  font-size: 14px;
  margin-bottom: 6px;
}

.order-row .label {
  color: #909399;
  margin-right: 4px;
}

.order-row .label.price {
  color: #f56c6c;
  font-weight: 600;
}

.order-row .value {
  color: #303133;
}

.order-row .muted {
  color: #909399;
  font-size: 13px;
}

.order-row .time {
  margin-left: 8px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 订单详情弹窗 */
.detail-loading {
  padding: 16px 0;
}

.detail-card {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-item-card {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.detail-item-cover-wrap {
  flex-shrink: 0;
}

.detail-item-cover {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.detail-cover-placeholder {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 28px;
}

.detail-item-info {
  flex: 1;
  min-width: 0;
}

.detail-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.detail-item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
  min-width: 0;
}

.detail-status-badge {
  flex-shrink: 0;
}

.detail-order-no {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #909399;
}

.detail-price-row {
  font-size: 14px;
  margin-bottom: 6px;
}

.detail-price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.detail-purpose {
  margin: 8px 0 0 0;
  font-size: 13px;
  color: #606266;
}

.detail-party {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.detail-party-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.detail-party-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-party-name {
  font-size: 14px;
  color: #303133;
}

.detail-party-extra {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #606266;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section :deep(.el-descriptions__title) {
  font-size: 14px;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.detail-actions-tip {
  color: #909399;
  font-size: 13px;
}

/* 评价弹窗 */
.review-dialog .review-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.review-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.review-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}
.review-checkbox-label {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.review-value {
  font-size: 14px;
  color: #303133;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
