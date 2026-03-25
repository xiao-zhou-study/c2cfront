<template>
  <div class="about-page">
    <!-- 主要内容区 -->
    <div class="main-content">
      <div class="container">
        <!-- 平台简介 -->
        <section class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">关于校园二手交易平台</h1>
            <p class="hero-subtitle">
              一个专为高校学生打造的二手物品交易平台，让闲置好物找到新主人，让每一件物品都物尽其用
            </p>
          </div>
        </section>

        <!-- 核心特色 -->
        <section class="features-section">
          <h2 class="section-title">核心特色</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">💸</div>
              <h3>轻松出售</h3>
              <p>一键发布闲置物品，快速变现，让闲置物品重获价值</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🛍️</div>
              <h3>放心购买</h3>
              <p>海量优质二手好物，价格实惠，淘到心仪商品</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔒</div>
              <h3>安全交易</h3>
              <p>实名认证，交易有保障，让买卖更放心</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🌱</div>
              <h3>绿色环保</h3>
              <p>延长物品使用周期，减少浪费，践行可持续理念</p>
            </div>
          </div>
        </section>

        <!-- 使用指南 -->
        <section class="guide-section">
          <h2 class="section-title">快速开始</h2>
          <div class="guide-cards">
            <div class="guide-card">
              <div class="guide-step">1</div>
              <h3>发布商品</h3>
              <p>上传商品照片，填写价格和描述，一键发布</p>
            </div>
            <div class="guide-card">
              <div class="guide-step">2</div>
              <h3>浏览购买</h3>
              <p>浏览感兴趣的商品，与卖家沟通交流</p>
            </div>
            <div class="guide-card">
              <div class="guide-step">3</div>
              <h3>线下交易</h3>
              <p>约定时间地点，当面验货完成交易</p>
            </div>
            <div class="guide-card">
              <div class="guide-step">4</div>
              <h3>评价反馈</h3>
              <p>交易完成后互相评价，建立信用体系</p>
            </div>
          </div>
        </section>

        <!-- 常见问题 -->
        <section class="faq-section">
          <h2 class="section-title">常见问题</h2>
          <div class="faq-list">
            <div
              v-for="faq in faqList"
              :key="faq.id"
              class="faq-item"
              @click="toggleFaq(faq.id)"
            >
              <div class="faq-question">
                <span>{{ faq.question }}</span>
                <el-icon :class="{ 'rotated': activeFaq === faq.id }">
                  <ArrowRight />
                </el-icon>
              </div>
              <div
                v-show="activeFaq === faq.id"
                class="faq-answer"
              >
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

// 活跃的FAQ
const activeFaq = ref(null)

// 常见问题
const faqList = ref([
  {
    id: 1,
    question: '如何注册账号？',
    answer: '点击右上角的"登录/注册"按钮，填写学号、设置密码即可完成注册。'
  },
  {
    id: 2,
    question: '发布商品需要收费吗？',
    answer: '发布商品完全免费，平台不收取任何费用。'
  },
  {
    id: 3,
    question: '如何保证交易安全？',
    answer: '平台采用实名认证机制，建议买卖双方当面交易、当场验货，确保交易安全。'
  },
  {
    id: 4,
    question: '交易纠纷如何处理？',
    answer: '如遇到交易纠纷，可以联系平台客服，我们会协助双方协商解决。'
  },
  {
    id: 5,
    question: '如何提高商品的曝光率？',
    answer: '提供清晰的商品照片、详细的描述、合理的价格都能提高曝光率。保持商品信息及时更新也很重要。'
  }
])

// 切换FAQ
const toggleFaq = (faqId) => {
  activeFaq.value = activeFaq.value === faqId ? null : faqId
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 平台简介 */
.hero-section {
  background-color: #fff;
  padding: 40px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  text-align: center;
}

.hero-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.hero-subtitle {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto;
}

/* 区块标题 */
.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  text-align: center;
  margin-bottom: 32px;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: #409eff;
  margin: 12px auto 0;
}

/* 核心特色 */
.features-section {
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background-color: #fff;
  padding: 32px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 使用指南 */
.guide-section {
  margin-bottom: 40px;
}

.guide-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.guide-card {
  background-color: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: transform 0.3s ease;
}

.guide-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.guide-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.guide-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.guide-card p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 常见问题 */
.faq-section {
  margin-bottom: 0;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.faq-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.faq-question {
  padding: 20px 24px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.faq-question .el-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
  color: #909399;
}

.faq-question .el-icon.rotated {
  transform: rotate(90deg);
}

.faq-answer {
  padding: 0 24px 20px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-page {
    padding: 20px;
  }

  .hero-section {
    padding: 32px 20px;
  }

  .hero-title {
    font-size: 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .guide-cards {
    grid-template-columns: 1fr;
  }
}
</style>

