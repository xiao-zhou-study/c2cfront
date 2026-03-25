<template>
  <div class="topic-page">
    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="8" animated />
    </div>

    <template v-else-if="topic">
      <div class="topic-header">
        <el-button text class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <h1 class="topic-title">{{ topic.title }}</h1>
        <div class="topic-meta">
          <div class="topic-author-wrap">
            <el-avatar
              :size="32"
              :src="topic.authorAvatar"
              class="topic-author-avatar"
            >
              {{ topic.authorName?.charAt(0) }}
            </el-avatar>
            <span class="author">{{ topic.authorName }}</span>
          </div>
          <span class="category">{{ topic.categoryName }}</span>
          <span class="time">{{ topic.createdAt }}</span>
          <span class="replies-count">{{ totalReplies }} 条回复</span>
        </div>
      </div>

      <div class="topic-body">
        <div class="topic-content">{{ topic.content }}</div>
      </div>

      <section class="replies-section">
        <h2 class="replies-title">全部回复（{{ totalReplies }}）</h2>

        <!-- 标题正下方的回复输入条：头像 + 输入 + 发送图标 -->
        <div
          class="reply-form-wrap"
          :class="{ 'is-focused': isReplyFocused }"
        >
          <div class="reply-form-inner">
            <div class="reply-current-avatar">
              <el-avatar :size="36" :src="currentUserAvatar">
                {{ currentUserName?.charAt(0) }}
              </el-avatar>
            </div>
            <div class="reply-input-wrapper">
              <el-input
                v-model="replyContent"
                type="textarea"
                class="reply-input"
                placeholder="我有话说"
                maxlength="500"
                :autosize="{ minRows: 1, maxRows: 4 }"
                @focus="isReplyFocused = true"
                @blur="isReplyFocused = false"
                @keydown.enter="handleEnterKey"
              />
              <el-icon
                class="send-icon"
                :class="{ 'is-disabled': submitting }"
                @click="!submitting && submitReply()"
              >
                <Promotion />
              </el-icon>
            </div>
          </div>
        </div>

        <div v-if="loadingReplies" class="loading-replies">
          <el-skeleton :rows="3" animated />
        </div>

        <el-empty
          v-else-if="replies.length === 0"
          description="暂无回复，写下第一条回复吧"
          :image-size="120"
        />

        <ul v-else class="reply-list">
          <li
            v-for="reply in displayedReplies"
            :key="reply.id"
            class="reply-item"
          >
            <div class="reply-avatar">
              <el-avatar :size="40" :src="reply.avatar">
                {{ reply.authorName.charAt(0) }}
              </el-avatar>
            </div>
            <div class="reply-body">
              <div class="reply-meta">
                <span class="reply-author">{{ reply.authorName }}</span>
                <span class="reply-time">{{ reply.createdAt }}</span>

                <el-dropdown trigger="click" class="reply-actions">
                  <span class="reply-actions-trigger">
                    <el-icon>
                      <MoreFilled />
                    </el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleCopyReply(reply)">
                        复制内容
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-if="isMyReply(reply)"
                        divided
                        @click="handleWithdrawReply(reply)"
                      >
                        撤回
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <p class="reply-content">{{ reply.content }}</p>
            </div>
          </li>
        </ul>

        <div
          v-if="!showAllReplies && replies.length > maxPreviewReplies"
          class="more-replies-wrap"
        >
          <el-button text class="more-replies-btn" @click="showAllReplies = true">
            更多评论（还有 {{ replies.length - maxPreviewReplies }} 条）
          </el-button>
        </div>
      </section>
    </template>

    <div v-else class="empty-wrap">
      <p>话题不存在或已删除</p>
      <el-button @click="goBack">返回列表</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Promotion, MoreFilled } from '@element-plus/icons-vue'
import { blogApi } from '@/shared/api'
import { formatTimeAgo } from '@/shared/utils/format'
import { useUserStore } from '@/shared/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const topicId = computed(() => Number(route.params.id))

const loading = ref(true)
const topic = ref(null)
const replies = ref([])
const replyContent = ref('')
const submitting = ref(false)
const loadingReplies = ref(false)
const isReplyFocused = ref(false)
const showAllReplies = ref(false)
const maxPreviewReplies = 5

const currentUserName = computed(
  () =>
    userStore.userName ||
    userStore.userInfo?.username ||
    userStore.userInfo?.studentId ||
    '我'
)
const currentUserAvatar = computed(
  () => userStore.userAvatar || userStore.userInfo?.avatarUrl || ''
)

const displayedReplies = computed(() =>
  showAllReplies.value ? replies.value : replies.value.slice(0, maxPreviewReplies)
)

// 判断是否为当前用户的评论
const isMyReply = reply => {
  const name =
    userStore.userName ||
    userStore.userInfo?.username ||
    userStore.userInfo?.studentId ||
    '我'
  return reply?.authorName === name
}
const pageNo = ref(1)
const pageSize = ref(20)
const totalReplies = ref(0)

// 获取话题详情
async function fetchTopic() {
  loading.value = true
  try {
    const data = await blogApi.getTopicDetail(topicId.value)

    topic.value = {
      id: data.id,
      title: data.title,
      content: data.content,
      authorName: data.userNickname,
      authorAvatar: data.userAvatar,
      categoryName: data.categoryName,
      createdAt: formatTimeAgo(data.createTime)
    }
    // 获取话题后，加载评论列表
    await fetchReplies()
  } catch (error) {
    console.error('获取话题详情失败:', error)
    ElMessage.error('获取话题详情失败，请稍后重试')
    topic.value = null
  } finally {
    loading.value = false
  }
}

// 获取评论列表
async function fetchReplies() {
  loadingReplies.value = true
  try {
    const response = await blogApi.getCommentPage({
      topicId: topicId.value,
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      sortBy: 'create_time',
      isAsc: false
    })
    
    // 数据适配：将后端返回的数据转换为前端使用的格式
    replies.value = response.list.map(comment => ({
      id: comment.id,
      authorName: comment.username,
      avatar: comment.avatar,
      content: comment.content,
      createdAt: formatTimeAgo(comment.createTime)
    }))
    
    // 确保 totalReplies 是数字类型，避免字符串拼接问题
    totalReplies.value = Number(response.total) || 0
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败，请稍后重试')
    replies.value = []
  } finally {
    loadingReplies.value = false
  }
}

// 处理 Enter 键：Enter 发送，Shift+Enter 换行
function handleEnterKey(event) {
  if (!event.shiftKey) {
    event.preventDefault()
    if (!submitting.value) {
      submitReply()
    }
  }
  // Shift+Enter 时允许默认行为（换行）
}

// 复制评论内容
function handleCopyReply(reply) {
  const text = reply?.content
  if (!text) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        ElMessage.success('内容已复制')
      })
      .catch(() => {
        ElMessage.error('复制失败，请稍后重试')
      })
  } else {
    // 兼容性降级处理
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      ElMessage.success('内容已复制')
    } catch (e) {
      ElMessage.error('复制失败，请稍后重试')
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

// 撤回评论（仅允许撤回自己的评论）
async function handleWithdrawReply(reply) {
  if (!isMyReply(reply)) {
    ElMessage.warning('只能撤回自己的评论')
    return
  }

  await deleteReply(reply.id)
}

// 提交回复
async function submitReply() {
  const content = replyContent.value?.trim()
  if (!content) {
    ElMessage.warning('请输入回复内容')
    return
  }

  // 获取当前登录用户信息
  const currentUserName = userStore.userName || userStore.userInfo?.username || userStore.userInfo?.studentId || '我'
  const currentUserAvatar = userStore.userAvatar || userStore.userInfo?.avatarUrl || ''

  // 先前端乐观更新，让用户立刻看到回复
  const localReply = {
    id: Date.now(),
    authorName: currentUserName,
    avatar: currentUserAvatar,
    content,
    createdAt: '刚刚'
  }
  replies.value.push(localReply)
  // 确保 totalReplies 是数字类型，避免字符串拼接问题
  totalReplies.value = Number(totalReplies.value) + 1
  replyContent.value = ''

  // 异步调用后端接口，不打断用户体验
  submitting.value = true
  try {
    await blogApi.addComment({
      topicId: topicId.value,
      content
    })
    ElMessage.success('回复已发送')
    // 这里不立即强制刷新列表，避免用户明显感知跳动
  } catch (error) {
    console.error('提交回复失败:', error)
    ElMessage.error('回复发送失败，稍后可能不同步')
  } finally {
    submitting.value = false
  }
}

// 删除 / 撤回评论（前端乐观更新 + 异步调用后端）
async function deleteReply(commentId) {
  try {
    await ElMessageBox.confirm('确定要撤回这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 先在前端移除这条评论，立即反馈给用户
    const index = replies.value.findIndex(reply => reply.id === commentId)
    let removedReply = null
    if (index !== -1) {
      removedReply = replies.value[index]
      replies.value.splice(index, 1)
      totalReplies.value = Math.max(0, Number(totalReplies.value) - 1)
    }

    // 再异步调用后端接口，同步服务端状态
    try {
      await blogApi.deleteComment(commentId)
      ElMessage.success('撤回成功')
    } catch (error) {
      console.error('删除回复失败:', error)
      // 如果后端失败，尽量还原前端状态
      if (removedReply) {
        replies.value.splice(index, 0, removedReply)
        totalReplies.value = Number(totalReplies.value) + 1
      }
      ElMessage.error('撤回失败，请稍后重试')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除回复失败:', error)
      ElMessage.error('撤回失败，请稍后重试')
    }
  }
}

function goBack() {
  router.push('/blog')
}

onMounted(() => {
  fetchTopic()
})
</script>

<style scoped>
.topic-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 32px;
}

.loading-wrap,
.empty-wrap {
  padding: 40px 0;
  text-align: center;
  color: #909399;
}

.back-btn {
  margin-bottom: 12px;
  color: #909399;
}

.topic-header {
  margin-bottom: 24px;
}

.topic-title {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.topic-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.topic-author-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topic-author-avatar {
  flex-shrink: 0;
}

.topic-body {
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 24px;
}

.topic-content {
  font-size: 15px;
  line-height: 1.7;
  color: #303133;
  white-space: pre-wrap;
}

.replies-section {
  margin-top: 24px;
}

.replies-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.reply-list {
  list-style: none;
  margin: 0 0 24px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 12px;
}

.reply-avatar {
  flex-shrink: 0;
}

.reply-body {
  flex: 1;
  min-width: 0;
}

.reply-meta {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reply-author {
  font-weight: 500;
  color: #303133;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-actions {
  margin-left: auto;
}

.reply-actions-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  color: #c0c4cc;
  transition: background-color 0.15s ease, color 0.15s ease,
    transform 0.1s ease;
}

.reply-actions-trigger:hover {
  background-color: rgba(0, 0, 0, 0.03);
  color: #606266;
  transform: translateY(-1px);
}

.reply-content {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.replies-empty {
  padding: 24px;
  text-align: center;
  color: #909399;
  background: #fafafa;
  border-radius: 12px;
  margin-bottom: 24px;
}

.loading-replies {
  padding: 20px 0;
  margin-bottom: 24px;
}

.delete-btn {
  margin-left: auto;
  opacity: 0.7;
}

.delete-btn:hover {
  opacity: 1;
}

.reply-form-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reply-form-wrap {
  margin-top: 12px;
  padding: 12px 16px;
  background: #f5f7fa; /* 与评论区背景统一 */
  border-radius: 12px; /* 和回复卡片保持一致 */
  border: none;
  box-shadow: none;
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);
  transition: box-shadow 0.15s ease, background 0.15s ease,
    backdrop-filter 0.15s ease, -webkit-backdrop-filter 0.15s ease;
}

.reply-form-wrap.is-focused {
  background: #f0f2f5; /* 聚焦时轻微加深一点 */
}

.reply-current-avatar {
  flex-shrink: 0;
}

.reply-input-wrapper {
  position: relative;
  flex: 1;
}

.reply-input :deep(.el-input__wrapper),
.reply-input :deep(.el-textarea__inner) {
  background-color: #ffffff; /* 输入框背景更白一些 */
  box-shadow: none;
  border-color: transparent;
}

.reply-input :deep(.el-textarea__inner) {
  resize: none; /* 禁用拖拽调整大小 */
  line-height: 1.5;
  padding-right: 34px; /* 给发送图标预留空间 */
}

.send-icon {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 10;
  font-size: 18px;
  color: #409eff;
  cursor: pointer;
  transition: color 0.15s ease, transform 0.15s ease;
}

.send-icon:hover {
  color: #66b1ff;
  transform: translateY(-1px);
}

.send-icon.is-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  transform: none;
}

.more-replies-wrap {
  margin-top: 8px;
  text-align: center;
}

.more-replies-btn {
  font-size: 13px;
  color: #606266;
}

@media (max-width: 768px) {
  .topic-page {
    padding: 0 12px 24px;
  }
}
</style>
