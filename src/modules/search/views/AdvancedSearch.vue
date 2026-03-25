<template>
  <div class="advanced-search-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>高级搜索</h1>
        <p>使用更多筛选条件找到您需要的物品</p>
      </div>

      <!-- 搜索表单 -->
      <el-card class="search-form-card">
        <template #header>
          <div class="card-header">
            <span>搜索条件</span>
            <el-button
              type="text"
              @click="resetForm"
            >
              重置
            </el-button>
          </div>
        </template>
        
        <el-form
          :model="searchForm"
          label-width="100px"
          label-position="left"
        >
          <!-- 关键词搜索 -->
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="输入物品名称、描述等关键词"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <!-- 分类选择 -->
          <el-form-item label="分类">
            <el-select
              v-model="searchForm.categoryId"
              placeholder="选择物品分类"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>

          <!-- 价格范围 -->
          <el-form-item label="价格范围">
            <div class="price-range">
              <el-input-number
                v-model="searchForm.minPrice"
                :min="0"
                placeholder="最低价"
                style="width: 150px"
              />
              <span class="separator">-</span>
              <el-input-number
                v-model="searchForm.maxPrice"
                :min="0"
                placeholder="最高价"
                style="width: 150px"
              />
            </div>
          </el-form-item>

          <!-- 物品状态 -->
          <el-form-item label="物品状态">
            <el-checkbox-group v-model="searchForm.statuses">
              <el-checkbox label="available">
                可用
              </el-checkbox>
              <el-checkbox label="reserved">
                已预留
              </el-checkbox>
              <el-checkbox label="borrowed">
                已借出
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <!-- 位置筛选 -->
          <el-form-item label="位置">
            <el-cascader
              v-model="searchForm.location"
              :options="locationOptions"
              :props="{ expandTrigger: 'hover' }"
              placeholder="选择地区"
              clearable
              style="width: 300px"
            />
          </el-form-item>

          <!-- 发布时间 -->
          <el-form-item label="发布时间">
            <el-select
              v-model="searchForm.publishTime"
              placeholder="选择时间范围"
              clearable
              style="width: 200px"
            >
              <el-option
                label="最近1天"
                value="1"
              />
              <el-option
                label="最近3天"
                value="3"
              />
              <el-option
                label="最近7天"
                value="7"
              />
              <el-option
                label="最近30天"
                value="30"
              />
            </el-select>
          </el-form-item>

          <!-- 排序方式 -->
          <el-form-item label="排序方式">
            <el-select
              v-model="searchForm.sortBy"
              style="width: 200px"
            >
              <el-option
                label="默认排序"
                value="default"
              />
              <el-option
                label="价格从低到高"
                value="price_asc"
              />
              <el-option
                label="价格从高到低"
                value="price_desc"
              />
              <el-option
                label="最新发布"
                value="newest"
              />
              <el-option
                label="浏览最多"
                value="most_viewed"
              />
            </el-select>
          </el-form-item>

          <!-- 搜索按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="handleSearch"
            >
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="saveSearch">
              保存搜索条件
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 搜索历史 -->
      <el-card
        v-if="searchHistory.length > 0"
        class="history-card"
      >
        <template #header>
          <div class="card-header">
            <span>搜索历史</span>
            <el-button
              type="text"
              @click="clearHistory"
            >
              清空历史
            </el-button>
          </div>
        </template>
        
        <div class="history-list">
          <div
            v-for="(item, index) in searchHistory"
            :key="index"
            class="history-item"
            @click="applyHistory(item)"
          >
            <div class="history-keyword">
              {{ item.keyword }}
            </div>
            <div class="history-time">
              {{ formatTime(item.time) }}
            </div>
            <el-button
              type="text"
              size="small"
              @click.stop="removeHistory(index)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 保存的搜索 -->
      <el-card
        v-if="savedSearches.length > 0"
        class="saved-searches-card"
      >
        <template #header>
          <span>保存的搜索</span>
        </template>
        
        <div class="saved-searches-list">
          <div
            v-for="(item, index) in savedSearches"
            :key="index"
            class="saved-search-item"
          >
            <div class="saved-search-name">
              {{ item.name }}
            </div>
            <div class="saved-search-conditions">
              {{ getConditionsText(item) }}
            </div>
            <div class="saved-search-actions">
              <el-button
                type="text"
                size="small"
                @click="applySavedSearch(item)"
              >
                应用
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="deleteSavedSearch(index)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 保存搜索对话框 -->
    <el-dialog
      v-model="saveDialogVisible"
      title="保存搜索条件"
      width="400px"
    >
      <el-form
        :model="saveForm"
        label-width="80px"
      >
        <el-form-item
          label="名称"
          required
        >
          <el-input
            v-model="saveForm.name"
            placeholder="为这次搜索起个名字"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="saveDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmSaveSearch"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Close } from '@element-plus/icons-vue'
import { 
  addSearchHistory, 
  getSearchHistory, 
  saveSearchConditions
} from '@/shared/api/modules/search'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const saveDialogVisible = ref(false)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  categoryId: null,
  minPrice: null,
  maxPrice: null,
  statuses: [],
  location: [],
  publishTime: '',
  sortBy: 'default'
})

// 保存搜索表单
const saveForm = reactive({
  name: ''
})

// 模拟数据
const categories = ref([
  { id: 1, name: '电子产品' },
  { id: 2, name: '家具' },
  { id: 3, name: '服装' },
  { id: 4, name: '图书' },
  { id: 5, name: '运动器材' },
  { id: 6, name: '生活用品' },
  { id: 7, name: '学习用品' },
  { id: 8, name: '其他' }
])

const locationOptions = ref([
  {
    value: 'beijing',
    label: '北京',
    children: [
      { value: 'haidian', label: '海淀区' },
      { value: 'chaoyang', label: '朝阳区' },
      { value: 'dongcheng', label: '东城区' },
      { value: 'xicheng', label: '西城区' }
    ]
  },
  {
    value: 'shanghai',
    label: '上海',
    children: [
      { value: 'pudong', label: '浦东新区' },
      { value: 'huangpu', label: '黄浦区' },
      { value: 'jingan', label: '静安区' },
      { value: 'xuhui', label: '徐汇区' }
    ]
  }
])

// 搜索历史
const searchHistory = ref([
  { keyword: '笔记本电脑', time: Date.now() - 3600000 },
  { keyword: '办公椅', time: Date.now() - 7200000 },
  { keyword: '手机支架', time: Date.now() - 86400000 }
])

// 保存的搜索
const savedSearches = ref([
  {
    name: '低价电子产品',
    conditions: { categoryId: 1, maxPrice: 500, sortBy: 'price_asc' }
  },
  {
    name: '海淀区的家具',
    conditions: { categoryId: 2, location: ['beijing', 'haidian'] }
  }
])

// 方法
const handleSearch = () => {
  if (!searchForm.keyword && !hasAnyFilter()) {
    ElMessage.warning('请输入关键词或选择筛选条件')
    return
  }

  // 添加到搜索历史
  if (searchForm.keyword) {
    addToHistory(searchForm.keyword)
  }

  // 构建搜索参数
  const searchParams = buildSearchParams()
  
  // 跳转到搜索结果页
  router.push({
    path: '/search/results',
    query: searchParams
  })
}

const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = []
    } else if (typeof searchForm[key] === 'object') {
      searchForm[key] = null
    } else {
      searchForm[key] = ''
    }
  })
}

const hasAnyFilter = () => {
  return (
    searchForm.categoryId ||
    searchForm.minPrice !== null ||
    searchForm.maxPrice !== null ||
    searchForm.statuses.length > 0 ||
    searchForm.location.length > 0 ||
    searchForm.publishTime ||
    searchForm.sortBy !== 'default'
  )
}

const buildSearchParams = () => {
  const params: any = {}
  
  if (searchForm.keyword) params.q = searchForm.keyword
  if (searchForm.categoryId) params.category = searchForm.categoryId
  if (searchForm.minPrice !== null) params.minPrice = searchForm.minPrice
  if (searchForm.maxPrice !== null) params.maxPrice = searchForm.maxPrice
  if (searchForm.statuses.length > 0) params.statuses = searchForm.statuses.join(',')
  if (searchForm.location.length > 0) params.location = searchForm.location.join(',')
  if (searchForm.publishTime) params.publishTime = searchForm.publishTime
  if (searchForm.sortBy !== 'default') params.sortBy = searchForm.sortBy
  
  return params
}

const saveSearch = () => {
  if (!hasAnyFilter()) {
    ElMessage.warning('请先设置搜索条件')
    return
  }
  
  saveForm.name = ''
  saveDialogVisible.value = true
}

const confirmSaveSearch = async () => {
  if (!saveForm.name.trim()) {
    ElMessage.warning('请输入搜索名称')
    return
  }

  try {
    await saveSearchConditions({
      name: saveForm.name.trim(),
      conditions: { 
        q: searchForm.keyword,
        category: searchForm.categoryId,
        minPrice: searchForm.minPrice,
        maxPrice: searchForm.maxPrice,
        statuses: searchForm.statuses.join(',') || '',
        location: searchForm.location.join(',') || '',
        publishTime: searchForm.publishTime,
        sortBy: searchForm.sortBy as 'default' | 'price_asc' | 'price_desc' | 'newest' | 'most_viewed'
      }
    })

    // 重新加载保存的搜索
    await loadSavedSearches()

    saveDialogVisible.value = false
    ElMessage.success('搜索条件已保存')
  } catch (error) {
    console.error('保存搜索条件失败:', error)
    ElMessage.error('保存搜索条件失败，请重试')
  }
}

const addToHistory = async (keyword: string) => {
  try {
    // 调用API添加搜索历史
    await addSearchHistory({
      keyword,
      filters: hasAnyFilter() ? { ...searchForm } : undefined
    })

    // 重新加载搜索历史
    await loadSearchHistory()
  } catch (error) {
    console.error('添加搜索历史失败:', error)
    // 如果API失败，使用本地存储作为备选
    // 移除重复的历史记录
    const existingIndex = searchHistory.value.findIndex(item => item.keyword === keyword)
    if (existingIndex > -1) {
      searchHistory.value.splice(existingIndex, 1)
    }

    // 添加到开头
    searchHistory.value.unshift({
      keyword,
      time: Date.now()
    })

    // 限制历史记录数量
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10)
    }

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }
}

const applyHistory = (item: any) => {
  searchForm.keyword = item.keyword
  handleSearch()
}

const removeHistory = (index: number) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

const clearHistory = () => {
  ElMessageBox.confirm('确定要清空搜索历史吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    searchHistory.value = []
    localStorage.removeItem('searchHistory')
    ElMessage.success('搜索历史已清空')
  })
}

const applySavedSearch = (item: any) => {
  Object.keys(item.conditions).forEach(key => {
    searchForm[key] = item.conditions[key]
  })
  handleSearch()
}

const deleteSavedSearch = (index: number) => {
  savedSearches.value.splice(index, 1)
  ElMessage.success('已删除保存的搜索')
}

const getConditionsText = (item: any) => {
  const resultConditions = []
  const { conditions } = item
  
  if (conditions.categoryId) {
    const category = categories.value.find(c => c.id === conditions.categoryId)
    if (category) resultConditions.push(category.name)
  }
  
  if (conditions.minPrice !== null || conditions.maxPrice !== null) {
    const min = conditions.minPrice || 0
    const max = conditions.maxPrice || '不限'
    resultConditions.push(`价格: ${min}-${max}`)
  }
  
  if (conditions.location.length > 0) {
    resultConditions.push('地区已选择')
  }
  
  if (conditions.sortBy !== 'default') {
    const sortMap = {
      price_asc: '价格从低到高',
      price_desc: '价格从高到低',
      newest: '最新发布',
      most_viewed: '浏览最多'
    }
    resultConditions.push(sortMap[conditions.sortBy])
  }
  
  return resultConditions.length > 0 ? resultConditions.join(', ') : '无特定条件'
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

const loadCategories = async () => {
  try {
    // 使用模拟数据，因为API尚未实现
    // const response = await getCategoryList()
    // categories.value = response
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadSearchHistory = async () => {
  try {
    const response = await getSearchHistory()
    searchHistory.value = response
  } catch (error) {
    console.error('加载搜索历史失败:', error)
    // 从本地存储加载作为备选
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      try {
        searchHistory.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to load search history from localStorage:', e)
      }
    }
  }
}

const loadSavedSearches = async () => {
  try {
    // 使用模拟数据，因为API尚未实现
    // const response = await getSavedSearches()
    // savedSearches.value = response
  } catch (error) {
    console.error('加载保存的搜索失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadSearchHistory(),
    loadSavedSearches()
  ])
})
</script>

<style scoped>
.advanced-search-page {
  padding: 20px 0;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.page-header p {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.search-form-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.separator {
  color: #909399;
  font-weight: 500;
}

.history-card, .saved-searches-card {
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.history-item:hover {
  background-color: #e9ecef;
}

.history-keyword {
  flex: 1;
  font-weight: 500;
  color: #303133;
}

.history-time {
  margin-right: 10px;
  font-size: 12px;
  color: #909399;
}

.saved-searches-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.saved-search-item {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.saved-search-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.saved-search-conditions {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.saved-search-actions {
  display: flex;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
  
  .price-range {
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
  }
  
  .separator {
    display: none;
  }
}
</style>