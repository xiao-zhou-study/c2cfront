<script setup>
import { RouterView } from 'vue-router'
import ChatFloatingButton from './shared/components/ChatFloatingButton.vue'
</script>

<template>
  <RouterView />
  <ChatFloatingButton />
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>