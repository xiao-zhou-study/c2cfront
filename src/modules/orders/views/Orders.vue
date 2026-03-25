<template>
  <div class="orders-page">
    <div class="page-header">
      <h2>订单列表</h2>
      <div class="actions">
        <el-select
          v-model="statusFilter"
          size="small"
          placeholder="筛选状态"
          @change="fetchOrders"
        >
          <el-option
            label="全部"
            :value="0"
          />
          <el-option
            label="待确认"
            :value="ORDER_STATUS.PENDING"
          />
          <el-option
            label="待付款"
            :value="ORDER_STATUS.WAIT_PAY"
          />
          <el-option
            label="借用中"
            :value="ORDER_STATUS.BORROWING"
          />
          <el-option
            label="待归还确认"
            :value="ORDER_STATUS.WAIT_RETURN_CONFIRM"
          />
          <el-option
            label="已完成"
            :value="ORDER_STATUS.COMPLETED"
          />
          <el-option
            label="已取消"
            :value="ORDER_STATUS.CANCELLED"
          />
          <el-option
            label="已拒绝"
            :value="ORDER_STATUS.REJECTED"
          />
          <el-option
            label="争议中"
            :value="ORDER_STATUS.DISPUTE"
          />
        </el-select>
        <el-button
          size="small"
          type="primary"
          :loading="loading"
          @click="fetchOrders"
        >
          刷新
        </el-button>
      </div>
    </div>
    
    <div
      v-if="loading"
      class="loading"
    >
      <el-skeleton
        :rows="6"
        animated
      />
    </div>
    <div
      v-else-if="orders.length === 0"
      class="empty"
    >
      <el-empty description="暂无订单" />
    </div>
    <div
      v-else
      class="table-wrapper"
    >
      <el-table
        :data="orders"
        style="width: 100%"
      >
        <el-table-column
          label="订单ID"
          prop="id"
          width="90"
        />
        <el-table-column
          label="标题"
          prop="title"
          min-width="200"
        />
        <el-table-column
          label="借用人"
          min-width="120"
        >
          <template #default="{ row }">
            {{ row.borrower?.nickname || row.borrowerId }}
          </template>
        </el-table-column>
        <el-table-column
          label="出借人"
          min-width="120"
        >
          <template #default="{ row }">
            {{ row.lender?.nickname || row.lenderId }}
          </template>
        </el-table-column>
        <el-table-column
          label="计费"
          width="160"
        >
          <template #default="{ row }">
            <span>¥{{ row.price }}</span>
            <span class="muted">/{{ billingLabel(row.billingType) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="押金"
          width="100"
          prop="deposit"
        />
        <el-table-column
          label="天数"
          width="80"
          prop="borrowDays"
        />
        <el-table-column
          label="总金额"
          width="110"
        >
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          width="120"
        >
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatTimestamp(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="180"
        >
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="goDetail(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderApi } from '@/shared/api'
import { mockOrderService } from '@/shared/services/mockService'
import { ORDER_STATUS } from '@/shared/utils/constants'
import { formatTimestamp } from '@/shared/utils/format'
import type { BorrowOrder } from '@/shared/types/models'

// 是否使用Mock数据
const useMock = ref(true)
const router = useRouter()
const loading = ref(false)
const statusFilter = ref(0)
const orders = ref<BorrowOrder[]>([])

const billingLabel = (type: string) => {
  const map: Record<string, string> = {
    'per_day': '天',
    'per_week': '周',
    'per_month': '月'
  }
  return map[type] || '天'
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

const goDetail = (row: BorrowOrder) => {
  router.push(`/orders/${row.orderNo || row.id}`)
}

const fetchOrders = async () => {
  try {
    loading.value = true
    const params: any = {}
    if (statusFilter.value) params.status = statusFilter.value
    
    if (useMock.value) {
      const res = await mockOrderService.getOrderList(params)
      orders.value = res.list || []
    } else {
      const res = await orderApi.getOrderList(params)
      orders.value = res.list || []
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)
</script>

<style scoped>
.orders-page {
  padding: 24px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.actions {
  display: flex;
  gap: 12px;
}
.muted {
  color: #909399;
  margin-left: 6px;
}
.loading, .empty {
  padding: 24px;
}
.table-wrapper {
  background: #fff;
  border-radius: 8px;
}
</style>

