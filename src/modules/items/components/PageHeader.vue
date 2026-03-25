<template>
  <div class="page-header">
    <div class="header-content">
      <h1 class="page-title">
        物品列表
      </h1>
      <p class="page-description">
        浏览校园内的共享物品，找到你需要的资源
      </p>
    </div>
    <div class="header-actions">
      <el-button
        type="primary"
        class="publish-btn"
        @click="navigateToPublish"
      >
        发布物品
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToPublish = () => {
  router.push('/publish')
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.page-description {
  margin: 0;
  font-size: 16px;
  color: #909399;
}

.publish-btn {
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
</style>