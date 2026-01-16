# Phase 2: Test Case Management UI
**Status: PENDING**

---

## Overview
Build test case creation, management, and execution interface in the frontend.

---

## Deliverables

### 1. Frontend Services

#### `testCase.service.ts`
```typescript
export const testCaseService = {
  getAll(filters: TestCaseFilters): Promise<PaginatedResponse<TestCase>>,
  getById(id: string): Promise<TestCase>,
  getByTask(taskId: string): Promise<TestCase[]>,
  getByProject(projectId: string): Promise<TestCase[]>,
  create(data: CreateTestCaseData): Promise<TestCase>,
  update(id: string, data: UpdateTestCaseData): Promise<TestCase>,
  delete(id: string): Promise<void>,
};
```

#### `testExecution.service.ts`
```typescript
export const testExecutionService = {
  getAll(filters: ExecutionFilters): Promise<PaginatedResponse<TestExecution>>,
  getById(id: string): Promise<TestExecution>,
  getHistory(testCaseId: string): Promise<TestExecution[]>,
  execute(testCaseId: string, data: ExecutionData): Promise<TestExecution>,
  bulkExecute(data: BulkExecutionData): Promise<TestExecution[]>,
  update(id: string, data: UpdateExecutionData): Promise<TestExecution>,
};
```

---

### 2. Components to Create

```
frontend/src/components/qa/
├── TestCaseList.tsx           # Filterable list of test cases
├── TestCaseCard.tsx           # Individual test case display
├── TestCaseForm.tsx           # Create/Edit form
├── TestCaseDetail.tsx         # Full detail view with execution history
├── TestStepsEditor.tsx        # Step-by-step editor component
├── ExecutionModal.tsx         # Modal for executing test
├── ExecutionHistory.tsx       # Execution history timeline
└── TestCaseFilters.tsx        # Filter bar component
```

---

### 3. Pages to Create

#### `TestCasesPage.tsx`
- List view with filters (project, milestone, task, status, priority, type)
- Search functionality
- Bulk actions (delete, change status)
- Create new test case button
- Pagination

#### `TestCaseDetailPage.tsx`
- Full test case information
- Steps display
- Execution history
- Linked bugs
- Attachments
- Edit/Delete actions
- Execute button

---

### 4. UI Specifications

#### Test Case Card Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Priority Badge] [Type Badge]                    [Menu] │
│ Title of Test Case                                      │
│ ─────────────────────────────────────────────────────── │
│ Project: Project Name > Milestone > Task                │
│ Steps: 5 | Last Run: 2 days ago                        │
│ ─────────────────────────────────────────────────────── │
│ [Pass] [Fail] [Not Run]          [Execute] [View]      │
└─────────────────────────────────────────────────────────┘
```

#### Test Execution Modal
```
┌─────────────────────────────────────────────────────────┐
│ Execute Test Case                               [Close] │
│ ═══════════════════════════════════════════════════════ │
│ Title: Login with valid credentials                     │
│ ─────────────────────────────────────────────────────── │
│ STEPS:                                                  │
│ ☐ 1. Navigate to login page                            │
│ ☐ 2. Enter valid email                                 │
│ ☐ 3. Enter valid password                              │
│ ☐ 4. Click login button                                │
│ ─────────────────────────────────────────────────────── │
│ Expected Result:                                        │
│ User should be redirected to dashboard                  │
│ ─────────────────────────────────────────────────────── │
│ Status: [Pass ▼]                                       │
│ Notes: [                                          ]    │
│ Attachments: [+ Add Screenshot] [+ Add Video]          │
│ ─────────────────────────────────────────────────────── │
│           [Cancel]  [Report Bug]  [Submit Result]      │
└─────────────────────────────────────────────────────────┘
```

---

### 5. TypeScript Types

```typescript
// frontend/src/types/qa.types.ts

export interface TestCase {
  id: string;
  title: string;
  description?: string;
  steps: TestStep[];
  expectedResult: string;
  preconditions?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'MANUAL' | 'AUTOMATION';
  status: 'DRAFT' | 'ACTIVE' | 'DEPRECATED';
  taskId: string;
  projectId: string;
  milestoneId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  task?: Task;
  project?: Project;
  milestone?: Milestone;
  createdBy?: User;
  lastExecution?: TestExecution;
  _count?: {
    executions: number;
    bugs: number;
    attachments: number;
  };
}

export interface TestStep {
  step: string;
  expected: string;
}

export interface TestExecution {
  id: string;
  testCaseId: string;
  status: 'NOT_RUN' | 'PASS' | 'FAIL' | 'BLOCKED' | 'SKIPPED';
  notes?: string;
  executionTime?: number;
  runNumber: number;
  stepResults?: StepResult[];
  executedById: string;
  executedAt: string;
  executedBy?: User;
  attachments?: QAAttachment[];
}

export interface StepResult {
  stepIndex: number;
  passed: boolean;
  notes?: string;
}
```

---

### 6. Routes to Add

```typescript
// In App.tsx
<Route path="/qa/test-cases" element={<TestCasesPage />} />
<Route path="/qa/test-cases/new" element={<TestCaseFormPage />} />
<Route path="/qa/test-cases/:id" element={<TestCaseDetailPage />} />
<Route path="/qa/test-cases/:id/edit" element={<TestCaseFormPage />} />
```

---

## Success Criteria

- [ ] Can create test cases with step editor
- [ ] Can link test cases to existing tasks
- [ ] Can execute tests and record results
- [ ] Step-by-step execution tracking works
- [ ] Execution history is visible
- [ ] Can attach screenshots/videos to executions
- [ ] Filters and search work correctly
- [ ] UI matches existing design system
