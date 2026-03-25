<template>
  <div class="item-basic-info">
    <div class="header-section">
      <h1 class="item-title">
        {{ item.title }}
      </h1>
      <div class="status-badges">
        <el-tag 
          :type="item.status === 'available' ? 'success' : 'warning'" 
          size="large"
          class="status-tag"
        >
          {{ item.status === 'available' ? '可借用' : '已借出' }}
        </el-tag>
        <el-tag
          v-if="item.isPopular"
          type="info"
          size="large"
        >
          热门
        </el-tag>
      </div>
    </div>

    <div class="price-section">
      <div class="price-info">
        <span class="price-label">租金：</span>
        <span class="price-value">¥{{ item.price }}</span>
        <span class="price-unit">/{{ billingUnit }}</span>
      </div>
      <div class="deposit-info">
        <span class="deposit-label">押金：</span>
        <span class="deposit-value">¥{{ item.deposit }}</span>
      </div>
    </div>

    <div
      v-if="item.rating"
      class="rating-section"
    >
      <div class="rating-stars">
        <el-rate 
          :model-value="item.rating" 
          disabled 
          show-score
          text-color="#ff9900"
          score-template="{value} 分"
        />
      </div>
      <div class="rating-count">
        ({{ item.stats?.totalRatings || 0 }} 条评价)
      </div>
    </div>

    <div class="basic-details">
      <div class="detail-row">
        <span class="detail-label">分类：</span>
        <el-tag type="primary">
          {{ item.category }}
        </el-tag>
      </div>
      <div class="detail-row">
        <span class="detail-label">状态：</span>
        <el-tag :type="item.status === 1 || item.status === 'available' ? 'success' : (item.status === 2 || item.status === 'borrowed' ? 'warning' : 'info')">
          {{ item.status === 1 || item.status === 'available' ? '可借用' : (item.status === 2 || item.status === 'borrowed' ? '已借出' : '已下架') }}
        </el-tag>
      </div>
      <div class="detail-row">
        <span class="detail-label">位置：</span>
        <span class="detail-value">{{ item.location }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">可租天数：</span>
        <span class="detail-value">{{ item.minBorrowDays || 1 }} - {{ item.maxBorrowDays || 30 }} 天</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BILLING_TYPE } from '@/shared/utils'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const billingUnit = computed(() => {
  const map = {
    [BillingType.PER_DAY]: '天',
    [BillingType.PER_WEEK]: '周',
    [BillingType.PER_MONTH]: '月'
  }
  return map[props.item?.billingType] || '天'
})
</script>

<style scoped>
.item-basic-info {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.header-section {
  margin-bottom: 20px;
}

.item-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.status-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-tag {
  font-size: 14px;
  padding: 6px 12px;
}

.price-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-label {
  font-size: 16px;
  color: #666;
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  color: #e91e63;
}

.price-unit {
  font-size: 16px;
  color: #666;
}

.deposit-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.deposit-label {
  font-size: 14px;
  color: #666;
}

.deposit-value {
  font-size: 18px;
  font-weight: 600;
  color: #666;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.rating-stars {
  flex: 1;
}

.rating-count {
  color: #999;
  font-size: 14px;
}

.basic-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  color: #666;
  min-width: 60px;
}

.detail-value {
  font-size: 14px;
  color: #333;
}
</style>
