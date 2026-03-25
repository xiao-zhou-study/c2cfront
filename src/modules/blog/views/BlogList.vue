<template>
  <div class="blog-page">
    <div class="blog-header">
      <h1 class="blog-title">校园讨论</h1>
      <p class="blog-desc">分享交易经验、提问求助，与同学们交流互助</p>
      <el-button type="primary" class="btn-publish" @click="goCreate">
        <el-icon><EditPen /></el-icon>
        发起讨论
      </el-button>
    </div>

    <div class="blog-toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索讨论标题或内容"
        clearable
        class="search-input"
        @keyup.enter="fetchTopics"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="categoryFilter" placeholder="全部分类" clearable class="category-select" @change="fetchTopics">
        <el-option
          v-for="cat in categories"
          :key="cat.id"
          :label="cat.name"
          :value="cat.id"
        />
      </el-select>
      <el-select v-model="sortOrder" placeholder="排序" class="sort-select" @change="fetchTopics">
        <el-option label="最新发布" value="desc" />
        <el-option label="最早发布" value="asc" />
        <el-option label="最热讨论" value="hot" />
      </el-select>
      <el-button type="primary" @click="fetchTopics">搜索</el-button>
    </div>

    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="topics.length === 0" class="empty-wrap">
      <p class="empty-text">暂无讨论，快来发起第一个话题吧</p>
      <el-button type="primary" @click="goCreate">发起讨论</el-button>
    </div>

    <ul v-else class="topic-list">
      <li
        v-for="topic in topics"
        :key="topic.id"
        class="topic-card"
        @click="goTopic(topic.id)"
      >
        <div class="topic-main">
          <h3 class="topic-title">{{ topic.title }}</h3>
          <p class="topic-excerpt">{{ topic.excerpt || topic.content }}</p>
          <div class="topic-meta">
            <span class="topic-author">
              <el-icon><User /></el-icon>
              {{ topic.authorName }}
            </span>
            <span class="topic-category">
              <el-icon><Collection /></el-icon>
              {{ topic.categoryName }}
            </span>
            <span class="topic-time">
              <el-icon><Clock /></el-icon>
              {{ topic.createdAt }}
            </span>
            <span class="topic-replies">
              <el-icon><ChatLineRound /></el-icon>
              {{ topic.replyCount }} 条回复
            </span>
            <span class="topic-views">
              <el-icon><View /></el-icon>
              {{ topic.viewCount }} 浏览
            </span>
          </div>
        </div>
        <div class="topic-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { EditPen, Search, ArrowRight, User, Collection, Clock, ChatLineRound, View } from '@element-plus/icons-vue'
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
function generateExcerpt(content, maxLength = 100) {
  if (!content) return ''
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '…'
}

// 获取分类列表
async function fetchCategories() {
  try {
    categories.value = await blogApi.getCategoryList()
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
      keyword: keyword.value || undefined
    }

    const response = await blogApi.getTopicList(params)
    
    // 数据适配：将后端返回的数据转换为前端使用的格式
    topics.value = response.list
      .map(topic => ({
        id: topic.id,
        title: topic.title,
        content: topic.content,
        excerpt: generateExcerpt(topic.content),
        authorName: topic.userNickname,
        categoryName: topic.categoryName,
        categoryId: topic.categoryId,
        createdAt: formatTimeAgo(topic.createTime),
        replyCount: topic.commentCount,
        viewCount: topic.viewCount
      }))
      .filter(topic => {
        if (!categoryFilter.value) return true
        return topic.categoryId === categoryFilter.value
      })
    
    total.value = response.total
  } catch (error) {
    console.error('获取话题列表失败:', error)
    ElMessage.error('获取话题列表失败，请稍后重试')
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
.blog-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 32px;
}

.blog-header {
  margin-bottom: 24px;
}

.blog-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.blog-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #909399;
}

.btn-publish {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.blog-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.sort-select {
  width: 140px;
}

.category-select {
  width: 160px;
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

.topic-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topic-card {
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

.topic-card:hover {
  background: #fafafa;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.topic-main {
  flex: 1;
  min-width: 0;
}

.topic-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.topic-excerpt {
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

.topic-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.topic-meta > span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.topic-meta .el-icon {
  font-size: 14px;
}

.topic-replies {
  margin-left: auto;
  color: #409eff;
  font-weight: 500;
}

.topic-views {
  color: #67c23a;
}

.topic-arrow {
  color: #c0c4cc;
  font-size: 18px;
}

@media (max-width: 768px) {
  .blog-page {
    padding: 0 12px 24px;
  }
  .topic-card {
    padding: 16px;
  }
}
</style>
