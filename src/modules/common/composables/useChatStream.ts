/**
 * SSE 流式聊天 composable — 使用原生 EventSource（GET 请求，零依赖）
 */
import { ref, nextTick } from 'vue'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  isLoading: boolean
  isFinal: boolean
}

export function useChatStream() {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  let eventSource: EventSource | null = null

  /** 停止生成 */
  function stopResponse() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    isLoading.value = false
    if (messages.value.length > 0) {
      const last = messages.value[messages.value.length - 1]
      last.isLoading = false
      last.isFinal = true
    }
  }

  /** 过滤 <think> 思考内容，只保留正式输出 */
  function stripThinking(rawContent: string): { content: string; isThinking: boolean } {
    const openTag = '<think>'
    const closeTag = '</think>'

    // 如果包含完整的 <think>...</think> 标签对，移除所有思考部分
    if (rawContent.includes(openTag) && rawContent.includes(closeTag)) {
      return { content: rawContent.replace(/<think>[\s\S]*?<\/think>/g, ''), isThinking: false }
    }

    // 如果只包含开始标签，说明还在思考中
    if (rawContent.includes(openTag)) {
      const idx = rawContent.indexOf(openTag)
      return { content: rawContent.slice(0, idx), isThinking: true }
    }

    return { content: rawContent, isThinking: false }
  }

  /** 发送消息并接收流式响应 */
  async function sendMessage(
    text: string,
    apiConfig: { apiBase: string; memoryId: string },
    onStreamUpdate?: (content: string) => void
  ) {
    if (!text.trim() || isLoading.value) return

    stopResponse()

    messages.value.push({ role: 'user', content: text, isLoading: false, isFinal: true })
    const aiMsgIndex = messages.value.push({
      role: 'assistant',
      content: '',
      isLoading: true,
      isFinal: false
    }) - 1

    isLoading.value = true

    // 累积的原始内容（含 <think>）
    let rawAccumulator = ''

    try {
      const { apiBase, memoryId } = apiConfig
      const params = new URLSearchParams({ message: text, memoryId })
      const url = `${apiBase}/ai/chat/stream?${params.toString()}`

      eventSource = new EventSource(url)

      eventSource.onmessage = (event) => {
        if (event.data === '[DONE]') return

        try {
          const json = JSON.parse(event.data)
          const content = json.content ?? ''
          if (!content) return

          rawAccumulator += content
          const { content: visible, isThinking } = stripThinking(rawAccumulator)

          const msg = messages.value[aiMsgIndex]
          msg.content = visible
          msg.isLoading = isThinking

          onStreamUpdate?.(visible)
        } catch {
          // 忽略无法解析的行
        }
      }

      eventSource.onerror = () => {
        eventSource?.close()
        eventSource = null
        isLoading.value = false

        const msg = messages.value[aiMsgIndex]
        msg.isLoading = false
        msg.isFinal = true
      }

    } catch (err: any) {
      const msg = messages.value[aiMsgIndex]
      if (!msg.content) {
        msg.content = '*(网络连接中断，请重试)*'
      }
      msg.isLoading = false
      msg.isFinal = true
      isLoading.value = false
    }
  }

  function addMessage(role: 'user' | 'assistant', content: string) {
    messages.value.push({ role, content, isLoading: false, isFinal: true })
  }

  function clearMessages() {
    messages.value = []
    stopResponse()
  }

  return {
    messages,
    isLoading,
    sendMessage,
    stopResponse,
    addMessage,
    clearMessages
  }
}
