<template>
  <el-dialog
    v-model="dialogVisible"
    title="申请借用"
    width="600px"
    :before-close="handleClose"
    class="borrow-dialog"
  >
    <div
      v-if="item"
      class="borrow-form"
    >
      <!-- 物品信息摘要 -->
      <div class="item-summary">
        <div class="item-image">
          <img
            :src="item.images[0]"
            :alt="item.title"
          >
        </div>
        <div class="item-details">
          <h4 class="item-title">
            {{ item.title }}
          </h4>
          <div class="item-price">
            ¥{{ item.price }}/{{ billingUnit }}
          </div>
          <div class="item-owner">
            出借人ID：{{ item.userId || item.ownerId }}
          </div>
        </div>
      </div>

      <el-form
        ref="borrowFormRef"
        :model="borrowForm"
        :rules="borrowRules"
        label-width="100px"
        class="borrow-form-content"
      >
        <!-- 借用时间 -->
        <el-form-item
          label="借用时间"
          prop="dateRange"
        >
          <el-date-picker
            v-model="borrowForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            class="date-picker"
            @change="handleDateChange"
          />
        </el-form-item>

        <!-- 计算租期和费用 -->
        <div
          v-if="borrowForm.dateRange.length === 2"
          class="cost-summary"
        >
          <div class="summary-item">
            <span class="label">租期：</span>
            <span class="value">{{ rentalDays }} 天</span>
          </div>
          <div class="summary-item">
            <span class="label">租金：</span>
            <span class="value">¥{{ rentalFee }}</span>
          </div>
          <div class="summary-item">
            <span class="label">押金：</span>
            <span class="value">¥{{ item.deposit }}</span>
          </div>
          <div class="summary-item total">
            <span class="label">总计：</span>
            <span class="value">¥{{ totalCost }}</span>
          </div>
        </div>

        <!-- 借用理由 -->
        <el-form-item
          label="借用理由"
          prop="purpose"
        >
          <el-input
            v-model="borrowForm.purpose"
            type="textarea"
            placeholder="请输入借用理由"
            :rows="3"
            maxlength="200"
            show-word-limit
            class="full-width"
          />
        </el-form-item>

        <!-- 服务条款 -->
        <el-form-item prop="agreeTerms">
          <el-checkbox v-model="borrowForm.agreeTerms">
            我已阅读并同意
            <el-button
              type="primary"
              link
              @click="showTermsDialog"
            >
              《租借服务条款》
            </el-button>
          </el-checkbox>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button
          size="large"
          @click="handleClose"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="submitting"
          size="large"
          @click="handleSubmit"
        >
          提交申请
        </el-button>
      </div>
    </template>

    <!-- 服务条款对话框 -->
    <el-dialog
      v-model="termsVisible"
      title="租借服务条款"
      width="700px"
      append-to-body
    >
      <div class="terms-content">
        <h4>租借服务条款</h4>
        <div class="terms-text">
          <p>1. 租借人应妥善保管租借物品，如有损坏需照价赔偿。</p>
          <p>2. 租借人应按时归还物品，逾期将产生额外费用。</p>
          <p>3. 租借期间如遇不可抗力因素，双方应协商解决。</p>
          <p>4. 租借人不得将物品转租给第三方。</p>
          <p>5. 如有争议，双方应友好协商解决。</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="termsVisible = false">
          关闭
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/shared/stores/user'
import { orderApi } from '@/shared/api'
import type { Item } from '@/shared/types/models'

interface Props {
  modelValue: boolean
  item: Item | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  item: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [payload: any]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const borrowFormRef = ref<FormInstance>()
const submitting = ref(false)
const termsVisible = ref(false)

interface BorrowForm {
  dateRange: string[]
  purpose: string
  agreeTerms: boolean
}

const borrowForm = ref<BorrowForm>({
  dateRange: [],
  purpose: '',
  agreeTerms: false
})

const userStore = useUserStore()

const borrowRules: FormRules<BorrowForm> = {
  dateRange: [
    { required: true, message: '请选择借用时间', trigger: 'change' }
  ],
  purpose: [
    { required: true, message: '请输入借用理由', trigger: 'blur' }
  ],
  agreeTerms: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请同意服务条款'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 计费单位展示
const billingUnit = computed(() => {
  const map: Record<string, string> = {
    'per_day': '天',
    'per_week': '周',
    'per_month': '月'
  }
  return map[props.item?.billingType || 'per_day'] || '天'
})

// 计算租期天数
const rentalDays = computed(() => {
  if (borrowForm.value.dateRange.length !== 2) return 0
  
  const start = new Date(borrowForm.value.dateRange[0])
  const end = new Date(borrowForm.value.dateRange[1])
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays + 1 // 包含开始和结束日期
})

// 计算租金
const rentalFee = computed(() => {
  if (!props.item || rentalDays.value === 0) return 0
  const price = Number(props.item.price) || 0
  switch (props.item.billingType) {
    case 'per_day':
      return price * rentalDays.value
    case 'per_week':
      return price * Math.ceil(rentalDays.value / 7)
    case 'per_month':
      return price * Math.ceil(rentalDays.value / 30)
    default:
      return price * rentalDays.value
  }
})

// 计算总费用
const totalCost = computed(() => {
  if (!props.item) return 0
  const deposit = Number(props.item.deposit) || 0
  return rentalFee.value + deposit
})

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

const handleDateChange = (dates: string[] | null) => {
  if (dates && dates.length === 2) {
    // 验证日期范围合理性
    const start = new Date(dates[0])
    const end = new Date(dates[1])
    const maxDays = 30 // 最长租期30天
    
    if (rentalDays.value > maxDays) {
      ElMessage.warning(`租期不能超过${maxDays}天`)
      borrowForm.value.dateRange = []
    }
    if (props.item?.minBorrowDays && rentalDays.value < props.item.minBorrowDays) {
      ElMessage.warning(`租期不能少于${props.item.minBorrowDays}天`)
      borrowForm.value.dateRange = []
    }
    if (props.item?.maxBorrowDays && rentalDays.value > props.item.maxBorrowDays) {
      ElMessage.warning(`租期不能超过${props.item.maxBorrowDays}天`)
      borrowForm.value.dateRange = []
    }
  }
}

const showTermsDialog = () => {
  termsVisible.value = true
}

const handleSubmit = async () => {
  try {
    await borrowFormRef.value.validate()
    
    if (!props.item) {
      ElMessage.error('物品信息不存在')
      return
    }
    
    submitting.value = true
    
    // 预约起止时间（毫秒时间戳，本地时区）：开始日 00:00:00，结束日 23:59:59.999
    const plannedStartTime = new Date(borrowForm.value.dateRange[0] + 'T00:00:00').getTime()
    const plannedEndTime = new Date(borrowForm.value.dateRange[1] + 'T23:59:59.999').getTime()

    const orderRequest = {
      itemId: String(props.item.id),
      plannedStartTime: String(plannedStartTime),
      plannedEndTime: String(plannedEndTime),
      purpose: borrowForm.value.purpose
    }

    try {
      const orderId = await orderApi.createBorrowOrder(orderRequest)
      ElMessage.success('订单创建成功')
      emit('submit', { orderId })
      handleClose()
    } catch (e) {
      throw e
    } finally {
      submitting.value = false
    }
    
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单信息是否正确')
  }
}

const handleClose = () => {
  if (submitting.value) return
  
  ElMessageBox.confirm(
    '确定要取消借用申请吗？已填写的信息将会丢失。',
    '取消申请',
    {
      confirmButtonText: '确定取消',
      cancelButtonText: '继续填写',
      type: 'warning',
    }
  ).then(() => {
    // 重置表单
    borrowForm.value = {
      dateRange: [],
      purpose: '',
      agreeTerms: false
    }
    borrowFormRef.value?.clearValidate()
    dialogVisible.value = false
  }).catch(() => {
    // 用户取消，留在当前对话框
  })
}

// 监听对话框关闭，重置表单
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    setTimeout(() => {
      borrowForm.value = {
        dateRange: [],
        purpose: '',
        agreeTerms: false
      }
      borrowFormRef.value?.clearValidate()
    }, 300)
  }
})
</script>

<style scoped>
.borrow-form {
  max-height: 70vh;
  overflow-y: auto;
}

.item-summary {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 24px;
}

.item-image {
  width: 80px;
  height: 80px;
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

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.item-price {
  font-size: 18px;
  font-weight: 700;
  color: #e91e63;
  margin-bottom: 4px;
}

.item-owner {
  font-size: 14px;
  color: #666;
}

.borrow-form-content {
  padding: 0 8px;
}

.date-picker {
  width: 100%;
}

.full-width {
  width: 100%;
}

.cost-summary {
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  font-weight: 600;
  color: #1a1a1a;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 2px solid #3b82f6;
}

.summary-item.total .value {
  color: #e91e63;
  font-size: 18px;
}

.summary-item .label {
  color: #666;
}

.summary-item .value {
  font-weight: 500;
  color: #1a1a1a;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.terms-content {
  padding: 16px 0;
}

.terms-content h4 {
  margin: 0 0 16px 0;
  color: #1a1a1a;
}

.terms-text {
  color: #4b5563;
  line-height: 1.6;
}

.terms-text p {
  margin: 0 0 12px 0;
}

@media (max-width: 768px) {
  .borrow-form {
    max-height: 60vh;
  }
  
  .item-summary {
    flex-direction: column;
    text-align: center;
  }
  
  .item-image {
    align-self: center;
  }
}
</style>
