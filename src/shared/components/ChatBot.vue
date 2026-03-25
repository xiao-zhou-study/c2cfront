<template>
  <div class="chatbot-container">
    <!-- 最小化状态 - 浮动按钮 -->
    <div
      v-if="!isOpen"
      @click="toggleChat"
      class="chatbot-float-btn"
      :class="{ 'animate-bounce': hasNewMessage }"
    >
      <i class="fas fa-robot"></i>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </div>

    <!-- 展开状态 - 聊天窗口 -->
    <transition name="slide-up">
      <div v-if="isOpen" class="chatbot-window">
        <!-- 头部 -->
        <div class="chatbot-header">
          <div class="header-title">
            <i class="fas fa-robot"></i>
            <span>AI志愿填报顾问</span>
          </div>
          <div class="header-actions">
            <button @click="startNewConversation" class="action-btn" title="新建会话">
              <i class="fas fa-plus"></i>
            </button>
            <button @click="toggleChat" class="action-btn" title="关闭">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- 聊天内容 -->
        <div class="chatbot-messages" ref="chatContainer">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']"
          >
            <div class="message-avatar">
              <i :class="message.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
            </div>
            <div class="message-content">
              <div v-if="message.role === 'assistant' && message.isLoading" class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div v-else class="message-text">
                <span
                  v-for="(char, charIndex) in message.content"
                  :key="charIndex"
                  :class="{
                    'char-hidden': charIndex >= message.visibleChars,
                    'char-visible': charIndex < message.visibleChars
                  }"
                >{{ char }}</span>
                <span v-if="message.isStreaming" class="cursor"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chatbot-input">
          <textarea
            v-model="userInput"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.ctrl.enter.exact.prevent="sendMessage"
            @keydown.esc.exact="toggleChat"
            placeholder="输入您的问题..."
            ref="textarea"
            rows="1"
            @input="adjustTextareaHeight"
          ></textarea>
          <button
            @click="isLoading ? stopResponse() : sendMessage()"
            :disabled="!userInput.trim() && !isLoading"
            :class="['send-btn', isLoading ? 'stop-btn' : 'send-btn-active']"
          >
            <i :class="isLoading ? 'fas fa-stop' : 'fas fa-paper-plane'"></i>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)
const textarea = ref(null)
const memoryId = ref(Date.now().toString())
const unreadCount = ref(0)
const hasNewMessage = ref(false)

let controller = null
let typingInterval = null

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadCount.value = 0
    hasNewMessage.value = false
    nextTick(() => {
      scrollToBottom()
      if (textarea.value) {
        textarea.value.focus()
      }
    })
  }
}

const adjustTextareaHeight = () => {
  const textareaEl = textarea.value
  if (textareaEl) {
    textareaEl.style.height = 'auto'
    textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, 150)}px`
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const startNewConversation = () => {
  messages.value = []
  memoryId.value = Date.now().toString()
  messages.value.push({
    role: 'assistant',
    content: '你好！我是传智教育提供的AI志愿填报顾问，请问有什么能帮到您？',
    isLoading: false,
    visibleChars: 0,
    isStreaming: false
  })
  messages.value[0].visibleChars = messages.value[0].content.length
  scrollToBottom()
}

const startTypingEffect = (messageIndex) => {
  const message = messages.value[messageIndex]
  if (!message || message.visibleChars >= message.content.length) {
    clearInterval(typingInterval)
    typingInterval = null
    messages.value[messageIndex].isStreaming = false
    return
  }

  messages.value[messageIndex].visibleChars++
  scrollToBottom()
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  if (controller) {
    controller.abort()
  }
  controller = new AbortController()

  const userMessage = {
    role: 'user',
    content: userInput.value.trim(),
    isLoading: false,
    visibleChars: userInput.value.trim().length,
    isStreaming: false
  }

  messages.value.push(userMessage)

  const assistantMessage = {
    role: 'assistant',
    content: '',
    isLoading: true,
    visibleChars: 0,
    isStreaming: true
  }

  messages.value.push(assistantMessage)

  userInput.value = ''
  adjustTextareaHeight()
  scrollToBottom()

  isLoading.value = true

  try {
    const response = await fetch(`/chat?message=${encodeURIComponent(userMessage.content)}&memoryId=${memoryId.value}`, {
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let messageIndex = messages.value.length - 1

    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      messages.value[messageIndex].content = buffer
      messages.value[messageIndex].isLoading = false

      if (!typingInterval) {
        typingInterval = setInterval(() => {
          startTypingEffect(messageIndex)
        }, 15)
      }

      scrollToBottom()
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('请求被用户中止')
    } else {
      console.error('请求出错:', error)
      const lastMessage = messages.value[messages.value.length - 1]
      lastMessage.content = '抱歉，请求过程中出现错误'
      lastMessage.visibleChars = lastMessage.content.length
    }
  } finally {
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.isLoading = false
    lastMessage.isStreaming = false

    if (lastMessage.visibleChars < lastMessage.content.length) {
      lastMessage.visibleChars = lastMessage.content.length
    }

    isLoading.value = false
    controller = null

    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }

    scrollToBottom()
  }
}

const stopResponse = () => {
  if (controller) {
    controller.abort()
    const lastMessage = messages.value[messages.value.length - 1]
    lastMessage.isLoading = false
    lastMessage.isStreaming = false

    if (lastMessage.visibleChars < lastMessage.content.length) {
      lastMessage.visibleChars = lastMessage.content.length
    }

    isLoading.value = false
    controller = null

    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }
  }
}

onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: '你好！我是传智教育提供的AI志愿填报顾问，请问有什么能帮到您？',
    isLoading: false,
    visibleChars: 0,
    isStreaming: false
  })
  messages.value[0].visibleChars = messages.value[0].content.length
})

onUnmounted(() => {
  if (typingInterval) {
    clearInterval(typingInterval)
  }
  if (controller) {
    controller.abort()
  }
})
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.chatbot-float-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  font-size: 24px;
}

.chatbot-float-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
}

.chatbot-float-btn.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4444;
  color: white;
  font-size: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.chatbot-window {
  width: 380px;
  height: 520px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.chatbot-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chatbot-messages::-webkit-scrollbar {
  width: 6px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 100%;
}

.message.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.user-message .message-avatar {
  background: #667eea;
  color: white;
}

.assistant-message .message-avatar {
  background: #764ba2;
  color: white;
}

.message-content {
  max-width: 75%;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.user-message .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.assistant-message .message-text {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.char-hidden {
  opacity: 0;
}

.char-visible {
  opacity: 1;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background: currentColor;
  animation: blink 1s step-end infinite;
  margin-left: 2px;
  vertical-align: middle;
}

@keyframes blink {
  from, to {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.loading-dots {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #c1c1c1;
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chatbot-input {
  padding: 16px;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.chatbot-input textarea {
  flex: 1;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 12px 16px;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  transition: border-color 0.2s ease;
  min-height: 44px;
  max-height: 150px;
}

.chatbot-input textarea:focus {
  border-color: #667eea;
}

.chatbot-input textarea::placeholder {
  color: #adb5bd;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.send-btn-active:not(:disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.stop-btn {
  background: #ff4444;
  color: white;
}

.stop-btn:hover {
  background: #ff3333;
}

@media (max-width: 480px) {
  .chatbot-window {
    width: calc(100vw - 48px);
    height: calc(100vh - 48px);
    bottom: 24px;
    right: 24px;
    left: 24px;
  }
}
</style>