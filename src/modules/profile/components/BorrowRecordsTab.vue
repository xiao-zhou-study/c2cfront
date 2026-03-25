<template>
  <div class="borrow-records-tab">
    <!-- 状态筛选 -->
    <div class="status-filter">
      <el-radio-group
        v-model="statusFilter"
        @change="handleFilterChange"
      >
        <el-radio-button :label="null">
          全部订单
        </el-radio-button>
        <el-radio-button :label="1">待确认</el-radio-button>
        <el-radio-button :label="2">待付款</el-radio-button>
        <el-radio-button :label="3">借用中</el-radio-button>
        <el-radio-button :label="4">待归还确认</el-radio-button>
        <el-radio-button :label="5">已完成</el-radio-button>
        <el-radio-button :label="6">已取消</el-radio-button>
        <el-radio-button :label="7">已拒绝</el-radio-button>
        <el-radio-button :label="8">争议中</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 订单列表 -->
    <div
      v-loading="loading"
      class="orders-list"
    >
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
      >
        <!-- 订单头部 -->
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">订单号: {{ order.orderNumber }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <el-tag :type="getStatusType(order.status)">
            {{ getStatusText(order.status) }}
          </el-tag>
        </div>

        <!-- 物品信息 -->
        <div
          class="order-content"
          @click="handleViewOrder(order)"
        >
          <div class="item-image">
            <img
              :src="getItemImage(order.item)"
              :alt="order.item.title"
            >
          </div>
          <div class="item-details">
            <h4 class="item-title">
              {{ order.item.title }}
            </h4>
            <div class="item-meta">
              <span class="item-price">¥{{ order.item.price }}/{{ getBillingTypeText(order.item.billingType) }}</span>
              <span class="item-period">租期: {{ order.rentalDays }}天</span>
            </div>
            <div class="rental-period">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(order.startDate) }} 至 {{ formatDate(order.endDate) }}</span>
            </div>
          </div>
          <div class="order-amount">
            <div class="amount-label">
              订单金额
            </div>
            <div class="amount-value">
              ¥{{ order.totalAmount }}
            </div>
          </div>
        </div>

        <!-- 状态流转（1-5 进行中状态展示） -->
        <div
          v-if="[1,2,3,4,5].includes(order.status)"
          class="order-timeline"
        >
          <el-steps
            :active="getActiveStep(order.status)"
            finish-status="success"
            simple
          >
            <el-step title="待确认" />
            <el-step title="待付款" />
            <el-step title="借用中" />
            <el-step title="待归还确认" />
            <el-step title="已完成" />
          </el-steps>
        </div>

        <!-- 操作按钮 -->
        <div class="order-actions">
          <el-button
            size="small"
            @click="handleViewOrder(order)"
          >
            查看详情
          </el-button>
          <el-button 
            v-if="order.status === 1"
            size="small" 
            type="danger"
            @click="handleCancel(order)"
          >
            取消订单
          </el-button>
          <el-button 
            v-if="order.status === 5"
            size="small" 
            type="primary"
            @click="handleReview(order)"
          >
            评价
          </el-button>
          <el-button 
            v-if="order.status === 3"
            size="small" 
            type="warning"
            @click="handleReturn(order)"
          >
            申请归还
          </el-button>
          <el-button 
            v-if="order.status === 5"
            size="small"
            @click="handleReborrow(order)"
          >
            再次借用
          </el-button>
          <el-button 
            v-if="order.status === 2 || order.status === 3"
            size="small"
            @click="handleContact(order)"
          >
            联系出借人
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredOrders.length === 0"
        description="暂无借用记录"
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
import { Calendar } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

interface Item {
  id: number
  title: string
  images: string[]
  price: number
  billingType: string
}

interface Order {
  id: number
  orderNumber: string
  item: Item
  status: number
  createdAt: number
  startDate: number
  endDate: number
  rentalDays: number
  totalAmount: number
}

interface Props {
  orders: Order[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  orders: () => [],
  loading: false
})

const emit = defineEmits<{
  'view': [order: Order]
  'cancel': [order: Order]
  'review': [order: Order]
  'return': [order: Order]
  'reborrow': [order: Order]
  'contact': [order: Order]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const statusFilter = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

const filteredOrders = computed(() => {
  let orders = props.orders
  if (statusFilter.value !== null) {
    orders = orders.filter(o => o.status === statusFilter.value)
  }
  return orders
})

const total = computed(() => filteredOrders.value.length)

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleViewOrder = (order: Order) => {
  emit('view', order)
}

const handleCancel = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    emit('cancel', order)
  } catch {
    // 用户取消
  }
}

const handleReview = (order: Order) => {
  emit('review', order)
}

const handleReturn = (order: Order) => {
  emit('return', order)
}

const handleReborrow = (order: Order) => {
  emit('reborrow', order)
}

const handleContact = (order: Order) => {
  emit('contact', order)
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
    : 'https://via.placeholder.com/200x200'
}

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '待确认',
    2: '待付款',
    3: '借用中',
    4: '待归还确认',
    5: '已完成',
    6: '已取消',
    7: '已拒绝',
    8: '争议中'
  }
  return statusMap[status] ?? '未知'
}

const getStatusType = (status: number) => {
  const typeMap: Record<number, any> = {
    1: 'warning',
    2: 'warning',
    3: 'primary',
    4: 'info',
    5: 'success',
    6: 'info',
    7: 'danger',
    8: 'danger'
  }
  return typeMap[status] ?? ''
}

const getActiveStep = (status: number) => {
  const stepMap: Record<number, number> = {
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4
  }
  return stepMap[status] ?? 0
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
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<template>
  <div class="borrow-records-tab">
    <!-- 状态筛选 -->
    <div class="status-filter">
      <el-radio-group v-model="statusFilter" @change="handleFilterChange">
        <el-radio-button :label="null">全部订单</el-radio-button>
        <el-radio-button :label="1">待确认</el-radio-button>
        <el-radio-button :label="2">待付款</el-radio-button>
        <el-radio-button :label="3">借用中</el-radio-button>
        <el-radio-button :label="4">待归还确认</el-radio-button>
        <el-radio-button :label="5">已完成</el-radio-button>
        <el-radio-button :label="6">已取消</el-radio-button>
        <el-radio-button :label="7">已拒绝</el-radio-button>
        <el-radio-button :label="8">争议中</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 订单列表 -->
    <div v-loading="loading" class="orders-list">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
      >
        <!-- 订单头部 -->
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">订单号: {{ order.orderNumber }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <el-tag :type="getStatusType(order.status)">
            {{ getStatusText(order.status) }}
          </el-tag>
        </div>

        <!-- 物品信息 -->
        <div class="order-content" @click="handleViewOrder(order)">
          <div class="item-image">
            <img :src="getItemImage(order.item)" :alt="order.item.title">
          </div>
          <div class="item-details">
            <h4 class="item-title">{{ order.item.title }}</h4>
            <div class="item-meta">
              <span class="item-price">¥{{ order.item.price }}/{{ getBillingTypeText(order.item.billingType) }}</span>
              <span class="item-period">租期: {{ order.rentalDays }}天</span>
            </div>
            <div class="rental-period">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(order.startDate) }} 至 {{ formatDate(order.endDate) }}</span>
            </div>
          </div>
          <div class="order-amount">
            <div class="amount-label">订单金额</div>
            <div class="amount-value">¥{{ order.totalAmount }}</div>
          </div>
        </div>

        <!-- 状态流转（1-5 进行中状态展示） -->
        <div v-if="[1,2,3,4,5].includes(order.status)" class="order-timeline">
          <el-steps :active="getActiveStep(order.status)" finish-status="success" simple>
            <el-step title="待确认" />
            <el-step title="待付款" />
            <el-step title="借用中" />
            <el-step title="待归还确认" />
            <el-step title="已完成" />
          </el-steps>
        </div>

        <!-- 操作按钮 -->
        <div class="order-actions">
          <el-button size="small" @click="handleViewOrder(order)">
            查看详情
          </el-button>
          <el-button 
            v-if="order.status === 1"
            size="small" 
            type="danger"
            @click="handleCancel(order)"
          >
            取消订单
          </el-button>
          <el-button 
            v-if="order.status === 5"
            size="small" 
            type="primary"
            @click="handleReview(order)"
          >
            评价
          </el-button>
          <el-button 
            v-if="order.status === 3"
            size="small" 
            type="warning"
            @click="handleReturn(order)"
          >
            申请归还
          </el-button>
          <el-button 
            v-if="order.status === 5"
            size="small"
            @click="handleReborrow(order)"
          >
            再次借用
          </el-button>
          <el-button 
            v-if="order.status === 2 || order.status === 3"
            size="small"
            @click="handleContact(order)"
          >
            联系出借人
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredOrders.length === 0"
        description="暂无借用记录"
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
import { Calendar } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

interface Item {
  id: number
  title: string
  images: string[]
  price: number
  billingType: string
}

interface Order {
  id: number
  orderNumber: string
  item: Item
  status: number
  createdAt: number
  startDate: number
  endDate: number
  rentalDays: number
  totalAmount: number
}

interface Props {
  orders: Order[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  orders: () => [],
  loading: false
})

const emit = defineEmits<{
  'view': [order: Order]
  'cancel': [order: Order]
  'review': [order: Order]
  'return': [order: Order]
  'reborrow': [order: Order]
  'contact': [order: Order]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const statusFilter = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

const filteredOrders = computed(() => {
  let orders = props.orders
  if (statusFilter.value !== null) {
    orders = orders.filter(o => o.status === statusFilter.value)
  }
  return orders
})

const total = computed(() => filteredOrders.value.length)

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleViewOrder = (order: Order) => {
  emit('view', order)
}

const handleCancel = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    emit('cancel', order)
  } catch {
    // 用户取消
  }
}

const handleReview = (order: Order) => {
  emit('review', order)
}

const handleReturn = (order: Order) => {
  emit('return', order)
}

const handleReborrow = (order: Order) => {
  emit('reborrow', order)
}

const handleContact = (order: Order) => {
  emit('contact', order)
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
    : 'https://via.placeholder.com/200x200'
}

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '待确认',
    2: '待付款',
    3: '借用中',
    4: '待归还确认',
    5: '已完成',
    6: '已取消',
    7: '已拒绝',
    8: '争议中'
  }
  return statusMap[status] ?? '未知'
}

const getStatusType = (status: number) => {
  const typeMap: Record<number, any> = {
    1: 'warning',
    2: 'warning',
    3: 'primary',
    4: 'info',
    5: 'success',
    6: 'info',
    7: 'danger',
    8: 'danger'
  }
  return typeMap[status] ?? ''
}

const getActiveStep = (status: number) => {
  const stepMap: Record<number, number> = {
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4
  }
  return stepMap[status] ?? 0
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
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
.borrow-records-tab {
  padding: var(--spacing-lg);
}

/* 状态筛选 */
.status-filter {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

/* 订单列表 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  min-height: 400px;
}

.order-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color-light);
}

.order-info {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.order-number {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.order-date {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 订单内容 */
.order-content {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
}

.item-image {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-md);
  overflow: hidden;
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
  gap: var(--spacing-sm);
}

.item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.item-meta {
  display: flex;
  gap: var(--spacing-lg);
  font-size: 14px;
}

.item-price {
  color: var(--danger-color);
  font-weight: 600;
}

.item-period {
  color: var(--text-secondary);
}

.rental-period {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--text-secondary);
}

.order-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: var(--spacing-xs);
}

.amount-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--danger-color);
}

/* 状态流转 */
.order-timeline {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
}

/* 操作按钮 */
.order-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
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
  .status-filter :deep(.el-radio-group) {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .order-content {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
    height: 200px;
  }

  .order-amount {
    align-items: flex-start;
  }

  .order-actions {
    flex-wrap: wrap;
  }

  .order-actions .el-button {
    flex: 1 1 calc(50% - 4px);
    min-width: 100px;
  }
}
</style>

<style scoped>
.borrow-records-tab {
  padding: var(--spacing-lg);
}

/* 状态筛选 */
.status-filter {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

/* 订单列表 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  min-height: 400px;
}

.order-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color-light);
}

.order-info {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.order-number {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.order-date {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 订单内容 */
.order-content {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
}

.item-image {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-md);
  overflow: hidden;
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
  gap: var(--spacing-sm);
}

.item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.item-meta {
  display: flex;
  gap: var(--spacing-lg);
  font-size: 14px;
}

.item-price {
  color: var(--danger-color);
  font-weight: 600;
}

.item-period {
  color: var(--text-secondary);
}

.rental-period {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--text-secondary);
}

.order-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: var(--spacing-xs);
}

.amount-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--danger-color);
}

/* 状态流转 */
.order-timeline {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
}

/* 操作按钮 */
.order-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
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
  .status-filter :deep(.el-radio-group) {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .order-content {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
    height: 200px;
  }

  .order-amount {
    align-items: flex-start;
  }

  .order-actions {
    flex-wrap: wrap;
  }

  .order-actions .el-button {
    flex: 1 1 calc(50% - 4px);
    min-width: 100px;
  }
}
</style>
