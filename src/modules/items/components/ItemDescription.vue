<template>
  <div class="item-description">
    <div class="description-section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><Document /></el-icon>
          物品描述
        </h3>
      </div>
      <div class="description-content">
        <p class="description-text">
          {{ item.description || '暂无详细描述' }}
        </p>
        
        <div
          v-if="item.features && item.features.length > 0"
          class="description-tags"
        >
          <span class="tag-label">特色标签：</span>
          <el-tag 
            v-for="feature in item.features" 
            :key="feature"
            type="success"
            effect="plain"
            class="feature-tag"
          >
            {{ feature }}
          </el-tag>
        </div>
      </div>
    </div>

    <div
      v-if="item.specifications"
      class="specs-section"
    >
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><Setting /></el-icon>
          规格参数
        </h3>
      </div>
      <div class="specs-content">
        <div class="specs-grid">
          <div 
            v-for="(value, key) in item.specifications" 
            :key="key"
            class="spec-item"
          >
            <span class="spec-label">{{ key }}：</span>
            <span class="spec-value">{{ value }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="item.usageInstructions"
      class="usage-section"
    >
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><InfoFilled /></el-icon>
          使用说明
        </h3>
      </div>
      <div class="usage-content">
        <div class="usage-steps">
          <div 
            v-for="(step, index) in item.usageInstructions" 
            :key="index"
            class="usage-step"
          >
            <div class="step-number">
              {{ index + 1 }}
            </div>
            <div class="step-content">
              {{ step }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="item.rules && item.rules.length > 0"
      class="rules-section"
    >
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><Warning /></el-icon>
          租借规则
        </h3>
      </div>
      <div class="rules-content">
        <div class="rules-list">
          <div 
            v-for="(rule, index) in item.rules" 
            :key="index"
            class="rule-item"
          >
            <el-icon class="rule-icon">
              <Check />
            </el-icon>
            <span class="rule-text">{{ rule }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="item.notes"
      class="notes-section"
    >
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><Memo /></el-icon>
          注意事项
        </h3>
      </div>
      <div class="notes-content">
        <el-alert
          :title="item.notes"
          type="info"
          :closable="false"
          show-icon
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  Document, 
  Setting, 
  InfoFilled, 
  Warning, 
  Check,
  Memo 
} from '@element-plus/icons-vue'

defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.item-description {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 24px;
}

.description-section,
.specs-section,
.usage-section,
.rules-section,
.notes-section {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.notes-section {
  border-bottom: none;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.description-content {
  color: #4b5563;
  line-height: 1.6;
}

.description-text {
  margin: 0 0 16px 0;
  font-size: 15px;
}

.description-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.feature-tag {
  font-size: 13px;
  padding: 4px 8px;
}

.specs-content {
  margin-top: 8px;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.spec-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.spec-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

.usage-content {
  margin-top: 8px;
}

.usage-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.usage-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step-number {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.step-content {
  flex: 1;
  padding-top: 4px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.rules-content {
  margin-top: 8px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rule-icon {
  color: #10b981;
  font-size: 16px;
}

.rule-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.notes-content {
  margin-top: 8px;
}

@media (max-width: 768px) {
  .specs-grid {
    grid-template-columns: 1fr;
  }
  
  .spec-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>