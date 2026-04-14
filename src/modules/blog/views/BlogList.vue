<template>
  <div class="blog-container">
    <!-- 左侧固定侧边栏 -->
    <aside class="blog-sidebar">
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input
          v-model="keyword"
          placeholder="搜索话题..."
          clearable
          size="large"
          @keyup.enter="fetchTopics"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" class="search-btn" @click="fetchTopics">
          搜索
        </el-button>
      </div>

      <!-- 分类导航 -->
      <div class="category-section">
        <h3 class="section-title">
          <el-icon><Folder /></el-icon>
          分类导航
        </h3>
        <ul class="category-list">
          <li
            class="category-item"
            :class="{ active: !categoryFilter }"
            @click="selectCategory('')"
          >
            <span class="category-name">全部话题</span>
          </li>
          <li
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            :class="{ active: categoryFilter === cat.id }"
            @click="selectCategory(cat.id)"
          >
            <span class="category-name">{{ cat.name }}</span>
          </li>
        </ul>
      </div>

      <!-- 排序选择 -->
      <div class="sort-section">
        <h3 class="section-title">
          <el-icon><Sort /></el-icon>
          排序方式
        </h3>
        <el-radio-group v-model="sortOrder" class="sort-radio" @change="fetchTopics">
          <el-radio-button value="desc">最新发布</el-radio-button>
          <el-radio-button value="asc">最早发布</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 发起讨论按钮 -->
      <el-button type="primary" class="create-btn" @click="goCreate">
        <el-icon><EditPen /></el-icon>
        发起讨论
      </el-button>
    </aside>

    <!-- 右侧瀑布流内容区 -->
    <main class="blog-main">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated v-for="i in 4" :key="i" class="skeleton-card" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="topics.length === 0" class="empty-state">
        <div class="empty-icon">
          <el-icon :size="64"><ChatDotRound /></el-icon>
        </div>
        <p class="empty-text">暂无话题讨论</p>
        <p class="empty-desc">快来发起第一个话题吧</p>
        <el-button type="primary" @click="goCreate">发起讨论</el-button>
      </div>

      <!-- 瀑布流卡片 -->
      <div v-else class="waterfall-grid">
        <div
          v-for="topic in topics"
          :key="topic.id"
          class="topic-card"
          @click="goTopic(topic.id)"
        >
          <!-- 分类标签 -->
          <div class="card-category-tag">{{ topic.categoryName }}</div>

          <!-- 标题 -->
          <h3 class="card-title">{{ topic.title }}</h3>

          <!-- 摘要 -->
          <p class="card-excerpt">{{ topic.excerpt || topic.content }}</p>

          <!-- 元信息 -->
          <div class="card-meta">
            <div class="meta-author">
              <el-avatar :size="24" class="author-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="author-name">{{ topic.authorName }}</span>
            </div>
            <div class="meta-stats">
              <span class="stat-item replies">
                <el-icon><ChatLineRound /></el-icon>
                {{ topic.replyCount }}
              </span>
            </div>
          </div>

          <!-- 时间戳 -->
          <div class="card-time">{{ topic.createdAt }}</div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="topics.length > 0" class="pagination-wrap">
        <el-pagination
          v-model:current-page="pageNo"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="fetchTopics"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  EditPen,
  Search,
  Folder,
  Sort,
  User,
  ChatLineRound,
  ChatDotRound
} from '@element-plus/icons-vue'
import { blogApi } from '@/shared/api'
import { ElMessage } from 'element-plus'
import { formatTimeAgo } from '@/shared/utils/format'

const router = useRouter()
const loading = ref(true)
const keyword = ref('')
const sortOrder = ref('desc')
const categoryFilter = ref('')
const topics = ref([])
const categories = ref([])
const pageNo = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 生成内容摘要
function generateExcerpt(content, maxLength = 120) {
  if (!content) return ''
  // 移除Markdown标记
  const plainText = content.replace(/[#*`_\[\]]/g, '').trim()
  if (plainText.length <= maxLength) return plainText
  return plainText.substring(0, maxLength) + '…'
}

// 选择分类
function selectCategory(catId) {
  categoryFilter.value = catId
  pageNo.value = 1
  fetchTopics()
}

// 获取分类列表
async function fetchCategories() {
  try {
    const list = await blogApi.getCategoryList()
    categories.value = list || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取话题列表
async function fetchTopics() {
  loading.value = true
  try {
    const params = {
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      sortBy: sortOrder.value === 'hot' ? 'comment_count' : 'create_time',
      isAsc: sortOrder.value === 'asc',
      keyword: keyword.value || undefined,
      categoryId: categoryFilter.value || undefined
    }

    const response = await blogApi.getTopicList(params)

    // 数据适配
    topics.value = response.list.map(topic => ({
      id: topic.id,
      title: topic.title,
      content: topic.content,
      excerpt: generateExcerpt(topic.content),
      authorName: topic.userNickname,
      categoryName: topic.categoryName,
      categoryId: topic.categoryId,
      createdAt: formatTimeAgo(topic.createTime),
      replyCount: topic.commentCount || 0,
      viewCount: topic.viewCount || 0
    }))

    total.value = response.total
  } catch (error) {
    console.error('获取话题列表失败:', error)
    ElMessage.error('获取话题列表失败')
    topics.value = []
  } finally {
    loading.value = false
  }
}

function goCreate() {
  router.push('/blog/create')
}

function goTopic(id) {
  router.push(`/blog/${id}`)
}

onMounted(() => {
  fetchCategories()
  fetchTopics()
})
</script>

<style scoped>
.blog-container {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px;
  min-height: calc(100vh - 120px);
}

/* 左侧侧边栏 */
.blog-sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-btn {
  width: 100%;
}

.category-section,
.sort-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e8e8e8;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-title .el-icon {
  color: #409eff;
}

.category-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #606266;
}

.category-item:hover {
  background: #f5f7fa;
}

.category-item.active {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
}

.category-name {
  font-size: 14px;
}

.sort-radio {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sort-radio .el-radio-button {
  margin-right: 0;
}

.sort-radio .el-radio-button__inner {
  width: 100%;
  border-radius: 8px !important;
  border: 1px solid #dcdfe6 !important;
}

.create-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  border-radius: 12px;
}

/* 右侧主内容区 */
.blog-main {
  flex: 1;
  min-width: 0;
}

.loading-state {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.skeleton-card {
  padding: 20px;
  background: #fff;
  border-radius: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background: #fff;
  border-radius: 16px;
}

.empty-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.empty-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 24px;
}

/* 瀑布流网格 */
.waterfall-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* 话题卡片 */
.topic-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  background-image: linear-gradient(#fff, #fff),
                    linear-gradient(135deg, #e8e8e8 0%, #e8e8e8 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}

.topic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  background-image: linear-gradient(#fff, #fff),
                    linear-gradient(135deg, #409eff 0%, #67c23a 100%);
}

.topic-card:hover .card-title {
  color: #409eff;
}

/* 分类标签 */
.card-category-tag {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #409eff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  margin-bottom: 12px;
}

/* 标题 */
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin: 0 0 12px;
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 摘要 */
.card-excerpt {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 元信息 */
.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
}

.meta-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.author-name {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.meta-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.stat-item.replies {
  color: #409eff;
}

/* 时间戳 */
.card-time {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 12px;
  color: #909399;
}

/* 分页 */
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
}
</style>