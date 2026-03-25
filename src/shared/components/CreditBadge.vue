<template>
  <div
    class="credit-badge"
    :class="`credit-${level}`"
  >
    <span class="badge-icon">{{ icon }}</span>
    <div class="badge-content">
      <span class="badge-score">{{ score }}</span>
      <span class="badge-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * 信用分数 (0-100)
   */
  score: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  /**
   * 显示模式: 'full' | 'compact' | 'icon-only'
   */
  mode: {
    type: String,
    default: 'full',
    validator: (value) => ['full', 'compact', 'icon-only'].includes(value)
  }
})

/**
 * 根据信用分计算信用等级
 * 钻石用户: 90-100 紫色 💎
 * 金牌用户: 80-89 金色 🥇
 * 银牌用户: 70-79 银色 🥈
 * 铜牌用户: 60-69 铜色 🥉
 * 新手用户: 50-59 蓝色 🆕
 * 信用不佳: <50 红色 ⚠️
 */
const level = computed(() => {
  const score = props.score
  if (score >= 90) return 'diamond'
  if (score >= 80) return 'gold'
  if (score >= 70) return 'silver'
  if (score >= 60) return 'bronze'
  if (score >= 50) return 'newbie'
  return 'bad'
})

const icon = computed(() => {
  const icons = {
    diamond: '💎',
    gold: '🥇',
    silver: '🥈',
    bronze: '🥉',
    newbie: '🆕',
    bad: '⚠️'
  }
  return icons[level.value]
})

const label = computed(() => {
  const labels = {
    diamond: '钻石用户',
    gold: '金牌用户',
    silver: '银牌用户',
    bronze: '铜牌用户',
    newbie: '新手用户',
    bad: '信用不佳'
  }
  return labels[level.value]
})
</script>

<style scoped>
.credit-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-extra-small);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
}

/* 信用等级颜色 */
.credit-diamond {
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
  color: #FFFFFF;
}

.credit-gold {
  background: linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%);
  color: #78350F;
}

.credit-silver {
  background: linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%);
  color: #374151;
}

.credit-bronze {
  background: linear-gradient(135deg, #B87333 0%, #D4A574 100%);
  color: #FFFFFF;
}

.credit-newbie {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  color: #FFFFFF;
}

.credit-bad {
  background: linear-gradient(135deg, #EF4444 0%, #F87171 100%);
  color: #FFFFFF;
}

.badge-icon {
  font-size: 16px;
  line-height: 1;
}

.badge-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1;
}

.badge-score {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.badge-label {
  font-size: var(--font-size-extra-small);
  opacity: 0.9;
}

/* 紧凑模式 */
.credit-badge.compact {
  padding: 4px 8px;
}

.credit-badge.compact .badge-content {
  flex-direction: row;
  gap: 4px;
  align-items: center;
}

.credit-badge.compact .badge-score {
  font-size: var(--font-size-extra-small);
}

.credit-badge.compact .badge-label {
  font-size: 10px;
}

/* 仅图标模式 */
.credit-badge.icon-only {
  padding: 4px;
  width: 32px;
  height: 32px;
  justify-content: center;
}

.credit-badge.icon-only .badge-icon {
  font-size: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .credit-badge {
    padding: 4px 8px;
  }
  
  .badge-score {
    font-size: var(--font-size-extra-small);
  }
}
</style>
