<template>
  <div class="campusshare-renderer">
    <transition name="markdown-fade" mode="out-in">
      <article
        v-if="safeHtml"
        :key="content"
        class="markdown-body p-6 bg-white rounded-2xl shadow-sm"
        v-html="safeHtml"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const props = defineProps<{
  content: string
}>()

// 单例 markdown-it 实例，避免重复创建
const md = new MarkdownIt({
  html: false, // 禁用 HTML，第一层防线
  linkify: true,
  breaks: true,
})

// 自定义渲染规则，添加 Tailwind 类
const originalHeadingOpen =
  md.renderer.rules.heading_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  if (token.tag === 'h3') {
    token.attrJoin(
      'class',
      'text-xl font-bold text-emerald-800 my-4 flex items-center'
    )
  }
  return originalHeadingOpen(tokens, idx, options, env, self)
}

const originalStrongOpen =
  md.renderer.rules.strong_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.strong_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  token.attrJoin(
    'class',
    'text-emerald-600 bg-emerald-50 px-1 rounded'
  )
  return originalStrongOpen(tokens, idx, options, env, self)
}

// 分割线
md.renderer.rules.hr = () =>
  '<hr class="border-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-8">\n'

// 列表
const originalBulletListOpen =
  md.renderer.rules.bullet_list_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.bullet_list_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  token.attrJoin('class', 'ml-6 space-y-3 list-disc')
  return originalBulletListOpen(tokens, idx, options, env, self)
}

const originalOrderedListOpen =
  md.renderer.rules.ordered_list_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.ordered_list_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  token.attrJoin('class', 'ml-6 space-y-3 list-decimal')
  return originalOrderedListOpen(tokens, idx, options, env, self)
}

// 表格：外层 overflow-x-auto，单元格样式
md.renderer.rules.table_open = () =>
  '<div class="overflow-x-auto"><table class="min-w-full border-collapse text-sm text-left">\n'

md.renderer.rules.table_close = () => '</table></div>\n'

const originalTheadOpen =
  md.renderer.rules.thead_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.thead_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  token.attrJoin('class', 'bg-slate-50')
  return originalTheadOpen(tokens, idx, options, env, self)
}

const originalThOpen =
  md.renderer.rules.th_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.th_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  token.attrJoin('class', 'border border-slate-100 p-3 text-sm font-semibold')
  return originalThOpen(tokens, idx, options, env, self)
}

const originalTdOpen =
  md.renderer.rules.td_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.td_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  token.attrJoin('class', 'border border-slate-100 p-3 text-sm')
  return originalTdOpen(tokens, idx, options, env, self)
}

// 计算属性：安全 HTML
const safeHtml = computed(() => {
  if (!props.content) return ''
  const rendered = md.render(props.content)
  // 第二层防线：DOMPurify 过滤 XSS
  return DOMPurify.sanitize(rendered)
})
</script>

<style scoped>
.campusshare-renderer {
  @apply w-full;
}

/* 为 h3 添加伪元素锚点图标 */
.markdown-body :deep(h3)::before {
  content: '';
  display: inline-block;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 9999px;
  background: linear-gradient(to right, #10b981, #34d399);
  margin-right: 0.5rem;
}

/* 过渡动画：content 更新时淡入 */
.markdown-fade-enter-active,
.markdown-fade-leave-active {
  transition: opacity 0.25s ease;
}

.markdown-fade-enter-from,
.markdown-fade-leave-to {
  opacity: 0;
}
</style>

