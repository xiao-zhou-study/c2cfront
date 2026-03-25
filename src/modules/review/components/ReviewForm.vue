<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? '编辑评价' : '写评价'"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent="handleSubmit"
    >
      <!-- 物品信息 -->
      <el-form-item
        v-if="itemInfo"
        label="物品"
      >
        <div class="item-info">
          <div class="item-image">
            <img
              :src="itemInfo.image"
              :alt="itemInfo.name"
            >
          </div>
          <div class="item-details">
            <div class="item-name">
              {{ itemInfo.name }}
            </div>
            <div class="item-price">
              ¥{{ itemInfo.price }}
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- 评分 -->
      <el-form-item
        label="评分"
        prop="rating"
        required
      >
        <div class="rating-container">
          <el-rate
            v-model="form.rating"
            :colors="ratingColors"
            show-text
            :texts="ratingTexts"
          />
          <div class="rating-tip">
            {{ getRatingTip(form.rating) }}
          </div>
        </div>
      </el-form-item>

      <!-- 评价内容 -->
      <el-form-item
        label="评价"
        prop="content"
      >
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="分享您的使用体验，帮助其他用户做出更好的选择..."
          :maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 标签选择 -->
      <el-form-item label="标签">
        <div class="tags-container">
          <el-checkbox-group
            v-model="form.tags"
            :max="5"
          >
            <el-checkbox
              v-for="tag in availableTags"
              :key="tag.id"
              :label="tag.id"
            >
              {{ tag.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-form-item>

      <!-- 图片上传 -->
      <el-form-item label="图片">
        <el-upload
          ref="uploadRef"
          v-model:file-list="fileList"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-remove="handleRemove"
          list-type="picture-card"
          :limit="5"
          :accept="'image/*'"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div class="upload-tip">
          最多上传5张图片，每张不超过5MB，支持JPG、PNG格式
        </div>
      </el-form-item>

      <!-- 匿名选项 -->
      <el-form-item>
        <el-checkbox v-model="form.isAnonymous">
          匿名评价
        </el-checkbox>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ isEditing ? '保存修改' : '发布评价' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/shared/stores/user'
import { createReview, updateReview } from '@/shared/api/modules/review'

// 用户 store
const userStore = useUserStore()

// Props
interface Props {
  modelValue: boolean
  reviewData?: any
  itemInfo?: {
    id: string
    name: string
    price: number
    image: string
    userId?: string
  }
  orderId?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  reviewData: undefined,
  itemInfo: undefined,
  orderId: undefined
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': [review: any]
}>()

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const uploadRef = ref()
const submitting = ref(false)
const fileList = ref<any[]>([])

// 表单数据
const form = reactive({
  rating: 5,
  content: '',
  tags: [],
  images: [] as string[],
  isAnonymous: false
})

// 表单验证规则
const rules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  content: [
    { min: 10, max: 500, message: '评价内容长度在10-500个字符之间', trigger: 'blur' }
  ]
}

// 评分相关
const ratingColors = ['#F56C6C', '#E6A23C', '#E6A23C', '#67C23A', '#67C23A']
const ratingTexts = ['非常差', '较差', '一般', '满意', '非常满意']

// 可用标签
const availableTags = [
  { id: 'quality_good', name: '质量好' },
  { id: 'price_reasonable', name: '价格合理' },
  { id: 'fast_delivery', name: '发货快' },
  { id: 'good_service', name: '服务好' },
  { id: 'as_described', name: '符合描述' },
  { id: 'good_condition', name: '成色好' },
  { id: 'practical', name: '实用' },
  { id: 'well_packaged', name: '包装好' }
]

// 上传配置
const uploadUrl = '/api/upload/review-image'
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${userStore.token}`
}))

// 计算属性
const isEditing = computed(() => !!props.reviewData)
const canSubmit = computed(() => {
  return form.rating > 0 && form.content.length >= 10 && form.content.length <= 500
})

// 方法
const getRatingTip = (rating: number) => {
  const tips = [
    '请选择您的满意度评分',
    '非常不满意，完全不推荐',
    '不太满意，存在较多问题',
    '一般般，可以接受但不够理想',
    '比较满意，值得推荐',
    '非常满意，强烈推荐！'
  ]
  return tips[rating] || tips[0]
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB！')
    return false
  }
  return true
}

const handleUploadSuccess: UploadProps['onSuccess'] = (response, file) => {
  if (response.code === 200) {
    form.images.push(response.data.url)
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '图片上传失败')
    // 从文件列表中移除失败的文件
    const index = fileList.value.findIndex(item => item.uid === file.uid)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
  }
}

const handleUploadError: UploadProps['onError'] = (error, file) => {
  console.error('Upload error:', error)
  ElMessage.error('图片上传失败，请重试')
  // 从文件列表中移除失败的文件
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

const handleRemove: UploadProps['onRemove'] = (file) => {
  const index = form.images.findIndex(url => url === file.url)
  if (index > -1) {
    form.images.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    if (!canSubmit.value) {
      ElMessage.warning('请完善评价内容')
      return
    }

    submitting.value = true

    const data = {
      rating: form.rating,
      content: form.content,
      images: form.images,
      tags: form.tags,
      isAnonymous: form.isAnonymous
    }

    let response
    if (isEditing.value) {
      // 编辑评价
      response = await updateReview(props.reviewData.id, data)
    } else {
      // 创建评价
      if (!props.itemInfo?.id) {
        ElMessage.error('缺少物品信息')
        return
      }
      
      response = await createReview({
        itemId: props.itemInfo.id,
        targetUserId: props.itemInfo.userId || '', // 需要从物品信息中获取用户ID
        orderId: props.orderId,
        ...data
      })
    }

    ElMessage.success(isEditing.value ? '评价修改成功' : '评价发布成功')
    emit('success', response)
    handleClose()
    
  } catch (error) {
    console.error('提交评价失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  if (submitting.value) return
  
  // 检查是否有未保存的更改
  if (hasUnsavedChanges()) {
    ElMessageBox.confirm('您有未保存的更改，确定要关闭吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      resetForm()
      dialogVisible.value = false
    })
  } else {
    resetForm()
    dialogVisible.value = false
  }
}

const hasUnsavedChanges = () => {
  if (!props.reviewData) {
    return form.rating > 0 || form.content.length > 0 || form.images.length > 0
  }
  
  return (
    form.rating !== props.reviewData.rating ||
    form.content !== props.reviewData.content ||
    JSON.stringify(form.images) !== JSON.stringify(props.reviewData.images)
  )
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.rating = 5
  form.content = ''
  form.tags = []
  form.images = []
  form.isAnonymous = false
  fileList.value = []
}

const loadReviewData = () => {
  if (!props.reviewData) return
  
  nextTick(() => {
    form.rating = props.reviewData.rating
    form.content = props.reviewData.content || ''
    form.tags = props.reviewData.tags || []
    form.images = props.reviewData.images || []
    form.isAnonymous = props.reviewData.isAnonymous || false
    
    // 设置文件列表
    if (props.reviewData.images) {
      fileList.value = props.reviewData.images.map((url: string, index: number) => ({
        name: `image${index}`,
        url
      }))
    }
  })
}

// 监听弹窗显示
watch(() => props.modelValue, (visible) => {
  if (visible && props.reviewData) {
    loadReviewData()
  } else if (!visible) {
    resetForm()
  }
})
</script>

<style scoped>
.item-info {
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.item-price {
  font-size: 16px;
  color: #f56c6c;
  font-weight: 600;
}

.rating-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rating-tip {
  font-size: 14px;
  color: #606266;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
  line-height: 86px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 80px;
  height: 80px;
}

:deep(.el-checkbox) {
  margin-right: 12px;
  margin-bottom: 8px;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}
</style>