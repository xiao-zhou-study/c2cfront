<template>
  <div class="search-history-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>搜索历史</h1>
        <el-button
          type="primary"
          @click="goToAdvancedSearch"
        >
          <el-icon><Search /></el-icon>
          高级搜索
        </el-button>
      </div>

      <!-- 历史记录统计 -->
      <el-row
        :gutter="20"
        class="stats-row"
      >
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">
                {{ totalSearches }}
              </div>
              <div class="stat-label">
                总搜索次数
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">
                {{ uniqueKeywords }}
              </div>
              <div class="stat-label">
                不同关键词
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">
                {{ savedSearches }}
              </div>
              <div class="stat-label">
                保存的搜索
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">
                {{ todaySearches }}
              </div>
              <div class="stat-label">
                今日搜索
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="action-left">
          <el-button
            type="danger"
            plain
            @click="clearAllHistory"
          >
            <el-icon><Delete /></el-icon>
            清空历史
          </el-button>
          <el-button @click="exportHistory">
            <el-icon><Download /></el-icon>
            导出历史
          </el-button>
        </div>
        <div class="action-right">
          <el-select
            v-model="groupBy"
            placeholder="分组方式"
            style="width: 120px"
          >
            <el-option
              label="按时间"
              value="time"
            />
            <el-option
              label="按关键词"
              value="keyword"
            />
          </el-select>
        </div>
      </div>

      <!-- 搜索历史列表 -->
      <el-card class="history-card">
        <template #header>
          <span>搜索记录</span>
        </template>
        
        <!-- 按时间分组 -->
        <div
          v-if="groupBy === 'time'"
          class="history-grouped"
        >
          <div
            v-for="group in groupedByTime"
            :key="group.date"
            class="time-group"
          >
            <div class="group-header">
              <h3>{{ group.date }}</h3>
              <span class="group-count">{{ group.items.length }} 次搜索</span>
            </div>
            <div class="history-items">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="history-item"
                @click="searchKeyword(item.keyword)"
              >
                <div class="history-content">
                  <div class="history-keyword">
                    {{ item.keyword }}
                  </div>
                  <div
                    v-if="item.hasFilters"
                    class="history-filters"
                  >
                    <el-tag
                      size="small"
                      type="info"
                    >
                      有筛选条件
                    </el-tag>
                  </div>
                </div>
                <div class="history-meta">
                  <span class="history-time">{{ formatTime(item.time) }}</span>
                  <span
                    v-if="item.resultCount"
                    class="history-count"
                  >
                    {{ item.resultCount }} 结果
                  </span>
                </div>
                <div class="history-actions">
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="searchAgain(item)"
                  >
                    再次搜索
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="deleteHistory(item.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 按关键词分组 -->
        <div
          v-else
          class="history-grouped"
        >
          <div
            v-for="group in groupedByKeyword"
            :key="group.keyword"
            class="keyword-group"
          >
            <div class="group-header">
              <h3>{{ group.keyword }}</h3>
              <span class="group-count">{{ group.count }} 次搜索</span>
            </div>
            <div class="keyword-stats">
              <el-tag size="small">
                最近: {{ formatTime(group.lastTime) }}
              </el-tag>
              <el-tag
                v-if="group.avgResults"
                size="small"
                type="success"
              >
                平均结果: {{ group.avgResults }}
              </el-tag>
            </div>
            <div class="history-items">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="history-item compact"
              >
                <span class="history-time">{{ formatDateTime(item.time) }}</span>
                <span
                  v-if="item.resultCount"
                  class="history-result"
                >
                  {{ item.resultCount }} 结果
                </span>
                <el-button
                  type="text"
                  size="small"
                  @click="searchAgain(item)"
                >
                  搜索
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="historyList.length === 0"
          description="暂无搜索历史"
        >
          <el-button
            type="primary"
            @click="goToAdvancedSearch"
          >
            开始搜索
          </el-button>
        </el-empty>
      </el-card>

      <!-- 热门搜索 -->
      <el-card class="popular-card">
        <template #header>
          <span>热门搜索</span>
        </template>
        
        <div class="popular-tags">
          <el-tag
            v-for="(item, index) in popularSearches"
            :key="item.keyword"
            :type="getTagType(index)"
            class="popular-tag"
            @click="searchKeyword(item.keyword)"
          >
            {{ index + 1 }}. {{ item.keyword }}
            <span class="search-count">({{ item.count }})</span>
          </el-tag>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete, Download } from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const groupBy = ref('time')

// 模拟搜索历史数据
const historyList = ref([
  {
    id: 1,
    keyword: '笔记本电脑',
    time: Date.now() - 300000,
    resultCount: 45,
    hasFilters: true,
    filters: { category: 1, maxPrice: 3000 }
  },
  {
    id: 2,
    keyword: '办公椅',
    time: Date.now() - 600000,
    resultCount: 23,
    hasFilters: false
  },
  {
    id: 3,
    keyword: '手机支架',
    time: Date.now() - 3600000,
    resultCount: 67,
    hasFilters: true,
    filters: { category: 1, minPrice: 10, maxPrice: 100 }
  },
  {
    id: 4,
    keyword: '书架',
    time: Date.now() - 7200000,
    resultCount: 12,
    hasFilters: false
  },
  {
    id: 5,
    keyword: '笔记本电脑',
    time: Date.now() - 86400000,
    resultCount: 52,
    hasFilters: false
  },
  {
    id: 6,
    keyword: '运动器材',
    time: Date.now() - 172800000,
    resultCount: 38,
    hasFilters: true,
    filters: { category: 5 }
  },
  {
    id: 7,
    keyword: '宿舍用品',
    time: Date.now() - 259200000,
    resultCount: 89,
    hasFilters: false
  },
  {
    id: 8,
    keyword: '手机支架',
    time: Date.now() - 345600000,
    resultCount: 71,
    hasFilters: false
  }
])

// 热门搜索
const popularSearches = ref([
  { keyword: '笔记本电脑', count: 156 },
  { keyword: '办公椅', count: 134 },
  { keyword: '手机支架', count: 98 },
  { keyword: '宿舍用品', count: 87 },
  { keyword: '运动器材', count: 76 },
  { keyword: '书架', count: 65 },
  { keyword: '台灯', count: 54 },
  { keyword: '键盘', count: 43 }
])

// 计算属性
const totalSearches = computed(() => historyList.value.length)

const uniqueKeywords = computed(() => {
  const keywords = new Set(historyList.value.map(item => item.keyword))
  return keywords.size
})

const todaySearches = computed(() => {
  const today = new Date().toDateString()
  return historyList.value.filter(item => 
    new Date(item.time).toDateString() === today
  ).length
})

const savedSearches = computed(() => {
  return 3 // 模拟保存的搜索数量
})

const groupedByTime = computed(() => {
  const groups: { [key: string]: any[] } = {}
  
  historyList.value.forEach(item => {
    const date = formatDate(item.time)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })
  
  return Object.keys(groups).map(date => ({
    date,
    items: groups[date].sort((a, b) => b.time - a.time)
  })).sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB.getTime() - dateA.getTime()
  })
})

const groupedByKeyword = computed(() => {
  const groups: { [key: string]: any[] } = {}
  
  historyList.value.forEach(item => {
    if (!groups[item.keyword]) {
      groups[item.keyword] = []
    }
    groups[item.keyword].push(item)
  })
  
  return Object.keys(groups).map(keyword => {
    const items = groups[keyword].sort((a, b) => b.time - a.time)
    const totalResults = items.reduce((sum, item) => sum + (item.resultCount || 0), 0)
    const avgResults = Math.round(totalResults / items.length)
    
    return {
      keyword,
      items,
      count: items.length,
      lastTime: items[0].time,
      avgResults
    }
  }).sort((a, b) => b.count - a.count)
})

// 方法
const goToAdvancedSearch = () => {
  router.push('/search/advanced')
}

const searchKeyword = (keyword: string) => {
  router.push({
    path: '/search/results',
    query: { q: keyword }
  })
}

const searchAgain = (item: any) => {
  const query: any = { q: item.keyword }
  
  // 如果有筛选条件，也传递过去
  if (item.filters) {
    Object.assign(query, item.filters)
  }
  
  router.push({
    path: '/search/results',
    query
  })
}

const deleteHistory = (id: number) => {
  const index = historyList.value.findIndex(item => item.id === id)
  if (index > -1) {
    historyList.value.splice(index, 1)
    saveToLocalStorage()
    ElMessage.success('已删除该条历史记录')
  }
}

const clearAllHistory = () => {
  ElMessageBox.confirm('确定要清空所有搜索历史吗？此操作不可恢复。', '确认清空', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyList.value = []
    saveToLocalStorage()
    ElMessage.success('搜索历史已清空')
  })
}

const exportHistory = () => {
  if (historyList.value.length === 0) {
    ElMessage.warning('暂无历史记录可导出')
    return
  }
  
  const data = historyList.value.map(item => ({
    关键词: item.keyword,
    搜索时间: formatDateTime(item.time),
    结果数量: item.resultCount || 0,
    有筛选条件: item.hasFilters ? '是' : '否'
  }))
  
  // 这里应该调用导出API或生成CSV文件
  console.log('Export data:', data)
  ElMessage.success('历史记录已导出')
}

const getTagType = (index: number) => {
  const types = ['', 'success', 'warning', 'danger']
  return types[Math.min(index, 3)]
}

const formatDate = (time: number) => {
  const date = new Date(time)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

const formatTime = (time: number) => {
  const now = Date.now()
  const diff = now - time
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return new Date(time).toLocaleDateString()
}

const formatDateTime = (time: number) => {
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const saveToLocalStorage = () => {
  localStorage.setItem('searchHistory', JSON.stringify(historyList.value))
}

// 生命周期
onMounted(() => {
  // 从本地存储加载搜索历史
  const saved = localStorage.getItem('searchHistory')
  if (saved) {
    try {
      historyList.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load search history:', e)
    }
  }
})
</script>

<style scoped>
.search-history-page {
  padding: 20px 0;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-left {
  display: flex;
  gap: 10px;
}

.history-card {
  margin-bottom: 20px;
}

.history-grouped {
  max-height: 600px;
  overflow-y: auto;
}

.time-group, .keyword-group {
  margin-bottom: 30px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
}

.group-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.group-count {
  font-size: 14px;
  color: #909399;
}

.keyword-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background-color: #e9ecef;
  transform: translateX(5px);
}

.history-item.compact {
  padding: 8px 15px;
}

.history-content {
  flex: 1;
}

.history-keyword {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.history-filters {
  margin-top: 5px;
}

.history-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 15px;
}

.history-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 3px;
}

.history-count {
  font-size: 12px;
  color: #606266;
}

.history-actions {
  display: flex;
  gap: 5px;
}

.popular-card {
  margin-bottom: 20px;
}

.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.popular-tag {
  cursor: pointer;
  transition: transform 0.3s;
}

.popular-tag:hover {
  transform: scale(1.05);
}

.search-count {
  margin-left: 5px;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .stats-row .el-col {
    margin-bottom: 10px;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .action-left {
    justify-content: center;
  }
  
  .history-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .history-meta {
    align-items: flex-start;
    margin-right: 0;
  }
  
  .history-actions {
    justify-content: center;
  }
  
  .popular-tags {
    justify-content: center;
  }
}

/* 滚动条样式 */
.history-grouped::-webkit-scrollbar {
  width: 6px;
}

.history-grouped::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.history-grouped::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.history-grouped::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>