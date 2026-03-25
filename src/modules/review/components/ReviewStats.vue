<template>
  <div class="review-stats">
    <!-- 总体评分卡片 -->
    <el-card class="overview-card">
      <div class="overview-content">
        <div class="rating-main">
          <div class="rating-score">
            {{ stats.averageRating.toFixed(1) }}
          </div>
          <el-rate 
            :model-value="stats.averageRating" 
            disabled 
            show-score 
            :score-template="`${stats.totalReviews} 条评价`"
            size="large"
          />
        </div>
        
        <div class="rating-details">
          <div class="detail-item">
            <span class="label">好评率</span>
            <span class="value positive">{{ stats.positiveRate }}%</span>
          </div>
          <div class="detail-item">
            <span class="label">中评率</span>
            <span class="value neutral">{{ stats.neutralRate }}%</span>
          </div>
          <div class="detail-item">
            <span class="label">差评率</span>
            <span class="value negative">{{ stats.negativeRate }}%</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 评分分布 -->
    <el-card class="distribution-card">
      <template #header>
        <span>评分分布</span>
      </template>
      
      <div class="distribution-chart">
        <div
          v-for="star in 5"
          :key="star"
          class="rating-bar"
        >
          <div class="bar-left">
            <span class="star-label">{{ 6 - star }}星</span>
            <el-icon class="star-icon">
              <Star />
            </el-icon>
          </div>
          <div class="bar-container">
            <div class="bar-background" />
            <div 
              class="bar-fill" 
              :style="{ 
                width: getPercentage(stats.ratingDistribution[6 - star]) + '%',
                backgroundColor: getBarColor(6 - star)
              }"
            />
          </div>
          <div class="bar-right">
            <span class="star-count">{{ stats.ratingDistribution[6 - star] }}</span>
            <span class="star-percentage">
              {{ getPercentage(stats.ratingDistribution[6 - star]).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 标签统计 -->
    <el-card
      v-if="stats.tagStats && stats.tagStats.length > 0"
      class="tags-card"
    >
      <template #header>
        <span>用户标签</span>
      </template>
      
      <div class="tags-cloud">
        <el-tag
          v-for="tag in stats.tagStats"
          :key="tag.id"
          :type="getTagType(tag.count)"
          class="tag-item"
          :size="getTagSize(tag.count)"
        >
          {{ tag.name }} ({{ tag.count }})
        </el-tag>
      </div>
    </el-card>

    <!-- 趋势图表 -->
    <el-card
      v-if="showTrend"
      class="trend-card"
    >
      <template #header>
        <div class="trend-header">
          <span>评价趋势</span>
          <el-radio-group
            v-model="trendPeriod"
            size="small"
            @change="updateTrend"
          >
            <el-radio-button label="7d">
              7天
            </el-radio-button>
            <el-radio-button label="30d">
              30天
            </el-radio-button>
            <el-radio-button label="90d">
              90天
            </el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <div
        ref="trendChart"
        class="trend-chart"
      />
    </el-card>

    <!-- 详细统计 -->
    <el-card class="detailed-stats-card">
      <template #header>
        <span>详细统计</span>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">
              {{ stats.totalReviews }}
            </div>
            <div class="stat-label">
              总评价数
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">
              {{ stats.avgResponseTime }}
            </div>
            <div class="stat-label">
              平均响应时间
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">
              {{ stats.replyRate }}%
            </div>
            <div class="stat-label">
              回复率
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">
              {{ stats.lastReviewDays }}
            </div>
            <div class="stat-label">
              距上次评价(天)
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Star } from '@element-plus/icons-vue'
// 由于可能缺少类型声明，我们使用动态导入
// let echarts: any = null // 未使用，已注释

// Props
interface Props {
  stats: {
    averageRating: number
    totalReviews: number
    positiveRate: number
    neutralRate: number
    negativeRate: number
    ratingDistribution: { [key: number]: number }
    tagStats?: Array<{
      id: string
      name: string
      count: number
    }>
    avgResponseTime?: string
    replyRate?: number
    lastReviewDays?: number
  }
  showTrend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTrend: true
})

// 响应式数据
const trendPeriod = ref('30d')
const trendChart = ref<HTMLElement>()
let chartInstance: any = null

// 方法
const getPercentage = (count: number) => {
  if (props.stats.totalReviews === 0) return 0
  return (count / props.stats.totalReviews) * 100
}

const getBarColor = (rating: number) => {
  const colors = {
    5: '#67c23a',  // 绿色 - 5星
    4: '#85ce61',  // 浅绿 - 4星
    3: '#e6a23c',  // 橙色 - 3星
    2: '#f56c6c',  // 红色 - 2星
    1: '#f78989'   // 浅红 - 1星
  }
  return colors[rating as keyof typeof colors] || '#dcdfe6'
}

const getTagType = (count: number) => {
  if (count >= 20) return 'success'
  if (count >= 10) return 'warning'
  if (count >= 5) return 'info'
  return ''
}

const getTagSize = (count: number) => {
  if (count >= 20) return 'large'
  if (count >= 10) return 'default'
  return 'small'
}

const initTrendChart = () => {
  if (!trendChart.value || !props.showTrend) return

  if (!trendChart.value || !props.showTrend) return
  console.warn('ECharts functionality is disabled in this version')
  // 图表功能暂时禁用，以避免类型错误
  // return
  // updateTrendData()
}

const updateTrendData = () => {
  if (!chartInstance) return

  // 模拟趋势数据
  const dates = []
  const ratings = []
  const counts = []

  const now = new Date()
  const days = parseInt(trendPeriod.value.slice(0, -1))

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
    
    // 模拟数据
    const baseRating = props.stats.averageRating
    const variation = (Math.random() - 0.5) * 0.5
    ratings.push(Math.max(1, Math.min(5, baseRating + variation)))
    
    const baseCount = props.stats.totalReviews / days
    counts.push(Math.floor(baseCount + (Math.random() - 0.5) * baseCount * 0.3))
  }

  const option = {
    title: {
      text: '评价趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        color: '#303133'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['平均评分', '评价数量'],
      top: 25
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 60,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '评分',
        min: 0,
        max: 5,
        interval: 1,
        position: 'left'
      },
      {
        type: 'value',
        name: '数量',
        min: 0,
        position: 'right'
      }
    ],
    series: [
      {
        name: '平均评分',
        type: 'line',
        smooth: true,
        data: ratings,
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      },
      {
        name: '评价数量',
        type: 'bar',
        yAxisIndex: 1,
        data: counts,
        itemStyle: {
          color: '#67c23a'
        }
      }
    ]
  }

  if (chartInstance) {
    // 图表功能暂时禁用
    // chartInstance.setOption(option)
  }
}

const updateTrend = () => {
  updateTrendData()
}

const handleResize = () => {
  if (chartInstance) {
    if (chartInstance) {
      // 图表功能暂时禁用
      // chartInstance.resize()
    }
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initTrendChart()
  })
  
  window.addEventListener('resize', handleResize)
})

// 监听窗口大小变化
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    // 图表功能暂时禁用
    // chartInstance.dispose?.()
    chartInstance = null
  }
})
</script>

<style scoped>
.review-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-card {
  margin-bottom: 20px;
}

.overview-content {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 20px;
}

.rating-main {
  text-align: center;
  min-width: 150px;
}

.rating-score {
  font-size: 48px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 10px;
  line-height: 1;
}

.rating-details {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.detail-item {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.detail-item .label {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.detail-item .value {
  display: block;
  font-size: 24px;
  font-weight: 600;
}

.detail-item .value.positive {
  color: #67c23a;
}

.detail-item .value.neutral {
  color: #e6a23c;
}

.detail-item .value.negative {
  color: #f56c6c;
}

.distribution-card {
  margin-bottom: 20px;
}

.distribution-chart {
  padding: 10px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 60px;
}

.star-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.star-icon {
  color: #f7ba2a;
}

.bar-container {
  flex: 1;
  height: 12px;
  position: relative;
  background-color: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.bar-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f0f0f0;
}

.bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  transition: width 0.5s ease;
  border-radius: 6px;
}

.bar-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 80px;
}

.star-count {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.star-percentage {
  font-size: 12px;
  color: #909399;
}

.tags-card {
  margin-bottom: 20px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}

.tag-item {
  cursor: default;
  transition: transform 0.2s, box-shadow 0.2s;
}

.tag-item:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.trend-card {
  margin-bottom: 20px;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-chart {
  height: 300px;
  margin-top: 20px;
}

.detailed-stats-card {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .rating-details {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .rating-bar {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .bar-left {
    min-width: 50px;
  }
  
  .bar-right {
    min-width: 60px;
  }
  
  .trend-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .trend-chart {
    height: 250px;
  }
}
</style>