<template>
  <div class="detail-header">
    <el-button
      type="default"
      class="back-btn"
      @click="navigateBack"
    >
      ← 返回物品列表
    </el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateBack = () => {
  router.back()
}
</script>

<style scoped>
.detail-header {
  margin-bottom: 32px;
}

.back-btn {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #ffffff;
  transform: translateX(-2px);
}
</style>