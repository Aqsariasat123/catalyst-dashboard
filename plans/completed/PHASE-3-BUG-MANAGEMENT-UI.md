# Phase 3: Bug/Defect Management UI
**Status: PENDING**

---

## Overview
Complete bug lifecycle management with status workflow and activity timeline.

---

## Deliverables

### 1. Frontend Services

#### `bug.service.ts`
```typescript
export const bugService = {
  getAll(filters: BugFilters): Promise<PaginatedResponse<Bug>>,
  getById(id: string): Promise<Bug>,
  getByProject(projectId: string): Promise<Bug[]>,
  getByTestCase(testCaseId: string): Promise<Bug[]>,
  create(data: CreateBugData): Promise<Bug>,
  update(id: string, data: UpdateBugData): Promise<Bug>,
  updateStatus(id: string, status: BugStatus, comment?: string): Promise<Bug>,
  assign(id: string, userId: string): Promise<Bug>,
  delete(id: string): Promise<void>,
  addComment(id: string, comment: string): Promise<BugActivity>,
  getActivities(id: string): Promise<BugActivity[]>,
};
```

---

### 2. Components to Create

```
frontend/src/components/qa/
├── BugList.tsx               # Filterable list of bugs
├── BugCard.tsx               # Individual bug display
├── BugForm.tsx               # Create/Edit bug form
├── BugDetailModal.tsx        # Full bug detail modal
├── BugStatusFlow.tsx         # Visual status workflow
├── BugActivityTimeline.tsx   # Activity history
├── CreateBugFromFailure.tsx  # Create bug from failed test
└── BugFilters.tsx            # Filter bar
```

---

### 3. Pages to Create

#### `BugsPage.tsx`
- List view with filters (project, severity, status, assignee)
- Search functionality
- Kanban view option (by status)
- Quick status update
- Pagination

#### `BugDetailPage.tsx` (or Modal)
- Full bug information
- Linked test case and task
- Status workflow buttons
- Assignment dropdown
- Activity timeline
- Attachments with preview
- Comments section

---

### 4. UI Specifications

#### Bug Card Layout
```
┌─────────────────────────────────────────────────────────┐
│ BUG-123  [Critical]  [Open]                     [Menu]  │
│ Login button not working on Safari                      │
│ ─────────────────────────────────────────────────────── │
│ Project: E-Commerce App > Sprint 5 > User Auth          │
│ Reported by: John Doe | 2 hours ago                     │
│ Assigned to: Jane Smith                                 │
│ ─────────────────────────────────────────────────────── │
│ 📎 2 attachments                                        │
│                              [View] [Update Status]     │
└─────────────────────────────────────────────────────────┘
```

#### Bug Status Flow Visualization
```
[Open] → [In Progress] → [Fixed] → [Retest] → [Closed]
                              ↑         ↓
                              ← [Reopened] ←
```

#### Bug Detail Modal
```
┌─────────────────────────────────────────────────────────────┐
│ BUG-123: Login button not working                   [Close] │
│ ═══════════════════════════════════════════════════════════ │
│ [Critical] [Open]                    Assigned: Jane Smith ▼ │
│ ─────────────────────────────────────────────────────────── │
│ DESCRIPTION:                                                │
│ The login button is not responding when clicked...          │
│ ─────────────────────────────────────────────────────────── │
│ STEPS TO REPRODUCE:                                         │
│ 1. Go to login page                                         │
│ 2. Enter credentials                                        │
│ 3. Click login button                                       │
│ ─────────────────────────────────────────────────────────── │
│ Environment: Safari 17, macOS Sonoma                        │
│ Expected: User should be logged in                          │
│ Actual: Nothing happens                                     │
│ ─────────────────────────────────────────────────────────── │
│ ATTACHMENTS:                                                │
│ [screenshot1.png] [video.mp4]                               │
│ ─────────────────────────────────────────────────────────── │
│ STATUS ACTIONS:                                             │
│ [Start Work] [Mark Fixed] [Close] [Reopen]                  │
│ ─────────────────────────────────────────────────────────── │
│ ACTIVITY:                                                   │
│ • John created this bug (2h ago)                            │
│ • Assigned to Jane (1h ago)                                 │
│ • Jane: "Looking into this" (30m ago)                       │
│ ─────────────────────────────────────────────────────────── │
│ Add Comment: [                              ] [Post]        │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Bug Creation from Failed Test

When a test execution fails, provide quick bug creation:
- Auto-populate title from test case name + "Failed"
- Link test case automatically
- Link task automatically
- Copy test steps to "Steps to Reproduce"
- Attach any failure screenshots from execution
- Pre-fill expected result from test case

---

### 6. TypeScript Types

```typescript
export interface Bug {
  id: string;
  bugNumber: number;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'RETEST' | 'CLOSED' | 'REOPENED';
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
  // Relations
  testCase?: TestCase;
  task?: Task;
  project?: Project;
  reportedBy?: User;
  assignedTo?: User;
  resolvedBy?: User;
  attachments?: QAAttachment[];
  activities?: BugActivity[];
}

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
  user?: User;
}
```

---

### 7. Routes to Add

```typescript
<Route path="/qa/bugs" element={<BugsPage />} />
<Route path="/qa/bugs/new" element={<BugFormPage />} />
<Route path="/qa/bugs/:id" element={<BugDetailPage />} />
```

---

## Success Criteria

- [ ] Can create bugs manually
- [ ] Can create bugs from failed test executions
- [ ] Bug status workflow is complete and visual
- [ ] Bug assignment works
- [ ] Activity timeline shows all changes
- [ ] Comments can be added
- [ ] Attachments are visible with preview
- [ ] Filters and search work correctly
- [ ] Kanban view works (optional)
