<template>
  <div class="announcements-page">
    <div class="announcements-header">
      <h1 class="announcements-title">校园公告</h1>
      <p class="announcements-desc">查看学校、各部门发布的最新通知与公告</p>
    </div>

    <div class="announcements-toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索公告标题或内容"
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="list.length === 0" class="empty-wrap">
      <p class="empty-text">暂无公告</p>
    </div>

    <ul v-else class="announcement-list">
      <li
        v-for="item in list"
        :key="item.id"
        class="announcement-card"
        @click="goDetail(item.id)"
      >
        <div class="announcement-main">
          <h3 class="announcement-title">{{ item.title }}</h3>
          <p v-if="item.content" class="announcement-excerpt">
            {{ truncate(item.content, 80) }}
          </p>
          <div class="announcement-meta">
            <span class="announcement-date">
              发布时间：{{ formatTimestamp(Number(item.createTime), 'YYYY-MM-DD HH:mm') }}
            </span>
          </div>
        </div>
        <div class="announcement-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </li>
    </ul>
    <div v-if="total > 0" class="pagination-wrap">
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowRight } from '@element-plus/icons-vue'
import { request } from '@/shared/api/request'
import { formatTimestamp, truncate } from '@/shared/utils/format'

const router = useRouter()
const loading = ref(true)
const keyword = ref('')
const list = ref([])
const pageNo = ref(1)
const pageSize = ref(20)
const total = ref(0)
const pages = ref(0)

async function fetchList() {
  loading.value = true
  try {
    const params = {
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      isAsc: true,
      sortBy: 'create_time',
      isPublished: true
    }

    const k = keyword.value.trim()
    if (k) {
      params.keyword = k
    }

    const res = await request.get('/cs/campus_announcements/list', { params })

    total.value = res.total
    pages.value = res.pages
    list.value = res.list || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageNo.value = 1
  fetchList()
}

function handleSizeChange(size) {
  pageSize.value = size
  pageNo.value = 1
  fetchList()
}

function handleCurrentChange(page) {
  pageNo.value = page
  fetchList()
}

function goDetail(id) {
  router.push(`/announcements/${id}`)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.announcements-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 32px;
}

.announcements-header {
  margin-bottom: 24px;
}

.announcements-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.announcements-desc {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.announcements-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.dept-select {
  width: 140px;
}

.loading-wrap,
.empty-wrap {
  padding: 40px 0;
  text-align: center;
}

.empty-text {
  margin: 0;
  color: #909399;
}

.announcement-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.announcement-card:hover {
  background: #fafafa;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.announcement-main {
  flex: 1;
  min-width: 0;
}

.announcement-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.announcement-excerpt {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.announcement-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.announcement-tag {
  color: #e6a23c;
  border: 1px solid #f5dab1;
  border-radius: 999px;
  padding: 2px 8px;
}

.announcement-arrow {
  color: #c0c4cc;
  font-size: 18px;
}

@media (max-width: 768px) {
  .announcements-page {
    padding: 0 12px 24px;
  }
  .announcement-card {
    padding: 16px;
  }
}
</style>
