<template>
  <div class="enhanced-item-info">
    <!-- 基础信息区 -->
    <div class="info-section">
      <h3 class="section-title">
        📋 基础信息
      </h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">物品名称</span>
          <span class="info-value">{{ itemInfo.title }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">分类</span>
          <el-tag>{{ itemInfo.categoryName }}</el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">成色</span>
          <el-tag :type="getConditionType(itemInfo.condition)">
            {{ itemInfo.condition }}
          </el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">物品状态</span>
          <el-tag :type="getStatusType(itemInfo.status)">
            <el-icon><component :is="getStatusIcon(itemInfo.status)" /></el-icon>
            {{ getStatusText(itemInfo.status) }}
          </el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">位置</span>
          <span class="info-value">
            <el-icon><MapLocation /></el-icon>
            {{ itemInfo.location }}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">发布时间</span>
          <span class="info-value">{{ formatDate(itemInfo.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 租赁条件区 -->
    <div class="info-section">
      <h3 class="section-title">
        💰 租赁条件
      </h3>
      <div class="rental-info">
        <div class="price-card">
          <div class="price-label">
            租金
          </div>
          <div class="price-value">
            <span class="price-symbol">¥</span>
            <span class="price-number">{{ itemInfo.price }}</span>
            <span class="price-unit">/{{ getBillingTypeText(itemInfo.billingType) }}</span>
          </div>
        </div>
        <div class="price-card">
          <div class="price-label">
            押金
          </div>
          <div class="price-value">
            <span v-if="itemInfo.deposit > 0">
              <span class="price-symbol">¥</span>
              <span class="price-number">{{ itemInfo.deposit }}</span>
            </span>
            <span
              v-else
              class="no-deposit"
            >
              <el-icon><SuccessFilled /></el-icon>
              无需押金
            </span>
          </div>
        </div>
      </div>
      <div class="rental-rules">
        <div class="rule-item">
          <el-icon color="var(--warning-color)">
            <Warning />
          </el-icon>
          <span>最短租期: {{ itemInfo.minRentalDays || 1 }}天</span>
        </div>
        <div class="rule-item">
          <el-icon color="var(--info-color)">
            <InfoFilled />
          </el-icon>
          <span>最长租期: {{ itemInfo.maxRentalDays || '不限' }}</span>
        </div>
      </div>
    </div>

    <!-- 物品描述区 -->
    <div class="info-section">
      <h3 class="section-title">
        📝 物品描述
      </h3>
      <div class="description-content">
        <p>{{ itemInfo.description || '暂无描述' }}</p>
      </div>
    </div>

    <!-- 物品属性区 -->
    <div
      v-if="itemInfo.specifications && itemInfo.specifications.length > 0"
      class="info-section"
    >
      <h3 class="section-title">
        🔧 物品属性
      </h3>
      <div class="specs-grid">
        <div 
          v-for="(spec, index) in itemInfo.specifications" 
          :key="index"
          class="spec-item"
        >
          <span class="spec-label">{{ spec.key }}</span>
          <span class="spec-value">{{ spec.value }}</span>
        </div>
      </div>
    </div>

    <!-- 统计信息区 -->
    <div class="info-section">
      <h3 class="section-title">
        📊 统计信息
      </h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon view">
            <el-icon><View /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ itemInfo.viewCount || 0 }}
            </div>
            <div class="stat-label">
              浏览量
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon favorite">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ itemInfo.favoriteCount || 0 }}
            </div>
            <div class="stat-label">
              收藏数
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon order">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ itemInfo.borrowCount || 0 }}
            </div>
            <div class="stat-label">
              借用次数
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rating">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ itemInfo.averageRating || 0 }}
            </div>
            <div class="stat-label">
              平均评分
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  MapLocation, 
  SuccessFilled, 
  Warning, 
  InfoFilled,
  View,
  Star,
  ShoppingCart,
  CircleCheckFilled,
  WarningFilled,
  RemoveFilled
} from '@element-plus/icons-vue'

interface ItemInfo {
  title: string
  categoryName: string
  condition: string
  status: number
  location: string
  createdAt: number
  price: number
  billingType: string
  deposit: number
  minRentalDays?: number
  maxRentalDays?: number | string
  description?: string
  specifications?: Array<{ key: string; value: string }>
  viewCount?: number
  favoriteCount?: number
  borrowCount?: number
  averageRating?: number
}

interface Props {
  itemInfo: ItemInfo
}

defineProps<Props>()

// 辅助方法
const getConditionType = (condition: string) => {
  const typeMap: Record<string, string> = {
    '全新': 'success',
    '几乎全新': 'success',
    '轻微使用痕迹': 'warning',
    '明显使用痕迹': 'info'
  }
  return typeMap[condition] || ''
}

const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'info'
  }
  return typeMap[status] || ''
}

const getStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    1: '可借用',
    2: '已借出',
    3: '已下架'
  }
  return textMap[status] || '未知'
}

const getStatusIcon = (status: number) => {
  const iconMap: Record<number, any> = {
    1: CircleCheckFilled,
    2: WarningFilled,
    3: RemoveFilled
  }
  return iconMap[status] || CircleCheckFilled
}

const getBillingTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'per_day': '天',
    'per_week': '周',
    'per_month': '月'
  }
  return textMap[type] || '天'
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="enhanced-item-info">
    <!-- 基础信息区 -->
    <div class="info-section">
      <h3 class="section-title">📋 基础信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">物品名称</span>
          <span class="info-value">{{ itemInfo.title }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">分类</span>
          <el-tag>{{ itemInfo.categoryName }}</el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">成色</span>
          <el-tag :type="getConditionType(itemInfo.condition)">
            {{ itemInfo.condition }}
          </el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">物品状态</span>
          <el-tag :type="getStatusType(itemInfo.status)">
            <el-icon><component :is="getStatusIcon(itemInfo.status)" /></el-icon>
            {{ getStatusText(itemInfo.status) }}
          </el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">位置</span>
          <span class="info-value">
            <el-icon><MapLocation /></el-icon>
            {{ itemInfo.location }}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">发布时间</span>
          <span class="info-value">{{ formatDate(itemInfo.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 租赁条件区 -->
    <div class="info-section">
      <h3 class="section-title">💰 租赁条件</h3>
      <div class="rental-info">
        <div class="price-card">
          <div class="price-label">租金</div>
          <div class="price-value">
            <span class="price-symbol">¥</span>
            <span class="price-number">{{ itemInfo.price }}</span>
            <span class="price-unit">/{{ getBillingTypeText(itemInfo.billingType) }}</span>
          </div>
        </div>
        <div class="price-card">
          <div class="price-label">押金</div>
          <div class="price-value">
            <span v-if="itemInfo.deposit > 0">
              <span class="price-symbol">¥</span>
              <span class="price-number">{{ itemInfo.deposit }}</span>
            </span>
            <span v-else class="no-deposit">
              <el-icon><SuccessFilled /></el-icon>
              无需押金
            </span>
          </div>
        </div>
      </div>
      <div class="rental-rules">
        <div class="rule-item">
          <el-icon color="var(--warning-color)"><Warning /></el-icon>
          <span>最短租期: {{ itemInfo.minRentalDays || 1 }}天</span>
        </div>
        <div class="rule-item">
          <el-icon color="var(--info-color)"><InfoFilled /></el-icon>
          <span>最长租期: {{ itemInfo.maxRentalDays || '不限' }}</span>
        </div>
      </div>
    </div>

    <!-- 物品描述区 -->
    <div class="info-section">
      <h3 class="section-title">📝 物品描述</h3>
      <div class="description-content">
        <p>{{ itemInfo.description || '暂无描述' }}</p>
      </div>
    </div>

    <!-- 物品属性区 -->
    <div v-if="itemInfo.specifications && itemInfo.specifications.length > 0" class="info-section">
      <h3 class="section-title">🔧 物品属性</h3>
      <div class="specs-grid">
        <div 
          v-for="(spec, index) in itemInfo.specifications" 
          :key="index"
          class="spec-item"
        >
          <span class="spec-label">{{ spec.key }}</span>
          <span class="spec-value">{{ spec.value }}</span>
        </div>
      </div>
    </div>

    <!-- 统计信息区 -->
    <div class="info-section">
      <h3 class="section-title">📊 统计信息</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon view">
            <el-icon><View /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ itemInfo.viewCount || 0 }}</div>
            <div class="stat-label">浏览量</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon favorite">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ itemInfo.favoriteCount || 0 }}</div>
            <div class="stat-label">收藏数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon order">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ itemInfo.borrowCount || 0 }}</div>
            <div class="stat-label">借用次数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rating">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ itemInfo.averageRating || 0 }}</div>
            <div class="stat-label">平均评分</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { 
  MapLocation, 
  SuccessFilled, 
  Warning, 
  InfoFilled,
  View,
  Star,
  ShoppingCart,
  CircleCheckFilled,
  WarningFilled,
  RemoveFilled
} from '@element-plus/icons-vue'

interface ItemInfo {
  title: string
  categoryName: string
  condition: string
  status: number
  location: string
  createdAt: number
  price: number
  billingType: string
  deposit: number
  minRentalDays?: number
  maxRentalDays?: number | string
  description?: string
  specifications?: Array<{ key: string; value: string }>
  viewCount?: number
  favoriteCount?: number
  borrowCount?: number
  averageRating?: number
}

interface Props {
  itemInfo: ItemInfo
}

defineProps<Props>()

// 辅助方法
const getConditionType = (condition: string) => {
  const typeMap: Record<string, string> = {
    '全新': 'success',
    '几乎全新': 'success',
    '轻微使用痕迹': 'warning',
    '明显使用痕迹': 'info'
  }
  return typeMap[condition] || ''
}

const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'info'
  }
  return typeMap[status] || ''
}

const getStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    1: '可借用',
    2: '已借出',
    3: '已下架'
  }
  return textMap[status] || '未知'
}

const getStatusIcon = (status: number) => {
  const iconMap: Record<number, any> = {
    1: CircleCheckFilled,
    2: WarningFilled,
    3: RemoveFilled
  }
  return iconMap[status] || CircleCheckFilled
}

const getBillingTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'per_day': '天',
    'per_week': '周',
    'per_month': '月'
  }
  return textMap[type] || '天'
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.enhanced-item-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 信息区块 */
.info-section {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color-light);
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 15px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* 租赁信息 */
.rental-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.price-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  text-align: center;
}

.price-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: var(--spacing-sm);
}

.price-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.price-symbol {
  font-size: 20px;
  font-weight: 600;
}

.price-number {
  font-size: 36px;
  font-weight: 700;
}

.price-unit {
  font-size: 14px;
}

.no-deposit {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 18px;
  font-weight: 600;
}

.rental-rules {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
}

.rule-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 14px;
  color: var(--text-secondary);
}

/* 描述内容 */
.description-content {
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
  line-height: 1.8;
  color: var(--text-primary);
}

.description-content p {
  margin: 0;
  white-space: pre-wrap;
}

/* 属性网格 */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
}

.spec-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.spec-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  font-size: 24px;
}

.stat-icon.view {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-icon.favorite {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.stat-icon.order {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.stat-icon.rating {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 响应式 */
@media (max-width: 768px) {
  .info-grid,
  .rental-info,
  .specs-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .price-number {
    font-size: 28px;
  }
}
</style>

<style scoped>
.enhanced-item-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 信息区块 */
.info-section {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color-light);
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 15px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* 租赁信息 */
.rental-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.price-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  text-align: center;
}

.price-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: var(--spacing-sm);
}

.price-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.price-symbol {
  font-size: 20px;
  font-weight: 600;
}

.price-number {
  font-size: 36px;
  font-weight: 700;
}

.price-unit {
  font-size: 14px;
}

.no-deposit {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 18px;
  font-weight: 600;
}

.rental-rules {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
}

.rule-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 14px;
  color: var(--text-secondary);
}

/* 描述内容 */
.description-content {
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
  line-height: 1.8;
  color: var(--text-primary);
}

.description-content p {
  margin: 0;
  white-space: pre-wrap;
}

/* 属性网格 */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
}

.spec-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.spec-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  font-size: 24px;
}

.stat-icon.view {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-icon.favorite {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.stat-icon.order {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.stat-icon.rating {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 响应式 */
@media (max-width: 768px) {
  .info-grid,
  .rental-info,
  .specs-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .price-number {
    font-size: 28px;
  }
}
</style>
