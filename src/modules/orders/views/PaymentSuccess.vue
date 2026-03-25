<template>
  <div class="payment-success">
    <div class="success-card">
      <div class="success-icon">
        <el-icon :size="64" color="#67c23a"><CircleCheckFilled /></el-icon>
      </div>
      <h1 class="success-title">支付成功</h1>
      <p class="success-desc">您的订单已支付成功，感谢使用。</p>
      <p v-if="orderNo" class="order-no">订单号：{{ orderNo }}</p>
      <div class="success-actions">
        <el-button type="primary" size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button size="large" @click="goProfile">
          个人中心
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CircleCheckFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const orderNo = computed(() => (route.query.orderNo as string) || '')

/** 返回到订单详情页；不使用 router.back()，否则会回到支付宝 return 页 */
function goBack() {
  if (orderNo.value) {
    router.push({ path: `/orders/${orderNo.value}` })
  } else {
    router.push({ path: '/profile', query: { tab: 'borrowing' } })
  }
}

function goProfile() {
  router.push('/profile')
}
</script>

<style scoped>
.payment-success {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.success-card {
  text-align: center;
  max-width: 420px;
  width: 100%;
  padding: 40px 32px;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.success-icon {
  margin-bottom: 20px;
}

.success-title {
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.success-desc {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.order-no {
  margin: 0 0 24px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.success-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}
</style>
