<template>
  <div class="enhanced-search">
    <div class="search-input-wrapper">
      <el-input
        ref="searchInputRef"
        v-model="searchKeyword"
        placeholder="搜索物品名称、描述、标签..."
        size="large"
        clearable
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @keyup.enter="handleSearch"
        @clear="handleClear"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button
            :icon="Search"
            @click="handleSearch"
          >
            搜索
          </el-button>
        </template>
      </el-input>

      <!-- 搜索建议下拉框 -->
      <transition name="el-zoom-in-top">
        <div
          v-if="showSuggestions"
          class="suggestions-dropdown"
        >
          <!-- 智能提示 -->
          <div
            v-if="filteredSuggestions.length > 0"
            class="suggestions-section"
          >
            <div class="section-header">
              <span class="section-title">🔍 智能提示</span>
            </div>
            <div class="suggestions-list">
              <div
                v-for="(suggestion, index) in filteredSuggestions"
                :key="'suggestion-' + index"
                class="suggestion-item"
                @click="selectSuggestion(suggestion)"
              >
                <el-icon class="item-icon">
                  <Search />
                </el-icon>
                <span
                  class="item-text"
                  v-html="highlightKeyword(suggestion)"
                />
                <el-icon class="arrow-icon">
                  <Right />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 搜索历史 -->
          <div
            v-if="searchHistory.length > 0 && !searchKeyword"
            class="suggestions-section"
          >
            <div class="section-header">
              <span class="section-title">🕐 搜索历史</span>
              <el-button
                text
                size="small"
                @click="clearHistory"
              >
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
            </div>
            <div class="suggestions-list">
              <div
                v-for="(item, index) in searchHistory"
                :key="'history-' + index"
                class="suggestion-item history-item"
                @click="selectSuggestion(item)"
              >
                <el-icon class="item-icon">
                  <Clock />
                </el-icon>
                <span class="item-text">{{ item }}</span>
                <el-icon
                  class="close-icon"
                  @click.stop="removeHistory(index)"
                >
                  <Close />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 热门搜索 -->
          <div
            v-if="hotSearches.length > 0 && !searchKeyword"
            class="suggestions-section"
          >
            <div class="section-header">
              <span class="section-title">🔥 热门搜索</span>
            </div>
            <div class="hot-tags">
              <el-tag
                v-for="(tag, index) in hotSearches"
                :key="'hot-' + index"
                class="hot-tag"
                :type="index < 3 ? 'danger' : ''"
                effect="plain"
                @click="selectSuggestion(tag)"
              >
                <span
                  v-if="index < 3"
                  class="tag-rank"
                >{{ index + 1 }}</span>
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="searchKeyword && filteredSuggestions.length === 0"
            class="empty-state"
          >
            <el-icon class="empty-icon">
              <Search />
            </el-icon>
            <p>暂无相关建议</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Search, Clock, Delete, Close, Right } from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue?: string
  suggestions?: string[]
  hotSearches?: string[]
  maxHistory?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  suggestions: () => [],
  hotSearches: () => ['电子产品', '图书教材', '运动器材', '生活用品', '乐器', '摄影设备'],
  maxHistory: 10
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [keyword: string]
  'select-suggestion': [suggestion: string]
}>()

// 响应式数据
const searchInputRef = ref()
const searchKeyword = ref(props.modelValue)
const showSuggestions = ref(false)
const searchHistory = ref<string[]>([])
const isFocused = ref(false)

// 计算属性
const filteredSuggestions = computed(() => {
  if (!searchKeyword.value) return []
  const keyword = searchKeyword.value.toLowerCase()
  return props.suggestions.filter(s => 
    s.toLowerCase().includes(keyword)
  ).slice(0, 8)
})

// 监听搜索关键词变化
watch(() => props.modelValue, (newVal) => {
  searchKeyword.value = newVal
})

watch(searchKeyword, (newVal) => {
  emit('update:modelValue', newVal)
})

// 方法
const handleFocus = () => {
  isFocused.value = true
  showSuggestions.value = true
}

const handleBlur = () => {
  isFocused.value = false
  // 延迟隐藏,以便点击建议项
  setTimeout(() => {
    if (!isFocused.value) {
      showSuggestions.value = false
    }
  }, 200)
}

const handleInput = () => {
  showSuggestions.value = true
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  
  // 添加到搜索历史
  addToHistory(searchKeyword.value.trim())
  
  // 触发搜索事件
  emit('search', searchKeyword.value.trim())
  
  // 隐藏建议框
  showSuggestions.value = false
  searchInputRef.value?.blur()
}

const handleClear = () => {
  searchKeyword.value = ''
  emit('search', '')
}

const selectSuggestion = (suggestion: string) => {
  searchKeyword.value = suggestion
  addToHistory(suggestion)
  emit('select-suggestion', suggestion)
  emit('search', suggestion)
  showSuggestions.value = false
}

const highlightKeyword = (text: string) => {
  if (!searchKeyword.value) return text
  const keyword = searchKeyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<strong class="highlight">$1</strong>')
}

// 搜索历史管理
const addToHistory = (keyword: string) => {
  // 移除重复项
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  
  // 添加到开头
  searchHistory.value.unshift(keyword)
  
  // 限制数量
  if (searchHistory.value.length > props.maxHistory) {
    searchHistory.value = searchHistory.value.slice(0, props.maxHistory)
  }
  
  // 保存到本地存储
  saveHistory()
}

const removeHistory = (index: number) => {
  searchHistory.value.splice(index, 1)
  saveHistory()
}

const clearHistory = () => {
  searchHistory.value = []
  saveHistory()
}

const saveHistory = () => {
  try {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

const loadHistory = () => {
  try {
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      searchHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadHistory()
})

// 点击外部关闭建议框
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const searchWrapper = target.closest('.enhanced-search')
  if (!searchWrapper) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.enhanced-search {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
}

/* 搜索建议下拉框 */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 480px;
  overflow-y: auto;
  z-index: 2000;
  border: 1px solid var(--border-color);
}

.suggestions-section {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color-light);
}

.suggestions-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* 建议列表 */
.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  background: var(--bg-hover);
}

.item-icon {
  flex-shrink: 0;
  color: var(--text-placeholder);
  font-size: 16px;
}

.item-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-text :deep(.highlight) {
  color: var(--brand-primary);
  font-weight: 600;
}

.arrow-icon {
  flex-shrink: 0;
  color: var(--text-placeholder);
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.suggestion-item:hover .arrow-icon {
  opacity: 1;
}

.close-icon {
  flex-shrink: 0;
  color: var(--text-placeholder);
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.close-icon:hover {
  color: var(--danger-color);
}

.history-item:hover .close-icon {
  opacity: 1;
}

/* 热门标签 */
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.hot-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  padding-left: 24px;
}

.hot-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tag-rank {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 700;
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
  color: var(--text-placeholder);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.3;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 滚动条样式 */
.suggestions-dropdown::-webkit-scrollbar {
  width: 6px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--text-placeholder);
}

/* 动画 */
.el-zoom-in-top-enter-active,
.el-zoom-in-top-leave-active {
  opacity: 1;
  transform: scaleY(1);
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: center top;
}

.el-zoom-in-top-enter-from,
.el-zoom-in-top-leave-to {
  opacity: 0;
  transform: scaleY(0);
}
</style>
