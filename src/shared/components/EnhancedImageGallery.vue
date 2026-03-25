<template>
  <div class="enhanced-image-gallery">
    <!-- 主图展示区 -->
    <div class="main-image-wrapper">
      <img 
        :src="currentImage" 
        :alt="altText"
        class="main-image"
        @click="handleImageClick"
      >
      
      <!-- 图片标签 -->
      <div
        v-if="showBadges"
        class="image-badges"
      >
        <el-tag
          v-if="isNew"
          type="danger"
          effect="dark"
        >
          最新
        </el-tag>
        <el-tag
          v-if="imageCount > 1"
          type="info"
        >
          {{ currentIndex + 1 }}/{{ imageCount }}
        </el-tag>
      </div>

      <!-- 放大按钮 -->
      <div
        class="zoom-button"
        @click="handleImageClick"
      >
        <el-icon><ZoomIn /></el-icon>
      </div>

      <!-- 左右切换按钮 -->
      <div
        v-if="imageCount > 1"
        class="nav-buttons"
      >
        <el-button 
          circle 
          class="nav-btn prev-btn"
          @click="handlePrev"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-button 
          circle 
          class="nav-btn next-btn"
          @click="handleNext"
        >
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 缩略图列表 -->
    <div
      v-if="imageCount > 1"
      class="thumbnail-list"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="thumbnail-item"
        :class="{ active: index === currentIndex }"
        @click="selectImage(index)"
      >
        <img
          :src="image"
          :alt="`${altText} ${index + 1}`"
        >
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      width="90%"
      :show-close="true"
      class="image-preview-dialog"
      append-to-body
    >
      <div class="preview-container">
        <img 
          :src="currentImage" 
          :alt="altText"
          class="preview-image"
        >
        
        <!-- 预览导航 -->
        <div
          v-if="imageCount > 1"
          class="preview-nav"
        >
          <el-button 
            circle 
            size="large"
            @click="handlePrev"
          >
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          
          <span class="preview-counter">{{ currentIndex + 1 }} / {{ imageCount }}</span>
          
          <el-button 
            circle 
            size="large"
            @click="handleNext"
          >
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        
        <!-- 缩略图导航 -->
        <div
          v-if="imageCount > 1"
          class="preview-thumbnails"
        >
          <div
            v-for="(image, index) in images"
            :key="index"
            class="preview-thumb-item"
            :class="{ active: index === currentIndex }"
            @click="selectImage(index)"
          >
            <img
              :src="image"
              :alt="`${altText} ${index + 1}`"
            >
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ZoomIn, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// Props
interface Props {
  images: string[]
  altText?: string
  showBadges?: boolean
  isNew?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  altText: '物品图片',
  showBadges: true,
  isNew: false
})

// 响应式数据
const currentIndex = ref(0)
const previewVisible = ref(false)

// 计算属性
const imageCount = computed(() => props.images.length)
const currentImage = computed(() => props.images[currentIndex.value] || 'https://via.placeholder.com/800x600')

// 方法
const selectImage = (index: number) => {
  currentIndex.value = index
}

const handlePrev = () => {
  currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : imageCount.value - 1
}

const handleNext = () => {
  currentIndex.value = currentIndex.value < imageCount.value - 1 ? currentIndex.value + 1 : 0
}

const handleImageClick = () => {
  previewVisible.value = true
}
</script>

<style scoped>
.enhanced-image-gallery {
  width: 100%;
}

/* 主图展示区 */
.main-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--bg-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: zoom-in;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-image-wrapper:hover .main-image {
  transform: scale(1.05);
}

/* 图片标签 */
.image-badges {
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
  display: flex;
  gap: var(--spacing-xs);
  z-index: 2;
}

/* 放大按钮 */
.zoom-button {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--radius-full);
  color: #fff;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  cursor: pointer;
}

.main-image-wrapper:hover .zoom-button {
  opacity: 1;
}

.zoom-button:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

/* 左右切换按钮 */
.nav-buttons {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
  pointer-events: none;
  z-index: 2;
}

.nav-btn {
  pointer-events: all;
  background: rgba(255, 255, 255, 0.9);
  opacity: 0;
  transition: all 0.3s ease;
}

.main-image-wrapper:hover .nav-btn {
  opacity: 1;
}

.nav-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

/* 缩略图列表 */
.thumbnail-list {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  overflow-x: auto;
  padding: var(--spacing-xs) 0;
}

.thumbnail-list::-webkit-scrollbar {
  height: 4px;
}

.thumbnail-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.thumbnail-item {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail-item:hover {
  border-color: var(--brand-primary);
  transform: translateY(-2px);
}

.thumbnail-item.active {
  border-color: var(--brand-primary);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 预览弹窗 */
:deep(.image-preview-dialog) {
  margin: 0 !important;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.image-preview-dialog .el-dialog__header) {
  display: none;
}

:deep(.image-preview-dialog .el-dialog__body) {
  padding: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
}

.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: calc(100vh - 200px);
  object-fit: contain;
  border-radius: var(--radius-lg);
}

/* 预览导航 */
.preview-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-2xl);
  pointer-events: none;
}

.preview-nav .el-button {
  pointer-events: all;
  background: rgba(255, 255, 255, 0.9);
}

.preview-counter {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.5);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
}

/* 预览缩略图 */
.preview-thumbnails {
  position: absolute;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--radius-lg);
  max-width: 80%;
  overflow-x: auto;
}

.preview-thumb-item {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.preview-thumb-item:hover {
  border-color: #fff;
}

.preview-thumb-item.active {
  border-color: var(--brand-primary);
}

.preview-thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式 */
@media (max-width: 768px) {
  .thumbnail-item {
    width: 60px;
    height: 60px;
  }

  .preview-container {
    padding: var(--spacing-md);
  }

  .preview-image {
    max-height: calc(100vh - 150px);
  }

  .preview-thumbnails {
    max-width: 90%;
  }

  .preview-thumb-item {
    width: 50px;
    height: 50px;
  }
}
</style>
