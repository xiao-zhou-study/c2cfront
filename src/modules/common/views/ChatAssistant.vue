<template>
  <div class="chat-assistant-container">
    <!-- 页面头部 -->
    <div class="chat-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon size="24" color="#667eea">
            <Box />
          </el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">校园物品共享助手</h1>
          <p class="header-subtitle">CampusShare 智能客服 • 随时为您解答疑问</p>
        </div>
      </div>
      <div class="header-actions">
        <el-button 
          type="primary" 
          @click="startNewConversation"
          :icon="Plus"
        >
          新对话
        </el-button>
      </div>
    </div>

    <!-- 聊天主区域 -->
    <div class="chat-main" ref="chatContainer">
      <!-- 欢迎区域 -->
      <div v-if="messages.length === 0" class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-icon">
            <el-icon size="48" color="#667eea">
              <Comment />
            </el-icon>
          </div>
          <h2 class="welcome-title">您好！我是您的共享助手 🎓</h2>
          <p class="welcome-desc">我可以帮您了解物品共享的方方面面</p>
          
          <div class="quick-actions">
            <h3 class="quick-title">快速开始</h3>
            <div class="action-grid">
              <div 
                v-for="action in quickActions" 
                :key="action.title"
                class="action-card"
                @click="selectQuickAction(action)"
              >
                <div class="action-icon" :style="{ backgroundColor: action.color }">
                  <el-icon :size="20" color="white">
                    <component :is="action.icon" />
                  </el-icon>
                </div>
                <div class="action-text">
                  <h4>{{ action.title }}</h4>
                  <p>{{ action.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="quick-questions">
            <h3 class="quick-title">常见问题</h3>
            <div class="questions-grid">
              <el-button 
                v-for="question in quickQuestions" 
                :key="question"
                type="info"
                plain
                @click="sendQuickQuestion(question)"
                class="question-btn"
              >
                {{ question }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="messages-container">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          :class="['message-item', message.role]"
        >
          <div class="message-avatar">
            <el-avatar 
              :icon="message.role === 'user' ? User : Comment" 
              :size="36"
              :style="{ backgroundColor: message.role === 'user' ? '#409eff' : '#667eea' }"
            />
          </div>
          <div class="message-content">
            <div 
              :class="['message-bubble', message.role]"
              v-loading="message.isLoading"
            >
              <div v-if="message.isLoading" class="loading-placeholder">
                <el-skeleton animated>
                  <template #template>
                    <el-skeleton-item variant="p" style="width: 60%" />
                    <el-skeleton-item variant="p" style="width: 80%" />
                    <el-skeleton-item variant="p" style="width: 40%" />
                  </template>
                </el-skeleton>
              </div>
              <div v-else class="message-text">
                <span v-for="(char, charIndex) in message.content" :key="charIndex"
                      :class="{'invisible-char': charIndex >= message.visibleChars}">
                  {{ char }}
                </span>
                <span v-if="message.isStreaming" class="typing-cursor">|</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <div class="input-container">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="1"
          :autosize="{ minRows: 1, maxRows: 6 }"
          placeholder="询问关于物品共享的问题...例如：如何发布物品？借用流程是什么？"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.ctrl.enter.exact.prevent="sendMessage"
          @keydown.esc.exact="stopResponse"
          ref="inputRef"
        >
          <template #suffix>
            <div class="input-hints">
              <el-tag size="small" type="info">Enter发送</el-tag>
              <el-tag size="small" type="info">Esc停止</el-tag>
            </div>
          </template>
        </el-input>
        <el-button
          :type="isLoading ? 'danger' : 'primary'"
          :icon="isLoading ? Delete : Position"
          :loading="isLoading"
          @click="isLoading ? stopResponse() : sendMessage()"
          :disabled="!userInput.trim() && !isLoading"
          circle
          size="large"
          class="send-button"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Box, Comment, User, Plus, Position, Delete, 
  Edit, Coin, Lock, StarFilled, Help, Document 
} from '@element-plus/icons-vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isLoading: boolean
  visibleChars: number
  isStreaming: boolean
}

interface QuickAction {
  title: string
  desc: string
  icon: any
  color: string
  prompt: string
}

const messages = ref<Message[]>([])
const userInput = ref('')
const isLoading = ref(false)
const chatContainer = ref<HTMLElement>()
const inputRef = ref()
const memoryId = ref(Date.now().toString())

let controller: AbortController | null = null
let typingInterval: number | null = null

// 快捷操作
const quickActions: QuickAction[] = [
  {
    title: '发布物品',
    desc: '了解如何上传和管理您的共享物品',
    icon: Edit,
    color: '#667eea',
    prompt: '如何发布物品到平台？需要准备哪些信息？'
  },
  {
    title: '借用流程',
    desc: '掌握完整的物品借用和归还步骤',
    icon: Coin,
    color: '#4facfe',
    prompt: '物品借用的具体流程是什么？需要注意什么？'
  },
  {
    title: '安全保障',
    desc: '了解平台的安全机制和保障措施',
    icon: Lock,
    color: '#00f2fe',
    prompt: '平台有哪些安全保障措施？如何保护我的权益？'
  },
  {
    title: '信用体系',
    desc: '提升信用分，享受更多平台权益',
    icon: StarFilled,
    color: '#764ba2',
    prompt: '什么是信用分？如何提高信用分？有什么好处？'
  }
]

// 快捷问题
const quickQuestions = [
  '押金是怎么收取和退还的？',
  '物品损坏了需要赔偿吗？',
  '如何联系物品所有者？',
  '平台收取什么费用？',
  '可以取消借用申请吗？',
  '忘记归还物品怎么办？'
]

// 调整输入框高度
const adjustInputHeight = () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.textareaStyle = {
        height: 'auto'
      }
    }
  })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 打字效果
const startTypingEffect = (messageIndex: number, speed: number = 20) => {
  const message = messages.value[messageIndex]
  if (!message || message.visibleChars >= message.content.length) {
    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }
    messages.value[messageIndex].isStreaming = false
    return
  }

  typingInterval = setInterval(() => {
    const msg = messages.value[messageIndex]
    if (msg && msg.visibleChars < msg.content.length) {
      msg.visibleChars++
      scrollToBottom()
    } else {
      if (typingInterval) {
        clearInterval(typingInterval)
        typingInterval = null
      }
      msg.isStreaming = false
    }
  }, speed)
}

// 新建对话
const startNewConversation = () => {
  messages.value = []
  memoryId.value = Date.now().toString()
  userInput.value = ''
  adjustInputHeight()
  
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 选择快捷操作
const selectQuickAction = (action: QuickAction) => {
  userInput.value = action.prompt
  sendMessage()
}

// 发送快捷问题
const sendQuickQuestion = (question: string) => {
  userInput.value = question
  sendMessage()
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  // 中止之前的请求
  if (controller) {
    controller.abort()
  }
  controller = new AbortController()

  // 添加用户消息
  const userMessage: Message = {
    role: 'user',
    content: userInput.value.trim(),
    isLoading: false,
    visibleChars: userInput.value.trim().length,
    isStreaming: false
  }
  messages.value.push(userMessage)

  // 添加助手回复占位符
  const assistantMessage: Message = {
    role: 'assistant',
    content: '',
    isLoading: true,
    visibleChars: 0,
    isStreaming: true
  }
  messages.value.push(assistantMessage)

  const userQuestion = userInput.value.trim()
  userInput.value = ''
  adjustInputHeight()
  scrollToBottom()
  isLoading.value = true

  try {
    // 连接到后端ChatController
    const response = await fetch(`/chat?message=${encodeURIComponent(userQuestion)}&memoryId=${memoryId.value}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('无法获取响应流')

    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    const messageIndex = messages.value.length - 1

    // 清除之前的打字效果
    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }

    // 流式处理响应
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      // 更新消息内容
      messages.value[messageIndex].content = buffer
      messages.value[messageIndex].isLoading = false

      // 启动打字效果
      if (!typingInterval) {
        startTypingEffect(messageIndex, 15)
      }

      scrollToBottom()
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('请求被用户中止')
    } else {
      console.error('请求出错:', error)
      const lastMessage = messages.value[messages.value.length - 1]
      lastMessage.content = '抱歉，我在处理您的问题时遇到了一些困难。请您稍后再试，或者联系我们的客服人员。'
      lastMessage.visibleChars = lastMessage.content.length
    }
  } finally {
    finishMessageProcessing()
  }
}

// 完成消息处理
const finishMessageProcessing = () => {
  const lastMessage = messages.value[messages.value.length - 1]
  lastMessage.isLoading = false
  lastMessage.isStreaming = false

  // 确保所有字符都可见
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

// 停止响应
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

// 初始化
onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus()
  })
})

// 监听消息变化自动滚动
watch(messages, scrollToBottom, { deep: true })
</script>

<style scoped>
.chat-assistant-container {
  height: calc(100vh - var(--layout-header-height, 60px));
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
}

/* 头部样式 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.header-text h1 {
  margin: 0 0 5px 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.header-text p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

/* 聊天主区域 */
.chat-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.welcome-content {
  text-align: center;
  max-width: 800px;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px 0;
}

.welcome-desc {
  font-size: 16px;
  color: #606266;
  margin: 0 0 40px 0;
}

.quick-actions {
  margin: 40px 0;
}

.quick-title {
  font-size: 20px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 20px 0;
  text-align: left;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-text h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.action-text p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.quick-questions {
  margin: 30px 0;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.question-btn {
  justify-content: flex-start;
  height: auto;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.question-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 消息区域 */
.messages-container {
  max-width: 1000px;
  margin: 0 auto;
}

.message-item {
  display: flex;
  margin-bottom: 25px;
  gap: 15px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-bubble {
  padding: 16px 20px;
  border-radius: 18px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.message-bubble.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 5px;
}

.message-bubble.assistant {
  background: white;
  color: #303133;
  border: 1px solid #ebeef5;
  border-bottom-left-radius: 5px;
}

.loading-placeholder {
  min-height: 60px;
  display: flex;
  align-items: center;
}

.message-text {
  line-height: 1.6;
  white-space: pre-wrap;
}

.invisible-char {
  opacity: 0;
}

.typing-cursor {
  animation: blink 1s step-end infinite;
  margin-left: 2px;
}

@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}

/* 输入区域 */
.chat-input-area {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #ebeef5;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 15px;
  max-width: 1000px;
  margin: 0 auto;
}

:deep(.el-textarea__inner) {
  border-radius: 20px;
  padding: 15px 20px;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  border: 2px solid #ebeef5;
  transition: border-color 0.3s ease;
}

:deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-hints {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.send-button {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.send-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-header {
    padding: 15px 20px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .chat-main {
    padding: 15px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .questions-grid {
    grid-template-columns: 1fr;
  }
  
  .input-container {
    padding: 0 15px;
  }
}
</style>