<template>
  <div class="auth-container">
    <!-- 左上角品牌信息 -->
    <div class="brand-logo-corner">
      <img src="https://r2.zmwlovefmn.uk/logo2.png" alt="Logo" class="corner-logo">
      <div class="corner-text">
        <h2 class="corner-title">校园二手交易</h2>
        <p class="corner-subtitle">创建账户，开始交易</p>
      </div>
    </div>
    
    <div class="auth-card">
      <RegisterForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/shared/stores/user'
import RegisterForm from '@/modules/auth/components/RegisterForm.vue'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: url('https://r2.zmwlovefmn.uk/background2.jpg') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  display: flex;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 让 auth-card 居中 */
.auth-card {
  margin: auto;
}

/* 静态渐变光晕层 */
.auth-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at 20% 20%, rgba(3, 166, 136, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(4, 199, 158, 0.1) 0%, transparent 50%);
  z-index: 0;
  pointer-events: none;
}

/* 静态白色光泽层 */
.auth-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 60%);
  z-index: 0;
  pointer-events: none;
}

/* 左上角品牌信息 */
.brand-logo-corner {
  position: absolute;
  top: 40px;
  left: 40px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 10;
  animation: fadeIn 0.8s ease-out;
}

.corner-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  box-shadow: 
    0 4px 16px rgba(3, 166, 136, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
  padding: 2px;
}

.corner-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.corner-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.corner-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

/* 玻璃卡片 */
.auth-card {
  max-width: 520px;
  width: 100%;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.2) 100%);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 8px 32px rgba(3, 166, 136, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 1px rgba(255, 255, 255, 0.6),
    inset 0 -1px 1px rgba(255, 255, 255, 0.2);
  padding: 40px 40px 40px;
  animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 1;
  max-height: 92vh;
  overflow-y: auto;
  overflow-x: hidden;
  margin: auto;
}

/* 静态旋转光晕 */
.auth-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg at 50% 50%,
    transparent 0deg,
    rgba(3, 166, 136, 0.06) 60deg,
    transparent 120deg,
    rgba(4, 199, 158, 0.05) 180deg,
    transparent 240deg,
    rgba(3, 166, 136, 0.04) 300deg,
    transparent 360deg);
  z-index: -1;
}

/* 顶部光泽效果 */
.auth-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.35) 0%,
    rgba(255, 255, 255, 0) 100%);
  border-radius: 28px 28px 0 0;
  pointer-events: none;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
  position: relative;
  z-index: 2;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: block;
  border-radius: 20px;
  box-shadow: 
    0 8px 24px rgba(3, 166, 136, 0.25),
    0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05) rotate(2deg);
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 12px 0;
  letter-spacing: -0.8px;
  background: linear-gradient(135deg, #1E293B 0%, #03a688 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 15px;
  color: #64748B;
  margin: 0;
  font-weight: 500;
}

.auth-tab {
  flex: 1;
  padding: 12px 20px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: #64748B;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 自定义滚动条 */
.auth-card::-webkit-scrollbar {
  width: 6px;
}

.auth-card::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.auth-card::-webkit-scrollbar-thumb {
  background: rgba(3, 166, 136, 0.3);
  border-radius: 3px;
}

.auth-card::-webkit-scrollbar-thumb:hover {
  background: rgba(3, 166, 136, 0.5);
}

@media (max-width: 768px) {
  .auth-container {
    padding: 16px;
  }
  
  .brand-logo-corner {
    top: 20px;
    left: 20px;
    gap: 12px;
  }
  
  .corner-logo {
    width: 48px;
    height: 48px;
  }
  
  .corner-title {
    font-size: 16px;
  }
  
  .corner-subtitle {
    font-size: 12px;
  }
  
  .auth-card {
    padding: 32px 24px;
  }
}

@media (max-width: 480px) {
  .brand-logo-corner {
    position: relative;
    top: auto;
    left: auto;
    margin-bottom: 24px;
    justify-content: center;
  }

  .auth-card {
    padding: 28px 20px;
    border-radius: 22px;
  }

  .auth-card::after {
    border-radius: 22px 22px 0 0;
  }
}
</style>
