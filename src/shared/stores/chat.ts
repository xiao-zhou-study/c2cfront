import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import { chatApi } from '@/shared/api'

export interface ChatMessage {
  type: 'chat' | 'ping' | 'pong' | 'error'
  msgId?: string
  from: string | number
  to: string | number
  content: string
  timestamp: number
}

export interface ChatSession {
  userId: string | number
  online: boolean
  lastMessage: {
    msgId: string
    content: string
    from: string | number
    timestamp: string | number
  } | null
  unreadCount: number
  userName?: string
  userAvatar?: string
}

const HEARTBEAT_INTERVAL = 30000
const RECONNECT_DELAY = 3000

function buildWsUrl(userId: string): string {
  // 根据环境动态构建 WebSocket URL
  const isDev = import.meta.env.MODE === 'development'

  if (isDev) {
    // 开发环境：使用本地代理
    return `ws://localhost:3000/api/ns/ws/chat?userId=${userId}`
  } else {
    // 生产环境：使用实际的 API 地址
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.xzxfle.top'
    // 将 http(s) 转换为 ws(s)
    const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws')
    return `${wsBaseUrl}/ns/ws/chat?userId=${userId}`
  }
}

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore()

  // 状态
  const connected = ref(false)
  const sessions = ref<ChatSession[]>([])
  const loadingSessions = ref(false)
  const currentPeerId = ref<string | null>(null)
  const currentMessages = ref<ChatMessage[]>([])

  // 计算属性
  const totalUnreadCount = computed(() => {
    return sessions.value.reduce((sum, s) => sum + (s.unreadCount || 0), 0)
  })

  // WebSocket 实例（非响应式）
  let ws: WebSocket | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  // 建立连接
  function connect() {
    const userId = String(userStore.userId)
    console.log('chatStore.connect() called', { userId })

    if (!userId) {
      console.warn('chatStore.connect(): userId 为空，跳过连接')
      return
    }

    // 避免重复连接
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('chatStore.connect(): WebSocket 已连接，跳过')
      return
    }

    const url = buildWsUrl(userId)
    console.log('chatStore.connect(): 正在连接 WebSocket', url)
    ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('chatStore: WebSocket 已连接')
      connected.value = true
      startHeartbeat()
    }

    ws.onmessage = (event) => {
      try {
        // 用正则把大数字转成字符串，避免 JSON.parse 精度丢失
        const fixed = event.data.replace(/:(\d{15,})/g, ':"$1"')
        const msg = JSON.parse(fixed) as ChatMessage

        if (msg.type === 'pong') return
        if (msg.type === 'error') {
          console.error('WebSocket 错误:', msg.content)
          return
        }

        if (msg.type === 'chat') {
          // 如果是当前对话窗口的消息，直接添加
          if (currentPeerId.value && String(msg.from) === currentPeerId.value) {
            currentMessages.value.push(msg)
          }
          // 更新会话列表中的未读数（如果不是自己发的）
          if (String(msg.from) !== String(userStore.userId)) {
            updateSessionUnread(String(msg.from))
          }
        }
      } catch (e) {
        console.error('解析消息失败:', e)
      }
    }

    ws.onclose = () => {
      connected.value = false
      stopHeartbeat()
      scheduleReconnect()
    }

    ws.onerror = (err) => {
      console.error('WebSocket 连接错误:', err)
      // 不抛出错误，静默处理
      connected.value = false
    }
  }

  // 断开连接
  function disconnect() {
    stopHeartbeat()
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
    connected.value = false
  }

  // 发送消息
  function sendMessage(toUserId: string, content: string) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket 未连接')
      return false
    }

    const payload = {
      type: 'chat',
      to: toUserId,
      content,
      timestamp: Date.now()
    }
    ws.send(JSON.stringify(payload))

    // 立即在本地添加自己发送的消息
    const myMsg: ChatMessage = {
      type: 'chat',
      from: String(userStore.userId),
      to: toUserId,
      content,
      timestamp: payload.timestamp
    }
    currentMessages.value.push(myMsg)

    return true
  }

  // 加载会话列表
  async function loadSessions() {
    const userId = userStore.userId
    if (!userId) return

    try {
      loadingSessions.value = true
      const data = await chatApi.getChatSessions(userId)
      sessions.value = data || []
    } catch (e) {
      console.error('加载会话列表失败:', e)
    } finally {
      loadingSessions.value = false
    }
  }

  // 批量检查会话用户的在线状态
  async function checkAllSessionsOnline() {
    for (const session of sessions.value) {
      try {
        const isOnline = await chatApi.checkOnline(String(session.userId))
        session.online = isOnline
      } catch {
        session.online = false
      }
    }
  }

  // 加载历史消息
  async function loadHistory(peerId: string, page = 0, size = 50) {
    const userId = userStore.userId
    if (!userId || !peerId) return []

    try {
      const res = await chatApi.getChatHistory(userId, peerId, page, size)
      const historyMessages: ChatMessage[] = (res?.list || []).map((item: string) => {
        const fixed = item.replace(/:(\d{15,})/g, ':"$1"')
        return JSON.parse(fixed)
      })
      return historyMessages
    } catch (e) {
      console.error('加载历史消息失败:', e)
      return []
    }
  }

  // 打开某个会话
  async function openConversation(peerId: string) {
    currentPeerId.value = peerId
    currentMessages.value = await loadHistory(peerId)
    // 清除该会话的未读数
    clearUnread(peerId)
  }

  // 关闭当前会话
  function closeConversation() {
    currentPeerId.value = null
    currentMessages.value = []
  }

  // 更新会话未读数
  function updateSessionUnread(fromUserId: string) {
    const session = sessions.value.find(s => String(s.userId) === fromUserId)
    if (session) {
      session.unreadCount = (session.unreadCount || 0) + 1
    }
  }

  // 清除未读数
  function clearUnread(peerId: string) {
    const session = sessions.value.find(s => String(s.userId) === peerId)
    if (session) {
      session.unreadCount = 0
    }
  }

  // 心跳
  function startHeartbeat() {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, HEARTBEAT_INTERVAL)
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // 重连
  function scheduleReconnect() {
    if (reconnectTimer) return
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, RECONNECT_DELAY)
  }

  // 检查单个用户是否在线
  async function checkOnline(userId: string) {
    try {
      return await chatApi.checkOnline(userId)
    } catch {
      return false
    }
  }

  // 刷新在线状态（可手动调用）
  async function refreshOnlineStatus() {
    await checkAllSessionsOnline()
  }

  return {
    connected,
    sessions,
    loadingSessions,
    currentPeerId,
    currentMessages,
    totalUnreadCount,
    connect,
    disconnect,
    sendMessage,
    loadSessions,
    loadHistory,
    openConversation,
    closeConversation,
    checkOnline,
    refreshOnlineStatus
  }
})