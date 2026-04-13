<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="480px"
    class="chat-dialog"
    destroy-on-close
    @open="onOpen"
    @close="onClose"
  >
    <div class="chat-container">
      <div class="chat-status" :class="{ 'chat-connected': chatStore.connected }">
        {{ chatStore.connected ? '已连接' : '连接中…' }}
      </div>
      <div ref="messagesRef" class="chat-messages">
        <div
          v-for="(msg, i) in chatStore.currentMessages"
          :key="i"
          class="chat-msg"
          :class="{ 'chat-msg-self': String(msg.from) === String(userId) }"
        >
          <div class="chat-msg-avatar">
            <el-avatar :size="32" :src="getAvatar(msg.from)">
              {{ getInitial(msg.from) }}
            </el-avatar>
          </div>
          <div class="chat-msg-bubble">
            <div class="chat-msg-content">{{ msg.content }}</div>
            <div class="chat-msg-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>
        <div v-if="chatStore.currentMessages.length === 0" class="chat-empty">
          暂无聊天记录
        </div>
      </div>
      <div class="chat-input-bar">
        <el-input
          v-model="inputText"
          placeholder="输入消息…"
          clearable
          @keydown.enter="sendMessage"
        />
        <el-button
          type="primary"
          :disabled="!inputText.trim() || !chatStore.connected"
          @click="sendMessage"
        >
          发送
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
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

const title = computed(() => `与 ${props.peerName || '用户' + props.peerId} 聊天`)

const inputText = ref('')
const messagesRef = ref<HTMLElement | null>(null)

// 用户头像缓存（key: string userId）
const userAvatars = ref<Record<string, string>>({})
const userNames = ref<Record<string, string>>({})

// 初始化：加载自己的头像和对方头像
async function loadUserAvatars() {
  // 自己的头像
  const myId = String(userId.value)
  if (!userAvatars.value[myId]) {
    userAvatars.value[myId] = userStore.userAvatar || ''
    userNames.value[myId] = userStore.userName || ''
  }

  // 对方的头像
  const peerIdStr = String(props.peerId)
  if (!userAvatars.value[peerIdStr]) {
    try {
      const user = await getUserInfo(peerIdStr)
      userAvatars.value[peerIdStr] = user?.avatarUrl || ''
      userNames.value[peerIdStr] = user?.username || props.peerName || ''
    } catch {
      userAvatars.value[peerIdStr] = ''
      userNames.value[peerIdStr] = props.peerName || ''
    }
  }
}

function getAvatar(fromId: string | number): string {
  const id = String(fromId)
  return userAvatars.value[id] || ''
}

function getInitial(fromId: string | number): string {
  const id = String(fromId)
  const name = userNames.value[id]
  if (name) return name.charAt(0)
  return id === String(userId.value) ? '我' : 'U'
}

function onOpen() {
  // 先清空缓存
  userAvatars.value = {}
  userNames.value = {}

  chatStore.connect()
  chatStore.openConversation(props.peerId).then(async () => {
    await loadUserAvatars()
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
  const d = new Date(ts * 1000)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 监听消息变化，自动滚动
watch(
  () => chatStore.currentMessages.length,
  () => scrollToBottom()
)
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 480px;
}

.chat-status {
  padding: 6px 12px;
  font-size: 12px;
  color: #909399;
  text-align: center;
  border-bottom: 1px solid #ebeef5;
  background: #f5f7fa;
}

.chat-status.chat-connected {
  color: #67c23a;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fafafa;
}

.chat-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

.chat-msg {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.chat-msg.chat-msg-self {
  flex-direction: row-reverse;
}

.chat-msg-avatar {
  flex-shrink: 0;
}

.chat-msg-avatar .el-avatar {
  background: #f0f0f0;
  color: #666;
  font-size: 12px;
}

.chat-msg-self .chat-msg-avatar .el-avatar {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
}

.chat-msg-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.chat-msg-self .chat-msg-bubble {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
}

.chat-msg-content {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.chat-msg-time {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.chat-msg-self .chat-msg-time {
  color: rgba(255, 255, 255, 0.7);
}

.chat-input-bar {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #ebeef5;
  background: #fff;
}

.chat-input-bar :deep(.el-input__wrapper) {
  border-radius: 10px;
}
</style>