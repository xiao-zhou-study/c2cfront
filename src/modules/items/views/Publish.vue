<template>
  <div class="publish-page">
    <div class="publish-container">
      <!-- 顶部导航栏 -->
      <div class="page-header">
        <el-button
          class="back-btn"
          text
          @click="$router.go(-1)"
        >
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
        <div class="header-title">
          {{ isEditMode ? '编辑物品' : '发布闲置' }}
        </div>
        <div class="header-placeholder" />
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
        class="publish-form"
        size="large"
      >
        <!-- 图片上传区域 -->
        <el-card class="form-card image-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon class="title-icon"><Picture /></el-icon>
                <span>物品图片</span>
                <el-tag
                  size="small"
                  type="danger"
                  effect="plain"
                >
                  必填
                </el-tag>
              </div>
              <span class="card-tip">{{ form.images.length }}/6</span>
            </div>
          </template>

          <el-form-item
            prop="images"
            class="no-label-item"
          >
            <div class="image-upload-wrapper">
              <el-upload
                v-model:file-list="form.images"
                action="#"
                :auto-upload="false"
                list-type="picture-card"
                :limit="6"
                multiple
                :on-exceed="handleImageExceed"
                :on-preview="handleImagePreview"
                :on-remove="handleImageRemove"
                :on-change="handleImageChange"
                accept="image/*"
                class="image-uploader"
              >
                <div class="upload-trigger">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <span class="upload-text">添加图片</span>
                </div>
                <template #file="{ file }">
                  <div class="image-item">
                    <img
                      :src="file.url"
                      alt=""
                      class="uploaded-image"
                    >
                    <div class="image-actions">
                      <el-icon
                        class="action-icon preview-icon"
                        @click.stop="handleImagePreview(file)"
                      >
                        <ZoomIn />
                      </el-icon>
                      <el-icon
                        class="action-icon delete-icon"
                        @click.stop="handleRemoveImage(file)"
                      >
                        <Delete />
                      </el-icon>
                    </div>
                  </div>
                </template>
              </el-upload>
            </div>
            <div class="upload-hint">
              <el-icon class="hint-icon"><InfoFilled /></el-icon>
              <div class="hint-content">
                <p>• 支持 JPG、PNG 格式，单张不超过 5MB</p>
                <p>• 建议上传清晰、光线充足的照片，突出物品细节</p>
                <p>• 第一张图片将作为封面展示</p>
              </div>
            </div>
          </el-form-item>
        </el-card>

        <!-- 基本信息区域 -->
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon class="title-icon"><Document /></el-icon>
                <span>基本信息</span>
              </div>
            </div>
          </template>

          <el-form-item
            label="物品名称"
            prop="title"
          >
            <el-input
              v-model="form.title"
              placeholder="给你的闲置起个好名字"
              maxlength="50"
              show-word-limit
              clearable
            >
              <template #prefix>
                <el-icon><Notebook /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item
                label="物品分类"
                prop="category"
              >
                <el-select
                  v-model="form.category"
                  placeholder="选择合适的分类"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="category in categories"
                    :key="category.value"
                    :label="category.label"
                    :value="category.value"
                  >
                    <div class="select-option">
                      <img
                        v-if="category.icon && (category.icon.startsWith('http://') || category.icon.startsWith('https://') || category.icon.startsWith('/'))"
                        :src="category.icon"
                        :alt="category.label"
                        class="option-icon-img"
                      >
                      <span
                        v-else
                        class="option-icon"
                      >{{ category.icon }}</span>
                      <span class="option-label">{{ category.label }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item
                label="物品成色"
                prop="condition"
              >
                <el-select
                  v-model="form.condition"
                  placeholder="选择物品成色"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="item in conditionOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                    <div class="condition-option">
                      <span class="condition-label">{{ item.label }}</span>
                      <el-tag
                        :color="item.color"
                        size="small"
                        style="border: none; color: white;"
                      >
                        {{ item.badge }}
                      </el-tag>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item
            label="物品描述"
            prop="description"
          >
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="5"
              placeholder="详细描述物品的使用情况、功能特点、购买时间、使用时长等&#10;提示：描述越详细，越容易获得买家信任哦~"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-card>

        <!-- 价格设置区域 -->
        <el-card class="form-card price-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon class="title-icon"><Money /></el-icon>
                <span>价格设置</span>
                <el-tag
                  size="small"
                  type="danger"
                  effect="plain"
                >
                  必填
                </el-tag>
              </div>
            </div>
          </template>

          <el-form-item
            label="出售价格"
            prop="price"
            class="price-form-item"
          >
            <div class="price-input-wrapper">
              <el-input-number
                v-model="form.price"
                :min="0.01"
                :max="99999"
                :precision="2"
                :controls="false"
                placeholder="0.00"
                class="price-input"
              >
                <template #suffix>
                  <span class="price-unit">元</span>
                </template>
              </el-input-number>
              <div class="price-tip">
                <el-icon class="tip-icon"><Warning /></el-icon>
                <span>建议定价合理,可参考原价的 3-7 折</span>
              </div>
            </div>
          </el-form-item>
        </el-card>

        <!-- 位置信息区域 -->
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon class="title-icon"><Location /></el-icon>
                <span>交易地点</span>
              </div>
            </div>
          </template>

          <el-form-item
            label="物品位置"
            prop="location"
          >
            <el-input
              v-model="form.location"
              placeholder="如：A区宿舍楼、图书馆、教学楼等"
              clearable
            >
              <template #prefix>
                <el-icon><Location /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item
            label="详细地址"
            prop="address"
          >
            <el-input
              v-model="form.address"
              placeholder="请输入详细地址，方便买家找到你"
              clearable
            >
              <template #prefix>
                <el-icon><MapLocation /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-card>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button
            class="action-btn reset-btn"
            size="large"
            @click="handleResetForm"
          >
            <el-icon><RefreshLeft /></el-icon>
            <span>重置</span>
          </el-button>
          <el-button
            class="action-btn draft-btn"
            size="large"
            :loading="draftLoading"
            @click="handleSaveDraft"
          >
            <el-icon v-if="!draftLoading"><Document /></el-icon>
            <span>保存草稿</span>
          </el-button>
          <el-button
            class="action-btn publish-btn"
            type="primary"
            size="large"
            :loading="publishLoading"
            @click="handlePublish"
          >
            <el-icon v-if="!publishLoading"><Select /></el-icon>
            <span>{{ publishLoading ? (isEditMode ? '更新中...' : '发布中...') : (isEditMode ? '更新物品' : '立即发布') }}</span>
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="图片预览"
      width="70%"
      class="preview-dialog"
    >
      <img
        v-if="previewImage"
        :src="previewImage"
        alt="预览图片"
        class="preview-image"
      >
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document, Money, Location, MapLocation,
  Plus, Delete, Picture, ArrowLeft,
  ZoomIn, InfoFilled, Notebook, Warning,
  RefreshLeft, Select
} from '@element-plus/icons-vue'
import { getCategoryList, publishItem, updateItem } from '@/shared/api/modules/item'
import { uploadImagesReturnUrls } from '@/shared/api/modules/file'
import { useUserStore } from '@/shared/stores/user'
import { itemApi } from '@/shared/api'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const loading = ref(false)

// 用户状态
const userStore = useUserStore()

// 获取草稿存储键名（按用户ID隔离）
const getDraftKey = () => {
  const userId = userStore.userId ?? 'anonymous'
  return `draft_item_${userId}`
}

// 表单初始值（用于重置）
const getInitialFormState = () => ({
  images: [],
  title: '',
  category: '',
  condition: 0,
  description: '',
  price: null,
  location: '',
  address: ''
})

// 表单数据
const form = reactive({
  ...getInitialFormState()
})

// 加载状态
const draftLoading = ref(false)
const publishLoading = ref(false)

// 图片预览
const previewVisible = ref(false)
const previewImage = ref('')

// 分类选项（从后端API获取）
const categories = ref([])

// 加载分类列表
const loadCategories = async () => {
  try {
    const data = await getCategoryList()
    categories.value = data.filter(cat => cat.isActive).map(cat => ({
      label: cat.name,
      value: cat.id,
      icon: cat.icon || '📦'
    }))
  } catch (error) {
    ElMessage.error('获取分类列表失败')
    console.error('Error loading categories:', error)
  }
}

// 成色选项（对应后端 ConditionLevel 枚举：0-全新, 1-九成新, 2-八成新）
const conditionOptions = [
  { label: '全新', value: 0, color: '#03a688', badge: '100%' },
  { label: '九成新', value: 1, color: '#67c23a', badge: '90-95%' },
  { label: '八成新', value: 2, color: '#e6a23c', badge: '80-89%' }
]

// 表单验证规则
const rules = {
  images: [
    { required: true, message: '请上传至少一张物品图片', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入物品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '物品名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择物品分类', trigger: 'change' }
  ],
  condition: [
    { required: true, message: '请选择物品成色', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入物品描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入出售价格', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '价格必须大于 0.01 元', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入物品位置', trigger: 'blur' }
  ]
}

// 工具函数

// 图片上传处理：超过数量限制时的提示
const handleImageExceed = () => {
  ElMessage.warning('最多只能上传 6 张图片')
}

const handleImageChange = (file, fileList) => {
  // 验证文件类型和大小
  const isImage = file.raw.type.startsWith('image/')
  const isLt5M = file.raw.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB！')
    return false
  }

  // 创建预览URL
  if (file.raw && !file.url) {
    file.url = URL.createObjectURL(file.raw)
  }

  form.images = fileList
  return true
}

const handleImageRemove = (file, fileList) => {
  // 释放URL对象
  if (file.url) {
    URL.revokeObjectURL(file.url)
  }
  form.images = fileList
}

// 从图片缩略图上删除图片
const handleRemoveImage = (file) => {
  const index = form.images.findIndex(img => img.uid === file.uid)
  if (index !== -1) {
    // 释放URL对象
    if (file.url) {
      URL.revokeObjectURL(file.url)
    }
    form.images.splice(index, 1)
  }
}

const handleImagePreview = (file) => {
  previewImage.value = file.url
  previewVisible.value = true
}

// 表单操作

// 重置表单信息
const handleResetForm = () => {
  form.images.forEach(file => {
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
  })
  Object.assign(form, getInitialFormState())
  formRef.value?.clearValidate()
  ElMessage.success('表单已重置')
}

const handleSaveDraft = async () => {
  try {
    draftLoading.value = true

    // 按用户 ID 区分，保存到 localStorage（只存可序列化数据，不存 File）
    const draftKey = getDraftKey()
    const draftPayload = {
      images: form.images.map(img => ({ name: img.name, url: img.url, uid: img.uid })),
      title: form.title,
      category: form.category,
      condition: form.condition,
      description: form.description,
      price: form.price,
      location: form.location,
      address: form.address
    }
    localStorage.setItem(draftKey, JSON.stringify(draftPayload))

    ElMessage.success('草稿已保存到本地')
  } catch (error) {
    ElMessage.error('保存草稿失败')
    console.error('Error saving draft:', error)
  } finally {
    draftLoading.value = false
  }
}

const handlePublish = async () => {
  try {
    // 1. 先进行基础验证,不使用表单验证器,直接提示缺失项
    const validationErrors = []
    
    if (form.images.length === 0) {
      validationErrors.push('请至少上传一张物品图片')
    }
    
    if (!form.title || form.title.trim().length === 0) {
      validationErrors.push('请输入物品名称')
    } else if (form.title.length < 2 || form.title.length > 100) {
      validationErrors.push('物品名称长度在 2 到 100 个字符')
    }
    
    if (!form.category) {
      validationErrors.push('请选择物品分类')
    }
    
    if (form.condition === null || form.condition === undefined) {
      validationErrors.push('请选择物品成色')
    }
    
    if (!form.description || form.description.trim().length === 0) {
      validationErrors.push('请输入物品描述')
    } else if (form.description.length < 10 || form.description.length > 500) {
      validationErrors.push('描述长度在 10 到 500 个字符')
    }
    
    if (!form.price || form.price < 0.01) {
      validationErrors.push('请输入出售价格（至少 0.01 元）')
    }
    
    if (!form.location || form.location.trim().length === 0) {
      validationErrors.push('请输入物品位置')
    }
    
    // 如果有验证错误,显示第一个错误
    if (validationErrors.length > 0) {
      ElMessage.warning(validationErrors[0])
      return
    }

    publishLoading.value = true

    const isEdit = isEditMode.value

    // 2. 确认发布/更新操作
    if (isEdit) {
      await ElMessageBox.confirm(
        '确认更新此物品吗？修改后将立即生效。',
        '确认更新',
        {
          confirmButtonText: '确认更新',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
    } else {
      await ElMessageBox.confirm(
        '确认发布此物品吗？发布后其他用户即可查看并购买。',
        '确认发布',
        {
          confirmButtonText: '确认发布',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
    }

    // 3. 上传图片到 Cloudflare R2
    let imageUrls = []
    
    // 提取需要上传的文件（只上传有 raw 对象的本地文件）
    const filesToUpload = form.images.filter(img => img.raw).map(img => img.raw)
    
    if (filesToUpload.length > 0) {
      const uploadMsg = ElMessage({
        message: `正在上传 ${filesToUpload.length} 张图片...`,
        type: 'info',
        duration: 0,
        iconClass: 'el-icon-loading'
      })

      try {
        // 调用批量上传接口 POST /ss/files/upload/batch?module=items
        imageUrls = await uploadImagesReturnUrls(filesToUpload, 'items')
        uploadMsg.close()
        console.log('图片上传成功，返回的 URL 列表:', imageUrls)
      } catch (uploadError) {
        uploadMsg.close()
        ElMessage.error('图片上传失败，请检查网络后重试')
        console.error('图片上传失败:', uploadError)
        publishLoading.value = false
        return
      }
      
      // 合并已上传的图片 URL（编辑模式可能有已存在的URL）和新上传的 URL
      const existingUrls = form.images.filter(img => !img.raw).map(img => img.url)
      imageUrls = [...existingUrls, ...imageUrls]
    } else {
      // 没有新图片需要上传，使用现有的URL
      imageUrls = form.images.map(img => img.url)
    }

    // 4. 提交物品信息到后端
    const submitMsg = ElMessage({
      message: isEdit ? '正在更新物品信息...' : '正在发布物品...',
      type: 'info',
      duration: 0,
      iconClass: 'el-icon-loading'
    })

    try {
      // 请求体（对接 POST /is/items 新增物品接口）
      const payload = {
        title: form.title,
        description: form.description,
        categoryId: Number(form.category),
        conditionLevel: form.condition,
        images: imageUrls,
        price: Number(form.price),
        location: form.location,
        address: form.address || ''
      }

      if (isEdit) {
        // 更新模式：需要传递 id
        const id = String(editItemId.value)
        await updateItem(id, { ...payload, id: Number(id) })
        submitMsg.close()
        ElMessage.success('物品更新成功！')
        router.push(`/items/${editItemId.value}`)
      } else {
        // 新增模式：调用 POST /is/items 接口，返回新创建的物品ID
        const itemId = await publishItem(payload)
        submitMsg.close()
        ElMessage.success('物品发布成功！')
        
        // 清除本地草稿
        const draftKey = getDraftKey()
        localStorage.removeItem(draftKey)
        
        // 跳转到物品详情页
        router.push(`/items/${itemId}`)
      }
    } catch (submitError) {
      submitMsg.close()
      // 不显示通用的"发布失败"提示，request.ts 会自动显示具体错误
      console.error(isEdit ? '更新物品失败:' : '发布物品失败:', submitError)
      publishLoading.value = false
    }

  } catch (error) {
    // 用户取消发布操作
    if (error === 'cancel') {
      console.log('用户取消了发布操作')
    } else {
      console.error('发布过程出错:', error)
    }
    publishLoading.value = false
  }
}

// 加载草稿
const loadDraft = () => {
  try {
    const draftKey = getDraftKey()
    const draft = localStorage.getItem(draftKey)
    if (draft) {
      const draftData = JSON.parse(draft)
      Object.assign(form, draftData)
      ElMessage.info('已加载上次保存的草稿')
    }
  } catch (error) {
    console.error('Error loading draft:', error)
  }
}

// 检查是否为编辑模式
const isEditMode = computed(() => {
  return route.query.edit !== undefined
})

const editItemId = computed(() => {
  return route.query.edit
})

// 加载要编辑的物品数据
const loadEditItem = async () => {
  if (!isEditMode.value) return

  try {
    loading.value = true

    // 首先尝试从路由状态获取数据（从ItemManageCard传递过来）
    let editData = null
    
    if (route.state && route.state.item) {
      editData = route.state.item
      console.log('从路由state获取数据:', editData)
    } else {
      // 如果没有传递数据，则从API获取
      console.log('从API获取编辑数据...')
      editData = await itemApi.getItemDetail(editItemId.value)
      console.log('从API获取到的数据:', editData)
    }

    // 统一的数据格式转换：将后端数据格式转换为表单格式
    // 处理 conditionLevel：可能是数字或枚举对象
    let conditionValue = 0
    if (typeof editData.conditionLevel === 'number') {
      conditionValue = editData.conditionLevel
    } else if (typeof editData.conditionLevel === 'object' && editData.conditionLevel !== null) {
      // 如果是枚举对象，提取 value 或 ordinal
      conditionValue = editData.conditionLevel.value ?? editData.conditionLevel.ordinal ?? 0
    }

    Object.assign(form, {
      images: editData.images?.map((url, index) => ({
        name: `image_${index}`,
        url: url,
        uid: Date.now() + index
      })) || [],
      title: editData.title || '',
      category: String(editData.categoryId || editData.category || ''),
      condition: conditionValue,
      description: editData.description || '',
      price: editData.price ? Number(editData.price) : null,
      location: editData.location || '',
      address: editData.address || ''
    })

    console.log('表单数据已填充:', form)
    ElMessage.success('编辑数据加载完成')

  } catch (error) {
    ElMessage.error('加载物品数据失败')
    console.error('加载物品数据失败:', error)
    router.push('/items')
  } finally {
    loading.value = false
  }
}

// 组件初始化
onMounted(async () => {
  // 先加载分类列表
  await loadCategories()

  if (isEditMode.value) {
    loadEditItem()
  } else {
    loadDraft()
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  // 释放所有图片URL对象
  form.images.forEach(file => {
    if (file.url) {
      URL.revokeObjectURL(file.url)
    }
  })
})
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf8 0%, #f8fffe 50%, #f0f9ff 100%);
  padding-bottom: 40px;
}

.publish-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 顶部导航栏 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  margin-bottom: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s;
}

.back-btn:hover {
  color: #03a688;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.header-placeholder {
  width: 80px;
}

/* 表单卡片 */
.publish-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card {
  background: white;
  border-radius: 16px;
  border: none;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.form-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fffe 0%, #f0fdf8 100%);
  border-bottom: 1px solid #e5f3f0;
  padding: 20px 24px;
}

.form-card :deep(.el-card__body) {
  padding: 32px 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.title-icon {
  font-size: 20px;
  color: #03a688;
}

.card-tip {
  font-size: 14px;
  color: #6b7280;
}

/* 图片上传 */
.image-card :deep(.el-card__body) {
  padding: 24px;
}

.no-label-item {
  margin-bottom: 0;
}

.no-label-item :deep(.el-form-item__label) {
  display: none;
}

.no-label-item :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

.image-upload-wrapper {
  width: 100%;
}

.image-uploader {
  width: 100%;
}

.image-uploader :deep(.el-upload-list) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.image-uploader :deep(.el-upload--picture-card) {
  width: 100%;
  height: 140px;
  border: 2px dashed #b8e6d8;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fffe 0%, #f0fdf8 100%);
  transition: all 0.3s;
}

.image-uploader :deep(.el-upload--picture-card:hover) {
  border-color: #03a688;
  background: white;
}

.image-uploader :deep(.el-upload-list__item) {
  width: 100%;
  height: 140px;
  border: 2px solid #e5f3f0;
  border-radius: 12px;
  padding: 0;
  margin: 0;
  transition: all 0.3s;
}

.image-uploader :deep(.el-upload-list__item:hover) {
  border-color: #03a688;
  box-shadow: 0 4px 12px rgba(3, 166, 136, 0.15);
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: #6b7280;
}

.upload-icon {
  font-size: 32px;
  color: #03a688;
}

.upload-text {
  font-size: 14px;
}

.image-item {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.action-icon {
  font-size: 24px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.action-icon:hover {
  transform: scale(1.2);
}

.preview-icon:hover {
  color: #03a688;
}

.delete-icon:hover {
  color: #f56c6c;
}

.upload-hint {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fffe 0%, #f0fdf8 100%);
  border-radius: 12px;
  border: 1px solid #e5f3f0;
}

.hint-icon {
  font-size: 18px;
  color: #03a688;
  flex-shrink: 0;
  margin-top: 2px;
}

.hint-content {
  flex: 1;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.8;
}

.hint-content p {
  margin: 0;
}

/* 表单项样式 */
.publish-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.publish-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.publish-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(3, 166, 136, 0.1);
}

.publish-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #03a688 inset;
}

.publish-form :deep(.el-textarea__inner) {
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.publish-form :deep(.el-textarea__inner:hover) {
  box-shadow: 0 2px 8px rgba(3, 166, 136, 0.1);
}

.publish-form :deep(.el-textarea__inner:focus) {
  border-color: #03a688;
  box-shadow: 0 0 0 1px #03a688 inset;
}

/* 选择器选项 */
.select-option,
.condition-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.option-icon {
  font-size: 18px;
  margin-right: 8px;
}

.option-icon-img {
  width: 20px;
  height: 20px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 8px;
}

.option-label,
.condition-label {
  flex: 1;
}

/* 价格输入 */
.price-card :deep(.el-card__body) {
  padding: 32px 24px 24px;
}

.price-input {
  width: 100%;
}

.price-input :deep(.el-input__wrapper) {
  padding: 0 16px;
}

.price-input :deep(.el-input__inner) {
  text-align: left;
  font-size: 18px;
  font-weight: 600;
  color: #03a688;
}

.price-unit {
  font-size: 16px;
  font-weight: 600;
  color: #03a688;
  margin-right: 8px;
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.price-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #e6a23c;
  white-space: nowrap;
}

.tip-icon {
  font-size: 16px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 0 24px;
}

.action-btn {
  flex: 1;
  max-width: 200px;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.reset-btn {
  background: #f3f4f6;
  border-color: #e5e7eb;
  color: #6b7280;
}

.reset-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
  color: #374151;
}

.draft-btn {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #ea580c;
}

.draft-btn:hover {
  background: #ffedd5;
  border-color: #fdba74;
  color: #c2410c;
}

.publish-btn {
  background: linear-gradient(135deg, #03a688 0%, #02c39a 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(3, 166, 136, 0.3);
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(3, 166, 136, 0.4);
}

.publish-btn:active {
  transform: translateY(0);
}

/* 图片预览对话框 */
.preview-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.preview-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8fffe 0%, #f0fdf8 100%);
  padding: 20px 24px;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .publish-container {
    padding: 0 12px;
  }

  .page-banner {
    padding: 24px 20px;
    border-radius: 16px;
  }

  .banner-content {
    flex-direction: column;
    text-align: center;
  }

  .banner-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }

  .banner-title {
    font-size: 20px;
  }

  .banner-subtitle {
    font-size: 13px;
  }

  .page-banner {
    padding: 24px 20px;
    border-radius: 16px;
  }

  .banner-content {
    flex-direction: column;
    text-align: center;
  }

  .banner-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }

  .banner-title {
    font-size: 20px;
  }

  .banner-subtitle {
    font-size: 13px;
  }

  .form-card :deep(.el-card__header) {
    padding: 16px 20px;
  }

  .form-card :deep(.el-card__body) {
    padding: 20px 16px;
  }

  .image-uploader :deep(.el-upload-list) {
    grid-template-columns: repeat(2, 1fr);
  }

  .publish-form :deep(.el-form-item__label) {
    width: 100% !important;
    text-align: left !important;
    margin-bottom: 8px;
  }

  .publish-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  .action-buttons {
    flex-direction: column;
    padding: 0;
  }

  .action-btn {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 16px 0;
  }

  .header-title {
    font-size: 18px;
  }

  .image-uploader :deep(.el-upload--picture-card),
  .image-uploader :deep(.el-upload-list__item) {
    height: 120px;
  }
}
</style>
