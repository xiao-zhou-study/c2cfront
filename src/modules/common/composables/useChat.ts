import { ref } from 'vue'
import { useUserStore } from '@/shared/stores/user'
import { chatApi } from '@/shared/api'

export interface ChatMessage {
  type: 'chat' | 'ping' | 'pong' | 'error'
  msgId?: string
  from: number | string
  to: number | string
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
}

const HEARTBEAT_INTERVAL = 30000
const RECONNECT_DELAY = 3000

function buildWsUrl(userId: string | number): string {
  return `ws://localhost:3000/api/ns/ws/chat?userId=${userId}`
}

export function useChat(targetUserId: string | number) {
  const userStore = useUserStore()
  const messages = ref<ChatMessage[]>([])
  const connected = ref(false)
  const sessions = ref<ChatSession[]>([])
  const loadingSessions = ref(false)

  let ws: WebSocket | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  function connect() {
    const userId = userStore.userId
    if (!userId) return

    const url = buildWsUrl(userId)
    ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('WebSocket 已连接')
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
          // 过滤掉自己发送的消息（已在本地添加）
          if (String(msg.from) === String(userStore.userId)) return
          messages.value.push(msg)
        }
      } catch (e) {
        console.error('解析消息失败:', e)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket 断开')
      connected.value = false
      stopHeartbeat()
      scheduleReconnect()
    }

    ws.onerror = () => {
      console.error('WebSocket 错误')
    }
  }

  function sendMessage(content: string) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket 未连接，无法发送消息')
      return
    }
    const payload = {
      type: 'chat',
      to: targetUserId, // 不转 Number，直接传字符串，避免大数精度丢失
      content,
      timestamp: Math.floor(Date.now() / 1000)
    }
    ws.send(JSON.stringify(payload))
  }

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

  function scheduleReconnect() {
    if (reconnectTimer) return
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, RECONNECT_DELAY)
  }

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

  async function loadHistory(targetId?: string | number, page = 0, size = 20): Promise<ChatMessage[]> {
    const userId = userStore.userId
    const peerId = targetId || targetUserId
    if (!userId || !peerId) return []
    try {
      const res = await chatApi.getChatHistory(userId, peerId, page, size)
      const historyMessages: ChatMessage[] = (res?.list || []).map((item: string) => {
        // 用正则把大数字（超过安全整数范围）转成字符串，避免 JSON.parse 精度丢失
        const fixed = item.replace(/:(\d{15,})/g, ':"$1"')
        return JSON.parse(fixed)
      })
      messages.value = historyMessages
      return historyMessages
    } catch (e) {
      console.error('加载历史消息失败:', e)
      return []
    }
  }

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

  async function checkOnline(userId?: string | number) {
    try {
      return await chatApi.checkOnline(userId || targetUserId)
    } catch {
      return false
    }
  }

  return {
    messages,
    connected,
    sessions,
    loadingSessions,
    connect,
    disconnect,
    sendMessage,
    loadHistory,
    loadSessions,
    checkOnline
  }
}
