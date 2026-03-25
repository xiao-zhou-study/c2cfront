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
      <div class="owner-bar">
        <el-avatar :src="item.avatar" :size="40">
          {{ item.username?.charAt(0) || 'U' }}
        </el-avatar>
        <span class="owner-name">{{ item.username || '未知用户' }}</span>
      </div>

      <div class="detail-card">
        <!-- 左侧：图片 -->
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
                :disabled="currentIndex === 0"
                @click="prevImage"
              >
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button
                class="arrow"
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
          <div v-if="imagesCount > 1" class="dots">
            <span
              v-for="(_, i) in item.images"
              :key="i"
              :class="['dot', { active: currentIndex === i }]"
              @click="currentIndex = i"
            />
          </div>
        </div>

        <!-- 右侧：信息 -->
        <div class="info">
          <h1 class="title">{{ item.title }}</h1>
          <div class="tags">
            <el-tag v-if="hasConditionDisplay(item.conditionLevel)" size="small" :type="conditionTagType(item.conditionLevel)">
              {{ conditionText(item.conditionLevel) }}
            </el-tag>
            <el-tag :type="item.status === 1 ? 'success' : 'warning'" size="small">
              {{ item.status === 1 ? '可借用' : '已借出' }}
            </el-tag>
          </div>

          <div class="price-block">
            <div class="price-row">
              <span class="label">租金</span>
              <span class="price">
                <span class="currency">¥</span>
                <span class="num">{{ item.price }}</span>
                <span class="unit">/{{ billingUnit }}</span>
              </span>
            </div>
            <div class="price-row">
              <span class="label">押金</span>
              <span class="deposit">¥{{ item.deposit }}</span>
            </div>
          </div>

          <div class="specs">
            <div class="spec">
              <span class="spec-label">分类</span>
              <span class="spec-val">{{ item.categoryName || item.categoryId || '其他' }}</span>
            </div>
            <div class="spec">
              <span class="spec-label">位置</span>
              <span class="spec-val">{{ item.location || item.address || '—' }}</span>
            </div>
            <div class="spec">
              <span class="spec-label">租期</span>
              <span class="spec-val">{{ item.minBorrowDays ?? 1 }}–{{ item.maxBorrowDays ?? 30 }} 天</span>
            </div>
            <div v-if="item.stats?.averageRating != null" class="spec">
              <span class="spec-label">评分</span>
              <div class="rating-inline">
                <el-rate :model-value="item.stats.averageRating" disabled size="small" />
                <span class="rating-num">{{ item.stats.averageRating }}</span>
                <span class="rating-count">({{ Number(item.stats.totalRatings) || 0 }} 条)</span>
              </div>
            </div>
          </div>

          <div class="actions">
            <el-button
              type="primary"
              size="large"
              :disabled="item.status !== 1"
              class="btn-borrow"
              @click="handleBorrow"
            >
              <el-icon><ShoppingCart /></el-icon>
              立即借用
            </el-button>
            <el-button
              size="large"
              :class="{ favorited: isFavorited }"
              class="btn-fav"
              @click="handleFavorite"
            >
              <el-icon><Star /></el-icon>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </el-button>
          </div>

          <div v-if="item.status !== 1" class="tip">
            <el-alert title="该物品当前不可借用" type="warning" :closable="false" show-icon />
          </div>
        </div>
      </div>

      <section class="section">
        <ItemDescription :item="item" />
      </section>

      <section class="section">
        <h3 class="section-title">留言</h3>
        <div class="message-form">
          <el-input
            v-model="messageInput"
            type="textarea"
            :rows="3"
            placeholder="写下你的留言…"
            maxlength="500"
            show-word-limit
            class="message-input"
          />
          <el-button
            type="primary"
            :loading="messageSending"
            class="btn-send"
            @click="sendMessage"
          >
            发送
          </el-button>
        </div>
        <div v-if="messageList.length === 0" class="message-placeholder">
          <el-empty description="暂无留言" />
        </div>
        <ul v-else class="message-list">
          <li v-for="msg in messageList" :key="msg.id" class="message-item">
            <div class="message-meta">
              <span class="message-user">{{ msg.userName || '匿名' }}</span>
              <span class="message-time">{{ msg.timeText }}</span>
            </div>
            <p class="message-content">{{ msg.content }}</p>
          </li>
        </ul>
      </section>
    </main>

    <!-- 不存在 -->
    <div v-else class="empty-state">
      <el-result icon="error" title="物品不存在" sub-title="该物品不存在或已被删除。">
        <template #extra>
          <el-button type="primary" @click="router.push('/items')">返回列表</el-button>
        </template>
      </el-result>
    </div>

    <el-image-viewer
      v-if="showViewer && item?.images?.length"
      :url-list="item.images"
      :initial-index="currentIndex"
      @close="showViewer = false"
    />

    <BorrowDialog
      v-model="borrowDialogVisible"
      :item="item"
      @submit="onBorrowSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Star, Share, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { itemApi } from '../../../shared/api'
import { BILLING_TYPE_UNIT } from '../../../shared/utils'
import { useUserStore } from '../../../shared/stores/user'
import type { Item } from '../../../shared/types/models'
import ItemDescription from '../components/ItemDescription.vue'
import BorrowDialog from '../components/BorrowDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const item = ref<Item | null>(null)
const borrowDialogVisible = ref(false)
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

const currentImageUrl = computed(() => {
  const list = item.value?.images
  if (!list?.length) return DEFAULT_IMG
  return list[currentIndex.value] || DEFAULT_IMG
})

const imagesCount = computed(() => item.value?.images?.length ?? 0)

const billingUnit = computed(() => {
  const t = item.value?.billingType
  return (t && BILLING_TYPE_UNIT[t as keyof typeof BILLING_TYPE_UNIT]) || '天'
})

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

function handleBorrow() {
  if (item.value?.status !== 1) {
    ElMessage.warning('该物品当前不可借用')
    return
  }
  borrowDialogVisible.value = true
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

function onBorrowSubmit(_payload?: { orderId?: string }) {
  borrowDialogVisible.value = false
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
  background: #f5f5f5;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.top-bar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-bar-inner .current {
  color: #999;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-wrap {
  max-width: 1100px;
  margin: 20px auto;
  padding: 20px 16px;
  background: #fff;
  border-radius: 12px;
}

.main {
  max-width: 1100px;
  margin: 20px auto;
  padding: 0 16px;
}

.owner-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.owner-bar .owner-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.detail-card {
  display: grid;
  grid-template-columns: 440px 1fr;
  gap: 32px;
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}

.gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-pic-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  border: 1px solid #eee;
  cursor: pointer;
}

.main-pic {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.2s;
}

.main-pic-wrap:hover .main-pic {
  transform: scale(1.02);
}

.nav-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 12px;
  pointer-events: none;
}

.arrow {
  pointer-events: auto;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.arrow:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.indicator {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.55);
  color: #fff;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
}

.dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  background: #ff6b00;
  transform: scale(1.15);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.35;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.price-block {
  padding: 16px;
  background: #fff8f3;
  border-radius: 8px;
  border: 1px solid #ffe8d9;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.price-row:last-child {
  margin-bottom: 0;
}

.price-block .label {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 18px;
  color: #ff6b00;
  font-weight: 600;
}

.num {
  font-size: 28px;
  color: #ff6b00;
  font-weight: 700;
}

.unit {
  font-size: 14px;
  color: #666;
}

.deposit {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.specs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.spec {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.spec-label {
  color: #666;
  min-width: 44px;
}

.spec-val {
  color: #1a1a1a;
}

.rating-inline {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-num {
  font-weight: 600;
  color: #f59e0b;
}

.rating-count {
  color: #999;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-borrow {
  flex: 2;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff6b00, #ff8534);
  border: none;
  border-radius: 8px;
}

.btn-borrow:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff8534, #ff6b00);
  box-shadow: 0 4px 16px rgba(255,107,0,0.35);
}

.btn-borrow:disabled {
  background: #e0e0e0;
  color: #999;
}

.btn-fav {
  flex: 1;
  height: 48px;
  border: 1px solid #e5e5e5;
  background: #fff;
  border-radius: 8px;
}

.btn-fav:hover {
  border-color: #f59e0b;
  color: #f59e0b;
}

.btn-fav.favorited {
  border-color: #f59e0b;
  background: #fffbeb;
  color: #f59e0b;
}

.tip {
  margin-top: 4px;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.message-form {
  margin-bottom: 20px;
}

.message-input {
  margin-bottom: 12px;
}

.message-input :deep(textarea) {
  resize: vertical;
  min-height: 72px;
}

.btn-send {
  min-width: 100px;
}

.message-placeholder {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.message-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.message-item:last-child {
  border-bottom: none;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.message-user {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-state {
  max-width: 1100px;
  margin: 40px auto;
  padding: 20px 16px;
}

@media (max-width: 900px) {
  .detail-card {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .gallery {
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .main {
    padding: 0 12px;
  }

  .detail-card {
    padding: 20px;
  }

  .title {
    font-size: 20px;
  }

  .num {
    font-size: 24px;
  }

  .actions {
    flex-direction: column;
  }

  .btn-borrow, .btn-fav {
    width: 100%;
  }

  .nav-arrows {
    display: none;
  }
}
</style>
