<template>
  <div class="p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card">
          <div class="stat-mini">
            <span class="label">任务总数</span>
            <span class="value">{{ statistics.totalCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card primary">
          <div class="stat-mini">
            <span class="label">进行中</span>
            <span class="value primary">{{ statistics.inProgressCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card warning">
          <div class="stat-mini">
            <span class="label">待核验</span>
            <span class="value warning">{{ statistics.pendingVerifyCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card success">
          <div class="stat-mini">
            <span class="label">已核验通过</span>
            <span class="value success">{{ statistics.verifiedCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card danger">
          <div class="stat-mini">
            <span class="label">已核验拒绝</span>
            <span class="value danger">{{ statistics.rejectedCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="stat-mini-card info">
          <div class="stat-mini">
            <span class="label">已结算</span>
            <span class="value info">{{ statistics.settledCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="hover" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="企业" prop="companyId">
          <el-input v-model="queryParams.companyId" placeholder="请输入企业ID" clearable @keyup.enter="handleQuery" style="width: 150px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="进行中" value="0" />
            <el-option label="已提交待核验" value="1" />
            <el-option label="已核验通过" value="2" />
            <el-option label="已核验拒绝" value="3" />
            <el-option label="已结算" value="4" />
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
        <el-table-column label="任务ID" prop="taskId" width="80" align="center" />
        <el-table-column label="求职者信息" min-width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar v-if="row.workerAvatar" :src="row.workerAvatar" :size="36" />
              <el-avatar v-else :size="36" style="background: #409EFF">
                {{ row.workerName?.charAt(0) || 'W' }}
              </el-avatar>
              <div class="user-detail">
                <div class="name">{{ row.workerName || '未知' }}</div>
                <div class="phone">{{ row.workerPhone || '' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="岗位信息" min-width="180">
          <template #default="{ row }">
            <div class="job-info">
              <div class="job-name">{{ row.jobName || '-' }}</div>
              <div class="salary">{{ row.salary || '' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="企业" prop="companyName" min-width="120" />
        <el-table-column label="工作地点" prop="address" min-width="150" show-overflow-tooltip />
        <el-table-column label="工作时间" prop="workTime" width="160" align="center" />
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === '0'" type="primary">进行中</el-tag>
            <el-tag v-else-if="row.status === '1'" type="warning">待核验</el-tag>
            <el-tag v-else-if="row.status === '2'" type="success">已通过</el-tag>
            <el-tag v-else-if="row.status === '3'" type="danger">已拒绝</el-tag>
            <el-tag v-else type="info">已结算</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.status === '1'" link type="success" icon="CircleCheck" @click="handleVerify(row, '2')">通过</el-button>
            <el-button v-if="row.status === '1'" link type="danger" icon="Close" @click="handleVerify(row, '3')">拒绝</el-button>
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

    <!-- 任务详情对话框 -->
    <el-dialog v-model="detailVisible" title="任务详情" width="700px" append-to-body>
      <el-descriptions :column="2" border v-if="currentTask">
        <el-descriptions-item label="任务ID">{{ currentTask.taskId }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="currentTask.status === '0'" type="primary">进行中</el-tag>
          <el-tag v-else-if="currentTask.status === '1'" type="warning">待核验</el-tag>
          <el-tag v-else-if="currentTask.status === '2'" type="success">已通过</el-tag>
          <el-tag v-else-if="currentTask.status === '3'" type="danger">已拒绝</el-tag>
          <el-tag v-else type="info">已结算</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="求职者">{{ currentTask.workerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentTask.workerPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="岗位名称">{{ currentTask.jobName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ currentTask.companyName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="薪资">{{ currentTask.salary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工作地点">{{ currentTask.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工作时间">{{ currentTask.workTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentTask.createTime }}</el-descriptions-item>
        <el-descriptions-item label="汇报内容" :span="2">
          <div style="white-space: pre-wrap">{{ currentTask.reportContent || '暂无' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="核验备注" :span="2">{{ currentTask.remark || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      <!-- 工作照片 -->
      <div v-if="currentTask?.photoPath" class="mt-4">
        <div class="mb-2">工作照片</div>
        <el-image
          v-for="(photo, index) in currentTask.photoPath.split(',')"
          :key="index"
          :src="photo"
          :preview-src-list="currentTask.photoPath.split(',')"
          style="width: 120px; height: 120px; margin-right: 8px"
          fit="cover"
        />
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 核验对话框 -->
    <el-dialog v-model="verifyVisible" title="任务核验" width="500px" append-to-body>
      <el-form ref="verifyFormRef" :model="verifyForm" label-width="80px">
        <el-form-item label="核验结果">
          <el-radio-group v-model="verifyForm.status">
            <el-radio label="2">核验通过</el-radio>
            <el-radio label="3">核验拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="verifyForm.remark" type="textarea" :rows="3" placeholder="请输入核验备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="verifyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitVerify">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TaskManagement" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { listTask, getTaskStatistics, getTask, verifyTask } from '@/api/recruitment';

const loading = ref(false);
const total = ref(0);
const tableData = ref<any[]>([]);
const detailVisible = ref(false);
const verifyVisible = ref(false);
const currentTask = ref<any>(null);
const queryFormRef = ref();
const verifyFormRef = ref();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  companyId: undefined,
  status: ''
});

const statistics = reactive({
  totalCount: 0,
  inProgressCount: 0,
  pendingVerifyCount: 0,
  verifiedCount: 0,
  rejectedCount: 0,
  settledCount: 0
});

const verifyForm = reactive({
  taskId: 0,
  status: '2',
  remark: ''
});

async function loadData() {
  loading.value = true;
  try {
    const res = await listTask(queryParams);
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
    const res = await getTaskStatistics();
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
  queryParams.companyId = undefined;
  loadData();
}

async function handleDetail(row: any) {
  try {
    const res = await getTask(row.taskId);
    currentTask.value = res.data;
    detailVisible.value = true;
  } catch (error) {
    ElMessage.error('获取任务详情失败');
  }
}

function handleVerify(row: any, status: string) {
  verifyForm.taskId = row.taskId;
  verifyForm.status = status;
  verifyForm.remark = '';
  verifyVisible.value = true;
}

async function submitVerify() {
  try {
    await verifyTask(verifyForm);
    ElMessage.success('核验成功');
    verifyVisible.value = false;
    loadData();
    loadStatistics();
  } catch (error) {
    ElMessage.error('核验失败');
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

.mt-4 {
  margin-top: 16px;
}

.mb-2 {
  margin-bottom: 8px;
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

.stat-mini .value.info {
  color: #909399;
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
