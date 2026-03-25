<template>
  <div class="item-actions">
    <div class="action-buttons">
      <el-button 
        type="primary" 
        size="large" 
        :disabled="!(item.status === 1 || item.status === 'available')"
        class="borrow-btn"
        @click="handleBorrow"
      >
        <el-icon><ShoppingCart /></el-icon>
        立即借用
      </el-button>
      
      <el-button 
        size="large" 
        :class="{ 'is-favorited': isFavorited }"
        class="favorite-btn"
        @click="handleFavorite"
      >
        <el-icon><Star /></el-icon>
        {{ isFavorited ? '已收藏' : '收藏' }}
      </el-button>
      
      <el-button 
        size="large" 
        class="share-btn"
        @click="handleShare"
      >
        <el-icon><Share /></el-icon>
        分享
      </el-button>
      
      <el-button 
        size="large" 
        class="report-btn"
        @click="handleReport"
      >
        <el-icon><Warning /></el-icon>
        举报
      </el-button>
    </div>
    
    <div
      v-if="!(item.status === 1 || item.status === 'available')"
      class="action-tips"
    >
      <el-alert 
        title="该物品当前不可借用" 
        type="warning" 
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ShoppingCart, 
  Star, 
  Share, 
  Warning 
} from '@element-plus/icons-vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['borrow', 'favorite', 'share', 'report'])

const isFavorited = ref(false)

const handleBorrow = () => {
  if (!(props.item.status === 1 || props.item.status === 'available')) {
    ElMessage.warning('该物品当前不可借用')
    return
  }
  
  ElMessageBox.confirm(
    `确定要借用「${props.item.title}」吗？`,
    '确认借用',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    emit('borrow', props.item)
    ElMessage.success('借用申请已提交')
  }).catch(() => {
    // 用户取消
  })
}

const handleFavorite = () => {
  isFavorited.value = !isFavorited.value
  emit('favorite', { item: props.item, isFavorited: isFavorited.value })
  
  ElMessage.success(isFavorited.value ? '已添加到收藏' : '已取消收藏')
}

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: props.item.title,
      text: `查看这个好物：${props.item.title}`,
      url: window.location.href
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
  }
  
  emit('share', props.item)
}

const handleReport = () => {
  ElMessageBox.prompt('请输入举报原因', '举报物品', {
    confirmButtonText: '提交',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入举报原因',
    inputType: 'textarea',
    inputPlaceholder: '请详细描述举报原因...'
  }).then(({ value }) => {
    emit('report', { item: props.item, reason: value })
    ElMessage.success('举报已提交，我们会尽快处理')
  }).catch(() => {
    // 用户取消
  })
}
</script>

<style scoped>
.item-actions {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.action-buttons {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.borrow-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
}

.borrow-btn:disabled {
  background: #d1d5db;
  color: #9ca3af;
}

.favorite-btn {
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
}

.favorite-btn:hover {
  border-color: #fbbf24;
  color: #f59e0b;
}

.favorite-btn.is-favorited {
  border-color: #fbbf24;
  background: #fef3c7;
  color: #f59e0b;
}

.share-btn {
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
}

.share-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.report-btn {
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #6b7280;
}

.report-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.action-tips {
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

@media (max-width: 768px) {
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .borrow-btn,
  .favorite-btn,
  .share-btn,
  .report-btn {
    width: 100%;
  }
}
</style>
