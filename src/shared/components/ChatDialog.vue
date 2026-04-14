<template>
  <el-dialog
    v-model="visible"
    width="520px"
    class="chat-detail-dialog"
    destroy-on-close
    :show-close="false"
    @open="onOpen"
    @close="onClose"
  >
    <!-- 自定义头部 -->
    <template #header="{ close }">
      <div class="chat-header">
        <div class="chat-header-left">
          <el-avatar
            :size="36"
            :src="peerAvatar"
          >
            {{ peerInitial }}
          </el-avatar>
          <div class="chat-header-info">
            <span class="chat-header-name">{{ peerName || '用户' }}</span>
            <span
              class="chat-header-status"
              :class="{ 'online': isOnline }"
            >
              {{ isOnline ? '在线' : '离线' }}
            </span>
          </div>
        </div>
        <div class="chat-header-right">
          <el-button
            type="text"
            circle
            @click="close"
          >
            <el-icon :size="18"><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <!-- 消息列表 -->
    <div
      ref="messagesRef"
      class="chat-messages-list"
    >
      <div
        v-for="(msg, i) in chatStore.currentMessages"
        :key="i"
        class="chat-message-item"
        :class="{ 'message-self': String(msg.from) === String(userId) }"
      >
        <!-- 消息气泡 -->
        <div class="message-bubble-wrapper">
          <div class="message-bubble">
            <div class="message-content">{{ msg.content }}</div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="chatStore.currentMessages.length === 0"
        class="chat-messages-empty"
      >
        <el-icon
          :size="40"
          color="var(--text-placeholder)"
        >
          <ChatDotRound />
        </el-icon>
        <p>暂无聊天记录</p>
        <span>发送消息开始聊天</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <el-input
        v-model="inputText"
        placeholder="输入消息..."
        clearable
        class="chat-input"
        @keydown.enter="sendMessage"
      >
        <template #suffix>
          <el-button
            type="primary"
            circle
            size="small"
            :disabled="!inputText.trim() || !chatStore.connected"
            @click="sendMessage"
          >
            <el-icon><Promotion /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Close, ChatDotRound, Promotion } from '@element-plus/icons-vue'
import { useUserStore } from '@/shared/stores/user'
import { useChatStore } from '@/shared/stores/chat'
import { getUserInfo } from '@/shared/api/modules/user'

const props = defineProps<{
  modelValue: boolean
  peerId: string
  peerName?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const userStore = useUserStore()
const chatStore = useChatStore()

const userId = computed(() => String(userStore.userId))
const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const inputText = ref('')
const messagesRef = ref<HTMLElement | null>(null)
const peerAvatar = ref('')
const peerInitial = ref('U')
const isOnline = ref(false)

// 加载对方用户信息
async function loadPeerInfo() {
  const peerIdStr = String(props.peerId)
  try {
    const user = await getUserInfo(peerIdStr)
    peerAvatar.value = user?.avatarUrl || ''
    peerInitial.value = user?.username?.charAt(0) || 'U'
  } catch {
    peerAvatar.value = ''
    peerInitial.value = props.peerName?.charAt(0) || 'U'
  }
  // 检查在线状态
  isOnline.value = await chatStore.checkOnline(peerIdStr)
}

function onOpen() {
  chatStore.connect()
  chatStore.openConversation(props.peerId).then(async () => {
    await loadPeerInfo()
    scrollToBottom()
  })
}

function onClose() {
  chatStore.closeConversation()
  inputText.value = ''
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text || !chatStore.currentPeerId) return

  if (chatStore.sendMessage(chatStore.currentPeerId, text)) {
    inputText.value = ''
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

function formatTime(timestamp: number | string): string {
  if (!timestamp) return ''
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

watch(
  () => chatStore.currentMessages.length,
  () => scrollToBottom()
)
</script>

<style scoped>
.chat-detail-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.chat-detail-dialog :deep(.el-dialog__body) {
  padding: 0;
}

/* 头部 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: transparent;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-header-left .el-avatar {
  background: var(--brand-primary-light);
  color: var(--brand-primary);
}

.chat-header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-header-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.chat-header-status {
  font-size: 12px;
  color: var(--text-secondary);
}

.chat-header-status.online {
  color: #67c23a;
}

.chat-header-right .el-button {
  color: var(--text-secondary);
}

/* 消息列表 */
.chat-messages-list {
  height: 420px;
  overflow-y: auto;
  padding: 16px;
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-messages-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.chat-messages-empty p {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.chat-messages-empty span {
  font-size: 12px;
  color: var(--text-placeholder);
}

/* 消息项 */
.chat-message-item {
  display: flex;
  gap: 8px;
}

.chat-message-item.message-self {
  flex-direction: row-reverse;
}

.message-bubble-wrapper {
  max-width: 70%;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--bg-white);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-self .message-bubble {
  background: var(--brand-primary);
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  color: var(--text-primary);
}

.message-self .message-content {
  color: white;
}

.message-time {
  font-size: 11px;
  color: var(--text-placeholder);
  margin-top: 4px;
}

.message-self .message-time {
  color: rgba(255, 255, 255, 0.6);
}

/* 输入区域 */
.chat-input-area {
  padding: 12px 16px;
  background: var(--bg-white);
  border-top: 1px solid var(--border-light);
}

.chat-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  padding: 8px 16px;
}

.chat-input :deep(.el-input__suffix) {
  margin-left: 8px;
}

.chat-input :deep(.el-button) {
  border-radius: 50%;
}
</style>