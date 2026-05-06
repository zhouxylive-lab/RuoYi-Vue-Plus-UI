<template>
  <div class="p-4">
    <!-- ========== 区块一：统计卡片 ========== -->
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="24" :sm="12" :md="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon primary"><el-icon><User /></el-icon></div>
            <div class="stat-body">
              <span class="stat-label">求职者总数</span>
              <span class="stat-value primary">{{ stats.totalCount || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon success"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-body">
              <span class="stat-label">正常用户</span>
              <span class="stat-value success">{{ stats.normalCount || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon warning"><el-icon><Document /></el-icon></div>
            <div class="stat-body">
              <span class="stat-label">有投递记录</span>
              <span class="stat-value warning">{{ stats.appliedCount || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon info"><el-icon><Clock /></el-icon></div>
            <div class="stat-body">
              <span class="stat-label">待处理投递</span>
              <span class="stat-value info">{{ stats.pendingApplyCount || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon danger"><el-icon><WarnTriangleFilled /></el-icon></div>
            <div class="stat-body">
              <span class="stat-label">已禁言</span>
              <span class="stat-value danger">{{ stats.silencedCount || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 区块二：搜索栏 ========== -->
    <el-card shadow="hover" class="mb-4">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="用户昵称" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入昵称" clearable style="width: 160px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="手机号" prop="phonenumber">
          <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号" clearable style="width: 140px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="用户状态" prop="isSilenced">
          <el-select v-model="queryParams.isSilenced" placeholder="全部" clearable style="width: 130px">
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

    <!-- ========== 区块三：数据表格 ========== -->
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Refresh" @click="loadData">刷新</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="WarnTriangleFilled" @click="loadData" :loading="loading">
              已禁言 {{ stats.silencedCount || 0 }} 人
            </el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column label="用户ID" prop="userId" width="80" align="center" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.avatar" :size="40">
                {{ (row.nickName || row.userName || '?').charAt(0) }}
              </el-avatar>
              <div class="user-detail">
                <div class="name">{{ row.nickName || row.userName || '-' }}</div>
                <div class="sub">{{ row.userName ? '账号: ' + row.userName : '' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="性别" prop="sex" width="70" align="center">
          <template #default="{ row }">
            <span v-if="row.sex === '0'">男</span>
            <span v-else-if="row.sex === '1'">女</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="年龄" prop="age" width="65" align="center">
          <template #default="{ row }">{{ row.age || '-' }}</template>
        </el-table-column>
        <el-table-column label="学历" prop="education" width="90" align="center">
          <template #default="{ row }">{{ row.education || '-' }}</template>
        </el-table-column>
        <el-table-column label="工作经验" prop="workYears" width="100" align="center">
          <template #default="{ row }">
            {{ row.workYears != null ? row.workYears + ' 年' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="手机号" prop="phonenumber" width="130" align="center" />
        <el-table-column label="邮箱" prop="email" min-width="160" show-overflow-tooltip />
        <el-table-column label="用户类型" prop="userType" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.userType === 'C'" type="success" size="small">求职者</el-tag>
            <el-tag v-else-if="row.userType === 'B'" type="warning" size="small">企业</el-tag>
            <el-tag v-else type="info" size="small">{{ row.userType || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="禁言状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isRecruitmentSilenced === '1'" type="danger" size="small">
              <el-icon><WarnTriangleFilled /></el-icon> 已禁言
            </el-tag>
            <el-tag v-else type="success" size="small">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="禁言原因" prop="silenceReason" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">{{ row.silenceReason || '-' }}</template>
        </el-table-column>
        <el-table-column label="最后登录" prop="loginDate" width="160" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="handleDetail(row)">详情</el-button>
            <el-button link type="danger" @click="handleSilence(row)" v-if="row.isRecruitmentSilenced !== '1'">
              禁言
            </el-button>
            <el-button link type="success" @click="handleUnsilence(row)" v-else>
              解禁
            </el-button>
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

    <!-- ========== 区块四：详情对话框 ========== -->
    <el-dialog v-model="detailVisible" title="求职者详情" width="700px" append-to-body>
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="用户ID">{{ currentUser.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户类型">
          <el-tag v-if="currentUser.userType === 'C'" type="success">求职者</el-tag>
          <el-tag v-else-if="currentUser.userType === 'B'" type="warning">企业</el-tag>
          <el-tag v-else>{{ currentUser.userType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ currentUser.userName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          <span v-if="currentUser.sex === '0'">男</span>
          <span v-else-if="currentUser.sex === '1'">女</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="年龄">{{ currentUser.age || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ currentUser.education || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工作年限">{{ currentUser.workYears != null ? currentUser.workYears + ' 年' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号" :span="2">{{ currentUser.phonenumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱" :span="2">{{ currentUser.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="个人简介" :span="2">
          <span style="white-space: pre-wrap">{{ currentUser.summary || '暂无' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="禁言状态">
          <el-tag v-if="currentUser.isRecruitmentSilenced === '1'" type="danger">已禁言</el-tag>
          <el-tag v-else type="success">正常</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="禁言原因">{{ currentUser.silenceReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="禁言时间">{{ currentUser.silenceTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间" :span="2">{{ currentUser.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后登录" :span="2">{{ currentUser.loginDate || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="danger" @click="handleSilence(currentUser)" v-if="currentUser?.isRecruitmentSilenced !== '1'">
          禁言该用户
        </el-button>
        <el-button type="success" @click="handleUnsilence(currentUser)" v-else>
          解除禁言
        </el-button>
      </template>
    </el-dialog>

    <!-- ========== 区块五：禁言对话框 ========== -->
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
import { statisticsUser, listUsers, silenceUser, unsilenceUser } from '@/api/recruitment';

interface UserItem {
  userId: number;
  userName: string;
  nickName: string;
  phonenumber: string;
  email: string;
  userType: string;
  avatar: string;
  sex: string;
  age: number;
  education: string;
  workYears: number;
  summary: string;
  loginDate: string;
  isRecruitmentSilenced: string;
  silenceReason: string;
  silenceTime: string;
  createTime: string;
}

const loading = ref(false);
const total = ref(0);
const tableData = ref<UserItem[]>([]);
const detailVisible = ref(false);
const silenceVisible = ref(false);
const currentUser = ref<UserItem | null>(null);
const queryFormRef = ref();
const silenceFormRef = ref();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phonenumber: '',
  isSilenced: '',
});

const stats = reactive({
  totalCount: 0,
  silencedCount: 0,
  normalCount: 0,
  appliedCount: 0,
  pendingApplyCount: 0,
});

const silenceForm = reactive<UserItem & { reason: string }>({
  userId: 0,
  userName: '',
  nickName: '',
  phonenumber: '',
  email: '',
  userType: '',
  avatar: '',
  sex: '',
  age: 0,
  education: '',
  workYears: 0,
  summary: '',
  loginDate: '',
  isRecruitmentSilenced: '0',
  silenceReason: '',
  silenceTime: '',
  createTime: '',
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
    const res = await statisticsUser();
    Object.assign(stats, res.data || {});
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
  queryParams.userName = '';
  queryParams.phonenumber = '';
  queryParams.isSilenced = '';
  loadData();
}

function handleDetail(row: UserItem) {
  currentUser.value = { ...row };
  detailVisible.value = true;
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
    detailVisible.value = false;
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
    ElMessage.success('已解除禁言');
    detailVisible.value = false;
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

/* ---------- 统计卡片 ---------- */
.stat-card {
  border-radius: 10px;
  transition: all 0.3s;
}
.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}
.stat-inner {
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.stat-icon.primary { background: #ECF5FF; color: #409EFF; }
.stat-icon.success { background: #F0F9EB; color: #67C23A; }
.stat-icon.warning { background: #FDF6EC; color: #E6A23C; }
.stat-icon.info { background: #F4F4F5; color: #909399; }
.stat-icon.danger { background: #FEF0F0; color: #F56C6C; }

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label {
  font-size: 13px;
  color: #909399;
}
.stat-value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
}
.stat-value.primary { color: #409EFF; }
.stat-value.success { color: #67C23A; }
.stat-value.warning { color: #E6A23C; }
.stat-value.info { color: #909399; }
.stat-value.danger { color: #F56C6C; }

/* ---------- 表格内用户信息 ---------- */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-detail .name {
  font-weight: 600;
  color: #303133;
  line-height: 1.3;
}
.user-detail .sub {
  font-size: 12px;
  color: #909399;
}
.text-muted { color: #C0C4CC; }
</style>
