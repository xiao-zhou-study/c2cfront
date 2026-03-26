<template>
  <div class="item-detail-page">
    <!-- 顶部导航 -->
    <header class="top-bar">
      <div class="top-bar-inner">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/items' }">物品广场</el-breadcrumb-item>
          <el-breadcrumb-item v-if="item" class="current">{{ item.title }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-button text @click="handleShare">
          <el-icon><Share /></el-icon>
          分享
        </el-button>
      </div>
    </header>

    <!-- 加载 -->
    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="12" animated />
    </div>

    <!-- 主内容 -->
    <main v-else-if="item" class="main">
      <!-- 卖家信息栏 -->
      <div class="owner-bar">
        <el-avatar :src="item.avatar" :size="44">
          {{ item.username?.charAt(0) || 'U' }}
        </el-avatar>
        <div class="owner-info">
          <span class="owner-name">{{ item.username || '未知用户' }}</span>
          <span class="owner-tip">卖家</span>
        </div>
        <el-button 
          v-if="!isOwner" 
          text 
          type="primary" 
          class="btn-contact"
          @click="handleContact"
        >
          <el-icon><ChatDotRound /></el-icon>
          联系卖家
        </el-button>
      </div>

      <div class="detail-card">
        <!-- 左侧：图片轮播 -->
        <div class="gallery">
          <div
            class="main-pic-wrap"
            @mouseenter="pauseAutoplay"
            @mouseleave="resumeAutoplay"
          >
            <img
              :src="currentImageUrl"
              :alt="item.title"
              class="main-pic"
              @click="openViewer"
            >
            <div v-if="imagesCount > 1" class="nav-arrows">
              <el-button
                class="arrow"
                circle
                :disabled="currentIndex === 0"
                @click="prevImage"
              >
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button
                class="arrow"
                circle
                :disabled="currentIndex === imagesCount - 1"
                @click="nextImage"
              >
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div v-if="imagesCount > 1" class="indicator">
              {{ currentIndex + 1 }} / {{ imagesCount }}
            </div>
          </div>
          <div v-if="imagesCount > 1" class="thumbnails">
            <div
              v-for="(img, i) in item.images"
              :key="i"
              :class="['thumbnail-item', { active: currentIndex === i }]"
              @click="currentIndex = i"
            >
              <img :src="img" :alt="`图片${i + 1}`">
            </div>
          </div>
        </div>

        <!-- 右侧：商品信息 -->
        <div class="info">
          <h1 class="title">{{ item.title }}</h1>
          
          <div class="tags">
            <el-tag v-if="hasConditionDisplay(item.conditionLevel)" size="large" :type="conditionTagType(item.conditionLevel)">
              {{ conditionText(item.conditionLevel) }}
            </el-tag>
            <el-tag :type="statusTagType" size="large">
              {{ statusText }}
            </el-tag>
            <el-tag v-if="item.categoryName" size="large" type="info" effect="plain">
              {{ item.categoryName }}
            </el-tag>
          </div>

          <!-- 价格区域 -->
          <div class="price-block">
            <div class="price-main">
              <span class="price-label">出售价格</span>
              <div class="price">
                <span class="currency">¥</span>
                <span class="num">{{ formatPrice(item.price) }}</span>
              </div>
            </div>
          </div>

          <!-- 物品属性 -->
          <div class="specs">
            <div class="spec-item">
              <div class="spec-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div class="spec-content">
                <span class="spec-label">交易地点</span>
                <span class="spec-val">{{ item.location || '未填写' }}</span>
                <span v-if="item.address" class="spec-detail">{{ item.address }}</span>
              </div>
            </div>
            
            <div class="spec-item">
              <div class="spec-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="spec-content">
                <span class="spec-label">发布时间</span>
                <span class="spec-val">{{ formatTime(item.createdAt) }}</span>
              </div>
            </div>
            
            <div class="spec-item">
              <div class="spec-icon">
                <el-icon><View /></el-icon>
              </div>
              <div class="spec-content">
                <span class="spec-label">浏览次数</span>
                <span class="spec-val">{{ item.viewCount || 0 }} 次</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="actions">
            <el-button
              type="primary"
              size="large"
              :disabled="!isAvailable"
              class="btn-buy"
              @click="handleBuy"
            >
              <el-icon><ShoppingCart /></el-icon>
              <span>{{ isAvailable ? '立即购买' : '已售出' }}</span>
            </el-button>
            <el-button
              size="large"
              :class="{ favorited: isFavorited }"
              class="btn-fav"
              @click="handleFavorite"
            >
              <el-icon><Star /></el-icon>
              <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
            </el-button>
          </div>

          <div v-if="!isAvailable" class="tip">
            <el-alert title="该物品已售出" type="info" :closable="false" show-icon />
          </div>
        </div>
      </div>

      <!-- 物品描述 -->
      <section class="section">
        <h3 class="section-title">
          <el-icon class="title-icon"><Document /></el-icon>
          物品描述
        </h3>
        <ItemDescription :item="item" />
      </section>

      <!-- 留言板块 -->
      <section class="section">
        <h3 class="section-title">
          <el-icon class="title-icon"><ChatDotRound /></el-icon>
          留言咨询
        </h3>
        <div class="message-form">
          <el-input
            v-model="messageInput"
            type="textarea"
            :rows="3"
            placeholder="对这个物品感兴趣？给卖家留言吧…"
            maxlength="500"
            show-word-limit
            class="message-input"
          />
          <el-button
            type="primary"
            :loading="messageSending"
            :disabled="!messageInput.trim()"
            class="btn-send"
            @click="sendMessage"
          >
            <el-icon v-if="!messageSending"><Position /></el-icon>
            <span>发送留言</span>
          </el-button>
        </div>
        <div v-if="messageList.length === 0" class="message-placeholder">
          <el-empty description="暂无留言，快来抢沙发吧~" />
        </div>
        <ul v-else class="message-list">
          <li v-for="msg in messageList" :key="msg.id" class="message-item">
            <el-avatar :size="32" class="message-avatar">
              {{ msg.userName?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="message-body">
              <div class="message-meta">
                <span class="message-user">{{ msg.userName || '匿名' }}</span>
                <span class="message-time">{{ msg.timeText }}</span>
              </div>
              <p class="message-content">{{ msg.content }}</p>
            </div>
          </li>
        </ul>
      </section>
    </main>

    <!-- 不存在 -->
    <div v-else class="empty-state">
      <el-result icon="error" title="物品不存在" sub-title="该物品不存在或已被删除。">
        <template #extra>
          <el-button type="primary" @click="router.push('/items')">返回物品广场</el-button>
        </template>
      </el-result>
    </div>

    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="showViewer && item?.images?.length"
      :url-list="item.images"
      :initial-index="currentIndex"
      @close="showViewer = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Star, Share, ArrowLeft, ArrowRight, 
  ChatDotRound, Location, Calendar, View,
  Document, Position, ShoppingCart
} from '@element-plus/icons-vue'
import { itemApi } from '../../../shared/api'
import { useUserStore } from '../../../shared/stores/user'
import type { Item } from '../../../shared/types/models'
import ItemDescription from '../components/ItemDescription.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const item = ref<Item | null>(null)
const isFavorited = ref(false)
const currentIndex = ref(0)
const showViewer = ref(false)
const messageInput = ref('')
const messageSending = ref(false)
const messageList = ref<{ id: string; content: string; userName: string; timeText: string }[]>([])

const FAVORITES_KEY = 'item_favorites'
const MESSAGES_KEY_PREFIX = 'item_messages_'
const DEFAULT_IMG = 'https://via.placeholder.com/600x600?text=暂无图片'
const AUTOPLAY_MS = 4000
let autoplayTimer: ReturnType<typeof setInterval> | null = null

// 计算属性
const currentImageUrl = computed(() => {
  const list = item.value?.images
  if (!list?.length) return DEFAULT_IMG
  return list[currentIndex.value] || DEFAULT_IMG
})

const imagesCount = computed(() => item.value?.images?.length ?? 0)

// 物品状态：1-在售, 2-已售出, 3-已下架
const isAvailable = computed(() => item.value?.status === 1)

const statusText = computed(() => {
  const status = item.value?.status
  if (status === 1) return '在售'
  if (status === 2) return '已售出'
  if (status === 3) return '已下架'
  return '未知'
})

const statusTagType = computed(() => {
  const status = item.value?.status
  if (status === 1) return 'success'
  if (status === 2) return 'info'
  if (status === 3) return 'warning'
  return 'info'
})

// 判断当前用户是否是物品所有者
const isOwner = computed(() => {
  if (!item.value || !userStore.userId) return false
  return String(item.value.userId) === String(userStore.userId)
})

// 工具函数
function formatPrice(price: number | string | undefined): string {
  if (!price) return '0.00'
  const num = typeof price === 'string' ? parseFloat(price) : price
  return num.toFixed(2)
}

function formatTime(timestamp: number | string | undefined): string {
  if (!timestamp) return '未知'
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getFavorites(): string[] {
  try {
    const s = localStorage.getItem(FAVORITES_KEY)
    return s ? JSON.parse(s) : []
  } catch {
    return []
  }
}

function getMessagesKey(): string {
  const id = item.value?.id
  return id ? `${MESSAGES_KEY_PREFIX}${id}` : ''
}

function loadMessages() {
  const key = getMessagesKey()
  if (!key) return
  try {
    const s = localStorage.getItem(key)
    messageList.value = s ? JSON.parse(s) : []
  } catch {
    messageList.value = []
  }
}

function saveMessages(list: typeof messageList.value) {
  const key = getMessagesKey()
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    // ignore
  }
}

function sendMessage() {
  const text = messageInput.value?.trim()
  if (!text) {
    ElMessage.warning('请输入留言内容')
    return
  }
  messageSending.value = true
  const id = `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const now = new Date()
  const timeText = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const userName = userStore.isLoggedIn ? userStore.userName : '匿名'
  const newMsg = { id, content: text, userName, timeText }
  const next = [...messageList.value, newMsg]
  messageList.value = next
  saveMessages(next)
  messageInput.value = ''
  messageSending.value = false
  ElMessage.success('留言已发送')
}

function setFavorites(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
}

async function loadDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('物品ID无效')
    return
  }
  loading.value = true
  try {
    item.value = await itemApi.getItemDetail(id)
    isFavorited.value = getFavorites().includes(id)
    loadMessages()
  } catch (e) {
    console.error(e)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

function handleContact() {
  if (!isAvailable.value) {
    ElMessage.warning('该物品已售出')
    return
  }
  ElMessage.info('联系卖家功能开发中，请先通过留言咨询')
}

function handleBuy() {
  if (!isAvailable.value) {
    ElMessage.warning('该物品已售出')
    return
  }
  if (isOwner.value) {
    ElMessage.warning('不能购买自己发布的物品')
    return
  }
  ElMessage.info('购买功能开发中，请先通过留言与卖家沟通')
}

function handleFavorite() {
  const id = item.value?.id
  if (!id) return
  const strId = String(id)
  const list = getFavorites()
  if (isFavorited.value) {
    setFavorites(list.filter((x) => x !== strId))
    isFavorited.value = false
    ElMessage.success('已取消收藏')
  } else {
    if (!list.includes(strId)) list.push(strId)
    setFavorites(list)
    isFavorited.value = true
    ElMessage.success('已收藏')
  }
}

function handleShare() {
  const url = window.location.href
  if (navigator.share) {
    navigator.share({ title: item.value?.title, text: item.value?.title, url })
  } else {
    navigator.clipboard.writeText(url).then(() => ElMessage.success('链接已复制'))
  }
}

function prevImage() {
  if (currentIndex.value > 0) currentIndex.value--
}

function nextImage() {
  if (currentIndex.value < imagesCount.value - 1) currentIndex.value++
}

function openViewer() {
  if (item.value?.images?.length) showViewer.value = true
}

// 成色枚举：BRAND_NEW(0) 全新, ALMOST_NEW(1) 九成新, GENTLY_USED(2) 八成新
const CONDITION_LEVELS: Record<number, { text: string; type: 'success' | 'info' | 'warning' }> = {
  0: { text: '全新', type: 'success' },
  1: { text: '九成新', type: 'info' },
  2: { text: '八成新', type: 'warning' }
}

function hasConditionDisplay(level?: string | number): boolean {
  if (level == null) return false
  const n = Number(level)
  return Number.isInteger(n) && n >= 0 && n <= 2
}

function conditionTagType(level: string | number): 'success' | 'info' | 'warning' {
  const n = Number(level)
  return CONDITION_LEVELS[n]?.type ?? 'info'
}

function conditionText(level: string | number): string {
  const n = Number(level)
  return CONDITION_LEVELS[n]?.text ?? ''
}

function startAutoplay() {
  if (imagesCount.value <= 1) return
  autoplayTimer = setInterval(() => {
    currentIndex.value = currentIndex.value >= imagesCount.value - 1 ? 0 : currentIndex.value + 1
  }, AUTOPLAY_MS)
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function pauseAutoplay() {
  stopAutoplay()
}

function resumeAutoplay() {
  startAutoplay()
}

onMounted(() => {
  loadDetail()
  setTimeout(startAutoplay, 500)
})

onUnmounted(stopAutoplay)
</script>

<style scoped>
.item-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf8 0%, #f8fffe 50%, #f0f9ff 100%);
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.top-bar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-bar-inner .current {
  color: #999;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-wrap {
  max-width: 1200px;
  margin: 24px auto;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.main {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

/* 卖家信息栏 */
.owner-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.owner-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.owner-name {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
}

.owner-tip {
  font-size: 13px;
  color: #9ca3af;
}

.btn-contact {
  font-size: 14px;
  font-weight: 500;
  background: linear-gradient(135deg, #03a688 0%, #02c39a 100%);
  color: #fff !important;
  padding: 8px 20px;
  border-radius: 10px;
  border: none;
  transition: all 0.3s;
}

.btn-contact:hover {
  background: linear-gradient(135deg, #02c39a 0%, #03a688 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 166, 136, 0.3);
}

.btn-contact :deep(.el-icon) {
  color: #fff;
}

/* 详情卡片 */
.detail-card {
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 40px;
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

/* 图片画廊 */
.gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-pic-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  cursor: zoom-in;
  transition: all 0.3s;
}

.main-pic-wrap:hover {
  border-color: #03a688;
  box-shadow: 0 4px 20px rgba(3, 166, 136, 0.15);
}

.main-pic {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.main-pic-wrap:hover .main-pic {
  transform: scale(1.05);
}

.nav-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.main-pic-wrap:hover .nav-arrows {
  opacity: 1;
}

.arrow {
  pointer-events: auto;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.arrow:hover:not(:disabled) {
  background: #03a688;
  color: #fff;
  transform: scale(1.1);
}

.arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.indicator {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

/* 缩略图 */
.thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-item:hover {
  border-color: #03a688;
  transform: translateY(-2px);
}

.thumbnail-item.active {
  border-color: #03a688;
  box-shadow: 0 2px 8px rgba(3, 166, 136, 0.3);
}

/* 商品信息 */
.info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.4;
}

.tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tags :deep(.el-tag) {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
}

/* 价格区块 */
.price-block {
  padding: 24px;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border-radius: 12px;
  border: 2px solid #fed7aa;
}

.price-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-label {
  font-size: 15px;
  color: #92400e;
  font-weight: 500;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.currency {
  font-size: 22px;
  color: #ea580c;
  font-weight: 600;
}

.num {
  font-size: 36px;
  color: #ea580c;
  font-weight: 700;
  line-height: 1;
}

/* 规格信息 */
.specs {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.spec-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.spec-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);
  border-radius: 8px;
  color: #03a688;
  font-size: 18px;
  flex-shrink: 0;
}

.spec-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-label {
  font-size: 13px;
  color: #6b7280;
}

.spec-val {
  font-size: 15px;
  color: #1f2937;
  font-weight: 500;
}

.spec-detail {
  font-size: 13px;
  color: #9ca3af;
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.btn-buy {
  flex: 2;
  height: 52px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #03a688 0%, #02c39a 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(3, 166, 136, 0.3);
  transition: all 0.3s;
}

.btn-buy:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(3, 166, 136, 0.4);
}

.btn-buy:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  box-shadow: none;
}

.btn-fav {
  flex: 1;
  height: 52px;
  border: 2px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s;
}

.btn-fav:hover {
  border-color: #fbbf24;
  color: #f59e0b;
  background: #fffbeb;
}

.btn-fav.favorited {
  border-color: #fbbf24;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #f59e0b;
}

.tip {
  margin-top: 4px;
}

/* 区块样式 */
.section {
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 22px;
  color: #03a688;
}

/* 留言板块 */
.message-form {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-input :deep(.el-textarea__inner) {
  resize: vertical;
  min-height: 90px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.3s;
}

.message-input :deep(.el-textarea__inner):focus {
  border-color: #03a688;
  box-shadow: 0 0 0 3px rgba(3, 166, 136, 0.1);
}

.btn-send {
  align-self: flex-end;
  min-width: 120px;
  height: 40px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
}

.message-placeholder {
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 12px;
}

.message-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.3s;
}

.message-item:hover {
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, #03a688 0%, #02c39a 100%);
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.message-user {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.message-time {
  font-size: 13px;
  color: #9ca3af;
}

.message-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 空状态 */
.empty-state {
  max-width: 1200px;
  margin: 60px auto;
  padding: 40px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .detail-card {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .gallery {
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .main {
    padding: 0 16px;
  }

  .detail-card {
    padding: 24px 20px;
    gap: 24px;
  }

  .title {
    font-size: 22px;
  }

  .num {
    font-size: 30px;
  }

  .actions {
    flex-direction: column;
  }

  .btn-buy, .btn-fav {
    flex: 1;
  }

  .section {
    padding: 20px 16px;
  }

  .section-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .top-bar-inner {
    padding: 12px 16px;
  }

  .owner-bar {
    padding: 12px 16px;
  }

  .main {
    padding: 0 12px;
  }

  .detail-card {
    padding: 20px 16px;
  }

  .title {
    font-size: 20px;
  }

  .price-block {
    padding: 20px;
  }

  .num {
    font-size: 28px;
  }

  .nav-arrows {
    display: none;
  }

  .thumbnails {
    gap: 8px;
  }

  .thumbnail-item {
    width: 60px;
    height: 60px;
  }
}
</style>
