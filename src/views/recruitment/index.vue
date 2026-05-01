<template>
  <div class="p-4">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon company-icon">
            <el-icon :size="32"><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totalCompanies || 0 }}</div>
            <div class="stat-label">入驻企业</div>
            <div class="stat-detail">
              <span class="pending" v-if="overview.pendingCompanies > 0">
                <el-badge :value="overview.pendingCompanies" type="warning">待审核</el-badge>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon job-icon">
            <el-icon :size="32"><Briefcase /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totalJobs || 0 }}</div>
            <div class="stat-label">在招岗位</div>
            <div class="stat-detail">
              <span class="online">{{ overview.onlineJobs || 0 }} 已上架</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon apply-icon">
            <el-icon :size="32"><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totalApplies || 0 }}</div>
            <div class="stat-label">投递总数</div>
            <div class="stat-detail">
              <span class="today">今日 +{{ overview.todayApplies || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon task-icon">
            <el-icon :size="32"><Timer /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overview.totalTasks || 0 }}</div>
            <div class="stat-label">任务总数</div>
            <div class="stat-detail">
              <span class="progress">{{ overview.inProgressTasks || 0 }} 进行中</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span>投递趋势（近7天）</span>
          </template>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>岗位类型分布</span>
          </template>
          <div ref="pieChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作入口 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>快捷管理</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="4">
              <div class="quick-entry" @click="router.push('/recruitment/company')">
                <el-icon :size="40"><OfficeBuilding /></el-icon>
                <span>企业管理</span>
                <el-badge :value="overview.pendingCompanies" type="warning" v-if="overview.pendingCompanies > 0" />
              </div>
            </el-col>
            <el-col :span="4">
              <div class="quick-entry" @click="router.push('/recruitment/job')">
                <el-icon :size="40"><Briefcase /></el-icon>
                <span>岗位管理</span>
                <el-badge :value="overview.pendingJobs" type="warning" v-if="overview.pendingJobs > 0" />
              </div>
            </el-col>
            <el-col :span="4">
              <div class="quick-entry" @click="router.push('/recruitment/apply')">
                <el-icon :size="40"><Document /></el-icon>
                <span>投递管理</span>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="quick-entry" @click="router.push('/recruitment/task')">
                <el-icon :size="40"><Timer /></el-icon>
                <span>任务管理</span>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="quick-entry" @click="router.push('/recruitment/ledger')">
                <el-icon :size="40"><Money /></el-icon>
                <span>台账管理</span>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="quick-entry" @click="router.push('/recruitment/invoice')">
                <el-icon :size="40"><Tickets /></el-icon>
                <span>发票管理</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { getOverview, getApplyTrend, getJobTypeDistribution } from '@/api/recruitment';

const router = useRouter();
const trendChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
let trendChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

interface OverviewData {
  totalCompanies?: number;
  pendingCompanies?: number;
  approvedCompanies?: number;
  totalJobs?: number;
  pendingJobs?: number;
  onlineJobs?: number;
  totalApplies?: number;
  todayApplies?: number;
  totalTasks?: number;
  inProgressTasks?: number;
}

const overview = reactive<OverviewData>({});
const trendData = ref<any[]>([]);
const pieData = ref<any[]>([]);

function initTrendChart() {
  if (!trendChartRef.value) return;
  trendChart = echarts.init(trendChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trendData.value.map((item: any) => item.date)
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '投递数',
        type: 'bar',
        data: trendData.value.map((item: any) => item.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#79bbff' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '50%'
      }
    ]
  };
  trendChart.setOption(option);
}

function initPieChart() {
  if (!pieChartRef.value) return;
  pieChart = echarts.init(pieChartRef.value);
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center'
    },
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
    series: [
      {
        name: '岗位类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: pieData.value
      }
    ]
  };
  pieChart.setOption(option);
}

async function loadData() {
  try {
    const overviewRes = await getOverview();
    Object.assign(overview, overviewRes.data || {});

    const trendRes = await getApplyTrend(7);
    trendData.value = trendRes.data || [];
    initTrendChart();

    const pieRes = await getJobTypeDistribution();
    pieData.value = (pieRes.data || []).map((item: any) => ({
      name: item.typeName,
      value: item.count
    }));
    initPieChart();
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

function handleResize() {
  trendChart?.resize();
  pieChart?.resize();
}

onMounted(() => {
  loadData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  pieChart?.dispose();
});
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  transition: all 0.3s;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}
.company-icon {
  background: linear-gradient(135deg, #409EFF 0%, #79bbff 100%);
  color: #fff;
}
.job-icon {
  background: linear-gradient(135deg, #67C23A 0%, #95d475 100%);
  color: #fff;
}
.apply-icon {
  background: linear-gradient(135deg, #E6A23C 0%, #f3d19e 100%);
  color: #fff;
}
.task-icon {
  background: linear-gradient(135deg, #F56C6C 0%, #fab6b6 100%);
  color: #fff;
}
.stat-content { flex: 1; }
.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}
.stat-detail {
  margin-top: 8px;
  font-size: 12px;
}
.stat-detail .pending { color: #E6A23C; }
.stat-detail .online { color: #67C23A; }
.stat-detail .today { color: #409EFF; }
.stat-detail .progress { color: #F56C6C; }

.quick-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  border-radius: 12px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}
.quick-entry:hover {
  background: #ecf5ff;
  transform: scale(1.05);
}
.quick-entry span {
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
}
.quick-entry :deep(.el-badge) {
  position: absolute;
  top: 8px;
  right: calc(50% - 40px);
}
.mb-4 { margin-bottom: 20px; }
</style>
