<template>
  <div class="p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card">
          <div class="stat-mini">
            <span class="label">投递总数</span>
            <span class="value">{{ statistics.totalCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card">
          <div class="stat-mini">
            <span class="label">已投递</span>
            <span class="value">{{ statistics.appliedCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card primary">
          <div class="stat-mini">
            <span class="label">面试邀请</span>
            <span class="value primary">{{ statistics.interviewCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card success">
          <div class="stat-mini">
            <span class="label">已录用</span>
            <span class="value success">{{ statistics.hiredCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card danger">
          <div class="stat-mini">
            <span class="label">已拒绝</span>
            <span class="value danger">{{ statistics.rejectedCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card warning">
          <div class="stat-mini">
            <span class="label">未读</span>
            <span class="value warning">{{ statistics.unreadCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="hover" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="岗位名称" prop="jobName">
          <el-input v-model="queryParams.jobName" placeholder="请输入岗位名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="求职者" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入求职者" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="已投递" value="0" />
            <el-option label="面试邀请" value="1" />
            <el-option label="已录用" value="2" />
            <el-option label="已拒绝" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Refresh" @click="loadData">刷新</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column label="投递ID" prop="applyId" width="80" align="center" />
        <el-table-column label="求职者信息" min-width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar v-if="row.avatar" :src="row.avatar" :size="36" />
              <el-avatar v-else :size="36" style="background: #409EFF">
                {{ row.userName?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="user-detail">
                <div class="name">{{ row.userName || '未知用户' }}</div>
                <div class="phone">{{ row.phonenumber || '' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="岗位信息" min-width="200">
          <template #default="{ row }">
            <div class="job-info">
              <div class="job-name">{{ row.jobName || '-' }}</div>
              <div class="salary">{{ row.salary || '' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="企业" prop="companyName" min-width="120" />
        <el-table-column label="投递时间" prop="applyTime" width="160" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === '0'" type="info">
              {{ row.isRead === '0' ? '新投递' : '已投递' }}
            </el-tag>
            <el-tag v-else-if="row.status === '1'" type="primary">面试邀请</el-tag>
            <el-tag v-else-if="row.status === '2'" type="success">已录用</el-tag>
            <el-tag v-else type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否已读" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isRead === '1'" type="success" size="small">已读</el-tag>
            <el-tag v-else type="warning" size="small">未读</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="handleDetail(row)">详情</el-button>
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

    <!-- 投递详情对话框 -->
    <el-dialog v-model="detailVisible" title="投递详情" width="700px" append-to-body>
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
        <el-descriptions-item label="备注" :span="2">{{ currentApply.message || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ApplyManagement" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { listApply, getApplyStatistics, getApply } from '@/api/recruitment';

const loading = ref(false);
const total = ref(0);
const tableData = ref<any[]>([]);
const detailVisible = ref(false);
const currentApply = ref<any>(null);
const queryFormRef = ref();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  jobName: '',
  userName: '',
  status: ''
});

const statistics = reactive({
  totalCount: 0,
  appliedCount: 0,
  interviewCount: 0,
  hiredCount: 0,
  rejectedCount: 0,
  unreadCount: 0
});

async function loadData() {
  loading.value = true;
  try {
    const res = await listApply(queryParams);
    tableData.value = res.rows || [];
    total.value = res.total || 0;
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
  loadData();
}

async function handleDetail(row: any) {
  try {
    const res = await getApply(row.applyId);
    currentApply.value = res.data;
    detailVisible.value = true;
    // 刷新列表以更新已读状态
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
.mb-4 {
  margin-bottom: 16px;
}

.stat-mini-card {
  text-align: center;
}

.stat-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.stat-mini .label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-mini .value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-mini .value.primary {
  color: #409EFF;
}

.stat-mini .value.success {
  color: #67C23A;
}

.stat-mini .value.danger {
  color: #F56C6C;
}

.stat-mini .value.warning {
  color: #E6A23C;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-detail {
  flex: 1;
}

.user-detail .name {
  font-weight: 600;
  color: #303133;
}

.user-detail .phone {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.job-info {
  padding: 4px 0;
}

.job-info .job-name {
  font-weight: 600;
  color: #303133;
}

.job-info .salary {
  color: #F56C6C;
  font-size: 12px;
  margin-top: 2px;
}
</style>
