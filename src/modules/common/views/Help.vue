<template>
  <div class="help-container">
    <div class="help-header">
      <h1>帮助中心</h1>
      <p>常见问题和使用指南</p>
    </div>

    <div class="help-content">
      <el-tabs
        v-model="activeTab"
        class="help-tabs"
        :tab-position="'top'"
      >
        <!-- 使用指南 -->
        <el-tab-pane
          label="使用指南"
          name="guide"
        >
          <div class="help-section">
            <h2>如何发布物品</h2>
            <div class="guide-steps">
              <div 
                v-for="step in publishSteps"
                :key="step.id"
                class="step-item"
              >
                <div class="step-number">
                  {{ step.id }}
                </div>
                <div class="step-content">
                  <h3>{{ step.title }}</h3>
                  <p>{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="help-section">
            <h2>借用流程指南</h2>
            <div class="guide-steps">
              <div 
                v-for="step in borrowSteps"
                :key="step.id"
                class="step-item"
              >
                <div class="step-number">
                  {{ step.id }}
                </div>
                <div class="step-content">
                  <h3>{{ step.title }}</h3>
                  <p>{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 安全提示 -->
        <el-tab-pane
          label="安全提示"
          name="safety"
        >
          <div class="help-section">
            <el-alert
              title="安全交易提示"
              type="warning"
              :closable="false"
              show-icon
              style="margin-bottom: 24px"
            />
            
            <div class="safety-tips">
              <div 
                v-for="tip in safetyTips"
                :key="tip.id"
                class="tip-item"
              >
                <el-icon class="tip-icon">
                  <component :is="tip.icon" />
                </el-icon>
                <div>
                  <h3>{{ tip.title }}</h3>
                  <p>{{ tip.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 常见问题 -->
        <el-tab-pane
          label="常见问题"
          name="faq"
        >
          <div class="faq-list">
            <el-collapse 
              v-model="activeFaq"
              class="modern-collapse"
            >
              <el-collapse-item
                v-for="faq in faqList"
                :key="faq.id"
                :title="faq.question"
                :name="faq.id"
                class="faq-item"
              >
                <p class="faq-answer">
                  {{ faq.answer }}
                </p>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>

        <!-- 联系我们 -->
        <el-tab-pane
          label="联系我们"
          name="contact"
        >
          <div class="contact-section">
            <el-card
              shadow="never"
              class="modern-card"
            >
              <template #header>
                <h3>平台联系方式</h3>
              </template>
              <div class="contact-info">
                <div 
                  v-for="contact in contactInfo"
                  :key="contact.id"
                  class="contact-item"
                >
                  <el-icon class="contact-icon">
                    <component :is="contact.icon" />
                  </el-icon>
                  <div>
                    <h4>{{ contact.title }}</h4>
                    <p>{{ contact.value }}</p>
                  </div>
                </div>
              </div>
            </el-card>

            <el-card
              shadow="never"
              class="modern-card"
              style="margin-top: 24px"
            >
              <template #header>
                <h3>意见反馈</h3>
              </template>
              <el-form
                :model="feedbackForm"
                label-width="100px"
                class="feedback-form"
              >
                <el-form-item label="反馈类型">
                  <el-select
                    v-model="feedbackForm.type"
                    placeholder="请选择反馈类型"
                    class="modern-select"
                  >
                    <el-option
                      v-for="option in feedbackOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="反馈内容">
                  <el-input
                    v-model="feedbackForm.content"
                    type="textarea"
                    :rows="6"
                    placeholder="请详细描述您的反馈..."
                    maxlength="500"
                    show-word-limit
                    class="modern-textarea"
                  />
                </el-form-item>
                <el-form-item label="联系方式">
                  <el-input
                    v-model="feedbackForm.contact"
                    placeholder="选填，方便我们联系您"
                    class="modern-input"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="submitting"
                    class="modern-button"
                    @click="submitFeedback"
                  >
                    提交反馈
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Warning, Lock, Document, User, Phone, 
  Message, Location, Search, Edit, Upload, 
  PriceTag, Check, Star
} from '@element-plus/icons-vue'

const activeTab = ref('guide')
const activeFaq = ref([])
const submitting = ref(false)

const feedbackForm = ref({
  type: '',
  content: '',
  contact: ''
})

// 发布物品步骤
const publishSteps = [
  { id: 1, title: '登录账号', description: '使用学号和密码登录平台' },
  { id: 2, title: '填写物品信息', description: '点击"发布物品"，填写物品名称、分类、描述等信息' },
  { id: 3, title: '上传图片', description: '上传清晰的物品照片，最多6张' },
  { id: 4, title: '设置价格和位置', description: '设置借用价格（可设为免费）和物品位置' },
  { id: 5, title: '发布', description: '确认信息无误后点击发布' }
]

// 借用流程步骤
const borrowSteps = [
  { id: 1, title: '浏览物品', description: '在首页或物品列表中找到需要的物品' },
  { id: 2, title: '查看详情', description: '点击物品查看详细信息、图片和评价' },
  { id: 3, title: '申请借用', description: '点击"立即借用"，填写借用时间和用途' },
  { id: 4, title: '等待确认', description: '物品所有者会收到通知并确认借用申请' },
  { id: 5, title: '取物和归还', description: '按照约定时间取物，使用完毕后按时归还' }
]

// 安全提示
const safetyTips = [
  { 
    id: 1, 
    title: '当面交易', 
    description: '建议在校园内公共场所当面交接物品，避免私下交易',
    icon: Warning
  },
  { 
    id: 2, 
    title: '检查物品', 
    description: '借用前仔细检查物品状态，确认与描述一致',
    icon: Check
  },
  { 
    id: 3, 
    title: '保留记录', 
    description: '保留借用记录和聊天记录，作为凭证',
    icon: Document
  },
  { 
    id: 4, 
    title: '核实身份', 
    description: '确认对方身份，可通过学号等信息核实',
    icon: User
  },
  { 
    id: 5, 
    title: '及时沟通', 
    description: '遇到问题及时通过平台联系对方或举报',
    icon: Message
  }
]

// 常见问题
const faqList = [
  { 
    id: '1', 
    question: '如何修改已发布的物品信息？', 
    answer: '在个人中心的"我的发布"页面，找到要修改的物品，点击"编辑"按钮即可修改信息。' 
  },
  { 
    id: '2', 
    question: '借用物品需要支付费用吗？', 
    answer: '这取决于物品所有者设置的借用价格。有些物品是免费共享的，有些需要支付一定的借用费用。价格会在物品详情页明确显示。' 
  },
  { 
    id: '3', 
    question: '如果物品损坏了怎么办？', 
    answer: '如果物品在使用过程中损坏，请及时联系物品所有者协商处理。平台建议双方友好协商，必要时可以通过平台客服介入处理。' 
  },
  { 
    id: '4', 
    question: '如何取消借用申请？', 
    answer: '在个人中心的"借用记录"页面，找到待确认的借用申请，点击"取消"按钮即可取消申请。' 
  },
  { 
    id: '5', 
    question: '可以延长借用时间吗？', 
    answer: '可以。在借用记录中点击"续借"按钮，向物品所有者申请延长借用时间，等待对方确认即可。' 
  },
  { 
    id: '6', 
    question: '如何举报不当行为？', 
    answer: '在物品详情页或用户信息页点击"举报"按钮，填写举报原因并提交。平台会在24小时内处理您的举报。' 
  },
  { 
    id: '7', 
    question: '忘记密码怎么办？', 
    answer: '请联系平台管理员或通过注册邮箱找回密码。目前暂不支持自助找回密码功能。' 
  }
]

// 联系方式
const contactInfo = [
  { 
    id: 1, 
    title: '客服邮箱', 
    value: 'support@campus-share.edu.cn',
    icon: Message
  },
  { 
    id: 2, 
    title: '客服电话', 
    value: '400-123-4567（工作日 9:00-18:00）',
    icon: Phone
  },
  { 
    id: 3, 
    title: '办公地址', 
    value: '校园物品共享平台运营中心',
    icon: Location
  }
]

// 反馈类型选项
const feedbackOptions = [
  { label: '功能建议', value: 'suggestion' },
  { label: '问题反馈', value: 'bug' },
  { label: '其他', value: 'other' }
]

const submitFeedback = async () => {
  if (!feedbackForm.value.type || !feedbackForm.value.content) {
    ElMessage.warning('请填写完整的反馈信息')
    return
  }
  
  submitting.value = true
  try {
    // ========== 真实 API 调用（接入后端时取消注释） ==========
    // await feedbackAPI.submit(feedbackForm.value)
    // ========================================================
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('反馈已提交，感谢您的建议！')
    feedbackForm.value = {
      type: '',
      content: '',
      contact: ''
    }
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #409EFF;
  --primary-gradient: linear-gradient(135deg, #409EFF 0%, #667eea 100%);
  --secondary-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;
  --light-bg: #f8f9fa;
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
}

.help-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.help-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;
  background: var(--primary-gradient);
  border-radius: 16px;
  color: white;
  box-shadow: var(--card-shadow);
}

.help-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.help-header p {
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
}

.help-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--card-shadow);
}

/* 标签页样式 */
.help-tabs {
  min-height: 500px;
}

:deep(.el-tabs__header) {
  margin-bottom: 32px;
}

:deep(.el-tabs__nav) {
  border-bottom: 2px solid #f0f0f0;
}

:deep(.el-tabs__active-bar) {
  background: var(--primary-gradient);
  height: 3px;
  border-radius: 3px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  padding: 0 24px;
  margin: 0 8px;
  transition: var(--transition);
}

:deep(.el-tabs__item:hover) {
  color: var(--primary-color);
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
  font-weight: 600;
}

/* 章节样式 */
.help-section {
  margin-bottom: 48px;
}

.help-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 32px 0;
  padding-bottom: 16px;
  border-bottom: 3px solid var(--primary-color);
  position: relative;
}

.help-section h2::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 80px;
  height: 3px;
  background: var(--primary-gradient);
  border-radius: 3px;
}

/* 步骤指南样式 */
.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.step-item {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 16px;
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.step-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.step-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409EFF 0%, #667eea 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  margin-right: 20px;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.step-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}

/* 安全提示样式 */
.safety-tips {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tip-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 16px;
  border-left: 4px solid var(--primary-color);
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tip-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-left-color: #667eea;
}

.tip-icon {
  font-size: 28px;
  color: var(--primary-color);
  flex-shrink: 0;
  margin-top: 4px;
}

.tip-item h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.tip-item p {
  font-size: 16px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}

/* 常见问题样式 */
.faq-list {
  max-width: 100%;
}

.modern-collapse {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-collapse-item__header) {
  font-size: 16px;
  font-weight: 500;
  padding: 20px 24px;
  background: #f8f9fa;
  border: none;
  border-radius: 12px;
  margin-bottom: 8px;
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.el-collapse-item__header:hover) {
  background: #f0f9ff;
  color: var(--primary-color);
}

:deep(.el-collapse-item__content) {
  padding: 0 24px 24px;
  background: white;
  border-left: 2px solid var(--primary-color);
  border-radius: 0 0 12px 12px;
  margin: -8px 0 16px 0;
}

.faq-answer {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
  padding: 16px 0;
}

/* 联系方式样式 */
.contact-section {
  max-width: 100%;
}

.modern-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: var(--transition);
}

.modern-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

:deep(.el-card__header) {
  background: var(--primary-gradient);
  color: white;
  padding: 20px 24px;
  border-bottom: none;
}

:deep(.el-card__header h3) {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

:deep(.el-card__body) {
  padding: 32px;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.contact-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 16px;
  border-left: 4px solid var(--primary-color);
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-left-color: #667eea;
}

.contact-icon {
  font-size: 28px;
  color: var(--primary-color);
  flex-shrink: 0;
  margin-top: 4px;
}

.contact-item h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.contact-item p {
  font-size: 16px;
  color: #606266;
  margin: 0;
  line-height: 1.4;
}

/* 表单样式 */
.feedback-form {
  max-width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

:deep(.el-form-item__content) {
  width: calc(100% - 100px);
}

.modern-input,
.modern-textarea,
.modern-select {
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  transition: var(--transition);
}

.modern-input:focus,
.modern-textarea:focus,
.modern-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

:deep(.el-textarea__inner) {
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  transition: var(--transition);
}

:deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.modern-button {
  border-radius: 12px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  background: var(--primary-gradient);
  border: none;
  transition: var(--transition);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.modern-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.modern-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .help-container {
    padding: 16px;
  }
  
  .help-header {
    padding: 32px 0;
  }
  
  .help-header h1 {
    font-size: 28px;
  }
  
  .help-content {
    padding: 24px;
  }
  
  .help-section h2 {
    font-size: 20px;
  }
  
  .step-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .tip-item {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .contact-info {
    grid-template-columns: 1fr;
  }
  
  .contact-item {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  :deep(.el-form-item__content) {
    width: 100%;
  }
  
  :deep(.el-card__body) {
    padding: 24px;
  }
  
  .modern-button {
    width: 100%;
  }
}
</style>