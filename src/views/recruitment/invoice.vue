<template>
  <div class="p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-mini-card">
          <div class="stat-mini">
            <span class="label">发票总数</span>
            <span class="value">{{ statistics.totalCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-mini-card warning">
          <div class="stat-mini">
            <span class="label">未开票</span>
            <span class="value warning">{{ statistics.pendingCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-mini-card success">
          <div class="stat-mini">
            <span class="label">已开票</span>
            <span class="value success">{{ statistics.issuedCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-mini-card danger">
          <div class="stat-mini">
            <span class="label">已作废</span>
            <span class="value danger">{{ statistics.cancelledCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="hover" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="企业" prop="companyId">
          <el-input v-model="queryParams.companyId" placeholder="企业ID" clearable @keyup.enter="handleQuery" style="width: 120px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="未开票" value="0" />
            <el-option label="已开票" value="1" />
            <el-option label="已作废" value="2" />
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
        <el-table-column label="发票ID" prop="invoiceId" width="80" align="center" />
        <el-table-column label="企业" prop="companyName" min-width="150" />
        <el-table-column label="台账ID" prop="ledgerId" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === '0'" type="warning">未开票</el-tag>
            <el-tag v-else-if="row.status === '1'" type="success">已开票</el-tag>
            <el-tag v-else type="danger">已作废</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发票文件" min-width="120">
          <template #default="{ row }">
            <el-button v-if="row.filePath" link type="primary" @click="previewFile(row.filePath)">查看文件</el-button>
            <span v-else class="text-secondary">暂无文件</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
        <el-table-column label="更新时间" prop="updateTime" width="160" align="center" />
        <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="handleDetail(row)">详情</el-button>
            <el-dropdown v-if="row.status === '0'" trigger="click">
              <span class="el-dropdown-link">
                <el-button link type="primary">更多<el-icon class="el-icon--right"><arrow-down /></el-icon></el-button>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Tickets" @click="handleStatusChange(row, '1')">标记已开票</el-dropdown-item>
                  <el-dropdown-item icon="Delete" @click="handleStatusChange(row, '2')">标记已作废</el-dropdown-item>
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

    <!-- 发票详情对话框 -->
    <el-dialog v-model="detailVisible" title="发票详情" width="600px" append-to-body>
      <el-descriptions :column="2" border v-if="currentInvoice">
        <el-descriptions-item label="发票ID">{{ currentInvoice.invoiceId }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="currentInvoice.status === '0'" type="warning">未开票</el-tag>
          <el-tag v-else-if="currentInvoice.status === '1'" type="success">已开票</el-tag>
          <el-tag v-else type="danger">已作废</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="企业">{{ currentInvoice.companyName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="台账ID">{{ currentInvoice.ledgerId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentInvoice.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentInvoice.updateTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentInvoice.remark || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="currentInvoice?.filePath" class="mt-4">
        <div class="mb-2">发票文件</div>
        <el-image :src="currentInvoice.filePath" :preview-src-list="[currentInvoice.filePath]" style="max-width: 100%" fit="contain" />
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InvoiceManagement" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listInvoice, getInvoiceStatistics, getInvoice, updateInvoiceStatus } from '@/api/recruitment';

const loading = ref(false);
const total = ref(0);
const tableData = ref<any[]>([]);
const detailVisible = ref(false);
const currentInvoice = ref<any>(null);
const queryFormRef = ref();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  companyId: undefined,
  ledgerId: undefined,
  status: ''
});

const statistics = reactive({
  totalCount: 0,
  pendingCount: 0,
  issuedCount: 0,
  cancelledCount: 0
});

async function loadData() {
  loading.value = true;
  try {
    const res = await listInvoice(queryParams);
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
    const res = await getInvoiceStatistics();
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
  queryParams.ledgerId = undefined;
  loadData();
}

async function handleDetail(row: any) {
  try {
    const res = await getInvoice(row.invoiceId);
    currentInvoice.value = res.data;
    detailVisible.value = true;
  } catch (error) {
    ElMessage.error('获取发票详情失败');
  }
}

function previewFile(filePath: string) {
  window.open(filePath, '_blank');
}

async function handleStatusChange(row: any, status: string) {
  const statusText = status === '1' ? '已开票' : '已作废';
  try {
    await ElMessageBox.confirm(`确认要将该发票标记为"${statusText}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await updateInvoiceStatus({ invoiceId: row.invoiceId, status });
    ElMessage.success('更新成功');
    loadData();
    loadStatistics();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('更新失败');
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

.stat-mini .value.success {
  color: #67C23A;
}

.stat-mini .value.danger {
  color: #F56C6C;
}

.stat-mini .value.warning {
  color: #E6A23C;
}

.text-secondary {
  color: #909399;
  font-size: 12px;
}
</style>
