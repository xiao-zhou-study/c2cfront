<template>
  <div
    v-if="images && images.length > 0"
    class="item-images-section"
  >
    <el-carousel
      :interval="5000"
      type="card"
      height="400px"
      class="image-carousel"
    >
      <el-carousel-item
        v-for="(image, index) in images"
        :key="index"
      >
        <img
          :src="image"
          :alt="title || '物品图片'"
          class="carousel-image"
        >
      </el-carousel-item>
    </el-carousel>
  </div>
  <div
    v-else
    class="no-images"
  >
    <el-empty description="暂无图片" />
  </div>
</template>

<script setup>
defineProps({
  images: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.item-images-section {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.image-carousel {
  border-radius: 16px;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>