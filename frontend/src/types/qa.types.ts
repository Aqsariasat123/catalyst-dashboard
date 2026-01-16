// QA Module Types
import { User, Project, Milestone, Task } from './index';

// Enums
export type TestCaseStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED';
export type TestCasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TestCaseType = 'MANUAL' | 'AUTOMATION';
export type ExecutionStatus = 'NOT_RUN' | 'PASS' | 'FAIL' | 'BLOCKED' | 'SKIPPED';
export type BugSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type BugStatus = 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'RETEST' | 'CLOSED' | 'REOPENED';
export type QAAttachmentType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';

// Test Step interface
export interface TestStep {
  step: string;
  expected: string;
}

// Step Result interface
export interface StepResult {
  stepIndex: number;
  passed: boolean;
  notes?: string;
}

// Test Case
export interface TestCase {
  id: string;
  title: string;
  description?: string;
  steps: TestStep[];
  expectedResult: string;
  preconditions?: string;
  priority: TestCasePriority;
  type: TestCaseType;
  status: TestCaseStatus;
  taskId: string;
  projectId: string;
  milestoneId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  task?: Pick<Task, 'id' | 'title'>;
  project?: Pick<Project, 'id' | 'name' | 'client'>;
  milestone?: Pick<Milestone, 'id' | 'title' | 'status'>;
  createdBy?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  lastExecution?: TestExecution;
  _count?: {
    executions: number;
    bugs: number;
    attachments: number;
  };
}

// Test Execution
export interface TestExecution {
  id: string;
  testCaseId: string;
  status: ExecutionStatus;
  notes?: string;
  executionTime?: number;
  runNumber: number;
  stepResults?: StepResult[];
  executedById: string;
  executedAt: string;
  createdAt: string;
  updatedAt: string;
  testCase?: Pick<TestCase, 'id' | 'title' | 'project'>;
  executedBy?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  attachments?: QAAttachment[];
}

// Bug
export interface Bug {
  id: string;
  bugNumber: number;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  stepsToReproduce?: string;
  environment?: string;
  actualResult?: string;
  expectedResult?: string;
  testCaseId?: string;
  taskId: string;
  projectId: string;
  milestoneId?: string;
  reportedById: string;
  assignedToId?: string;
  resolvedById?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  testCase?: Pick<TestCase, 'id' | 'title'>;
  task?: Pick<Task, 'id' | 'title'>;
  project?: Pick<Project, 'id' | 'name' | 'client'>;
  milestone?: Pick<Milestone, 'id' | 'title'>;
  reportedBy?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  assignedTo?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  resolvedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  attachments?: QAAttachment[];
  activities?: BugActivity[];
}

// Bug Activity
export interface BugActivity {
  id: string;
  bugId: string;
  userId: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

// QA Attachment
export interface QAAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: QAAttachmentType;
  testCaseId?: string;
  testExecutionId?: string;
  bugId?: string;
  uploadedById: string;
  uploadedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  createdAt: string;
}

// Trend Data for charts
export interface ExecutionTrendData {
  date: string;
  pass: number;
  fail: number;
  blocked: number;
  skipped: number;
  total: number;
}

export interface BugTrendData {
  date: string;
  opened: number;
  closed: number;
  total: number;
  critical: number;
  high: number;
}

// Dashboard Data
export interface QADashboardData {
  overallStatus: 'READY' | 'AT_RISK' | 'NOT_READY';
  testCases: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  };
  executions: {
    total: number;
    byStatus: Record<string, number>;
    passRate: number;
    recentExecutions: TestExecution[];
    trend?: ExecutionTrendData[];
  };
  bugs: {
    total: number;
    open: number;
    criticalHighOpen: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    trend?: BugTrendData[];
    recentBugs?: Bug[];
  };
  projectStats: ProjectQAStats[];
}

export interface ProjectQAStats {
  id: string;
  name: string;
  client: { id: string; name: string };
  testCases: number;
  totalBugs: number;
  openBugs: number;
  criticalBugs: number;
  passRate: number;
  status: 'READY' | 'AT_RISK' | 'NOT_READY';
}

// Filter types
export interface TestCaseFilters {
  page?: number;
  limit?: number;
  projectId?: string;
  milestoneId?: string;
  taskId?: string;
  status?: TestCaseStatus;
  priority?: TestCasePriority;
  type?: TestCaseType;
  search?: string;
  createdById?: string;
}

export interface ExecutionFilters {
  page?: number;
  limit?: number;
  testCaseId?: string;
  projectId?: string;
  status?: ExecutionStatus;
  executedById?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BugFilters {
  page?: number;
  limit?: number;
  projectId?: string;
  milestoneId?: string;
  taskId?: string;
  testCaseId?: string;
  status?: BugStatus;
  severity?: BugSeverity;
  assignedToId?: string;
  reportedById?: string;
  search?: string;
}

// Create/Update DTOs
export interface CreateTestCaseData {
  title: string;
  description?: string;
  steps: TestStep[];
  expectedResult: string;
  preconditions?: string;
  priority?: TestCasePriority;
  type?: TestCaseType;
  status?: TestCaseStatus;
  taskId: string;
  projectId: string;
  milestoneId?: string;
}

export interface UpdateTestCaseData {
  title?: string;
  description?: string;
  steps?: TestStep[];
  expectedResult?: string;
  preconditions?: string;
  priority?: TestCasePriority;
  type?: TestCaseType;
  status?: TestCaseStatus;
}

export interface ExecuteTestData {
  status: ExecutionStatus;
  notes?: string;
  executionTime?: number;
  stepResults?: StepResult[];
}

export interface CreateBugData {
  title: string;
  description: string;
  severity?: BugSeverity;
  stepsToReproduce?: string;
  environment?: string;
  actualResult?: string;
  expectedResult?: string;
  testCaseId?: string;
  taskId: string;
  projectId: string;
  milestoneId?: string;
  assignedToId?: string;
}

export interface UpdateBugData {
  title?: string;
  description?: string;
  severity?: BugSeverity;
  status?: BugStatus;
  stepsToReproduce?: string;
  environment?: string;
  actualResult?: string;
  expectedResult?: string;
  assignedToId?: string;
  resolution?: string;
}
