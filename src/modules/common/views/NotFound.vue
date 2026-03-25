<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-icon">
        <span class="icon-404">404</span>
      </div>
      <h1 class="error-title">
        页面未找到
      </h1>
      <p class="error-description">
        抱歉，您访问的页面不存在或已被移除
      </p>
      <div class="error-actions">
        <el-button
          type="primary"
          size="large"
          @click="goHome"
        >
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button
          size="large"
          @click="goBack"
        >
          <el-icon><ArrowLeft /></el-icon>
          返回上一页
        </el-button>
      </div>
      <div class="quick-links">
        <h3>您可能想要访问：</h3>
        <div class="links-grid">
          <el-link
            type="primary"
            @click="navigateTo('/dashboard')"
          >
            首页
          </el-link>
          <el-link
            type="primary"
            @click="navigateTo('/items')"
          >
            物品列表
          </el-link>
          <el-link
            type="primary"
            @click="navigateTo('/publish')"
          >
            发布物品
          </el-link>
          <el-link
            type="primary"
            @click="navigateTo('/profile')"
          >
            个人中心
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.back()
}

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.not-found-container {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  background: white;
  padding: 60px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.error-icon {
  margin-bottom: 30px;
}

.icon-404 {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
  line-height: 1;
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  color: #606266;
  margin: 0 0 40px 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 50px;
}

.quick-links {
  padding-top: 40px;
  border-top: 1px solid #e4e7ed;
}

.quick-links h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.links-grid .el-link {
  padding: 12px 24px;
  border-radius: 8px;
  background: #f5f7fa;
  transition: all 0.3s;
}

.links-grid .el-link:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 24px;
  }
  
  .icon-404 {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .error-actions .el-button {
    width: 100%;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>

