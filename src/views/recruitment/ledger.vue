<template>
  <div class="p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-mini-card">
          <div class="stat-mini">
            <span class="label">台账总数</span>
            <span class="value">{{ statistics.totalCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-mini-card success">
          <div class="stat-mini">
            <span class="label">累计金额</span>
            <span class="value success">?{{ formatMoney(statistics.totalAmount) }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-mini-card primary">
          <div class="stat-mini">
            <span class="label">今日金额</span>
            <span class="value primary">?{{ formatMoney(statistics.todayAmount) }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="hover" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="企业" prop="companyId">
          <el-input v-model="queryParams.companyId" placeholder="企业ID" clearable @keyup.enter="handleQuery" style="width: 120px" />
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
        <el-table-column label="台账ID" prop="ledgerId" width="80" align="center" />
        <el-table-column label="订单号" prop="orderNo" min-width="200" show-overflow-tooltip />
        <el-table-column label="企业" prop="companyName" min-width="150" />
        <el-table-column label="用户" min-width="120">
          <template #default="{ row }">
            <span>{{ row.userName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结算金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount">?{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="不可篡改时间" prop="timestamp" width="180" align="center" />
        <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
        <el-table-column label="操作" width="80" fixed="right" align="center">
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

    <!-- 台账详情对话框 -->
    <el-dialog v-model="detailVisible" title="台账详情" width="600px" append-to-body>
      <el-descriptions :column="2" border v-if="currentLedger">
        <el-descriptions-item label="台账ID">{{ currentLedger.ledgerId }}</el-descriptions-item>
        <el-descriptions-item label="订单号" :span="2">{{ currentLedger.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="企业">{{ currentLedger.companyName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentLedger.userName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="结算金额">
          <span class="amount-lg">?{{ formatMoney(currentLedger.amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="任务ID">{{ currentLedger.taskId }}</el-descriptions-item>
        <el-descriptions-item label="不可篡改时间" :span="2">{{ currentLedger.timestamp }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentLedger.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentLedger.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentLedger.remark || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="LedgerManagement" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { listLedger, getLedgerStatistics, getLedger } from '@/api/recruitment';

const loading = ref(false);
const total = ref(0);
const tableData = ref<any[]>([]);
const detailVisible = ref(false);
const currentLedger = ref<any>(null);
const queryFormRef = ref();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  orderNo: '',
  companyId: undefined,
  userId: undefined
});

const statistics = reactive({
  totalCount: 0,
  totalAmount: 0,
  todayAmount: 0
});

function formatMoney(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '0.00';
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

async function loadData() {
  loading.value = true;
  try {
    const res = await listLedger(queryParams);
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
    const res = await getLedgerStatistics();
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
  queryParams.orderNo = '';
  queryParams.companyId = undefined;
  queryParams.userId = undefined;
  loadData();
}

async function handleDetail(row: any) {
  try {
    const res = await getLedger(row.ledgerId);
    currentLedger.value = res.data;
    detailVisible.value = true;
  } catch (error) {
    ElMessage.error('获取台账详情失败');
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

.stat-mini .value.success {
  color: #67C23A;
}

.stat-mini .value.primary {
  color: #409EFF;
}

.amount {
  color: #67C23A;
  font-weight: 600;
}

.amount-lg {
  color: #67C23A;
  font-weight: 700;
  font-size: 18px;
}
</style>
