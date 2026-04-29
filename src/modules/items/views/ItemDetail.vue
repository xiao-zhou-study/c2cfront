<template>
  <div class="item-detail">
    <!-- ==================== 移动端布局 ==================== -->
    <div class="layout-mobile">
      <!-- Hero 图片轮播区域 -->
      <div class="hero-gallery">
        <div
          class="hero-slides"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <div
            v-for="(img, i) in (item?.images?.length ? item.images : [DEFAULT_IMG])"
            :key="i"
            class="hero-slide"
          >
            <img :src="img" :alt="item?.title || '物品图片'" @click="openViewer">
          </div>
        </div>

        <!-- 顶部操作栏 -->
        <div class="hero-actions">
          <button class="hero-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
          </button>
          <button class="hero-btn" @click="handleShare">
            <el-icon><Share /></el-icon>
          </button>
        </div>

        <!-- 轮播指示器 -->
        <div v-if="imagesCount > 1" class="hero-dots">
          <span
            v-for="i in imagesCount"
            :key="i"
            :class="['dot', { active: i - 1 === currentIndex }]"
            @click="currentIndex = i - 1"
          />
        </div>

        <!-- 图片计数 -->
        <div v-if="imagesCount > 1" class="hero-counter">{{ currentIndex + 1 }}/{{ imagesCount }}</div>
      </div>

      <!-- 加载骨架屏 -->
      <div v-if="loading" class="content-skeleton">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- 主内容 -->
      <main v-else-if="item" class="content">
        <!-- 悬浮信息卡片（重叠在 Hero 上方） -->
        <div class="float-card price-card">
          <div class="price-row">
            <div class="price-display">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ formatPrice(item.price) }}</span>
            </div>
            <div class="status-badge" :class="statusBadgeClass">{{ statusText }}</div>
          </div>
          <h1 class="item-title">{{ item.title }}</h1>
          <div class="tag-row">
            <span v-if="hasConditionDisplay(item.conditionLevel)" class="tag condition" :class="conditionClass(item.conditionLevel)">
              {{ conditionText(item.conditionLevel) }}
            </span>
            <span v-if="item.categoryName" class="tag category">{{ item.categoryName }}</span>
          </div>
        </div>

        <!-- 卖家卡片 -->
        <div class="float-card seller-card">
          <div class="seller-row">
            <el-avatar :src="item.ownerAvatar || item.avatar" :size="48">
              {{ item.ownerName?.charAt(0) || item.username?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="seller-info">
              <span class="seller-name">{{ item.ownerName || item.username || '未知用户' }}</span>
              <span class="seller-meta">发布于 {{ formatTime(item.createdAt) }}</span>
            </div>
            <el-button
              v-if="!isOwner"
              size="small"
              class="seller-chat-btn"
              @click="handleContact"
            >
              <el-icon><ChatDotRound /></el-icon>
              联系卖家
            </el-button>
          </div>
        </div>

        <!-- 物品信息网格 -->
        <div class="float-card info-grid">
          <div class="info-cell">
            <el-icon><Location /></el-icon>
            <span class="info-label">交易地点</span>
            <span class="info-value">{{ item.location || '未指定' }}</span>
            <span v-if="item.address" class="info-sub">{{ item.address }}</span>
          </div>
          <div class="info-cell">
            <el-icon><View /></el-icon>
            <span class="info-label">浏览量</span>
            <span class="info-value">{{ item.viewCount || 0 }}</span>
          </div>
          <div class="info-cell">
            <el-icon><Calendar /></el-icon>
            <span class="info-label">发布时间</span>
            <span class="info-value">{{ formatRelativeTime(item.createdAt) }}</span>
          </div>
        </div>

        <!-- Tab 切换：描述 / 留言 -->
        <div class="float-card tab-card">
          <div class="tab-header">
            <button
              :class="['tab-btn', { active: activeTab === 'description' }]"
              @click="activeTab = 'description'"
            >
              <el-icon><Document /></el-icon>
              物品描述
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'messages' }]"
              @click="activeTab = 'messages'"
            >
              <el-icon><ChatDotRound /></el-icon>
              留言
              <span v-if="messageList.length" class="tab-badge">{{ messageList.length }}</span>
            </button>
          </div>

          <!-- 描述面板 -->
          <div v-show="activeTab === 'description'" class="tab-panel">
            <ItemDescription :item="item" />
          </div>

          <!-- 留言面板 -->
          <div v-show="activeTab === 'messages'" class="tab-panel">
            <div class="message-input-wrap">
              <el-input
                v-model="messageInput"
                type="textarea"
                :rows="2"
                placeholder="对这个物品感兴趣？给卖家留言吧…"
                maxlength="500"
                :disabled="messageSending"
              />
              <el-button
                type="primary"
                :loading="messageSending"
                :disabled="!messageInput.trim()"
                @click="sendMessage"
              >
                发送
              </el-button>
            </div>

            <div v-if="messageList.length === 0" class="message-empty">
              <el-empty description="暂无留言，快来抢沙发吧~" :image-size="80" />
            </div>
            <div v-else class="message-stream">
              <div v-for="msg in messageList" :key="msg.id" class="msg-card">
                <el-avatar :size="36" class="msg-avatar">
                  {{ msg.userName?.charAt(0) || 'U' }}
                </el-avatar>
                <div class="msg-content">
                  <div class="msg-header">
                    <span class="msg-user">{{ msg.userName || '匿名' }}</span>
                    <span class="msg-time">{{ msg.timeText }}</span>
                  </div>
                  <p class="msg-text">{{ msg.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部占位（避免被固定栏遮挡） -->
        <div class="bottom-spacer" />
      </main>

      <!-- 底部固定操作栏 -->
      <div v-if="item" class="action-bar">
        <div class="action-bar-inner">
          <el-button
            type="primary"
            size="large"
            :disabled="!isAvailable"
            class="bar-btn-primary"
            @click="handleBuy"
          >
            <el-icon><ShoppingCart /></el-icon>
            <span>{{ isAvailable ? '发起购买申请' : '已售出' }}</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- ==================== 桌面端布局 ==================== -->
    <div v-if="item && !loading" class="layout-desktop">
      <!-- 顶部卖家信息条 -->
      <div class="dt-seller-bar">
        <div class="dt-seller-inner">
          <el-avatar :src="item.ownerAvatar || item.avatar" :size="40">
            {{ item.ownerName?.charAt(0) || item.username?.charAt(0) || 'U' }}
          </el-avatar>
          <div class="dt-seller-info">
            <div class="dt-seller-name-wrap">
              <span class="dt-seller-name">{{ item.ownerName || item.username || '未知用户' }}</span>
            </div>
            <div class="dt-seller-meta">
              {{ item.location || '未指定' }} · 发布于 {{ formatTime(item.createdAt) }}
            </div>
          </div>
          <div class="dt-seller-actions">
            <button class="dt-share-btn" @click="handleShare">
              <el-icon><Share /></el-icon>
            </button>
          </div>
        </div>
      </div>

      <div class="dt-main">
        <!-- 左侧图片区 -->
        <div class="dt-left">
          <div class="dt-gallery">
            <!-- 缩略图列表 -->
            <div class="dt-thumb-list">
              <div
                v-for="(img, i) in (item?.images?.length ? item.images : [DEFAULT_IMG])"
                :key="i"
                :class="['dt-thumb-item', { active: i === currentIndex }]"
                @click="currentIndex = i"
              >
                <img :src="img" alt="">
              </div>
            </div>
            <!-- 大图区 -->
            <div class="dt-main-image">
              <button
                v-if="imagesCount > 1"
                class="dt-arrow dt-arrow-left"
                @click="prevImage"
              >
                <el-icon><ArrowLeft /></el-icon>
              </button>
              <img
                :src="item?.images?.[currentIndex] || DEFAULT_IMG"
                :alt="item.title"
                @click="openViewer"
              >
              <button
                v-if="imagesCount > 1"
                class="dt-arrow dt-arrow-right"
                @click="nextImage"
              >
                <el-icon><ArrowRight /></el-icon>
              </button>
              <div v-if="imagesCount > 1" class="dt-image-counter">
                {{ currentIndex + 1 }} / {{ imagesCount }}
              </div>
            </div>
          </div>
          <div class="dt-trust-bar">
            <span class="dt-trust-item">
              <el-icon class="dt-trust-icon"><CircleCheckFilled /></el-icon>
              担保交易
            </span>
            <span class="dt-trust-dot">·</span>
            <span class="dt-trust-item">举报</span>
          </div>
        </div>

        <!-- 右侧信息区 -->
        <div class="dt-right">
          <!-- 价格 -->
          <div class="dt-price-section">
            <div class="dt-price-row">
              <div class="dt-price-main">
                <span class="dt-price-symbol">¥</span>
                <span class="dt-price-value">{{ formatPrice(item.price) }}</span>
              </div>
            </div>
          </div>

          <!-- 标题和标签 -->
          <div class="dt-title-section">
            <h1 class="dt-item-title">{{ item.title }}</h1>
            <div class="dt-tag-row">
              <span v-if="hasConditionDisplay(item.conditionLevel)" class="dt-tag" :class="conditionClass(item.conditionLevel)">
                {{ conditionText(item.conditionLevel) }}
              </span>
              <span v-if="item.categoryName" class="dt-tag dt-tag-cat">{{ item.categoryName }}</span>
              <span class="dt-tag dt-tag-status" :class="statusBadgeClass">{{ statusText }}</span>
            </div>
          </div>

          <!-- 描述 -->
          <div class="dt-desc-section">
            <ItemDescription :item="item" />
          </div>

          <!-- 桌面端操作栏 -->
          <div class="dt-action-bar">
            <div class="dt-action-inner">
              <button v-if="!isOwner" class="dt-chat-btn" @click="handleContact">
                <el-icon><ChatDotRound /></el-icon>
                <span>聊一聊</span>
              </button>
              <button class="dt-buy-btn" :disabled="!isAvailable" @click="handleBuy">
                <span>{{ isAvailable ? '立即购买' : '已售出' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 不存在 -->
    <div v-if="!item && !loading" class="empty-state">
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

    <!-- 聊天弹窗 -->
    <ChatDialog
      v-model="chatVisible"
      :peer-id="chatPeerId"
      :peer-name="chatPeerName"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Share, ArrowLeft, ArrowRight,
  ChatDotRound, Location, Calendar, View,
  Document, ShoppingCart, CircleCheckFilled
} from '@element-plus/icons-vue'
import { itemApi, orderApi } from '../../../shared/api'
import { useUserStore } from '../../../shared/stores/user'
import type { Item } from '../../../shared/types/models'
import ItemDescription from '../components/ItemDescription.vue'
import ChatDialog from '../../../shared/components/ChatDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const item = ref<Item | null>(null)
const currentIndex = ref(0)
const showViewer = ref(false)
const messageInput = ref('')
const messageSending = ref(false)
const messageList = ref<{ id: string; content: string; userName: string; timeText: string }[]>([])
const activeTab = ref<'description' | 'messages'>('description')

// 触摸滑动
const touchStartX = ref(0)
const touchDeltaX = ref(0)

function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
  touchDeltaX.value = 0
}

function onTouchMove(e: TouchEvent) {
  touchDeltaX.value = e.touches[0].clientX - touchStartX.value
}

function onTouchEnd() {
  if (Math.abs(touchDeltaX.value) > 50) {
    if (touchDeltaX.value > 0 && currentIndex.value > 0) {
      currentIndex.value--
    } else if (touchDeltaX.value < 0 && currentIndex.value < imagesCount.value - 1) {
      currentIndex.value++
    }
  }
  touchDeltaX.value = 0
}

const MESSAGES_KEY_PREFIX = 'item_messages_'
const DEFAULT_IMG = 'https://via.placeholder.com/600x600?text=暂无图片'
const AUTOPLAY_MS = 4000
let autoplayTimer: ReturnType<typeof setInterval> | null = null

// 聊天相关
const chatVisible = ref(false)
const chatPeerId = ref('')
const chatPeerName = ref('')

function openChat() {
  if (!item.value || !userStore.userId) return
  const sellerId = String(item.value.ownerId)
  if (!sellerId || sellerId === 'undefined' || sellerId === 'null') return

  chatPeerId.value = sellerId
  chatPeerName.value = item.value.ownerName || item.value.username || '卖家'
  chatVisible.value = true
}

// 计算属性
const imagesCount = computed(() => item.value?.images?.length ?? 0)

const isAvailable = computed(() => item.value?.status === 1)

const statusText = computed(() => {
  const status = item.value?.status
  if (status === 1) return '在售'
  if (status === 2) return '已售出'
  if (status === 3) return '已下架'
  return '未知'
})

const statusBadgeClass = computed(() => {
  const map: Record<number, string> = { 1: 'badge-onsale', 2: 'badge-sold', 3: 'badge-offshelf' }
  return map[item.value?.status ?? 0] || ''
})

const isOwner = computed(() => {
  if (!item.value || !userStore.userId) return false
  return String(item.value.ownerId) === String(userStore.userId)
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

function formatRelativeTime(timestamp: number | string | undefined): string {
  if (!timestamp) return '未知'
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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

async function loadDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('物品ID无效')
    return
  }
  loading.value = true
  try {
    item.value = await itemApi.getItemDetail(id)
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
  openChat()
}

async function handleBuy() {
  if (!isAvailable.value) {
    ElMessage.warning('该物品已售出')
    return
  }
  if (isOwner.value) {
    ElMessage.warning('不能购买自己发布的物品')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要发起购买申请吗？\n物品：${item.value?.title}\n价格：¥${item.value?.price}`,
      '确认购买',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    await orderApi.createPurchaseOrder(item.value!.id!)
    ElMessage.success('购买申请已提交，请等待卖家审核')
  } catch (e: any) {
    if (e !== 'cancel') {
      console.error('购买失败:', e)
    }
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

function openViewer() {
  if (item.value?.images?.length) showViewer.value = true
}

function prevImage() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function nextImage() {
  if (currentIndex.value < imagesCount.value - 1) {
    currentIndex.value++
  }
}

// 成色枚举：BRAND_NEW(0) 全新, ALMOST_NEW(1) 九成新, GENTLY_USED(2) 八成新
const CONDITION_LEVELS: Record<number, { text: string; cls: string }> = {
  0: { text: '全新', cls: 'cond-new' },
  1: { text: '九成新', cls: 'cond-like-new' },
  2: { text: '八成新', cls: 'cond-used' }
}

function hasConditionDisplay(level?: string | number): boolean {
  if (level == null) return false
  const n = Number(level)
  return Number.isInteger(n) && n >= 0 && n <= 2
}

function conditionText(level: string | number): string {
  const n = Number(level)
  return CONDITION_LEVELS[n]?.text ?? ''
}

function conditionClass(level: string | number): string {
  const n = Number(level)
  return CONDITION_LEVELS[n]?.cls ?? ''
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

onMounted(() => {
  loadDetail()
  setTimeout(startAutoplay, 500)
})

onUnmounted(stopAutoplay)
</script>

<style scoped>
.item-detail {
  min-height: 100vh;
  background: #f5f5f7;
}

/* ==================== 布局切换 ==================== */
.layout-desktop {
  display: none;
}

@media (min-width: 768px) {
  .layout-mobile {
    display: none;
  }

  .layout-desktop {
    display: block;
  }

  .item-detail {
    background: #fff;
  }
}

/* ==================== 移动端：Hero Gallery ==================== */
.hero-gallery {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #000;
}

.hero-slides {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.hero-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
}

.hero-slide img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.hero-actions {
  position: absolute;
  top: env(safe-area-inset-top, 12px);
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.hero-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.2s;
}

.hero-btn:hover {
  background: rgba(0, 0, 0, 0.65);
  transform: scale(1.05);
}

.hero-dots {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  background: #fff;
  width: 20px;
  border-radius: 4px;
}

.hero-counter {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  backdrop-filter: blur(4px);
}

/* ==================== 移动端：Content ==================== */
.content {
  position: relative;
  max-width: 800px;
  margin: -40px auto 0;
  padding: 0 16px 100px;
  z-index: 5;
}

.content-skeleton {
  max-width: 800px;
  margin: -40px auto 0;
  padding: 0 16px;
  background: #fff;
  border-radius: 16px 16px 0 0;
}

.float-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.price-card {
  margin-top: 0;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.price-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: 20px;
  font-weight: 700;
  color: #ff5722;
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  color: #ff5722;
  line-height: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.badge-onsale {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-sold {
  background: #f5f5f5;
  color: #9e9e9e;
}

.badge-offshelf {
  background: #fff3e0;
  color: #ef6c00;
}

.item-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px;
  line-height: 1.5;
}

.tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.tag.condition {
  border: 1px solid;
}

.cond-new {
  background: #e8f5e9;
  color: #2e7d32;
  border-color: #a5d6a7;
}

.cond-like-new {
  background: #e3f2fd;
  color: #1565c0;
  border-color: #90caf9;
}

.cond-used {
  background: #fff3e0;
  color: #ef6c00;
  border-color: #ffcc80;
}

.tag.category {
  background: #f5f5f5;
  color: #616161;
  border: 1px solid #e0e0e0;
}

/* 卖家卡片 */
.seller-card {
  padding: 16px 20px;
}

.seller-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seller-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.seller-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seller-meta {
  font-size: 12px;
  color: #9e9e9e;
}

.seller-chat-btn {
  padding: 8px 16px;
  border: 1.5px solid #4caf50;
  background: #fff;
  color: #4caf50;
  font-size: 13px;
  font-weight: 500;
  border-radius: 20px;
  gap: 4px;
  transition: all 0.2s;
}

.seller-chat-btn:hover {
  background: #4caf50;
  color: #fff;
}

.seller-chat-btn .el-icon {
  font-size: 16px;
  color: #4caf50;
}

.seller-chat-btn:hover .el-icon {
  color: #fff;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.info-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 12px;
  text-align: center;
  position: relative;
}

.info-cell:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: #f0f0f0;
}

.info-cell .el-icon {
  font-size: 22px;
  color: #757575;
  margin-bottom: 4px;
}

.info-label {
  font-size: 12px;
  color: #9e9e9e;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.info-sub {
  font-size: 12px;
  color: #bdbdbd;
}

/* Tab Card */
.tab-card {
  padding: 0;
  overflow: hidden;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border: none;
  background: none;
  font-size: 15px;
  font-weight: 500;
  color: #757575;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn.active {
  color: #1a1a1a;
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  border-radius: 2px;
  background: #4caf50;
}

.tab-btn .el-icon {
  font-size: 16px;
}

.tab-badge {
  background: #ff5722;
  color: #fff;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  line-height: 1.4;
}

.tab-panel {
  padding: 20px;
}

/* 留言 */
.message-input-wrap {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-bottom: 20px;
}

.message-input-wrap :deep(.el-textarea) {
  flex: 1;
}

.message-input-wrap :deep(.el-textarea__inner) {
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  padding: 10px 14px;
}

.message-input-wrap :deep(.el-textarea__inner):focus {
  border-color: #4caf50;
}

.message-input-wrap .el-button {
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  background: #4caf50;
  border: none;
}

.message-input-wrap .el-button:hover:not(:disabled) {
  background: #43a047;
}

.message-empty {
  padding: 20px 0;
}

.message-stream {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.msg-card {
  display: flex;
  gap: 10px;
}

.msg-avatar {
  flex-shrink: 0;
  background: #e0e0e0;
  color: #616161;
  font-size: 14px;
}

.msg-content {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.msg-user {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.msg-time {
  font-size: 12px;
  color: #bdbdbd;
}

.msg-text {
  font-size: 14px;
  color: #424242;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 移动端底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0));
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.action-bar-inner {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  align-items: center;
}

.bar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px;
  border: none;
  background: none;
  color: #757575;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 11px;
  border-radius: 8px;
}

.bar-btn .el-icon {
  font-size: 22px;
}

.bar-btn:hover {
  background: #f5f5f5;
}

.bar-btn.active {
  color: #ff9800;
}

.bar-btn-primary {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.bar-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #43a047 0%, #4caf50 100%);
}

.bar-btn-primary:disabled {
  background: #e0e0e0;
  box-shadow: none;
}

.bottom-spacer {
  height: 20px;
}

/* ==================== 空状态 ==================== */
.empty-state {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 16px;
}

/* ==================== 移动端小屏适配 ==================== */
@media (max-width: 480px) {
  .content {
    padding: 0 12px 100px;
  }

  .float-card {
    padding: 16px;
    border-radius: 12px;
  }

  .price-value {
    font-size: 28px;
  }

  .info-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .info-cell {
    padding: 16px 8px;
  }

  .info-cell .el-icon {
    font-size: 18px;
  }
}

/* ==================== 桌面端布局 ==================== */
@media (min-width: 768px) {
  .empty-state {
    margin: 80px auto;
  }
}

/* 桌面端卖家信息条 */
.dt-seller-bar {
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.dt-seller-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dt-seller-info {
  flex: 1;
  min-width: 0;
}

.dt-seller-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.dt-seller-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.dt-seller-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: #fff8e1;
  color: #f9a825;
  font-size: 12px;
  font-weight: 500;
}

.dt-seller-meta {
  font-size: 13px;
  color: #9e9e9e;
}

.dt-seller-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dt-seller-stat {
  font-size: 13px;
  color: #9e9e9e;
}

.dt-share-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.dt-share-btn:hover {
  background: #f5f5f5;
  border-color: #bdbdbd;
}

/* 桌面端主体 */
.dt-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

/* 左侧图片区 */
.dt-left {
  flex: 0 0 520px;
  position: sticky;
  top: 24px;
}

.dt-gallery {
  display: flex;
  gap: 12px;
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

/* 缩略图列表 */
.dt-thumb-list {
  flex: 0 0 60px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
}

.dt-thumb-list::-webkit-scrollbar {
  width: 3px;
}

.dt-thumb-list::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 3px;
}

.dt-thumb-item {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.2s;
  background: #fff;
}

.dt-thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dt-thumb-item.active {
  border-color: #ff5722;
}

.dt-thumb-item:hover:not(.active) {
  border-color: #e0e0e0;
}

/* 大图区 */
.dt-main-image {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.dt-main-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: zoom-in;
  max-height: 480px;
}

.dt-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 5;
  font-size: 18px;
}

.dt-arrow:hover {
  background: rgba(0, 0, 0, 0.6);
}

.dt-arrow-left {
  left: 12px;
}

.dt-arrow-right {
  right: 12px;
}

.dt-image-counter {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

/* 担保交易栏 */
.dt-trust-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px;
  font-size: 13px;
  color: #9e9e9e;
}

.dt-trust-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.2s;
}

.dt-trust-item:hover {
  color: #616161;
}

.dt-trust-icon {
  font-size: 14px;
  color: #4caf50;
}

.dt-trust-dot {
  color: #e0e0e0;
}

/* 右侧信息区 */
.dt-right {
  flex: 1;
  min-width: 0;
}

/* 价格区 */
.dt-price-section {
  margin-bottom: 16px;
}

.dt-price-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.dt-price-main {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.dt-price-symbol {
  font-size: 24px;
  font-weight: 700;
  color: #ff5722;
}

.dt-price-value {
  font-size: 42px;
  font-weight: 700;
  color: #ff5722;
  line-height: 1;
}

/* 标题区 */
.dt-title-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dt-item-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px;
  line-height: 1.5;
}

.dt-tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dt-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.dt-tag.cond-new {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.dt-tag.cond-like-new {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
}

.dt-tag.cond-used {
  background: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffcc80;
}

.dt-tag-cat {
  background: #f5f5f5;
  color: #616161;
  border: 1px solid #e0e0e0;
}

.dt-tag-status.badge-onsale {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.dt-tag-status.badge-sold {
  background: #f5f5f5;
  color: #9e9e9e;
  border: 1px solid #e0e0e0;
}

.dt-tag-status.badge-offshelf {
  background: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffcc80;
}

/* 描述区 */
.dt-desc-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

/* 留言区 */
.dt-message-section {
  margin-bottom: 24px;
}

.dt-msg-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.dt-msg-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.dt-msg-count {
  background: #ff5722;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

/* 桌面端操作栏 */
.dt-action-bar {
  margin-top: 8px;
}

.dt-action-inner {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.dt-fav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 20px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #757575;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.dt-fav-btn .el-icon {
  font-size: 20px;
}

.dt-fav-btn:hover {
  background: #f5f5f5;
}

.dt-fav-btn.active {
  color: #ff9800;
  border-color: #ffcc80;
  background: #fff8e1;
}

.dt-chat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 32px;
  border: none;
  background: #ffeb3b;
  color: #1a1a1a;
  border-radius: 24px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;
}

.dt-chat-btn:hover {
  background: #fdd835;
}

.dt-buy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 48px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  border-radius: 24px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;
}

.dt-buy-btn:hover:not(:disabled) {
  background: #333;
}

.dt-buy-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

/* 桌面端响应式 */
@media (min-width: 768px) and (max-width: 1024px) {
  .dt-main {
    gap: 24px;
  }

  .dt-left {
    flex: 0 0 420px;
  }

  .dt-gallery {
    padding: 12px;
  }

  .dt-main-image {
    min-height: 340px;
  }

  .dt-price-value {
    font-size: 36px;
  }
}

@media (min-width: 1024px) {
  .dt-left {
    flex: 0 0 560px;
  }
}
</style>
