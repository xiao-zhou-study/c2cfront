<template>
  <div class="favorites-container">
    <div class="favorites-header">
      <h1>我的收藏</h1>
      <p>收藏的物品会在这里显示</p>
    </div>

    <div
      v-if="loading"
      class="loading-container"
    >
      <el-skeleton
        :rows="5"
        animated
      />
    </div>

    <div
      v-else-if="favoriteItems.length === 0"
      class="empty-container"
    >
      <div class="empty-icon">
        ⭐
      </div>
      <h2>暂无收藏</h2>
      <p>快去收藏你喜欢的物品吧</p>
      <el-button
        type="primary"
        @click="goToItems"
      >
        去浏览物品
      </el-button>
    </div>

    <div
      v-else
      class="favorites-content"
    >
      <!-- 筛选和排序 -->
      <div class="filters-bar">
        <div class="filter-left">
          <el-tag
            type="info"
            size="large"
          >
            共 {{ favoriteItems.length }} 件收藏
          </el-tag>
        </div>
        <div class="filter-right">
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            style="width: 150px"
          >
            <el-option
              label="收藏时间"
              value="time"
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
          </el-select>
        </div>
      </div>

      <!-- 物品列表 -->
      <div class="items-grid">
        <UnifiedItemCard
          v-for="item in sortedItems"
          :key="item.id"
          :item="item"
          @click="viewItemDetail(item.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { itemApi } from '@/shared/api'
import UnifiedItemCard from '@/shared/components/UnifiedItemCard.vue'

const router = useRouter()

const loading = ref(false)
const sortBy = ref('time')
const favoriteItems = ref([])

// localStorage 收藏相关
const FAVORITES_KEY = 'item_favorites'

const getLocalFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveLocalFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

// 排序后的物品
const sortedItems = computed(() => {
  const items = [...favoriteItems.value]
  
  switch (sortBy.value) {
    case 'price_asc':
      return items.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'price_desc':
      return items.sort((a, b) => (b.price || 0) - (a.price || 0))
    case 'newest':
      return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    case 'time':
    default:
      return items
  }
})

// 获取收藏列表 - 从 localStorage 读取收藏 ID，然后调用 API 获取物品详情
const getFavorites = async () => {
  try {
    loading.value = true
    const favoriteIds = getLocalFavorites()
    
    if (favoriteIds.length === 0) {
      favoriteItems.value = []
      return
    }
    
    // 并行获取所有收藏物品的详情
    const itemPromises = favoriteIds.map(async (id) => {
      try {
        const item = await itemApi.getItemDetail(id)
        return {
          ...item,
          isFavorite: true,
          // 处理图片数组
          images: item.images || [item.coverImage || ''],
          // 处理用户信息
          userName: item.owner?.nickname || item.owner?.username || '未知用户',
          userAvatar: item.owner?.avatar || '',
          // 处理评分
          rating: item.stats?.averageRating || 0
        }
      } catch (error) {
        console.warn(`获取物品 ${id} 详情失败:`, error)
        return null
      }
    })
    
    const results = await Promise.all(itemPromises)
    // 过滤掉获取失败的物品
    favoriteItems.value = results.filter(item => item !== null)
    
  } catch (error) {
    ElMessage.error('获取收藏列表失败')
    console.error('获取收藏列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 切换收藏状态 - 使用 localStorage
const toggleFavorite = (item) => {
  const itemId = String(item.id)
  const favorites = getLocalFavorites()
  
  // 从 localStorage 移除
  const newFavorites = favorites.filter(id => id !== itemId)
  saveLocalFavorites(newFavorites)
  
  // 从列表中移除
  const index = favoriteItems.value.findIndex(i => String(i.id) === itemId)
  if (index > -1) {
    favoriteItems.value.splice(index, 1)
  }
  
  ElMessage.success('已取消收藏')
}

// 查看物品详情
const viewItemDetail = (itemId) => {
  router.push(`/items/${itemId}`)
}

// 去浏览物品
const goToItems = () => {
  router.push('/items')
}

onMounted(() => {
  getFavorites()
})
</script>

<style scoped>
.favorites-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.favorites-header {
  margin-bottom: 32px;
}

.favorites-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.favorites-header p {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.loading-container {
  background: white;
  padding: 24px;
  border-radius: 12px;
}

.empty-container {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.empty-container h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.empty-container p {
  font-size: 14px;
  color: #606266;
  margin: 0 0 32px 0;
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.item-wrapper {
  position: relative;
}

.unfavorite-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.unfavorite-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.unfavorite-btn .el-icon {
  font-size: 20px;
  color: #fbbf24;
}

.unfavorite-btn .el-icon.is-favorited {
  color: #fbbf24;
}

.item-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.item-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.item-card:hover .item-image img {
  transform: scale(1.05);
}

.item-status {
  position: absolute;
  top: 12px;
  left: 12px;
}

.item-favorite {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.item-favorite:hover {
  background: white;
  transform: scale(1.1);
}

.item-favorite .el-icon {
  font-size: 20px;
  color: #d1d5db;
  transition: color 0.3s;
}

.item-favorite .el-icon.is-favorited {
  color: #fbbf24;
}

.item-info {
  padding: 16px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-price {
  font-size: 18px;
  font-weight: 700;
  color: #409EFF;
}

.item-location {
  font-size: 12px;
  color: #909399;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.item-owner {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #606266;
}

.item-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #f59e0b;
}

.item-rating .el-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .favorites-container {
    padding: 16px;
  }
  
  .filters-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}
</style>
