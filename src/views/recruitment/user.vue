<template>
  <div class="p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-mini-card">
          <div class="stat-mini">
            <span class="label">被禁言求职者</span>
            <span class="value danger">{{ statistics.silencedCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 查询表单 -->
    <el-card shadow="hover" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="用户昵称" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入用户昵称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="手机号" prop="phonenumber">
          <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="禁言状态" prop="isSilenced">
          <el-select v-model="queryParams.isSilenced" placeholder="全部" clearable style="width: 150px">
            <el-option label="正常" value="0" />
            <el-option label="已禁言" value="1" />
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
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column label="用户ID" prop="userId" width="80" align="center" />
        <el-table-column label="用户信息" min-width="180">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.avatar" :size="36">
                {{ (row.nickName || row.userName || '?').charAt(0) }}
              </el-avatar>
              <div class="user-detail">
                <div class="name">{{ row.nickName || row.userName || '-' }}</div>
                <div class="sub text-secondary">账号: {{ row.userName || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="手机号" prop="phonenumber" width="130" align="center" />
        <el-table-column label="邮箱" prop="email" width="180" show-overflow-tooltip />
        <el-table-column label="用户类型" prop="userType" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.userType === 'C'" type="success">求职者</el-tag>
            <el-tag v-else-if="row.userType === 'B'" type="warning">企业</el-tag>
            <el-tag v-else type="info">{{ row.userType || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录" prop="loginDate" width="160" align="center" />
        <el-table-column label="禁言状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isRecruitmentSilenced === '1'" type="danger">
              <el-icon><WarnTriangleFilled /></el-icon> 已禁言
            </el-tag>
            <el-tag v-else type="info">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="禁言原因" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.silenceReason || '-' }}</template>
        </el-table-column>
        <el-table-column label="禁言时间" prop="silenceTime" width="160" align="center" />
        <el-table-column label="操作" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleSilence(row)" v-if="row.isRecruitmentSilenced !== '1'">禁言</el-button>
            <el-button link type="success" @click="handleUnsilence(row)" v-else>取消禁言</el-button>
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

    <!-- 禁言对话框 -->
    <el-dialog v-model="silenceVisible" title="禁言求职者" width="500px" append-to-body>
      <el-form ref="silenceFormRef" :model="silenceForm" label-width="100px">
        <el-alert type="warning" :closable="false" style="margin-bottom: 16px">
          禁言后该求职者将无法查看招聘信息、投递职位、联系企业
        </el-alert>
        <el-form-item label="用户">
          <el-input :model-value="silenceForm.nickName || silenceForm.userName" disabled />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input :model-value="silenceForm.phonenumber" disabled />
        </el-form-item>
        <el-form-item label="禁言原因" prop="reason" required>
          <el-input
            v-model="silenceForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入禁言原因，便于后续管理记录"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="silenceVisible = false">取消</el-button>
        <el-button type="danger" @click="submitSilence">确认禁言</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { silenceUser, unsilenceUser, getUserSilenceStatistics, listUsers } from '@/api/recruitment';

interface UserItem {
  userId: number;
  userName: string;
  nickName: string;
  phonenumber: string;
  email: string;
  userType: string;
  avatar: string;
  loginDate: string;
  isRecruitmentSilenced: string;
  silenceReason: string;
  silenceTime: string;
}

const loading = ref(false);
const total = ref(0);
const tableData = ref<UserItem[]>([]);
const silenceVisible = ref(false);
const queryFormRef = ref();
const silenceFormRef = ref();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phonenumber: '',
  isSilenced: '',
});

const statistics = reactive({ silencedCount: 0 });

const silenceForm = reactive<UserItem & { reason: string }>({
  userId: 0,
  userName: '',
  nickName: '',
  phonenumber: '',
  email: '',
  userType: '',
  avatar: '',
  loginDate: '',
  isRecruitmentSilenced: '0',
  silenceReason: '',
  silenceTime: '',
  reason: '',
});

async function loadData() {
  loading.value = true;
  try {
    const res = await listUsers({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      userName: queryParams.userName || undefined,
      phonenumber: queryParams.phonenumber || undefined,
      isRecruitmentSilenced: queryParams.isSilenced || undefined,
    });
    tableData.value = (res.data?.rows || res.rows) as UserItem[];
    total.value = res.data?.total || res.total || 0;
  } catch {
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

async function loadStatistics() {
  try {
    const res = await getUserSilenceStatistics();
    statistics.silencedCount = res.data || 0;
  } catch {
    // silent
  }
}

function handleQuery() {
  queryParams.pageNum = 1;
  loadData();
}

function resetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.isSilenced = '';
  loadData();
}

function handleSilence(row: UserItem) {
  Object.assign(silenceForm, row);
  silenceForm.reason = '';
  silenceVisible.value = true;
}

async function submitSilence() {
  if (!silenceForm.reason.trim()) {
    ElMessage.warning('请填写禁言原因');
    return;
  }
  try {
    await silenceUser({ userId: silenceForm.userId, reason: silenceForm.reason });
    ElMessage.success('禁言成功');
    silenceVisible.value = false;
    loadData();
    loadStatistics();
  } catch {
    ElMessage.error('禁言失败');
  }
}

async function handleUnsilence(row: UserItem) {
  try {
    await ElMessageBox.confirm(
      '确定要取消该求职者的禁言状态吗？取消后用户可以正常查看职位信息。',
      '提示',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    );
    await unsilenceUser({ userId: row.userId });
    ElMessage.success('已取消禁言');
    loadData();
    loadStatistics();
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
}

onMounted(() => {
  loadData();
  loadStatistics();
});
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.stat-mini-card { text-align: center; }
.stat-mini { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-mini .label { font-size: 13px; color: #909399; }
.stat-mini .value { font-size: 24px; font-weight: 700; }
.stat-mini .value.danger { color: #F56C6C; }
.text-secondary { font-size: 12px; color: #909399; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-detail .name { font-weight: 600; color: #303133; }
</style>
