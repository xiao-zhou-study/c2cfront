<template>
  <div
    v-if="item"
    class="owner-info"
  >
    <div class="owner-card">
      <div class="owner-header">
        <div class="owner-avatar">
          <el-avatar
            :src="item.avatar"
            size="large"
          >
            {{ item.username?.charAt(0) || 'U' }}
          </el-avatar>
          <!-- 暂时隐藏认证徽章，因为后端未提供该字段 -->
        </div>
        <div class="owner-basic">
          <div class="owner-name">
            {{ item.username || '未知用户' }}
          </div>
          <div class="owner-location">
            <el-icon><Location /></el-icon>
            {{ item.address || '未知位置' }}
          </div>
        </div>

      </div>

      <!-- 统计数据暂时隐藏，因为后端未提供该字段 -->

      <!-- 个人简介暂时隐藏，因为后端未提供该字段 -->

      <!-- 荣誉徽章暂时隐藏 -->

      <div class="owner-safety">
        <div class="safety-title">
          安全信息
        </div>
        <div class="safety-items">
          <div class="safety-item">
            <el-icon class="safety-icon">
              <Check />
            </el-icon>
            <span>身份已认证</span>
          </div>
          <div class="safety-item">
            <el-icon class="safety-icon">
              <Check />
            </el-icon>
            <span>芝麻信用优秀</span>
          </div>
          <div class="safety-item">
            <el-icon class="safety-icon">
              <Check />
            </el-icon>
            <span>无不良记录</span>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { Location, Check } from '@element-plus/icons-vue'

defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.owner-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.owner-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.owner-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.owner-avatar {
  position: relative;
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  border: 2px solid white;
}

.owner-basic {
  flex: 1;
}

.owner-name {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.verified-tag {
  font-size: 12px;
  padding: 2px 6px;
}

.owner-location {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.owner-contact {
  display: flex;
  align-items: center;
}

.contact-btn {
  height: 36px;
  padding: 0 16px;
}

.owner-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.owner-bio,
.owner-badges,
.owner-safety {
  margin-bottom: 20px;
}

.bio-title,
.badges-title,
.safety-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bio-content {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.badges-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge-tag {
  font-size: 12px;
  padding: 4px 8px;
}

.safety-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.safety-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
}

.safety-icon {
  color: #10b981;
  font-size: 16px;
}

@media (max-width: 768px) {
  .owner-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .owner-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
