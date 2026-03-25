<template>
  <div class="announcement-detail-page">
    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="8" animated />
    </div>

    <template v-else-if="detail">
      <div class="detail-header">
        <el-button text class="btn-back" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <h1 class="detail-title">{{ detail.title }}</h1>
        <div class="detail-meta">
          <span>发布时间：{{ formatTimestamp(Number(detail.createTime), 'YYYY-MM-DD HH:mm') }}</span>
        </div>
      </div>
      <div class="detail-body" v-html="detail.content"></div>
    </template>

    <div v-else class="empty-wrap">
      <p class="empty-text">公告不存在或已下架</p>
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { request } from '@/shared/api/request'
import { formatTimestamp } from '@/shared/utils/format'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const detail = ref(null)

const id = computed(() => Number(route.params.id) || 0)

async function fetchDetail() {
  if (!id.value) {
    detail.value = null
    return
  }
  loading.value = true
  try {
    const res = await request.get('/cs/campus_announcements/get', {
      params: { id: id.value }
    })
    detail.value = res || null
  } catch (e) {
    detail.value = null
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/announcements')
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.announcement-detail-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px 32px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  color: #909399;
  padding: 0;
}

.btn-back:hover {
  color: #409EFF;
}

.loading-wrap,
.empty-wrap {
  padding: 40px 0;
  text-align: center;
}

.empty-text {
  margin: 0 0 16px;
  color: #909399;
}

.detail-header {
  margin-bottom: 24px;
}

.detail-title {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.detail-tag {
  color: #e6a23c;
  border: 1px solid #f5dab1;
  border-radius: 999px;
  padding: 2px 8px;
}

.detail-body {
  font-size: 15px;
  line-height: 1.7;
  color: #303133;
}

.detail-body :deep(p) {
  margin: 0 0 12px;
}

.detail-body :deep(p:last-child) {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .announcement-detail-page {
    padding: 0 12px 24px;
  }
  .detail-title {
    font-size: 18px;
  }
}
</style>
