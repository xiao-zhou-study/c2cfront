<template>
  <div class="borrow-records">
    

    <div class="search-bar">
      <div class="search-bar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="按物品名称搜索"
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
      <el-tab-pane label="待确认" :name="ORDER_STATUS.PENDING" />
      <el-tab-pane label="待付款" :name="ORDER_STATUS.WAIT_PAY" />
      <el-tab-pane label="交易中/服务中" :name="ORDER_STATUS.BORROWING" />
      <el-tab-pane label="待评价" :name="ORDER_STATUS.WAIT_RETURN_CONFIRM" />
      <el-tab-pane label="已完成" :name="ORDER_STATUS.COMPLETED" />
      <el-tab-pane label="已取消" :name="ORDER_STATUS.CANCELLED" />
      <el-tab-pane label="已拒绝" :name="ORDER_STATUS.REJECTED" />
      <el-tab-pane label="争议中" :name="ORDER_STATUS.DISPUTE" />
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
            <span class="value">{{ order.title }}</span>
          </div>
          <div class="order-row">
            <span class="label">卖家：</span>
            <span class="value">{{ lenderName(order) }}</span>
          </div>
          <div class="order-row">
            <span class="label">¥{{ order.price }}</span>
            <span class="muted">/{{ billingLabel(order.billingType) }}</span>
            <span class="muted"> · {{ billingDurationValue(order.borrowDays ?? 0, order.billingType) }} · 共 ¥{{ order.totalAmount }}</span>
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

    <!-- 订单详情卡片弹窗（不跳转页面） -->
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
                <h3 class="detail-item-title">{{ detailOrder.itemName || detailOrder.title }}</h3>
                <el-tag
                  class="detail-status-badge"
                  :type="statusTagType(detailOrder.status)"
                >
                  {{ statusText(detailOrder.status) }}
                </el-tag>
              </div>
              <p class="detail-order-no">订单号：{{ detailOrder.orderNo || detailOrder.id }}</p>
              <div class="detail-price-row">
                <span class="detail-price">¥{{ detailOrder.price }}</span>
                <span class="detail-unit">/{{ billingLabel(detailOrder.billingType) }}</span>
                <span class="detail-muted"> · {{ billingDurationValue(detailOrder.borrowDays ?? 0, detailOrder.billingType) }} · 共 ¥{{ detailOrder.totalAmount }}</span>
              </div>
              <p
                v-if="detailOrder.purpose"
                class="detail-purpose"
              >
                用途：{{ detailOrder.purpose }}
              </p>
            </div>
          </div>

          <div class="detail-party">
            <div class="detail-party-label">卖家</div>
            <div class="detail-party-info">
              <el-avatar
                :size="40"
                :src="detailOrder.lenderAvatar"
                class="detail-party-avatar"
              >
                {{ (detailOrder.lenderName || detailOrder.lenderId || '出').slice(0, 1) }}
              </el-avatar>
              <span class="detail-party-name">{{ lenderName(detailOrder) }}</span>
            </div>
          </div>

          <el-descriptions
            title="费用信息"
            :column="2"
            border
            size="small"
            class="detail-section"
          >
            <el-descriptions-item label="单价">¥{{ detailOrder.price }}/{{ billingLabel(detailOrder.billingType) }}</el-descriptions-item>
            <el-descriptions-item label="押金">¥{{ detailOrder.deposit }}</el-descriptions-item>
            <el-descriptions-item :label="billingDurationLabel(detailOrder.billingType)">{{ billingDurationValue(detailOrder.borrowDays ?? 0, detailOrder.billingType) }}</el-descriptions-item>
            <el-descriptions-item label="总金额">¥{{ detailOrder.totalAmount }}</el-descriptions-item>
          </el-descriptions>

          <el-descriptions
            title="时间信息"
            :column="2"
            border
            size="small"
            class="detail-section"
          >
            <el-descriptions-item label="创建时间">{{ formatTimestamp(detailOrder.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="计划开始">{{ formatTimestamp(detailOrder.plannedStartTime) }}</el-descriptions-item>
            <el-descriptions-item label="计划结束">{{ formatTimestamp(detailOrder.plannedEndTime) }}</el-descriptions-item>
            <el-descriptions-item label="预计归还">{{ formatTimestamp(detailOrder.expectReturnTime || detailOrder.returnTime) }}</el-descriptions-item>
            <el-descriptions-item
              v-if="detailOrder.confirmTime"
              label="确认时间"
              :span="2"
            >
              {{ formatTimestamp(detailOrder.confirmTime) }}
            </el-descriptions-item>
            <el-descriptions-item
              v-if="detailOrder.borrowTime"
              label="成交时间"
              :span="2"
            >
              {{ formatTimestamp(detailOrder.borrowTime) }}
            </el-descriptions-item>
            <el-descriptions-item
              v-if="detailOrder.actualReturnTime"
              label="实际归还"
              :span="2"
            >
              {{ formatTimestamp(detailOrder.actualReturnTime) }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 借用人视角：按状态渲染操作按钮 -->
          <div class="detail-actions">
            <!-- 待确认：可取消申请 -->
            <template v-if="detailOrder.status === ORDER_STATUS.PENDING">
              <el-button
                type="warning"
                plain
                :loading="detailActionLoading === 'cancel'"
                @click="handleDetailCancel"
              >
                取消申请
              </el-button>
            </template>
            <!-- 待付款：去付款、取消申请 -->
            <template v-else-if="detailOrder.status === ORDER_STATUS.WAIT_PAY">
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
            <!-- 交易中/服务中：可申请归还（若后端有接口则在此对接） -->
            <template v-else-if="detailOrder.status === ORDER_STATUS.BORROWING">
              <el-button
                type="primary"
                :loading="detailActionLoading === 'return'"
                @click="handleDetailApplyReturn"
              >
                申请归还
              </el-button>
            </template>
            <!-- 待评价：等待卖家确认，无操作 -->
            <template v-else-if="detailOrder.status === ORDER_STATUS.WAIT_RETURN_CONFIRM">
              <span class="detail-actions-tip">等待卖家确认，完成后可评价</span>
            </template>
            <!-- 已完成/已取消/已拒绝/争议中：无操作 -->
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 支付表单弹窗：接口返回表单时渲染并自动提交跳转 -->
    <el-dialog
      v-model="payFormVisible"
      title="支付"
      width="480px"
      class="pay-form-dialog"
      :close-on-click-modal="false"
      destroy-on-close
      @closed="payFormHtml = null"
    >
      <div v-if="payFormHtml" class="pay-form-wrap" v-html="payFormHtml" />
      <div v-else class="pay-form-loading">
        <div class="pay-form-loading__spinner" />
        <p class="pay-form-loading__text">正在跳转至支付页面...</p>
        <p class="pay-form-loading__sub">请稍候</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, Picture } from '@element-plus/icons-vue'
import { nextTick } from 'vue'
import { orderApi } from '@/shared/api'
import type { PayBorrowOrderResult } from '@/shared/api/modules/order'
import { ORDER_STATUS } from '@/shared/utils/constants'
import { formatTimestamp } from '@/shared/utils/format'
import type { BorrowOrder } from '@/shared/types/models'

const borrowLoading = ref(false)
const borrowOrders = ref<BorrowOrder[]>([])
const borrowStatusFilter = ref(0)
const searchKeyword = ref('')
const timeFilter = ref('')
const pageNo = ref(1)
const pageSize = ref(20)
const total = ref(0)

const router = useRouter()
const detailVisible = ref(false)
const detailOrder = ref<BorrowOrder | null>(null)
const detailLoading = ref(false)
/** 详情内操作 loading：'cancel' | 'pay' | 'return' */
const detailActionLoading = ref<string | null>(null)

/** 支付表单弹窗：接口返回表单 HTML 时渲染 */
const payFormVisible = ref(false)
const payFormHtml = ref<string | null>(null)

const firstDetailImage = computed(() => {
  const imgs = detailOrder.value?.itemImages
  if (imgs && imgs.length > 0) return imgs[0]
  return ''
})

/** 时间筛选对应的 startTime（毫秒时间戳） */
function getTimeRange(): { startTime?: number; endTime?: number } {
  const days = timeFilter.value ? Number(timeFilter.value) : 0
  if (days <= 0) return {}
  const endTime = Date.now()
  const startTime = endTime - days * 24 * 60 * 60 * 1000
  return { startTime, endTime }
}

function lenderName(order: BorrowOrder) {
  return order.lenderName ?? (order.lender as any)?.username ?? (order.lender as any)?.nickname ?? order.lenderId ?? '未知'
}

function billingLabel(type: string | number) {
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

/** 根据计费类型得到借用时长标签：1-按天→借用天数，2-按周→借用周数，3-按月→借用月数 */
function billingDurationLabel(billingType: string | number): string {
  const map: Record<string, string> = {
    per_day: '借用天数',
    per_week: '借用周数',
    per_month: '借用月数',
    1: '借用天数',
    2: '借用周数',
    3: '借用月数'
  }
  return map[String(billingType)] ?? '借用天数'
}

/** 根据计费类型渲染借用时长数值（后端 borrowDays 为天数，按周/按月时换算显示） */
function billingDurationValue(borrowDays: number, billingType: string | number): string {
  const days = Number(borrowDays) || 0
  const type = String(billingType)
  if (type === '2' || type === 'per_week') return `${Math.ceil(days / 7)} 周`
  if (type === '3' || type === 'per_month') return `${Math.ceil(days / 30)} 月`
  return `${days} 天`
}

function statusText(status: number) {
  const map: Record<number, string> = {
    [ORDER_STATUS.PENDING]: '待确认',
    [ORDER_STATUS.WAIT_PAY]: '待付款',
    [ORDER_STATUS.BORROWING]: '交易中/服务中',
    [ORDER_STATUS.WAIT_RETURN_CONFIRM]: '待评价',
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

async function fetchBorrowOrders(resetPage = false) {
  if (resetPage) pageNo.value = 1
  try {
    borrowLoading.value = true
    const { startTime, endTime } = getTimeRange()
    const params: Parameters<typeof orderApi.getBorrowOrdersPageIn>[0] = {
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value.trim() || undefined,
      startTime,
      endTime
    }
    if (borrowStatusFilter.value) params.status = borrowStatusFilter.value
    const res = await orderApi.getBorrowOrdersPageIn(params)
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

function openDetail(order: BorrowOrder) {
  detailOrder.value = order
  detailVisible.value = true
  fetchDetailInDrawer()
}

async function fetchDetailInDrawer() {
  const orderNo = detailOrder.value?.orderNo || detailOrder.value?.id
  if (!orderNo) return
  try {
    detailLoading.value = true
    const res = await orderApi.getBorrowOrderDetailByOrderNo(String(orderNo))
    detailOrder.value = res
  } catch (e) {
    console.error('加载订单详情失败:', e)
    ElMessage.error('加载订单详情失败')
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

async function handleDetailCancel() {
  const order = detailOrder.value
  const orderNo = order?.orderNo || order?.id
  if (!orderNo) return
  const version = order!.version
  if (version === undefined || version === null) {
    ElMessage.warning('订单数据版本缺失，请关闭后重新打开详情再试')
    return
  }
  try {
    await ElMessageBox.confirm('确定要取消该借用订单吗？', '取消订单', {
      confirmButtonText: '确定取消',
      cancelButtonText: '我再想想',
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    detailActionLoading.value = 'cancel'
    await orderApi.cancelBorrowOrder(String(orderNo), version)
    ElMessage.success('已取消订单')
    detailVisible.value = false
    await fetchBorrowOrders(true)
  } catch (e) {
    console.error('取消订单失败:', e)
    ElMessage.error('取消订单失败')
  } finally {
    detailActionLoading.value = null
  }
}

/** 借用人：去付款，调用支付接口；返回 SUCCESS 则刷新，返回表单则渲染并自动提交 */
async function handleDetailPay() {
  const order = detailOrder.value
  const orderNo = order?.orderNo || order?.id
  if (!orderNo) return
  const version = order!.version
  if (version === undefined || version === null) {
    ElMessage.warning('订单数据版本缺失，请关闭后重新打开详情再试')
    return
  }
  try {
    detailActionLoading.value = 'pay'
    // 先打开支付弹窗并显示加载动画，再请求接口
    payFormHtml.value = null
    detailVisible.value = false
    payFormVisible.value = true
    const result: PayBorrowOrderResult = await orderApi.payBorrowOrder(orderNo, version)
    if (typeof result === 'string') {
      if (result === 'SUCCESS' || result.toUpperCase() === 'SUCCESS') {
        payFormVisible.value = false
        ElMessage.success('支付成功')
        await fetchBorrowOrders(true)
        await nextTick()
        router.push({ path: '/pay/success', query: { orderNo } })
        return
      }
      // 后端直接返回表单 HTML 字符串
      payFormHtml.value = result
      await nextTick()
      setTimeout(submitPayFormInDialog, 100)
      return
    }
    const data = result as { formHtml?: string; method?: string; action?: string; fields?: Array<{ name: string; value: string }> }
    if (data.formHtml) {
      payFormHtml.value = data.formHtml
      await nextTick()
      setTimeout(submitPayFormInDialog, 100)
      return
    }
    if (data.method && data.action && Array.isArray(data.fields)) {
      payFormVisible.value = false
      submitStructuredPayForm(data.method, data.action, data.fields)
      return
    }
    payFormVisible.value = false
    ElMessage.success('支付跳转中')
    await fetchBorrowOrders(true)
  } catch (e) {
    console.error('发起支付失败:', e)
    payFormVisible.value = false
    ElMessage.error('发起支付失败，请重试')
  } finally {
    detailActionLoading.value = null
  }
}

/** 弹窗内已渲染的 HTML 表单自动提交 */
function submitPayFormInDialog() {
  const wrap = document.querySelector('.pay-form-wrap')
  if (!wrap) return
  const form = wrap.querySelector('form')
  if (form) {
    form.submit()
  }
}

/** 结构化表单：创建 form 并提交 */
function submitStructuredPayForm(method: string, action: string, fields: Array<{ name: string; value: string }>) {
  const form = document.createElement('form')
  form.method = method.toUpperCase() === 'GET' ? 'get' : 'post'
  form.action = action
  form.style.display = 'none'
  fields.forEach(({ name, value }) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

/** 借用人：申请归还（调用归还接口后变为待出借人确认） */
async function handleDetailApplyReturn() {
  const order = detailOrder.value
  const orderNo = order?.orderNo || order?.id
  if (!orderNo) return
  const version = order!.version
  if (version === undefined || version === null) {
    ElMessage.warning('订单数据版本缺失，请关闭后重新打开详情再试')
    return
  }
  try {
    detailActionLoading.value = 'return'
    await orderApi.applyReturnBorrowOrder(String(orderNo), version)
    ElMessage.success('已提交归还，等待出借人确认')
    detailVisible.value = false
    await fetchBorrowOrders(true)
  } catch (e) {
    console.error('申请归还失败:', e)
    ElMessage.error('操作失败，请重试')
  } finally {
    detailActionLoading.value = null
  }
}

async function refresh() {
  await fetchBorrowOrders()
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

.section-desc {
  color: #909399;
  font-size: 13px;
  margin: 0 0 16px 0;
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
  margin-bottom: 0;
  width: 100%;
}

.status-tabs :deep(.el-tabs__nav-scroll) {
  width: 100%;
}

.status-tabs :deep(.el-tabs__nav) {
  width: 100%;
  display: flex;
}

.status-tabs :deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  font-size: 14px;
}

.status-tabs :deep(.el-tabs__content) {
  display: none;
}

.status-tabs :deep(.el-tabs__active-bar) {
  transition: none;
}

.status-tabs :deep(.el-tabs__indicator) {
  transition: none;
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

/* 订单详情卡片弹窗 */
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
  position: relative;
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
  color: #303133;
  font-weight: 500;
}

.detail-unit,
.detail-muted {
  color: #909399;
  font-size: 13px;
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

.detail-party-avatar {
  flex-shrink: 0;
}

.detail-party-name {
  font-size: 14px;
  color: #303133;
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

.pay-form-dialog .pay-form-wrap {
  min-height: 60px;
}
.pay-form-dialog .pay-form-wrap :deep(form) {
  display: none;
}

.pay-form-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  min-height: 120px;
}
.pay-form-loading__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--el-border-color-lighter);
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  animation: pay-form-spin 0.8s linear infinite;
}
.pay-form-loading__text {
  margin: 20px 0 4px;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 500;
}
.pay-form-loading__sub {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
@keyframes pay-form-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
