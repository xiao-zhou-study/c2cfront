<template>
  <div class="project-info">
    <div class="info-content">
      <div class="logo-section">
        <div class="logo">
          <span class="logo-icon" aria-hidden="true">
            <el-icon :size="32" class="logo-svg"><ShoppingCart /></el-icon>
          </span>
          <h1 class="project-name">校园二手交易平台</h1>
        </div>
        <p class="project-subtitle">让闲置好物找到新主人</p>
      </div>
      <div class="features-list">
        <div class="feature-item">
          <span class="feature-icon" aria-hidden="true">
            <el-icon :size="24" class="line-icon"><Sell /></el-icon>
          </span>
          <div class="feature-text">
            <h3>轻松出售</h3>
            <p>一键发布闲置物品，快速变现</p>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon" aria-hidden="true">
            <el-icon :size="24" class="line-icon"><ShoppingBag /></el-icon>
          </span>
          <div class="feature-text">
            <h3>放心购买</h3>
            <p>海量优质二手好物，价格实惠</p>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon" aria-hidden="true">
            <el-icon :size="24" class="line-icon"><CircleCheck /></el-icon>
          </span>
          <div class="feature-text">
            <h3>安全交易</h3>
            <p>实名认证，交易有保障</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShoppingCart, Sell, ShoppingBag, CircleCheck } from '@element-plus/icons-vue'
</script>

<style scoped>
/* 左侧：透明，与整体玻璃风格一致 */
.project-info {
  flex: 1;
  background: transparent;
  padding: 48px 40px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.info-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1E293B;
}
.logo-icon .logo-svg {
  color: #1E293B;
}

.project-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #1E293B;
  line-height: 1.3;
  text-align: center;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
}

.project-subtitle {
  font-size: 1rem;
  margin: 0;
  color: #334155;
  text-align: center;
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
}

.features-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: background 0.25s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.28);
}

.feature-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1E3A5F;
}
.feature-icon .line-icon {
  color: #1E3A5F;
}

.feature-text h3 {
  margin: 0 0 6px 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1E293B;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.7);
}

.feature-text p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #475569;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .project-info {
    padding: 32px 24px;
  }
  .logo-icon .logo-svg {
    font-size: 28px;
  }
  .project-name {
    font-size: 1.4rem;
  }
  .feature-item {
    padding: 16px;
  }
}
</style>
