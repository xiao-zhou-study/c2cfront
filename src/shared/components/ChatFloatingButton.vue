<template>
  <div class="chat-container-wrapper">
    <transition name="scale-fade">
      <div 
        v-if="!showChatWindow && !isFullscreen && userStore.isLoggedIn"
        class="floating-btn-wrapper"
        @click="toggleChatWindow"
      >
        <div class="gemini-glow"></div>
        <div class="floating-button">
          <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0" class="custom-badge">
            <el-icon size="24" color="white"><Service /></el-icon>
          </el-badge>
        </div>
      </div>
    </transition>

    <transition name="gemini-dialog">
      <div 
        v-if="showChatWindow && userStore.isLoggedIn" 
        :class="['chat-window', { 'is-fullscreen': isFullscreen }]"
      >
        <div class="glass-header">
          <div class="header-left">
            <div class="avatar-gradient">
              <el-icon color="white" :size="20"><Service /></el-icon>
            </div>
            <div class="header-text">
              <div class="ai-name">Campus AI <span class="beta-tag">Beta</span></div>
              <div class="ai-status">
                <span class="status-dot"></span> 
                {{ isLoading ? '正在思考...' : '在线' }}
              </div>
            </div>
          </div>
          <div class="header-actions">
            <el-tooltip content="全屏/恢复" placement="bottom">
              <div class="icon-btn hide-on-mobile" @click="toggleFullscreen">
                <el-icon><component :is="isFullscreen ? 'CopyDocument' : 'FullScreen'" /></el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="最小化" placement="bottom">
              <div class="icon-btn" @click="minimizeChat">
                <el-icon><Minus /></el-icon>
              </div>
            </el-tooltip>
            <el-tooltip content="清空并关闭" placement="bottom">
              <div class="icon-btn close" @click="closeChat">
                <el-icon><Close /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </div>

        <div class="chat-viewport" ref="messagesContainer">
          <transition name="fade-slide">
            <div v-if="messages.length === 0" class="welcome-screen">
              <div class="welcome-logo">
                <el-icon :size="56"><MagicStick /></el-icon>
              </div>
              <h2 class="welcome-title">你好，我是你的交易助手</h2>
              <p class="welcome-subtitle">我可以帮你解答二手交易流程、价格咨询或发布商品相关的问题。</p>
              
              <div class="suggestion-grid">
                <div 
                  v-for="(q, idx) in quickQuestions" 
                  :key="idx" 
                  class="suggestion-card"
                  @click="sendQuickQuestion(q)"
                >
                  <span class="suggestion-text">{{ q }}</span>
                  <el-icon class="arrow-icon"><Right /></el-icon>
                </div>
              </div>
            </div>
          </transition>

          <div class="message-list">
            <div 
              v-for="(msg, index) in messages" 
              :key="index" 
              :class="['message-row', msg.role]"
            >
              <div v-if="msg.role === 'assistant'" class="avatar-col">
                <div class="ai-avatar-small">
                  <el-icon><Service /></el-icon>
                </div>
              </div>

              <div class="content-col">
                <div v-if="msg.role === 'user'" class="user-bubble">
                  {{ msg.content }}
                </div>
                
                <div v-else class="ai-bubble-container">
                  <div v-if="msg.role === 'assistant'" class="ai-name-label">Campus AI</div>
                  
                  <div 
                    v-if="msg.isLoading && !msg.content" 
                    class="loading-placeholder"
                  >
                    <span class="thinking-dots">
                      <span></span><span></span><span></span>
                    </span>
                  </div>
                  <template v-else>
                    <MarkdownRender
                      custom-id="chat"
                      :nodes="messageNodes[index]"
                      :final="msg.isFinal"
                    />

                    <div v-if="!msg.isFinal" class="streaming-footer">
                      <span class="gemini-cursor"></span>
                    </div>
                  </template>

                  <div class="ai-actions" v-if="!msg.isLoading && msg.isFinal">
                    <el-tooltip content="复制内容" placement="top" :show-after="500">
                      <el-icon class="action-icon" @click="copyToClipboard(msg.content)"><CopyDocument /></el-icon>
                    </el-tooltip>
                    <el-tooltip content="有帮助" placement="top" :show-after="500">
                      <el-icon class="action-icon"><StarFilled /></el-icon>
                    </el-tooltip>
                    <el-tooltip content="重新生成" placement="top" :show-after="500">
                      <el-icon class="action-icon"><RefreshRight /></el-icon>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="input-section">
          <div class="input-wrapper" :class="{ 'is-focused': isInputFocused }">
            <el-input
              v-model="userInput"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              placeholder="输入你想问的问题..."
              resize="none"
              class="gemini-input"
              @focus="isInputFocused = true"
              @blur="isInputFocused = false"
              @keydown.enter.exact.prevent="sendMessage"
              ref="inputRef"
            />
            <div class="input-actions">
              <el-button 
                v-if="isLoading"
                class="stop-btn"
                circle
                @click="stopResponse"
              >
                <el-icon><VideoPause /></el-icon>
              </el-button>
              <el-button 
                v-else
                class="send-btn" 
                :class="{ 'has-text': userInput.trim() }"
                circle
                @click="sendMessage"
              >
                <el-icon><Promotion /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="footer-note">内容由 AI 生成，请仔细甄别。</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Minus, Close, Promotion, Service, 
  FullScreen, CopyDocument, MagicStick, Right,
  StarFilled, RefreshRight, VideoPause
} from '@element-plus/icons-vue'
import { MarkdownRender, getMarkdown, parseMarkdownToStructure } from 'markstream-vue'
import 'markstream-vue/index.css'
import { useUserStore } from '@/shared/stores/user'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  isLoading: boolean
  isFinal: boolean
}

const userStore = useUserStore()
const showChatWindow = ref(false)
const isFullscreen = ref(false)
const isInputFocused = ref(false)
const unreadCount = ref(0)
const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()
const inputRef = ref()
const memoryId = ref(Date.now().toString())
let controller: AbortController | null = null

const md = getMarkdown('chat')

const messageNodes = computed(() =>
  messages.value.map(msg =>
    msg.role === 'assistant'
      ? parseMarkdownToStructure(msg.content, md, { final: msg.isFinal })
      : null
  )
)

const quickQuestions = [
  '📦 如何发布二手商品？',
  '💰 怎样定价更合理？',
  '🤝 如何安全交易？',
  '⭐ 买到有问题的商品怎么办？'
]

const scrollToBottom = async (force = false) => {
  await nextTick()
  if (!messagesContainer.value) return
  const container = messagesContainer.value
  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
  if (force || isNearBottom) {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }
}

const autoScroll = () => {
  if (!messagesContainer.value) return
  const el = messagesContainer.value
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 150) {
    el.scrollTop = el.scrollHeight
  }
}

const toggleChatWindow = () => {
  showChatWindow.value = !showChatWindow.value
  if (showChatWindow.value) scrollToBottom(true)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  scrollToBottom(true)
}

const minimizeChat = () => {
  showChatWindow.value = false
}

const closeChat = () => {
  showChatWindow.value = false
  isFullscreen.value = false
  messages.value = []
  stopResponse()
  memoryId.value = Date.now().toString()
}

const sendQuickQuestion = (q: string) => {
  userInput.value = q.replace(/^[^\w\u4e00-\u9fa5]+/, '')
  sendMessage()
}

const stopResponse = () => {
  if (controller) {
    controller.abort()
    controller = null
  }
  isLoading.value = false
  if (messages.value.length > 0) {
    const last = messages.value[messages.value.length - 1]
    last.isLoading = false
    last.isFinal = true
  }
}

const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text || isLoading.value) return

  stopResponse()
  controller = new AbortController()

  messages.value.push({ role: 'user', content: text, isLoading: false, isFinal: true })
  userInput.value = ''

  const aiMsgIndex = messages.value.push({
    role: 'assistant',
    content: '',
    isLoading: true,
    isFinal: false,
  }) - 1

  isLoading.value = true
  scrollToBottom(true)

  try {
    const apiBase = import.meta.env.DEV ? '/api' : 'https://ai.xzxfle.top'
    const params = new URLSearchParams({ message: text, memoryId: memoryId.value })

    const response = await fetch(`${apiBase}/ai/chat/stream?${params}`, {
      method: 'POST',
      headers: { Accept: '*/*' },
      credentials: 'include',
      signal: controller.signal,
    })

    if (!response.body) throw new Error('Stream Error')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let thinkingBuffer = ''
    let isInThinking = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue
        
        // 处理 "data:data:" 双重前缀或单个 "data:" 前缀
        let jsonStr = line.trim()
        if (jsonStr.startsWith('data:data:')) {
          jsonStr = jsonStr.replace(/^data:data:\s*/, '').trim()
        } else if (jsonStr.startsWith('data:')) {
          jsonStr = jsonStr.replace(/^data:\s*/, '').trim()
        }
        
        if (!jsonStr) continue

        try {
          const json = JSON.parse(jsonStr)
          let content = json.content ?? ''
          
          if (!content) continue

          // 处理思考标签 (可能跨多个消息块)
          thinkingBuffer += content
          
          // 检查是否包含 <think> 开始标签
          if (thinkingBuffer.includes('<think>')) {
            isInThinking = true
          }
          
          // 如果在思考中,检查是否有结束标签
          if (isInThinking) {
            if (thinkingBuffer.includes('</think>')) {
              // 移除所有思考内容,保留 </think> 后面的内容
              thinkingBuffer = thinkingBuffer.replace(/[\s\S]*?<\/think>\s*/g, '')
              isInThinking = false
              
              // 如果还有剩余内容,添加到消息中
              if (thinkingBuffer) {
                messages.value[aiMsgIndex].content += thinkingBuffer
                messages.value[aiMsgIndex].isLoading = false
              }
              thinkingBuffer = ''
            }
            // 还在思考中,不添加任何内容,继续累积到 buffer
          } else {
            // 不在思考中,直接添加内容
            messages.value[aiMsgIndex].content += thinkingBuffer
            messages.value[aiMsgIndex].isLoading = false
            thinkingBuffer = ''
          }
        } catch {
          // 忽略无法解析的行
        }
      }

      await nextTick()
      autoScroll()
    }

  } catch (err: any) {
    if (err.name !== 'AbortError') {
      messages.value[aiMsgIndex].content += '\n\n*(网络连接中断，请重试)*'
      messages.value[aiMsgIndex].isLoading = false
    }
  } finally {
    messages.value[aiMsgIndex].isFinal = true
    isLoading.value = false
    controller = null
    scrollToBottom(true)
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isFullscreen.value) isFullscreen.value = false
}
onMounted(() => window.addEventListener('keydown', handleEsc))
onUnmounted(() => window.removeEventListener('keydown', handleEsc))
</script>

<style scoped lang="scss">
.chat-container-wrapper {
  --primary-color: #03a688;
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.12);
  --radius-lg: 24px;
  
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 2000;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.floating-btn-wrapper {
  position: absolute;
  bottom: 0;
  right: 0;
  cursor: pointer;
  z-index: 2000;
  transform-origin: bottom right;
  
  &:hover .floating-button {
    transform: scale(1.1) rotate(-5deg);
  }
}

.gemini-glow {
  position: absolute;
  inset: -6px;
  background: rgba(64, 158, 255, 0.8);
  border-radius: 50%;
  filter: blur(12px);
  opacity: 0.5;
  animation: breathe 3s infinite ease-in-out;
}

.floating-button {
  width: 64px;
  height: 64px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.chat-window {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 460px;
  height: 650px;
  background: #ffffff;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: bottom right;
  
  @media (max-width: 480px) {
    position: fixed !important;
    bottom: 0 !important;
    right: 0 !important;
    left: 0 !important;
    top: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    border-radius: 0 !important;
    z-index: 3000;
  }

  &.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    z-index: 3000;
  }
}

.glass-header {
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-gradient {
  width: 38px;
  height: 38px;
  background: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.25);
}

.header-text {
  .ai-name {
    font-weight: 700;
    font-size: 16px;
    color: #1f1f1f;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .beta-tag {
    font-size: 9px;
    background: #e6f9f5;
    color: #03a688;
    padding: 1px 5px;
    border-radius: 6px;
    font-weight: 700;
  }
  .ai-status {
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }
  .status-dot {
    width: 8px;
    height: 8px;
    background: #03a688;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.8);
  }
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  color: #5f6368;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f3f4;
    color: #1f1f1f;
  }
  &.close:hover {
    background: #fee2e2;
    color: #d93025;
  }
}

@media (max-width: 480px) {
  .hide-on-mobile {
    display: none;
  }
}

.chat-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(to bottom, #ffffff, #f7f9fc);
}

.welcome-screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 24px;
}

.welcome-logo {
  margin-bottom: 24px;
  color: var(--primary-color);
  animation: float 3s ease-in-out infinite;
}

.welcome-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: var(--primary-color);
  font-weight: 800;
  letter-spacing: -0.5px;
}

.welcome-subtitle {
  color: #5f6368;
  font-size: 15px;
  margin-bottom: 32px;
  max-width: 280px;
  line-height: 1.6;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  width: 100%;
}

.suggestion-card {
  background: white;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e0e3e7;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background: #e6f9f5;
    border-color: #b4f3e6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(3, 166, 136, 0.1);
  }
  
  .suggestion-text {
    font-size: 13px;
    color: #3c4043;
    font-weight: 500;
  }
  
  .arrow-icon {
    opacity: 0;
    transition: opacity 0.2s;
    font-size: 14px;
    color: #03a688;
  }
  
  &:hover .arrow-icon {
    opacity: 1;
  }
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-bottom: 20px;
}

.message-row {
  display: flex;
  gap: 16px;
  animation: slideIn 0.3s ease-out forwards;
  
  &.user {
    justify-content: flex-end;
  }
}

.ai-avatar-small {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.user-bubble {
  background: #f0f2f5;
  color: #1f1f1f;
  padding: 12px 20px;
  border-radius: 24px 24px 4px 24px;
  max-width: 85%;
  font-size: 15px;
  line-height: 1.6;
}

.ai-bubble-container {
  flex: 1;
  max-width: 100%;
  min-width: 0;
}

.ai-name-label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
  margin-bottom: 8px;
}

.loading-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 28px;
  padding: 10px 18px;
  border-radius: 14px;
  background: #f9fafb;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.15);
}

.ai-actions {
  display: flex;
  gap: 14px;
  margin-top: 10px;
  opacity: 0;
  transition: opacity 0.2s;
  
  .action-icon {
    cursor: pointer;
    color: #9aa0a6;
    font-size: 18px;
    transition: all 0.2s;
    
    &:hover {
      color: #5f6368;
      transform: scale(1.1);
    }
  }
}

.message-row:hover .ai-actions {
  opacity: 1;
}

.input-section {
  padding: 16px 24px 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.input-wrapper {
  background: #f0f4f9;
  border-radius: 28px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  border: 2px solid transparent;
  
  &.is-focused {
    background: white;
    border-color: #b4f3e6;
    box-shadow: 0 4px 12px rgba(3, 166, 136, 0.15);
  }
}

.gemini-input {
  :deep(.el-textarea__inner) {
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 4px 0;
    color: #1f1f1f;
    font-size: 14px;
    line-height: 20px;
    min-height: 20px;
    
    &::placeholder {
      color: #8e9196;
    }
  }
}

.input-actions {
  margin-left: 10px;
  display: flex;
  align-items: center;
  padding-bottom: 2px;
}

.send-btn {
  border: none;
  background: transparent;
  color: #dadce0;
  transition: all 0.3s;
  width: 36px;
  height: 36px;
  font-size: 18px;
  
  &.has-text {
    background: var(--primary-color);
    color: white;
  }
  
  &:hover.has-text {
    background: #028a73;
    box-shadow: 0 2px 6px rgba(3, 166, 136, 0.3);
  }
}

.stop-btn {
  border: 1px solid #f28b82;
  color: #d93025;
  background: #fce8e6;
  width: 36px;
  height: 36px;
  
  &:hover {
    background: #fad2cf;
  }
}

.footer-note {
  text-align: center;
  font-size: 11px;
  color: #9aa0a6;
  margin-top: 10px;
}

.streaming-footer {
  display: flex;
  align-items: center;
  margin-top: 6px;
  height: 20px;
}

.gemini-cursor {
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  animation: blink 1s infinite;
  margin-left: 4px;
}

.thinking-dots span {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #dadce0;
  margin-right: 4px;
  animation: bounce 1.4s infinite ease-in-out both;
}

.thinking-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.thinking-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
    background: #9b72cb;
  }
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.gemini-dialog-enter-active,
.gemini-dialog-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.gemini-dialog-enter-from,
.gemini-dialog-leave-to {
  opacity: 0;
  transform: translateY(60px) scale(0.9);
}

.fade-slide-enter-active {
  transition: all 0.6s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
