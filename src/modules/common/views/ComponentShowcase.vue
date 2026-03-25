<template>
  <div class="component-showcase">
    <div class="showcase-header">
      <h1>UI组件展示</h1>
      <p>新设计系统组件预览</p>
    </div>

    <!-- 信用徽章展示 -->
    <section class="showcase-section">
      <h2>信用体系徽章</h2>
      <div class="badge-grid">
        <div class="badge-item">
          <CreditBadge :score="95" />
          <span class="badge-desc">钻石用户 (95分)</span>
        </div>
        <div class="badge-item">
          <CreditBadge :score="85" />
          <span class="badge-desc">金牌用户 (85分)</span>
        </div>
        <div class="badge-item">
          <CreditBadge :score="75" />
          <span class="badge-desc">银牌用户 (75分)</span>
        </div>
        <div class="badge-item">
          <CreditBadge :score="65" />
          <span class="badge-desc">铜牌用户 (65分)</span>
        </div>
        <div class="badge-item">
          <CreditBadge :score="55" />
          <span class="badge-desc">新手用户 (55分)</span>
        </div>
        <div class="badge-item">
          <CreditBadge :score="45" />
          <span class="badge-desc">信用不佳 (45分)</span>
        </div>
      </div>
    </section>

    <!-- 认证徽章展示 -->
    <section class="showcase-section">
      <h2>实名认证徽章</h2>
      <div class="badge-grid">
        <div class="badge-item">
          <VerifiedBadge :is-verified="true" />
          <span class="badge-desc">已认证</span>
        </div>
        <div class="badge-item">
          <VerifiedBadge :is-verified="false" />
          <span class="badge-desc">未认证</span>
        </div>
        <div class="badge-item">
          <VerifiedBadge
            :is-verified="true"
            :show-text="false"
          />
          <span class="badge-desc">仅图标</span>
        </div>
      </div>
    </section>

    <!-- 物品卡片展示 - 网格视图 -->
    <section class="showcase-section">
      <h2>物品卡片 - 网格视图</h2>
      <div class="cards-grid">
        <UnifiedItemCard
          v-for="item in mockItems"
          :key="item.id"
          :item="item"
          view-mode="grid"
          @click="handleItemClick"
        />
      </div>
    </section>

    <!-- 物品卡片展示 - 列表视图 -->
    <section class="showcase-section">
      <h2>物品卡片 - 列表视图</h2>
      <div class="cards-list">
        <UnifiedItemCard
          v-for="item in mockItems.slice(0, 2)"
          :key="item.id"
          :item="item"
          view-mode="list"
          @click="handleItemClick"
        />
      </div>
    </section>

    <!-- 设计令牌展示 -->
    <section class="showcase-section">
      <h2>设计令牌示例</h2>
      
      <h3>色彩</h3>
      <div class="color-grid">
        <div class="color-item">
          <div
            class="color-box"
            style="background: var(--brand-primary)"
          />
          <span>品牌主色</span>
        </div>
        <div class="color-item">
          <div
            class="color-box"
            style="background: var(--brand-secondary)"
          />
          <span>品牌辅色</span>
        </div>
        <div class="color-item">
          <div
            class="color-box"
            style="background: var(--color-success)"
          />
          <span>成功色</span>
        </div>
        <div class="color-item">
          <div
            class="color-box"
            style="background: var(--color-warning)"
          />
          <span>警告色</span>
        </div>
        <div class="color-item">
          <div
            class="color-box"
            style="background: var(--color-danger)"
          />
          <span>危险色</span>
        </div>
      </div>

      <h3>间距</h3>
      <div class="spacing-demo">
        <div
          class="spacing-box"
          style="width: var(--spacing-xs)"
        >
          xs
        </div>
        <div
          class="spacing-box"
          style="width: var(--spacing-sm)"
        >
          sm
        </div>
        <div
          class="spacing-box"
          style="width: var(--spacing-md)"
        >
          md
        </div>
        <div
          class="spacing-box"
          style="width: var(--spacing-lg)"
        >
          lg
        </div>
        <div
          class="spacing-box"
          style="width: var(--spacing-xl)"
        >
          xl
        </div>
        <div
          class="spacing-box"
          style="width: var(--spacing-2xl)"
        >
          2xl
        </div>
      </div>

      <h3>圆角</h3>
      <div class="radius-demo">
        <div class="radius-box rounded-sm">
          sm
        </div>
        <div class="radius-box rounded-md">
          md
        </div>
        <div class="radius-box rounded-lg">
          lg
        </div>
        <div class="radius-box rounded-full">
          full
        </div>
      </div>

      <h3>阴影</h3>
      <div class="shadow-demo">
        <div class="shadow-box shadow-base">
          base
        </div>
        <div class="shadow-box shadow-hover">
          hover
        </div>
        <div class="shadow-box shadow-deep">
          deep
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CreditBadge from '@/shared/components/CreditBadge.vue'
import VerifiedBadge from '@/shared/components/VerifiedBadge.vue'
import UnifiedItemCard from '@/shared/components/UnifiedItemCard.vue'
import { ElMessage } from 'element-plus'

// Mock物品数据
const mockItems = ref([
  {
    id: 1,
    title: 'iPad Pro 2022款 11英寸 256GB',
    images: ['https://via.placeholder.com/300x300?text=iPad+Pro'],
    price: 50,
    billingType: 'per_day',
    deposit: 1000,
    isNegotiable: true,
    conditionLevel: '95%',
    location: '东校区图书馆',
    status: 1,
    viewCount: 1234,
    favoriteCount: 89,
    owner: {
      id: 1,
      nickname: '张三',
      avatarUrl: '',
      creditScore: 95
    },
    stats: {
      viewCount: 1234,
      favoriteCount: 89,
      averageRating: 4.8
    }
  },
  {
    id: 2,
    title: '蓝牙音箱 JBL Flip 5 便携式户外音响',
    images: ['https://via.placeholder.com/300x300?text=JBL+Speaker'],
    price: 15,
    billingType: 'per_day',
    deposit: 200,
    isNegotiable: false,
    conditionLevel: '90%',
    location: '西校区宿舍',
    status: 2,
    viewCount: 567,
    favoriteCount: 23,
    owner: {
      id: 2,
      nickname: '李四',
      avatarUrl: '',
      creditScore: 85
    },
    stats: {
      viewCount: 567,
      favoriteCount: 23,
      averageRating: 4.5
    }
  },
  {
    id: 3,
    title: '单反相机 Canon EOS 90D 含18-135镜头',
    images: ['https://via.placeholder.com/300x300?text=Canon+Camera'],
    price: 80,
    billingType: 'per_day',
    deposit: 3000,
    isNegotiable: true,
    conditionLevel: 'new',
    location: '南校区摄影社',
    status: 1,
    viewCount: 2345,
    favoriteCount: 156,
    owner: {
      id: 3,
      nickname: '王五',
      avatarUrl: '',
      creditScore: 92
    },
    stats: {
      viewCount: 2345,
      favoriteCount: 156,
      averageRating: 5.0
    }
  },
  {
    id: 4,
    title: '电动滑板车 小米米家电动滑板车Pro2',
    images: ['https://via.placeholder.com/300x300?text=Scooter'],
    price: 30,
    billingType: 'per_day',
    deposit: 800,
    isNegotiable: false,
    conditionLevel: '80%',
    location: '北校区体育馆',
    status: 1,
    viewCount: 890,
    favoriteCount: 45,
    owner: {
      id: 4,
      nickname: '赵六',
      avatarUrl: '',
      creditScore: 78
    },
    stats: {
      viewCount: 890,
      favoriteCount: 45,
      averageRating: 4.2
    }
  }
])

const handleItemClick = (item) => {
  ElMessage.info(`点击了物品: ${item.title}`)
}
</script>

<template>
  <div class="component-showcase">
    <div class="showcase-header">
      <h1>UI组件展示</h1>
      <p>新设计系统组件预览</p>
    </div>

    <!-- 信用徽章展示 -->
    <section class="showcase-section">
      <h2>信用体系徽章</h2>
      <div class="badge-grid">
        <div class="badge-item">
          <CreditBadge :score="95" />
          <span class="badge-desc">钻石用户 (95分)</span>
        </div>
        <div class="badge-item">
          <CreditBadge :score="85" />
          <span class="badge-desc">金牌用户 (85分)</span>
        </div>
        <div class="badge-item">
          <CreditBadge :score="75" />
          <span class="badge-desc">银牌用户 (75分)</span>
        </div>
        <div class="badge-item">
          <CreditBadge :score="65" />
          <span class="badge-desc">铜牌用户 (65分)</span>
        </div>
        <div class="badge-item">
          <CreditBadge :score="55" />
          <span class="badge-desc">新手用户 (55分)</span>
        </div>
        <div class="badge-item">
          <CreditBadge :score="45" />
          <span class="badge-desc">信用不佳 (45分)</span>
        </div>
      </div>
    </section>

    <!-- 认证徽章展示 -->
    <section class="showcase-section">
      <h2>实名认证徽章</h2>
      <div class="badge-grid">
        <div class="badge-item">
          <VerifiedBadge :is-verified="true" />
          <span class="badge-desc">已认证</span>
        </div>
        <div class="badge-item">
          <VerifiedBadge :is-verified="false" />
          <span class="badge-desc">未认证</span>
        </div>
        <div class="badge-item">
          <VerifiedBadge :is-verified="true" :show-text="false" />
          <span class="badge-desc">仅图标</span>
        </div>
      </div>
    </section>

    <!-- 物品卡片展示 - 网格视图 -->
    <section class="showcase-section">
      <h2>物品卡片 - 网格视图</h2>
      <div class="cards-grid">
        <UnifiedItemCard
          v-for="item in mockItems"
          :key="item.id"
          :item="item"
          view-mode="grid"
          @click="handleItemClick"
        />
      </div>
    </section>

    <!-- 物品卡片展示 - 列表视图 -->
    <section class="showcase-section">
      <h2>物品卡片 - 列表视图</h2>
      <div class="cards-list">
        <UnifiedItemCard
          v-for="item in mockItems.slice(0, 2)"
          :key="item.id"
          :item="item"
          view-mode="list"
          @click="handleItemClick"
        />
      </div>
    </section>

    <!-- 设计令牌展示 -->
    <section class="showcase-section">
      <h2>设计令牌示例</h2>
      
      <h3>色彩</h3>
      <div class="color-grid">
        <div class="color-item">
          <div class="color-box" style="background: var(--brand-primary)"></div>
          <span>品牌主色</span>
        </div>
        <div class="color-item">
          <div class="color-box" style="background: var(--brand-secondary)"></div>
          <span>品牌辅色</span>
        </div>
        <div class="color-item">
          <div class="color-box" style="background: var(--color-success)"></div>
          <span>成功色</span>
        </div>
        <div class="color-item">
          <div class="color-box" style="background: var(--color-warning)"></div>
          <span>警告色</span>
        </div>
        <div class="color-item">
          <div class="color-box" style="background: var(--color-danger)"></div>
          <span>危险色</span>
        </div>
      </div>

      <h3>间距</h3>
      <div class="spacing-demo">
        <div class="spacing-box" style="width: var(--spacing-xs)">xs</div>
        <div class="spacing-box" style="width: var(--spacing-sm)">sm</div>
        <div class="spacing-box" style="width: var(--spacing-md)">md</div>
        <div class="spacing-box" style="width: var(--spacing-lg)">lg</div>
        <div class="spacing-box" style="width: var(--spacing-xl)">xl</div>
        <div class="spacing-box" style="width: var(--spacing-2xl)">2xl</div>
      </div>

      <h3>圆角</h3>
      <div class="radius-demo">
        <div class="radius-box rounded-sm">sm</div>
        <div class="radius-box rounded-md">md</div>
        <div class="radius-box rounded-lg">lg</div>
        <div class="radius-box rounded-full">full</div>
      </div>

      <h3>阴影</h3>
      <div class="shadow-demo">
        <div class="shadow-box shadow-base">base</div>
        <div class="shadow-box shadow-hover">hover</div>
        <div class="shadow-box shadow-deep">deep</div>
      </div>
    </section>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import CreditBadge from '@/shared/components/CreditBadge.vue'
import VerifiedBadge from '@/shared/components/VerifiedBadge.vue'
import UnifiedItemCard from '@/shared/components/UnifiedItemCard.vue'
import { ElMessage } from 'element-plus'

// Mock物品数据
const mockItems = ref([
  {
    id: 1,
    title: 'iPad Pro 2022款 11英寸 256GB',
    images: ['https://via.placeholder.com/300x300?text=iPad+Pro'],
    price: 50,
    billingType: 'per_day',
    deposit: 1000,
    isNegotiable: true,
    conditionLevel: '95%',
    location: '东校区图书馆',
    status: 1,
    viewCount: 1234,
    favoriteCount: 89,
    owner: {
      id: 1,
      nickname: '张三',
      avatarUrl: '',
      creditScore: 95
    },
    stats: {
      viewCount: 1234,
      favoriteCount: 89,
      averageRating: 4.8
    }
  },
  {
    id: 2,
    title: '蓝牙音箱 JBL Flip 5 便携式户外音响',
    images: ['https://via.placeholder.com/300x300?text=JBL+Speaker'],
    price: 15,
    billingType: 'per_day',
    deposit: 200,
    isNegotiable: false,
    conditionLevel: '90%',
    location: '西校区宿舍',
    status: 2,
    viewCount: 567,
    favoriteCount: 23,
    owner: {
      id: 2,
      nickname: '李四',
      avatarUrl: '',
      creditScore: 85
    },
    stats: {
      viewCount: 567,
      favoriteCount: 23,
      averageRating: 4.5
    }
  },
  {
    id: 3,
    title: '单反相机 Canon EOS 90D 含18-135镜头',
    images: ['https://via.placeholder.com/300x300?text=Canon+Camera'],
    price: 80,
    billingType: 'per_day',
    deposit: 3000,
    isNegotiable: true,
    conditionLevel: 'new',
    location: '南校区摄影社',
    status: 1,
    viewCount: 2345,
    favoriteCount: 156,
    owner: {
      id: 3,
      nickname: '王五',
      avatarUrl: '',
      creditScore: 92
    },
    stats: {
      viewCount: 2345,
      favoriteCount: 156,
      averageRating: 5.0
    }
  },
  {
    id: 4,
    title: '电动滑板车 小米米家电动滑板车Pro2',
    images: ['https://via.placeholder.com/300x300?text=Scooter'],
    price: 30,
    billingType: 'per_day',
    deposit: 800,
    isNegotiable: false,
    conditionLevel: '80%',
    location: '北校区体育馆',
    status: 1,
    viewCount: 890,
    favoriteCount: 45,
    owner: {
      id: 4,
      nickname: '赵六',
      avatarUrl: '',
      creditScore: 78
    },
    stats: {
      viewCount: 890,
      favoriteCount: 45,
      averageRating: 4.2
    }
  }
])

const handleItemClick = (item) => {
  ElMessage.info(`点击了物品: ${item.title}`)
}
</script>

<style scoped>
.component-showcase {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.showcase-header {
  margin-bottom: var(--spacing-2xl);
  text-align: center;
}

.showcase-header h1 {
  font-size: var(--font-size-extra-large);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.showcase-header p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.showcase-section {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
}

.showcase-section h2 {
  font-size: var(--font-size-large);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--brand-primary);
}

.showcase-section h3 {
  font-size: var(--font-size-medium);
  color: var(--text-regular);
  margin: var(--spacing-lg) 0 var(--spacing-md);
}

/* 徽章网格 */
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
}

.badge-desc {
  font-size: var(--font-size-extra-small);
  color: var(--text-secondary);
}

/* 卡片网格 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 色彩网格 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.color-box {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
}

.color-item span {
  font-size: var(--font-size-extra-small);
  color: var(--text-regular);
}

/* 间距演示 */
.spacing-demo {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.spacing-box {
  height: 60px;
  background: var(--brand-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-extra-small);
  border-radius: var(--radius-sm);
}

/* 圆角演示 */
.radius-demo {
  display: flex;
  gap: var(--spacing-md);
}

.radius-box {
  width: 100px;
  height: 100px;
  background: var(--brand-secondary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-extra-small);
}

/* 阴影演示 */
.shadow-demo {
  display: flex;
  gap: var(--spacing-xl);
}

.shadow-box {
  width: 120px;
  height: 120px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-extra-small);
  color: var(--text-regular);
  border-radius: var(--radius-md);
}

/* 响应式 */
@media (max-width: 768px) {
  .component-showcase {
    padding: var(--spacing-md);
  }

  .showcase-section {
    padding: var(--spacing-md);
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>

<style scoped>
.component-showcase {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.showcase-header {
  margin-bottom: var(--spacing-2xl);
  text-align: center;
}

.showcase-header h1 {
  font-size: var(--font-size-extra-large);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.showcase-header p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.showcase-section {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
}

.showcase-section h2 {
  font-size: var(--font-size-large);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--brand-primary);
}

.showcase-section h3 {
  font-size: var(--font-size-medium);
  color: var(--text-regular);
  margin: var(--spacing-lg) 0 var(--spacing-md);
}

/* 徽章网格 */
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
}

.badge-desc {
  font-size: var(--font-size-extra-small);
  color: var(--text-secondary);
}

/* 卡片网格 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 色彩网格 */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.color-box {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
}

.color-item span {
  font-size: var(--font-size-extra-small);
  color: var(--text-regular);
}

/* 间距演示 */
.spacing-demo {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.spacing-box {
  height: 60px;
  background: var(--brand-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-extra-small);
  border-radius: var(--radius-sm);
}

/* 圆角演示 */
.radius-demo {
  display: flex;
  gap: var(--spacing-md);
}

.radius-box {
  width: 100px;
  height: 100px;
  background: var(--brand-secondary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-extra-small);
}

/* 阴影演示 */
.shadow-demo {
  display: flex;
  gap: var(--spacing-xl);
}

.shadow-box {
  width: 120px;
  height: 120px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-extra-small);
  color: var(--text-regular);
  border-radius: var(--radius-md);
}

/* 响应式 */
@media (max-width: 768px) {
  .component-showcase {
    padding: var(--spacing-md);
  }

  .showcase-section {
    padding: var(--spacing-md);
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
