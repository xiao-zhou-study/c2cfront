<template>
  <div
    class="verified-badge"
    :class="{ verified: isVerified }"
  >
    <span class="badge-icon">{{ icon }}</span>
    <span
      v-if="showText"
      class="badge-text"
    >{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * 是否已实名认证
   */
  isVerified: {
    type: Boolean,
    default: false
  },
  /**
   * 是否显示文字
   */
  showText: {
    type: Boolean,
    default: true
  },
  /**
   * 尺寸: 'small' | 'medium' | 'large'
   */
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const icon = computed(() => {
  return props.isVerified ? '✓' : '?'
})

const text = computed(() => {
  return props.isVerified ? '已认证' : '未认证'
})
</script>

<template>
  <div class="verified-badge" :class="{ verified: isVerified }">
    <span class="badge-icon">{{ icon }}</span>
    <span v-if="showText" class="badge-text">{{ text }}</span>
  </div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * 是否已实名认证
   */
  isVerified: {
    type: Boolean,
    default: false
  },
  /**
   * 是否显示文字
   */
  showText: {
    type: Boolean,
    default: true
  },
  /**
   * 尺寸: 'small' | 'medium' | 'large'
   */
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const icon = computed(() => {
  return props.isVerified ? '✓' : '?'
})

const text = computed(() => {
  return props.isVerified ? '已认证' : '未认证'
})
</script>

<style scoped>
.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-extra-small);
  font-weight: var(--font-weight-medium);
  background-color: var(--bg-base);
  color: var(--text-secondary);
  transition: all var(--transition-base);
}

.verified-badge.verified {
  background-color: #EBF5FF;
  color: #2563EB;
}

.badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.verified-badge.verified .badge-icon {
  background-color: #2563EB;
}

.badge-text {
  line-height: 1;
}

/* 尺寸变体 */
.verified-badge.small {
  padding: 1px 6px;
  font-size: 10px;
}

.verified-badge.small .badge-icon {
  width: 12px;
  height: 12px;
  font-size: 8px;
}

.verified-badge.large {
  padding: 4px 12px;
  font-size: var(--font-size-base);
}

.verified-badge.large .badge-icon {
  width: 16px;
  height: 16px;
  font-size: 12px;
}
</style>

<style scoped>
.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-extra-small);
  font-weight: var(--font-weight-medium);
  background-color: var(--bg-base);
  color: var(--text-secondary);
  transition: all var(--transition-base);
}

.verified-badge.verified {
  background-color: #EBF5FF;
  color: #2563EB;
}

.badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.verified-badge.verified .badge-icon {
  background-color: #2563EB;
}

.badge-text {
  line-height: 1;
}

/* 尺寸变体 */
.verified-badge.small {
  padding: 1px 6px;
  font-size: 10px;
}

.verified-badge.small .badge-icon {
  width: 12px;
  height: 12px;
  font-size: 8px;
}

.verified-badge.large {
  padding: 4px 12px;
  font-size: var(--font-size-base);
}

.verified-badge.large .badge-icon {
  width: 16px;
  height: 16px;
  font-size: 12px;
}
</style>
