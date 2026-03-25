<template>
  <div class="profile-order-list">
    <!-- 待我处理（作为出借人）：他人向我发起的借用申请 -->
    <section class="order-section">
      <h3 class="section-title">
        <el-icon><Bell /></el-icon>
        待我处理
      </h3>
      <p class="section-desc">他人向您发起的借用申请，请查看对方信息后选择允许或拒绝</p>

      <div
        v-if="lendLoading"
        class="loading-wrap"
      >
        <el-skeleton :rows="3" animated />
      </div>
      <div
        v-else-if="pendingOrders.length === 0"
        class="empty-wrap"
      >
        <el-empty description="暂无待处理订单" />
      </div>
      <div
        v-else
        class="order-cards"
      >
        <div
          v-for="order in pendingOrders"
          :key="order.id"
          class="order-card pending-card"
        >
          <div class="card-main">
            <div class="order-row">
              <span class="label">物品：</span>
              <span class="value">{{ order.title }}</span>
            </div>
            <div class="order-row">
              <span class="label">借用人：</span>
              <span class="value">{{ borrowerName(order) }}</span>
            </div>
            <div class="order-row">
              <span class="label">借用天数：</span>
              <span class="value">{{ order.borrowDays }} 天</span>
            </div>
            <div class="order-row">
              <span class="label">用途：</span>
              <span class="value">{{ order.purpose || '-' }}</span>
            </div>
            <div class="order-row muted">
              {{ formatTimestamp(order.createdAt) }} 申请
            </div>
          </div>
          <div class="card-actions">
            <el-button
              size="default"
              @click="showBorrowerInfo(order)"
            >
              查看对方信息
            </el-button>
            <el-button
              type="success"
              :loading="actionOrderId === order.id && allowLoading"
              @click="handleAllow(order)"
            >
              允许
            </el-button>
            <el-button
              type="danger"
              plain
              :loading="actionOrderId === order.id && rejectLoading"
              @click="handleReject(order)"
            >
              拒绝
            </el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- 我发起的：我向他人发起的借用订单 -->
    <section class="order-section">
      <h3 class="section-title">
        <el-icon><List /></el-icon>
        我发起的
      </h3>
      <p class="section-desc">您发起的借用申请与订单记录</p>

      <div class="toolbar">
        <el-select
          v-model="statusFilter"
          size="default"
          placeholder="全部状态"
          class="status-select"
          @change="fetchMyOrders"
        >
          <el-option label="全部" :value="0" />
          <el-option label="待确认" :value="ORDER_STATUS.PENDING" />
          <el-option label="待付款" :value="ORDER_STATUS.WAIT_PAY" />
          <el-option label="借用中" :value="ORDER_STATUS.BORROWING" />
          <el-option label="待归还确认" :value="ORDER_STATUS.WAIT_RETURN_CONFIRM" />
          <el-option label="已完成" :value="ORDER_STATUS.COMPLETED" />
          <el-option label="已取消" :value="ORDER_STATUS.CANCELLED" />
          <el-option label="已拒绝" :value="ORDER_STATUS.REJECTED" />
          <el-option label="争议中" :value="ORDER_STATUS.DISPUTE" />
        </el-select>
        <el-button
          type="primary"
          :loading="borrowLoading"
          @click="fetchMyOrders"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <div
        v-if="borrowLoading"
        class="loading-wrap"
      >
        <el-skeleton :rows="4" animated />
      </div>
      <div
        v-else-if="myOrders.length === 0"
        class="empty-wrap"
      >
        <el-empty description="暂无发起的订单" />
      </div>
      <div
        v-else
        class="order-cards my-orders"
      >
        <div
          v-for="order in myOrders"
          :key="order.id"
          class="order-card"
          @click="goDetail(order)"
        >
          <div class="card-main">
            <div class="order-row">
              <span class="label">物品：</span>
              <span class="value">{{ order.title }}</span>
            </div>
            <div class="order-row">
              <span class="label">出借人：</span>
              <span class="value">{{ lenderName(order) }}</span>
            </div>
            <div class="order-row">
              <span class="label">¥{{ order.price }}</span>
              <span class="muted">/{{ billingLabel(order.billingType) }}</span>
              <span class="muted"> · {{ order.borrowDays }} 天 · 共 ¥{{ order.totalAmount }}</span>
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
              @click.stop="goDetail(order)"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- 借用人信息弹窗 -->
    <el-dialog
      v-model="borrowerDialogVisible"
      title="借用人信息"
      width="420px"
      class="borrower-dialog"
    >
      <template v-if="currentBorrowerOrder">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="昵称">
            {{ borrowerName(currentBorrowerOrder) }}
          </el-descriptions-item>
          <el-descriptions-item label="用途">
            {{ currentBorrowerOrder.purpose || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="借用天数">
            {{ currentBorrowerOrder.borrowDays }} 天
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ formatTimestamp(currentBorrowerOrder.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
      <template v-if="currentBorrowerOrder" #footer>
        <el-button @click="borrowerDialogVisible = false">关闭</el-button>
        <el-button
          type="success"
          :loading="allowLoading"
          @click="onDialogAllow"
        >
          允许借用
        </el-button>
        <el-button
          type="danger"
          plain
          :loading="rejectLoading"
          @click="onDialogReject"
        >
          拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, List, Refresh } from '@element-plus/icons-vue'
import { orderApi } from '@/shared/api'
import { ORDER_STATUS } from '@/shared/utils/constants'
import { formatTimestamp } from '@/shared/utils/format'
import type { BorrowOrder } from '@/shared/types/models'

const props = defineProps<{
  currentUserId: string
}>()

const emit = defineEmits<{
  refresh: []
}>()

const router = useRouter()

const lendLoading = ref(false)
const borrowLoading = ref(false)
const allowLoading = ref(false)
const rejectLoading = ref(false)
const actionOrderId = ref<string | null>(null)

const lendOrders = ref<BorrowOrder[]>([])
const borrowOrders = ref<BorrowOrder[]>([])
const statusFilter = ref(0)

const borrowerDialogVisible = ref(false)
const currentBorrowerOrder = ref<BorrowOrder | null>(null)

// 待我处理：作为出借人的待处理订单（待确认）
const pendingOrders = computed(() => {
  return lendOrders.value.filter(o => o.status === ORDER_STATUS.PENDING)
})

// 我发起的：当前用户作为借用人的订单列表
const myOrders = computed(() => borrowOrders.value)

function borrowerName(order: BorrowOrder) {
  return (order.borrower as any)?.username ?? (order.borrower as any)?.nickname ?? order.borrowerId ?? '未知'
}

function lenderName(order: BorrowOrder) {
  return (order.lender as any)?.username ?? (order.lender as any)?.nickname ?? order.lenderId ?? '未知'
}

function billingLabel(type: string) {
  const map: Record<string, string> = {
    per_day: '天',
    per_week: '周',
    per_month: '月'
  }
  return map[type] || '天'
}

function statusText(status: number) {
  const map: Record<number, string> = {
    [ORDER_STATUS.PENDING]: '待确认',
    [ORDER_STATUS.WAIT_PAY]: '待付款',
    [ORDER_STATUS.BORROWING]: '借用中',
    [ORDER_STATUS.WAIT_RETURN_CONFIRM]: '待归还确认',
    [ORDER_STATUS.COMPLETED]: '已完成',
    [ORDER_STATUS.CANCELLED]: '已取消',
    [ORDER_STATUS.REJECTED]: '已拒绝',
    [ORDER_STATUS.DISPUTE]: '争议中'
  }
  return map[status] ?? '未知'
}

function statusTagType(status: number) {
  const map: Record<number, string> = {
    [ORDER_STATUS.PENDING]: 'warning',
    [ORDER_STATUS.WAIT_PAY]: 'warning',
    [ORDER_STATUS.BORROWING]: 'primary',
    [ORDER_STATUS.WAIT_RETURN_CONFIRM]: 'info',
    [ORDER_STATUS.COMPLETED]: 'success',
    [ORDER_STATUS.CANCELLED]: 'default',
    [ORDER_STATUS.REJECTED]: 'danger',
    [ORDER_STATUS.DISPUTE]: 'danger'
  }
  return map[status] ?? 'info'
}

async function fetchLendOrders() {
  try {
    lendLoading.value = true
    const res = await orderApi.getOrderList({
      type: 'lend',
      page: 1,
      pageSize: 50
    })
    lendOrders.value = res?.list ?? []
  } catch (e) {
    console.error('获取待处理订单失败:', e)
    ElMessage.error('获取待处理订单失败')
    lendOrders.value = []
  } finally {
    lendLoading.value = false
  }
}

async function fetchMyOrders() {
  try {
    borrowLoading.value = true
    const params: { type: 'borrow'; page: number; pageSize: number; status?: number } = {
      type: 'borrow',
      page: 1,
      pageSize: 50
    }
    if (statusFilter.value) params.status = statusFilter.value
    const res = await orderApi.getOrderList(params)
    borrowOrders.value = res?.list ?? []
  } catch (e) {
    console.error('获取我的订单失败:', e)
    ElMessage.error('获取我的订单失败')
    borrowOrders.value = []
  } finally {
    borrowLoading.value = false
  }
}

function showBorrowerInfo(order: BorrowOrder) {
  currentBorrowerOrder.value = order
  borrowerDialogVisible.value = true
}

async function onDialogAllow() {
  if (currentBorrowerOrder.value) {
    borrowerDialogVisible.value = false
    await handleAllow(currentBorrowerOrder.value)
  }
}

async function onDialogReject() {
  if (currentBorrowerOrder.value) {
    borrowerDialogVisible.value = false
    await handleReject(currentBorrowerOrder.value)
  }
}

function goDetail(order: BorrowOrder) {
  router.push(`/orders/${order.orderNo || order.id}`)
}

// 允许：确认订单后视为借用完成（确认 + 开始借用）
async function handleAllow(order: BorrowOrder) {
  try {
    actionOrderId.value = order.id
    allowLoading.value = true
    await orderApi.confirmOrder(order.id)
    await orderApi.startBorrow(order.id)
    ElMessage.success('已允许借用，订单已进入借用中')
    await fetchLendOrders()
    emit('refresh')
  } catch (e) {
    console.error('允许借用失败:', e)
    ElMessage.error('操作失败，请重试')
  } finally {
    actionOrderId.value = null
    allowLoading.value = false
  }
}

async function handleReject(order: BorrowOrder) {
  try {
    await ElMessageBox.confirm('确定要拒绝该借用申请吗？', '拒绝申请', {
      confirmButtonText: '确定拒绝',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    actionOrderId.value = order.id
    rejectLoading.value = true
    await orderApi.rejectOrder(order.id)
    ElMessage.success('已拒绝该申请')
    await fetchLendOrders()
    emit('refresh')
  } catch (e) {
    console.error('拒绝失败:', e)
    ElMessage.error('操作失败，请重试')
  } finally {
    actionOrderId.value = null
    rejectLoading.value = false
  }
}

async function refresh() {
  await Promise.all([fetchLendOrders(), fetchMyOrders()])
}

onMounted(() => {
  refresh()
})

defineExpose({ refresh })
</script>

<style scoped>
.profile-order-list {
  padding: 0 4px;
}

.order-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px 0;
}

.section-desc {
  color: #909399;
  font-size: 13px;
  margin: 0 0 16px 0;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.status-select {
  width: 140px;
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
}

.pending-card {
  background: #f0f9ff;
  border-color: #b3d8ff;
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

.order-row .value {
  color: #303133;
}

.order-row.muted,
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

.my-orders .order-card {
  cursor: pointer;
}

.my-orders .order-card:hover {
  border-color: #c0c4cc;
  background: #f5f7fa;
}

.borrower-dialog :deep(.el-descriptions__label) {
  width: 90px;
}
</style>
