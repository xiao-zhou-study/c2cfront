<template>
  <div class="enhanced-owner-card">
    <div class="owner-header">
      <el-avatar
        :size="80"
        :src="props.ownerInfo.avatarUrl"
      >
        {{ props.ownerInfo.nickname?.charAt(0) || props.ownerInfo.username.charAt(0) }}
      </el-avatar>
      
      <div class="owner-basic">
        <div class="owner-name">
          {{ props.ownerInfo.nickname || props.ownerInfo.username }}
          <VerifiedBadge v-if="props.ownerInfo.isVerified" />
        </div>
        <CreditBadge 
          :score="props.ownerInfo.creditScore" 
          size="medium" 
          show-score 
        />
      </div>
    </div>

    <div class="owner-stats">
      <div class="stat-item">
        <div class="stat-value">
          {{ props.ownerInfo.itemCount || 0 }}
        </div>
        <div class="stat-label">
          发布物品
        </div>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <div class="stat-value">
          {{ props.ownerInfo.borrowCount || 0 }}
        </div>
        <div class="stat-label">
          借用次数
        </div>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <div class="stat-value">
          {{ props.ownerInfo.rating || 0 }}
        </div>
        <div class="stat-label">
          好评率
        </div>
      </div>
    </div>

    <div class="owner-actions">
      <el-button 
        type="primary" 
        :icon="ChatDotRound"
        class="action-btn"
        @click="handleChat"
      >
        联系TA
      </el-button>
      <el-button 
        :icon="User"
        class="action-btn"
        @click="handleViewProfile"
      >
        查看主页
      </el-button>
    </div>

    <div
      v-if="props.ownerInfo.bio"
      class="owner-bio"
    >
      <div class="bio-title">
        <el-icon><Document /></el-icon>
        个人简介
      </div>
      <p class="bio-content">
        {{ props.ownerInfo.bio }}
      </p>
    </div>

    <div class="owner-meta">
      <div class="meta-item">
        <el-icon><Calendar /></el-icon>
        <span>加入于 {{ formatJoinDate(props.ownerInfo.createdAt) }}</span>
      </div>
      <div
        v-if="props.ownerInfo.lastActiveAt"
        class="meta-item"
      >
        <el-icon><Clock /></el-icon>
        <span>最近活跃: {{ formatLastActive(props.ownerInfo.lastActiveAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound, User, Document, Calendar, Clock } from '@element-plus/icons-vue'
import CreditBadge from '@/shared/components/CreditBadge.vue'
import VerifiedBadge from '@/shared/components/VerifiedBadge.vue'

interface OwnerInfo {
  id: string
  username: string
  nickname?: string
  avatarUrl: string
  isVerified: boolean
  creditScore: number
  itemCount?: number
  borrowCount?: number
  rating?: number
  bio?: string
  createdAt: number
  lastActiveAt?: number
}

interface Props {
  ownerInfo: OwnerInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'chat': [userId: string]
  'view-profile': [userId: string]
}>()

const handleChat = () => {
  emit('chat', props.ownerInfo.id)
}

const handleViewProfile = () => {
  emit('view-profile', props.ownerInfo.id)
}

const formatJoinDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
}

const formatLastActive = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return formatJoinDate(timestamp)
}
</script>

<style scoped>
.enhanced-owner-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: var(--spacing-lg);
}

/* 所有者头部 */
.owner-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-light);
}

.owner-basic {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-sm);
}

.owner-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* 统计信息 */
.owner-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md) 0;
  background: var(--bg-light);
  border-radius: var(--radius-md);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--brand-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-divider {
  width: 1px;
  background: var(--border-color);
}

/* 操作按钮 */
.owner-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.action-btn {
  flex: 1;
}

/* 个人简介 */
.owner-bio {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
}

.bio-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.bio-content {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 元信息 */
.owner-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 13px;
  color: var(--text-placeholder);
}

/* 响应式 */
@media (max-width: 768px) {
  .enhanced-owner-card {
    position: static;
  }

  .owner-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .owner-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
