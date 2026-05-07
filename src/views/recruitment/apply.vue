<template>
  <div class="apply-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-radio-group v-model="timeRange" size="default" @change="handleTimeRangeChange">
          <el-radio-button value="7">近7天</el-radio-button>
          <el-radio-button value="14">近14天</el-radio-button>
          <el-radio-button value="30">近30天</el-radio-button>
        </el-radio-group>
      </div>
      <div class="toolbar-right">
        <el-button :icon="Refresh" circle @click="loadData" :loading="loading" />
      </div>
    </div>

    <!-- ========== 统计卡片 ========== -->
    <el-row :gutter="12" class="mb-4">
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ statistics.totalCount || 0 }}</div>
          <div class="stat-label">投递总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card primary">
          <div class="stat-value primary">{{ statistics.appliedCount || 0 }}</div>
          <div class="stat-label">已投递</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card warning">
          <div class="stat-value warning">{{ statistics.interviewCount || 0 }}</div>
          <div class="stat-label">面试邀请</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card success">
          <div class="stat-value success">{{ statistics.hiredCount || 0 }}</div>
          <div class="stat-label">已录用</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card danger">
          <div class="stat-value danger">{{ statistics.rejectedCount || 0 }}</div>
          <div class="stat-label">已拒绝</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card info">
          <div class="stat-value info">{{ statistics.unreadCount || 0 }}</div>
          <div class="stat-label">未读</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 搜索栏 ========== -->
    <el-card shadow="hover" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="岗位名称" prop="jobName">
          <el-input v-model="queryParams.jobName" placeholder="请输入岗位名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="求职者" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入求职者" clearable style="width: 140px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="企业" prop="companyName">
          <el-input v-model="queryParams.companyName" placeholder="请输入企业" clearable style="width: 140px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="已投递" value="0" />
            <el-option label="面试邀请" value="1" />
            <el-option label="已录用" value="2" />
            <el-option label="已拒绝" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="已读状态" prop="isRead">
          <el-select v-model="queryParams.isRead" placeholder="全部" clearable style="width: 100px">
            <el-option label="未读" value="0" />
            <el-option label="已读" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ========== 数据表格 ========== -->
    <el-card shadow="hover">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column label="投递ID" prop="applyId" width="200" align="center" />
        <el-table-column label="求职者信息" min-width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="34" :src="row.avatar" style="background: #409EFF; flex-shrink: 0">
                {{ (row.userName || 'U').charAt(0) }}
              </el-avatar>
              <div class="user-detail">
                <div class="name">{{ row.userName || '未知用户' }}</div>
                <div class="phone">{{ row.phonenumber || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="岗位信息" min-width="180">
          <template #default="{ row }">
            <div class="job-cell">
              <div class="job-name">{{ row.jobName || '-' }}</div>
              <div class="salary">{{ row.salary || '' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="企业" prop="companyName" min-width="120" show-overflow-tooltip />
        <el-table-column label="投递时间" prop="applyTime" width="160" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === '0'" :type="row.isRead === '0' ? 'warning' : 'info'" size="small">
              {{ row.isRead === '0' ? '新投递' : '已投递' }}
            </el-tag>
            <el-tag v-else-if="row.status === '1'" type="primary" size="small">面试邀请</el-tag>
            <el-tag v-else-if="row.status === '2'" type="success" size="small">已录用</el-tag>
            <el-tag v-else type="danger" size="small">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已读" width="70" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isRead === '1'" type="success" size="small">已读</el-tag>
            <el-tag v-else type="warning" size="small">未读</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="联系方式" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.exchanged" type="success" size="small">已交换</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right" align="center">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <el-button link type="primary" icon="View" @click="handleDetail(row)">详情</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="loadData"
      />
    </el-card>

    <!-- ========== 投递详情对话框 ========== -->
    <el-dialog v-model="detailVisible" title="投递详情" width="720px" append-to-body>
      <el-descriptions :column="2" border v-if="currentApply">
        <el-descriptions-item label="投递ID">{{ currentApply.applyId }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="currentApply.status === '0'" type="info">已投递</el-tag>
          <el-tag v-else-if="currentApply.status === '1'" type="primary">面试邀请</el-tag>
          <el-tag v-else-if="currentApply.status === '2'" type="success">已录用</el-tag>
          <el-tag v-else type="danger">已拒绝</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="求职者">{{ currentApply.userName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentApply.phonenumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="岗位名称" :span="2">{{ currentApply.jobName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ currentApply.companyName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="薪资">{{ currentApply.salary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="投递时间">{{ currentApply.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="是否已读">
          <el-tag v-if="currentApply.isRead === '1'" type="success">已读</el-tag>
          <el-tag v-else type="warning">未读</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentApply.createTime }}</el-descriptions-item>
        <!-- 简历快照 -->
        <el-descriptions-item label="真实姓名" v-if="currentApply.realName">{{ currentApply.realName }}</el-descriptions-item>
        <el-descriptions-item label="学历" v-if="currentApply.education">{{ currentApply.education }}</el-descriptions-item>
        <el-descriptions-item label="工作年限" v-if="currentApply.workYears">{{ currentApply.workYears }} 年</el-descriptions-item>
        <el-descriptions-item label="所在城市" v-if="currentApply.city">{{ currentApply.city }}</el-descriptions-item>
        <el-descriptions-item label="期望职位" :span="2" v-if="currentApply.expectPosition">{{ currentApply.expectPosition }}</el-descriptions-item>
        <el-descriptions-item label="技能标签" :span="2" v-if="currentApply.skills">
          <el-tag v-for="skill in (currentApply.skills || '').split(',')" :key="skill" size="small" style="margin-right: 4px">{{ skill }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="个人简介" :span="2" v-if="currentApply.summary">
          <div style="white-space: pre-wrap">{{ currentApply.summary }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentApply.message || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { listApply, getApplyStatistics, getApply } from '@/api/recruitment';

const loading = ref(false);
const total = ref(0);
const tableData = ref<any[]>([]);
const detailVisible = ref(false);
const currentApply = ref<any>(null);
const queryFormRef = ref();
const timeRange = ref('7');

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  jobName: '',
  userName: '',
  companyName: '',
  status: '',
  isRead: '',
});

const statistics = reactive({
  totalCount: 0,
  appliedCount: 0,
  interviewCount: 0,
  hiredCount: 0,
  rejectedCount: 0,
  unreadCount: 0,
});

async function loadData() {
  loading.value = true;
  try {
    const res = await listApply(queryParams);
    tableData.value = res.data?.rows || res.rows || [];
    total.value = res.data?.total || res.total || 0;
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
}

async function loadStatistics() {
  try {
    const res = await getApplyStatistics();
    Object.assign(statistics, res.data || {});
  } catch (error) {
    console.error('加载统计失败:', error);
  }
}

function handleQuery() {
  queryParams.pageNum = 1;
  loadData();
}

function resetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.status = '';
  queryParams.isRead = '';
  loadData();
}

function handleTimeRangeChange() {
  queryParams.pageNum = 1;
  loadData();
}

async function handleDetail(row: any) {
  try {
    const res = await getApply(row.applyId);
    currentApply.value = res.data;
    detailVisible.value = true;
    loadData();
  } catch (error) {
    ElMessage.error('获取投递详情失败');
  }
}

onMounted(() => {
  loadData();
  loadStatistics();
});
</script>

<style scoped>
.apply-container {
  padding: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.toolbar-right { display: flex; align-items: center; gap: 8px; }

.mb-4 { margin-bottom: 14px; }

/* 统计卡片 */
.stat-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  border-radius: 10px;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
.stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #303133;
  line-height: 1.2;
}
.stat-value.primary { color: #409EFF; }
.stat-value.warning { color: #E6A23C; }
.stat-value.success { color: #67C23A; }
.stat-value.danger  { color: #F56C6C; }
.stat-value.info    { color: #909399; }
.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 单元格 */
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-detail .name { font-weight: 600; color: #303133; font-size: 13px; }
.user-detail .phone { font-size: 11px; color: #909399; margin-top: 2px; }

.job-cell { padding: 2px 0; }
.job-cell .job-name { font-weight: 600; color: #303133; font-size: 13px; }
.job-cell .salary { color: #F56C6C; font-size: 12px; margin-top: 2px; }

.text-muted { color: #C0C4CC; font-size: 12px; }

@media (max-width: 768px) {
  .stat-value { font-size: 20px; }
}
</style>
