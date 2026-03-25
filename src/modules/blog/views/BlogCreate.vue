<template>
  <div class="create-page">
    <div class="create-header">
      <el-button text class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1 class="create-title">发布话题</h1>
    </div>

    <div class="create-form">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="form-inner"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="写一个简洁的标题"
            maxlength="80"
            show-word-limit
            clearable
          />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="选择分类"
            style="width: 100%"
            :loading="loadingCategories"
          >
            <el-option
              v-for="c in categories"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="详细描述你的话题或问题…"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="onSubmit">
            发布
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { blogApi } from '@/shared/api'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const categories = ref([])
const loadingCategories = ref(false)

const form = reactive({
  title: '',
  categoryId: null,
  content: ''
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 80, message: '标题长度 2～80 字', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 5, message: '内容至少 5 个字', trigger: 'blur' }
  ]
}

// 获取分类列表
async function fetchCategories() {
  loadingCategories.value = true
  try {
    const list = await blogApi.getCategoryList()
    categories.value = list
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败，请稍后重试')
  } finally {
    loadingCategories.value = false
  }
}

async function onSubmit() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    if (!form.categoryId) {
      ElMessage.warning('请选择分类')
      return
    }
    submitting.value = true
    try {
      await blogApi.addOrUpdateTopic({
        categoryId: form.categoryId,
        title: form.title,
        content: form.content
      })
      ElMessage.success('发布成功')
      router.push('/blog')
    } catch (error) {
      console.error('发布话题失败:', error)
      ElMessage.error('发布失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

function goBack() {
  router.push('/blog')
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.create-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 16px 32px;
}

.create-header {
  margin-bottom: 24px;
}

.back-btn {
  margin-bottom: 8px;
  color: #909399;
}

.create-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.create-form {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  padding: 24px;
}

.form-inner {
  max-width: 100%;
}

@media (max-width: 768px) {
  .create-page {
    padding: 0 12px 24px;
  }
  .create-form {
    padding: 16px;
  }
}
</style>
