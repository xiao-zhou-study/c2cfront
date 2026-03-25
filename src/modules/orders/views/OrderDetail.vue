<template>
  <div class="order-detail">
    <div class="header">
      <h2>订单详情</h2>
      <el-button
        link
        @click="$router.back()"
      >
        返回
      </el-button>
    </div>
    <div
      v-if="loading"
      class="loading"
    >
      <el-skeleton
        :rows="8"
        animated
      />
    </div>
    <div
      v-else-if="!order"
      class="empty"
    >
      <el-empty description="订单不存在" />
    </div>
    <div
      v-else
      class="content"
    >
      <!-- 物品信息卡片 -->
      <div class="item-card">
        <div class="item-cover-wrap">
          <el-image
            v-if="firstItemImage"
            :src="firstItemImage"
            fit="cover"
            class="item-cover"
          >
            <template #error>
              <div class="cover-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div
            v-else
            class="cover-placeholder"
          >
            <el-icon><Picture /></el-icon>
          </div>
          <el-tag
            class="status-badge"
            :type="statusTagType(order.status)"
          >
            {{ statusText(order.status) }}
          </el-tag>
        </div>
        <div class="item-info">
          <h3 class="item-title">{{ order.itemName || order.title }}</h3>
          <p class="order-no">订单号：{{ order.orderNo || order.id }}</p>
          <div class="price-row">
            <span class="price">¥{{ order.price }}</span>
            <span class="unit">/{{ billingLabel(order.billingType) }}</span>
            <span class="muted"> · {{ order.borrowDays }} 天 · 共 ¥{{ order.totalAmount }}</span>
          </div>
          <p
            v-if="order.purpose"
            class="purpose"
          >
            用途：{{ order.purpose }}
          </p>
        </div>
      </div>

      <!-- 出借人 / 借用人：本人不展示（借用的不展示借用人，借出的不展示出借人） -->
      <div class="parties">
        <div
          v-if="showLender"
          class="party-card"
        >
          <div class="party-label">出借人</div>
          <div class="party-info">
            <el-avatar
              :size="44"
              :src="order.lenderAvatar"
              class="party-avatar"
            >
              {{ (order.lenderName || order.lenderId || '出').slice(0, 1) }}
            </el-avatar>
            <span class="party-name">{{ order.lenderName || order.lender?.username || order.lenderId || '未知' }}</span>
          </div>
        </div>
        <div
          v-if="showBorrower"
          class="party-card"
        >
          <div class="party-label">借用人</div>
          <div class="party-info">
            <el-avatar
              :size="44"
              :src="order.borrowerAvatar"
              class="party-avatar"
            >
              {{ (order.borrowerName || order.borrowerId || '借').slice(0, 1) }}
            </el-avatar>
            <span class="party-name">{{ order.borrowerName || order.borrower?.username || order.borrowerId || '未知' }}</span>
          </div>
        </div>
      </div>

      <!-- 费用与时间 -->
      <el-descriptions
        title="费用信息"
        :column="2"
        border
        class="section"
      >
        <el-descriptions-item label="单价">¥{{ order.price }}/{{ billingLabel(order.billingType) }}</el-descriptions-item>
        <el-descriptions-item label="押金">¥{{ order.deposit }}</el-descriptions-item>
        <el-descriptions-item label="借用天数">{{ order.borrowDays }} 天</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ order.totalAmount }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions
        title="时间信息"
        :column="2"
        border
        class="section"
      >
        <el-descriptions-item label="创建时间">{{ formatTimestamp(order.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="计划开始">{{ formatTimestamp(order.plannedStartTime) }}</el-descriptions-item>
        <el-descriptions-item label="计划结束">{{ formatTimestamp(order.plannedEndTime) }}</el-descriptions-item>
        <el-descriptions-item label="预计归还">{{ formatTimestamp(order.expectReturnTime || order.returnTime) }}</el-descriptions-item>
        <el-descriptions-item
          v-if="order.confirmTime"
          label="确认时间"
          :span="2"
        >
          {{ formatTimestamp(order.confirmTime) }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="order.borrowTime"
          label="借出时间"
          :span="2"
        >
          {{ formatTimestamp(order.borrowTime) }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="order.actualReturnTime"
          label="实际归还"
          :span="2"
        >
          {{ formatTimestamp(order.actualReturnTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作按钮：借用人只能取消/去付款，出借人可同意/拒绝、开始借用、确认归还 -->
      <div class="actions">
        <!-- 借用人：取消申请、待付款时仅展示去付款提示（实际付款走支付渠道） -->
        <template v-if="isBorrower">
          <el-button
            v-if="order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.WAIT_PAY"
            type="warning"
            plain
            @click="setStatus(ORDER_STATUS.CANCELLED)"
          >
            取消申请
          </el-button>
          <el-button
            v-if="order.status === ORDER_STATUS.WAIT_PAY"
            type="primary"
            disabled
          >
            待付款（请通过支付渠道完成付款）
          </el-button>
        </template>
        <!-- 出借人：同意/拒绝、开始借用、确认归还 -->
        <template v-if="isLender">
          <el-button
            v-if="order.status === ORDER_STATUS.PENDING"
            type="success"
            @click="setStatus(ORDER_STATUS.WAIT_PAY)"
          >
            确认订单
          </el-button>
          <el-button
            v-if="order.status === ORDER_STATUS.PENDING"
            type="danger"
            plain
            @click="setStatus(ORDER_STATUS.REJECTED)"
          >
            拒绝订单
          </el-button>
          <el-button
            v-if="order.status === ORDER_STATUS.WAIT_PAY"
            type="primary"
            @click="setStatus(ORDER_STATUS.BORROWING)"
          >
            开始借用
          </el-button>
          <el-button
            v-if="order.status === ORDER_STATUS.BORROWING"
            type="primary"
            @click="setStatus(ORDER_STATUS.WAIT_RETURN_CONFIRM)"
          >
            确认归还
          </el-button>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { orderApi } from '@/shared/api'
import { useUserStore } from '@/shared/stores/user'
import { ORDER_STATUS } from '@/shared/utils/constants'
import { formatTimestamp } from '@/shared/utils/format'
import type { BorrowOrder } from '@/shared/types/models'

const route = useRoute()
const userStore = useUserStore()
const order = ref<BorrowOrder | null>(null)
const loading = ref(true)

/** 当前用户是借用人（查看「我借用的」）时不展示借用人；是出借人（查看「我借出的」）时不展示出借人 */
const currentUserId = computed(() => String(userStore.userId || ''))
const showLender = computed(() => {
  const o = order.value
  if (!o) return true
  return currentUserId.value && String(o.lenderId) !== currentUserId.value
})
const showBorrower = computed(() => {
  const o = order.value
  if (!o) return true
  return currentUserId.value && String(o.borrowerId) !== currentUserId.value
})

/** 当前用户是借用人：只能取消、去付款，不能同意/拒绝 */
const isBorrower = computed(() => {
  const o = order.value
  return !!(currentUserId.value && o && String(o.borrowerId) === currentUserId.value)
})
/** 当前用户是出借人：可同意/拒绝、开始借用、确认归还等 */
const isLender = computed(() => {
  const o = order.value
  return !!(currentUserId.value && o && String(o.lenderId) === currentUserId.value)
})

const firstItemImage = computed(() => {
  const imgs = order.value?.itemImages
  if (imgs && imgs.length > 0) return imgs[0]
  return ''
})

const billingLabel = (type: string | number) => {
  const map: Record<string, string> = {
    per_day: '天',
    per_week: '周',
    per_month: '月',
    1: '天',
    2: '周',
    3: '月'
  }
  return map[String(type)] || '天'
}

const statusText = (status: number) => {
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

const statusTagType = (status: number) => {
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

function normalizeOrderFromState(raw: any): BorrowOrder {
  const billingMap: Record<number, 'per_day' | 'per_week' | 'per_month'> = {
    1: 'per_day',
    2: 'per_week',
    3: 'per_month'
  }
  return {
    ...raw,
    id: String(raw.id ?? ''),
    itemId: String(raw.itemId ?? ''),
    borrowerId: String(raw.borrowerId ?? ''),
    lenderId: String(raw.lenderId ?? ''),
    billingType: billingMap[raw.billingType] ?? 'per_day',
    createdAt: Number(raw.createdAt) || 0,
    updatedAt: Number(raw.updatedAt) || 0
  } as BorrowOrder
}

/** 拉取订单详情：仅使用 GET /os/borrow_orders/detail?orderNo=xxx（路由 param 为 orderNo） */
const fetchDetail = async () => {
  const orderNo = String(route.params.id)
  if (!orderNo) return
  try {
    loading.value = true
    const res = await orderApi.getBorrowOrderDetailByOrderNo(orderNo)
    order.value = res
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})

const setStatus = async (status: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) => {
  const orderId = order.value?.id
  if (!orderId) return
  try {
    switch (status) {
      case 6:
        await orderApi.cancelOrder(orderId)
        break
      case 7:
        await orderApi.rejectOrder(orderId)
        break
      case 2:
        await orderApi.confirmOrder(orderId)
        break
      case 3:
        await orderApi.startBorrow(orderId)
        break
      case 4:
        await orderApi.returnItem(orderId)
        break
      default:
        ElMessage.warning('不支持的状态更新')
        return
    }
    if (order.value) order.value.status = status
    ElMessage.success('状态已更新')
    await fetchDetail()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}
</script>

<style scoped>
.order-detail {
  padding: 24px;
  max-width: 720px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.item-card {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.item-cover-wrap {
  position: relative;
  flex-shrink: 0;
}

.item-cover {
  width: 160px;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
  background: #f5f5f5;
}

.cover-placeholder {
  width: 160px;
  height: 120px;
  border-radius: 10px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 32px;
}

.status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  margin: 0 0 6px 0;
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.order-no {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #909399;
}

.price-row {
  font-size: 15px;
  margin-bottom: 6px;
}

.price-row .price {
  color: #f56c6c;
  font-weight: 600;
}

.price-row .unit {
  color: #606266;
}

.price-row .muted {
  color: #909399;
  font-size: 13px;
}

.purpose {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.parties {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.party-card {
  flex: 1;
  min-width: 160px;
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #eee;
}

.party-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.party-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.party-avatar {
  flex-shrink: 0;
}

.party-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.section {
  margin-bottom: 20px;
}

.section :deep(.el-descriptions__title) {
  font-size: 15px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.mt24 {
  margin-top: 24px;
}

.mt24 h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
}

.muted {
  color: #909399;
  font-size: 13px;
  margin: 4px 0 0 0;
}

.loading,
.empty {
  padding: 48px 24px;
}
</style>
