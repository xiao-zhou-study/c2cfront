<template>
  <div class="breadcrumb-nav">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">
        <el-icon><HomeFilled /></el-icon>
        首页
      </el-breadcrumb-item>
      <el-breadcrumb-item 
        v-for="(item, index) in items" 
        :key="index"
        :to="item.path ? { path: item.path } : undefined"
      >
        {{ item.label }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { HomeFilled } from '@element-plus/icons-vue'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()
</script>

<style scoped>
.breadcrumb-nav {
  padding: var(--spacing-md) 0;
  background: #fff;
  border-bottom: 1px solid var(--border-color-light);
}

.breadcrumb-nav :deep(.el-breadcrumb) {
  font-size: 14px;
}

.breadcrumb-nav :deep(.el-breadcrumb__item) {
  display: inline-flex;
  align-items: center;
}

.breadcrumb-nav :deep(.el-breadcrumb__inner) {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.breadcrumb-nav :deep(.el-breadcrumb__inner:hover) {
  color: var(--brand-primary);
}

.breadcrumb-nav :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--text-primary);
  font-weight: 500;
}

.breadcrumb-nav :deep(.el-breadcrumb__separator) {
  margin: 0 var(--spacing-sm);
  color: var(--text-placeholder);
}
</style>
