<template>
  <div class="dashboard-container">
    <DashboardCarousel @navigate="navigateTo" />

    <!-- 校园公告、交易动态、热门商品 -->
    <div class="home-cards">
      <section class="home-card">
        <div class="home-card-header">
          <h3 class="home-card-title">公告</h3>
          <button type="button" class="home-card-link" @click="navigateTo('/announcements')">全部</button>
        </div>
        <ul class="home-list">
          <li
            v-for="item in campusAnnouncements"
            :key="item.id"
            class="home-list-item home-list-item--clickable"
            @click="navigateTo(`/announcements/${item.id}`)"
          >
            <div class="home-list-main">
              <span class="home-list-title">{{ item.title }}</span>
              <span class="home-list-meta">
                发布时间：{{ formatTimestamp(Number(item.createTime), 'YYYY-MM-DD HH:mm') }}
              </span>
            </div>
          </li>
        </ul>
      </section>
      <section class="home-card">
        <div class="home-card-header">
          <h3 class="home-card-title">热门商品</h3>
          <button type="button" class="home-card-link" @click="navigateTo('/items?sort=popular')">更多</button>
        </div>
        <ul class="home-rank-list">
          <li
            v-for="(item, index) in shareRankList"
            :key="item.id"
            class="home-rank-item home-rank-item--clickable"
            @click="viewItemDetail(item.id)"
          >
            <span class="home-rank-index">{{ index + 1 }}</span>
            <div class="home-rank-thumb">
              <img :src="item.cover" :alt="item.name" class="home-rank-img">
            </div>
            <div class="home-rank-info">
              <span class="home-rank-title">{{ item.name }}</span>
              <span class="home-rank-meta">{{ item.campus }} · 浏览 {{ item.viewCount }} 次</span>
            </div>
          </li>
        </ul>
      </section>
      <section class="home-card home-card--blog">
        <div class="home-card-header">
          <h3 class="home-card-title">校园讨论</h3>
          <button type="button" class="home-card-link" @click="navigateTo('/blog')">进入动态</button>
        </div>
        <ul class="home-list">
          <li v-for="topic in campusTopics" :key="topic.id" class="home-list-item" @click="navigateTo(`/blog/${topic.id}`)">
            <div class="home-list-main">
              <span class="home-list-title">{{ topic.title }}</span>
              <span class="home-list-meta">{{ topic.category }} · {{ topic.replyCount }} 条回复</span>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <RecommendedItems
      @navigate="navigateTo"
      @item-click="viewItemDetail"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardCarousel from '@/modules/dashboard/components/DashboardCarousel.vue'
import RecommendedItems from '@/modules/dashboard/components/RecommendedItems.vue'
import { blogApi } from '@/shared/api'
import { request } from '@/shared/api/request'
import { formatTimestamp } from '@/shared/utils/format'

const router = useRouter()

const campusAnnouncements = ref([])
const campusTopics = ref([])
// 默认热门商品数据，接口异常时作为回退
const shareRankList = ref([
  { id: 1, name: 'iPad Pro 11 英寸 2022', viewCount: 36, campus: '东校区', cover: 'https://via.placeholder.com/80x60?text=Item' },
  { id: 2, name: '佳能微单相机 EOS M50', viewCount: 24, campus: '西校区', cover: 'https://via.placeholder.com/80x60?text=Item' },
  { id: 3, name: '蓝牙音箱（宿舍学习伴侣）', viewCount: 19, campus: '南校区', cover: 'https://via.placeholder.com/80x60?text=Item' }
])

// 获取前三个话题
async function fetchCampusTopics() {
  try {
    const response = await blogApi.getTopicList({
      pageNo: 1,
      pageSize: 3,
      sortBy: 'create_time',
      isAsc: false
    })
    
    campusTopics.value = response.list.slice(0, 3).map(topic => ({
      id: topic.id,
      title: topic.title,
      category: topic.categoryName,
      replyCount: topic.commentCount
    }))
  } catch (error) {
    console.error('获取话题列表失败:', error)
    campusTopics.value = [
      { id: 1, title: '有没有人转让二手iPad？价格合适可入', category: '求购·数码', replyCount: 0 },
      { id: 2, title: '出一台用了半年的Switch，九成新', category: '出售·游戏', replyCount: 0 },
      { id: 3, title: '二手交易如何避免被骗？', category: '交流·经验', replyCount: 0 }
    ]
  }
}

// 获取校园公告前三条
async function fetchCampusAnnouncements() {
  try {
    const res = await request.get('/cs/campus_announcements/list', {
      params: {
        pageNo: 1,
        pageSize: 3,
        sortBy: 'create_time',
        isAsc: false,
        isPublished: true
      }
    })

    const list = (res && res.list) || []
    campusAnnouncements.value = list.slice(0, 3).map((item) => ({
      id: item.id,
      title: item.title,
      createTime: item.createTime
    }))
  } catch (error) {
    console.error('获取校园公告失败:', error)
    campusAnnouncements.value = []
  }
}

// 获取热门商品排行榜（按浏览量 view_count 降序，取前三个）
async function fetchShareRankList() {
  try {
    const res = await request.get('/is/items', {
      params: {
        pageNo: 1,
        pageSize: 3,
        sortBy: 'view_count',
        isAsc: false
      }
    })

    const list = (res && res.list) || (res && res.data && res.data.list) || []

    shareRankList.value = list.slice(0, 3).map((item) => ({
      id: item.id,
      name: item.title && item.title.length > 18 ? `${item.title.slice(0, 18)}...` : item.title,
      viewCount: item.viewCount ?? 0,
      campus: item.location || '未指定校区',
      cover: Array.isArray(item.images) && item.images.length > 0
        ? item.images[0]
        : 'https://via.placeholder.com/80x60?text=Item'
    }))
  } catch (error) {
    console.error('获取热门商品排行榜失败:', error)
  }
}

const navigateTo = (path) => router.push(path)
const viewItemDetail = (itemId) => router.push(`/items/${itemId}`)

onMounted(() => {
  fetchCampusTopics()
  fetchCampusAnnouncements()
  fetchShareRankList()
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
  box-sizing: border-box;
}

.home-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 1.5rem 0;
}

.home-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #ebeef5;
  padding: 18px 18px 14px;
}

.home-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.home-card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #303133;
}

.home-card-link {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 12px;
  color: #909399;
  cursor: pointer;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.home-card-link:hover {
  color: #03a688;
}

.home-list, .home-rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home-rank-list { gap: 10px; }

.home-list-item, .home-rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.home-list-item { justify-content: space-between; }

.home-list-item--clickable,
.home-card--blog .home-list-item {
  cursor: pointer;
}

.home-rank-item--clickable {
  cursor: pointer;
}

.home-rank-item--clickable:hover .home-rank-title {
  color: #03a688;
}

.home-list-item--clickable:hover .home-list-title,
.home-card--blog .home-list-item:hover .home-list-title {
  color: #03a688;
}

.home-list-main, .home-rank-info {
  flex: 1;
  min-width: 0;
}

.home-list-title, .home-rank-title {
  display: block;
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.home-list-meta, .home-rank-meta {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: #a0a3aa;
}

.home-tag {
  font-size: 11px;
  color: #909399;
  border-radius: 999px;
  border: 1px solid #e4e7ed;
  padding: 2px 8px;
  white-space: nowrap;
}

.home-rank-index {
  width: 18px;
  text-align: right;
  font-size: 12px;
  color: #c0c4cc;
}

.home-rank-thumb {
  width: 72px;
  height: 54px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f7fa;
}

.home-rank-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (max-width: 1200px) {
  .dashboard-container { padding: 0 20px; }
  .home-cards { grid-template-columns: 1fr; gap: 1.25rem; }
}

@media (max-width: 768px) {
  .dashboard-container { padding: 0 16px; }
  .home-cards { gap: 1rem; margin: 1rem 0; }
}
</style>
