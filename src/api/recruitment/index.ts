import request from '@/utils/request';

// ========== 类型定义 ==========

// 企业统计
export interface CompanyStatistics {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  disabledCount: number;
}

// 企业详情
export interface CompanyVO {
  companyId?: number;
  companyName?: string;
  description?: string;
  contactPerson?: string;
  contactPhone?: string;
  logoUrl?: string;
  businessLicense?: string;
  status?: string;
  userId?: number;
  createTime?: string;
  remark?: string;
  jobCount?: number;
  applyCount?: number;
}

// 岗位统计
export interface JobStatistics {
  totalCount: number;
  pendingCount: number;
  onlineCount: number;
  offlineCount: number;
}

// 岗位详情
export interface JobVO {
  jobId?: number;
  companyId?: number;
  companyName?: string;
  jobName?: string;
  salary?: string;
  location?: string;
  jobType?: string;
  jobTypeName?: string;
  experience?: string;
  experienceName?: string;
  description?: string;
  publishTime?: string;
  applyCount?: number;
  status?: string;
  statusName?: string;
  createTime?: string;
  remark?: string;
}

// 投递统计
export interface ApplyStatistics {
  totalCount: number;
  appliedCount: number;
  interviewCount: number;
  hiredCount: number;
  rejectedCount: number;
  unreadCount: number;
}

// 投递详情
export interface ApplyVO {
  applyId?: number;
  jobId?: number;
  jobName?: string;
  salary?: string;
  companyName?: string;
  userId?: number;
  userName?: string;
  phonenumber?: string;
  applyTime?: string;
  status?: string;
  statusName?: string;
  isRead?: string;
  message?: string;
  createTime?: string;
}

// 任务统计
export interface TaskStatistics {
  totalCount: number;
  inProgressCount: number;
  pendingVerifyCount: number;
  verifiedCount: number;
  rejectedCount: number;
  settledCount: number;
}

// 任务详情
export interface TaskVO {
  taskId?: number;
  jobId?: number;
  jobName?: string;
  applyId?: number;
  userId?: number;
  workerName?: string;
  workerPhone?: string;
  workerAvatar?: string;
  companyId?: number;
  companyName?: string;
  photoPath?: string;
  reportContent?: string;
  workTime?: string;
  address?: string;
  status?: string;
  statusName?: string;
  remark?: string;
  createTime?: string;
}

// 台账统计
export interface LedgerStatistics {
  totalCount: number;
  totalAmount: number;
  todayAmount: number;
}

// 台账详情
export interface LedgerVO {
  ledgerId?: number;
  taskId?: number;
  companyId?: number;
  companyName?: string;
  userId?: number;
  userName?: string;
  orderNo?: string;
  timestamp?: string;
  amount?: number;
  createTime?: string;
}

// 发票统计
export interface InvoiceStatistics {
  totalCount: number;
  pendingCount: number;
  issuedCount: number;
  cancelledCount: number;
}

// 发票详情
export interface InvoiceVO {
  invoiceId?: number;
  ledgerId?: number;
  companyId?: number;
  companyName?: string;
  filePath?: string;
  status?: string;
  statusName?: string;
  createTime?: string;
  remark?: string;
}

// 综合概览
export interface RecruitmentOverview {
  totalCompanies: number;
  pendingCompanies: number;
  approvedCompanies: number;
  totalJobs: number;
  pendingJobs: number;
  onlineJobs: number;
  totalApplies: number;
  todayApplies: number;
  totalTasks: number;
  inProgressTasks: number;
}

// 投递趋势
export interface ApplyTrend {
  date: string;
  count: number;
}

// 岗位类型分布
export interface JobTypeDistribution {
  jobType: string;
  typeName: string;
  count: number;
}

// ========== 查询参数 ==========

export interface CompanyQuery {
  pageNum?: number;
  pageSize?: number;
  companyName?: string;
  status?: string;
  userId?: number;
}

export interface JobQuery {
  pageNum?: number;
  pageSize?: number;
  jobName?: string;
  companyId?: number;
  status?: string;
  jobType?: string;
}

export interface ApplyQuery {
  pageNum?: number;
  pageSize?: number;
  jobId?: number;
  jobName?: string;
  userId?: number;
  userName?: string;
  status?: string;
}

export interface TaskQuery {
  pageNum?: number;
  pageSize?: number;
  jobId?: number;
  companyId?: number;
  userId?: number;
  status?: string;
}

export interface LedgerQuery {
  pageNum?: number;
  pageSize?: number;
  companyId?: number;
  userId?: number;
  orderNo?: string;
}

export interface InvoiceQuery {
  pageNum?: number;
  pageSize?: number;
  companyId?: number;
  ledgerId?: number;
  status?: string;
}

// ========== API 函数 ==========

const baseUrl = '/admin/recruitment';

// 企业管理
export function listCompany(query: CompanyQuery) {
  return request.get<any>(`${baseUrl}/company/list`, { params: query });
}

export function getCompany(companyId: number) {
  return request.get<any>(`${baseUrl}/company/${companyId}`);
}

export function auditCompany(data: { companyId: number; status: string; remark?: string }) {
  return request.post(`${baseUrl}/company/audit`, data);
}

export function changeCompanyStatus(data: { companyId: number; status: string }) {
  return request.post(`${baseUrl}/company/changeStatus`, data);
}

export function getCompanyStatistics() {
  return request.get<any>(`${baseUrl}/company/statistics`);
}

// 岗位管理
export function listJob(query: JobQuery) {
  return request.get<any>(`${baseUrl}/job/list`, { params: query });
}

export function getJob(jobId: number) {
  return request.get<any>(`${baseUrl}/job/${jobId}`);
}

export function auditJob(data: { jobId: number; status: string; remark?: string }) {
  return request.post(`${baseUrl}/job/audit`, data);
}

export function batchAuditJob(data: { jobIds: number[]; status: string }) {
  return request.post(`${baseUrl}/job/batchAudit`, data);
}

export function changeJobStatus(data: { jobId: number; status: string }) {
  return request.post(`${baseUrl}/job/changeStatus`, data);
}

export function delJob(jobId: number | number[]) {
  return request.delete(`${baseUrl}/job/${jobId}`);
}

export function getJobStatistics() {
  return request.get<any>(`${baseUrl}/job/statistics`);
}

// 投递管理
export function listApply(query: ApplyQuery) {
  return request.get<any>(`${baseUrl}/apply/list`, { params: query });
}

export function getApply(applyId: number) {
  return request.get<any>(`${baseUrl}/apply/${applyId}`);
}

export function markApplyRead(data: { applyId: number; isRead: string }) {
  return request.post(`${baseUrl}/apply/markRead`, data);
}

export function getApplyStatistics() {
  return request.get<any>(`${baseUrl}/apply/statistics`);
}

// 任务管理
export function listTask(query: TaskQuery) {
  return request.get<any>(`${baseUrl}/task/list`, { params: query });
}

export function getTask(taskId: number) {
  return request.get<any>(`${baseUrl}/task/${taskId}`);
}

export function verifyTask(data: { taskId: number; status: string; remark?: string }) {
  return request.post(`${baseUrl}/task/verify`, data);
}

export function getTaskStatistics() {
  return request.get<any>(`${baseUrl}/task/statistics`);
}

// 台账管理
export function listLedger(query: LedgerQuery) {
  return request.get<any>(`${baseUrl}/ledger/list`, { params: query });
}

export function getLedger(ledgerId: number) {
  return request.get<any>(`${baseUrl}/ledger/${ledgerId}`);
}

export function getLedgerStatistics() {
  return request.get<any>(`${baseUrl}/ledger/statistics`);
}

// 发票管理
export function listInvoice(query: InvoiceQuery) {
  return request.get<any>(`${baseUrl}/invoice/list`, { params: query });
}

export function getInvoice(invoiceId: number) {
  return request.get<any>(`${baseUrl}/invoice/${invoiceId}`);
}

export function updateInvoiceStatus(data: { invoiceId: number; status: string }) {
  return request.post(`${baseUrl}/invoice/updateStatus`, data);
}

export function getInvoiceStatistics() {
  return request.get<any>(`${baseUrl}/invoice/statistics`);
}

// 综合统计
export function getOverview() {
  return request.get<any>(`${baseUrl}/dashboard/overview`);
}

export function getApplyTrend(days: number = 7) {
  return request.get<any>(`${baseUrl}/dashboard/applyTrend`, { params: { days } });
}

export function getJobTypeDistribution() {
  return request.get<any>(`${baseUrl}/dashboard/jobTypeDistribution`);
}
