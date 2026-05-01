<template>
  <div class="p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-mini-card">
          <div class="stat-mini">
            <span class="label">企业总数</span>
            <span class="value">{{ statistics.totalCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-mini-card warning">
          <div class="stat-mini">
            <span class="label">待审核</span>
            <span class="value warning">{{ statistics.pendingCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-mini-card success">
          <div class="stat-mini">
            <span class="label">已认证</span>
            <span class="value success">{{ statistics.approvedCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-mini-card danger">
          <div class="stat-mini">
            <span class="label">已禁用</span>
            <span class="value danger">{{ statistics.disabledCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="hover" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="企业名称" prop="companyName">
          <el-input v-model="queryParams.companyName" placeholder="请输入企业名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="待审核" value="0" />
            <el-option label="已认证" value="1" />
            <el-option label="已禁用" value="2" />
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
        <el-table-column label="企业ID" prop="companyId" width="80" align="center" />
        <el-table-column label="企业信息" min-width="200">
          <template #default="{ row }">
            <div class="company-info">
              <el-avatar v-if="row.logoUrl" :src="row.logoUrl" :size="40" />
              <el-avatar v-else :size="40" style="background: #409EFF">
                {{ row.companyName?.charAt(0) }}
              </el-avatar>
              <div class="company-detail">
                <div class="name">{{ row.companyName }}</div>
                <div class="desc text-secondary">{{ row.description || '暂无描述' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="联系人" width="150">
          <template #default="{ row }">
            <div>{{ row.contactPerson || '-' }}</div>
            <div class="text-secondary">{{ row.contactPhone || '' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="岗位数" prop="jobCount" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.jobCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="投递数" prop="applyCount" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success">{{ row.applyCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === '0'" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === '1'" type="success">已认证</el-tag>
            <el-tag v-else type="danger">已禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="入驻时间" prop="createTime" width="160" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="handleDetail(row)">详情</el-button>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                <el-button link type="primary">更多<el-icon class="el-icon--right"><arrow-down /></el-icon></el-button>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="row.status === '0'" icon="CircleCheck" @click="handleAudit(row, '1')">审核通过</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === '0'" icon="Close" @click="handleAudit(row, '2')">审核拒绝</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === '1'" icon="Lock" @click="handleStatusChange(row, '2')">禁用企业</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === '2'" icon="Unlock" @click="handleStatusChange(row, '1')">启用企业</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- 企业详情对话框 -->
    <el-dialog v-model="detailVisible" title="企业详情" width="700px" append-to-body>
      <el-descriptions :column="2" border v-if="currentCompany">
        <el-descriptions-item label="企业ID">{{ currentCompany.companyId }}</el-descriptions-item>
        <el-descriptions-item label="企业状态">
          <el-tag v-if="currentCompany.status === '0'" type="warning">待审核</el-tag>
          <el-tag v-else-if="currentCompany.status === '1'" type="success">已认证</el-tag>
          <el-tag v-else type="danger">已禁用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="企业名称" :span="2">{{ currentCompany.companyName }}</el-descriptions-item>
        <el-descriptions-item label="企业描述" :span="2">{{ currentCompany.description || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentCompany.contactPerson || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentCompany.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="岗位数量">{{ currentCompany.jobCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="投递数量">{{ currentCompany.applyCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentCompany.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentCompany.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentCompany.remark || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditVisible" title="企业审核" width="500px" append-to-body>
      <el-form ref="auditFormRef" :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.status">
            <el-radio label="1">审核通过</el-radio>
            <el-radio label="2">审核拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="auditForm.remark" type="textarea" :rows="3" placeholder="请输入审核备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CompanyManagement" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  listCompany,
  getCompanyStatistics,
  getCompany,
  auditCompany,
  changeCompanyStatus
} from '@/api/recruitment';

const loading = ref(false);
const total = ref(0);
const tableData = ref<any[]>([]);
const detailVisible = ref(false);
const auditVisible = ref(false);
const currentCompany = ref<any>(null);
const queryFormRef = ref();
const auditFormRef = ref();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  companyName: '',
  status: ''
});

const statistics = reactive({
  totalCount: 0,
  pendingCount: 0,
  approvedCount: 0,
  disabledCount: 0
});

const auditForm = reactive({
  companyId: 0,
  status: '1',
  remark: ''
});

async function loadData() {
  loading.value = true;
  try {
    const res = await listCompany(queryParams);
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
    const res = await getCompanyStatistics();
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
    const res = await getCompany(row.companyId);
    currentCompany.value = res.data;
    detailVisible.value = true;
  } catch (error) {
    ElMessage.error('获取企业详情失败');
  }
}

function handleAudit(row: any, status: string) {
  auditForm.companyId = row.companyId;
  auditForm.status = status;
  auditForm.remark = '';
  auditVisible.value = true;
}

async function submitAudit() {
  try {
    await auditCompany(auditForm);
    ElMessage.success('审核成功');
    auditVisible.value = false;
    loadData();
    loadStatistics();
  } catch (error) {
    ElMessage.error('审核失败');
  }
}

async function handleStatusChange(row: any, status: string) {
  const action = status === '1' ? '启用' : '禁用';
  try {
    await ElMessageBox.confirm(`确认要${action}该企业吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await changeCompanyStatus({ companyId: row.companyId, status });
    ElMessage.success(`${action}成功`);
    loadData();
    loadStatistics();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`);
    }
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

.stat-mini .value.warning {
  color: #E6A23C;
}

.stat-mini .value.success {
  color: #67C23A;
}

.stat-mini .value.danger {
  color: #F56C6C;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-detail {
  flex: 1;
}

.company-detail .name {
  font-weight: 600;
  color: #303133;
}

.company-detail .desc {
  font-size: 12px;
  margin-top: 4px;
}

.text-secondary {
  color: #909399;
  font-size: 12px;
}
</style>
