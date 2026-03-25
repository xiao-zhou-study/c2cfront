<template>
  <div class="feedback-container">
    <div class="feedback-header">
      <h1>意见反馈</h1>
      <p>您的建议是我们前进的动力</p>
    </div>

    <div class="feedback-content">
      <el-card shadow="never">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          label-position="top"
        >
          <el-form-item
            label="反馈类型"
            prop="type"
          >
            <el-select
              v-model="form.type"
              placeholder="请选择反馈类型"
              style="width: 100%"
            >
              <el-option
                label="功能建议"
                value="suggestion"
              />
              <el-option
                label="问题反馈"
                value="bug"
              />
              <el-option
                label="界面优化"
                value="ui"
              />
              <el-option
                label="其他"
                value="other"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            label="反馈内容"
            prop="content"
          >
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="8"
              placeholder="请详细描述您的反馈内容，包括遇到的问题、建议的改进方案等..."
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item
            label="联系方式"
            prop="contact"
          >
            <el-input
              v-model="form.contact"
              placeholder="选填，方便我们联系您（邮箱或手机号）"
            />
          </el-form-item>

          <el-form-item
            label="上传截图"
            prop="images"
          >
            <el-upload
              v-model:file-list="form.images"
              action="#"
              :auto-upload="false"
              list-type="picture-card"
              :limit="3"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">
              最多上传3张截图，每张不超过5MB
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="submitFeedback"
            >
              提交反馈
            </el-button>
            <el-button
              size="large"
              @click="resetForm"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 常见问题 -->
      <el-card
        shadow="never"
        style="margin-top: 24px"
      >
        <template #header>
          <h3>常见问题</h3>
        </template>
        <div class="faq-list">
          <el-collapse>
            <el-collapse-item
              title="反馈多久会得到回复？"
              name="1"
            >
              <p>我们会在收到反馈后的3个工作日内回复，紧急问题会在24小时内处理。</p>
            </el-collapse-item>
            <el-collapse-item
              title="如何查看我的反馈处理进度？"
              name="2"
            >
              <p>提交反馈后，您会收到确认邮件。处理完成后，我们会通过您留下的联系方式通知您。</p>
            </el-collapse-item>
            <el-collapse-item
              title="可以匿名反馈吗？"
              name="3"
            >
              <p>可以，联系方式为选填项。但建议留下联系方式，以便我们更好地了解问题并回复您。</p>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const formRef = ref()
const submitting = ref(false)

const form = ref({
  type: '',
  content: '',
  contact: '',
  images: []
})

const rules = {
  type: [
    { required: true, message: '请选择反馈类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { min: 10, message: '反馈内容至少10个字符', trigger: 'blur' }
  ]
}

const submitFeedback = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    // ========== 真实 API 调用（接入后端时取消注释） ==========
    // await feedbackAPI.submit(form.value)
    // ========================================================
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('反馈已提交，感谢您的建议！我们会认真考虑您的意见。')
    resetForm()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('请填写完整的反馈信息')
    }
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    type: '',
    content: '',
    contact: '',
    images: []
  }
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.feedback-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.feedback-header {
  text-align: center;
  margin-bottom: 32px;
}

.feedback-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.feedback-header p {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.feedback-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.faq-list {
  max-width: 100%;
}

.faq-list p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .feedback-container {
    padding: 16px;
  }
  
  .feedback-content {
    padding: 16px;
  }
}
</style>

