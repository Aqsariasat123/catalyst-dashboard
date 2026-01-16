# Phase 5: Reporting, Role-Based Access & Polish
**Status: PENDING**

---

## Overview
Reports generation, export functionality, role-based permissions, and final polish.

---

## Deliverables

### 1. Reporting System

#### Report Types

**Test Execution Report**
- Date range filter
- Project/Milestone filter
- Pass/Fail breakdown
- Detailed execution list
- Export to PDF/Excel

**Bug Summary Report**
- Open bugs by severity
- Bug aging (how long open)
- Resolution time metrics
- Assignee workload
- Export to PDF/Excel

**Sprint/Release Report**
- Milestone-based view
- Test coverage
- Quality gate status
- Blockers list

---

### 2. Export Functionality

#### Dependencies to Add
```json
{
  "jspdf": "^2.x",
  "jspdf-autotable": "^3.x",
  "xlsx": "^0.18.x"
}
```

#### Export Services
```typescript
// frontend/src/utils/export.ts

export const exportToPDF = async (reportData: ReportData, title: string): Promise<void>
export const exportToExcel = async (reportData: ReportData, title: string): Promise<void>
```

---

### 3. Report Components

```
frontend/src/components/qa/reports/
├── ReportFilters.tsx         # Date range, project, milestone
├── ExecutionReport.tsx       # Test execution report view
├── BugReport.tsx             # Bug summary report view
├── SprintReport.tsx          # Sprint/release report
├── ExportButtons.tsx         # PDF/Excel export buttons
└── ReportPreview.tsx         # Print-friendly preview
```

---

### 4. Report Pages

```
frontend/src/pages/qa/
├── ReportsPage.tsx           # Reports landing page
├── ExecutionReportPage.tsx   # Test execution report
├── BugReportPage.tsx         # Bug summary report
└── SprintReportPage.tsx      # Sprint/release report
```

---

### 5. Role-Based Access Control

#### Permission Matrix

| Feature | QA Tester | QA Lead | Project Manager | Client |
|---------|-----------|---------|-----------------|--------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ (own projects) |
| View Test Cases | ✓ | ✓ | ✓ | ✓ |
| Create Test Cases | ✓ | ✓ | ✓ | ✗ |
| Edit Test Cases | Own only | ✓ | ✓ | ✗ |
| Delete Test Cases | ✗ | ✓ | ✓ | ✗ |
| Execute Tests | ✓ | ✓ | ✓ | ✗ |
| View Bugs | ✓ | ✓ | ✓ | ✓ |
| Create Bugs | ✓ | ✓ | ✓ | ✗ |
| Update Bug Status | Assigned only | ✓ | ✓ | ✗ |
| Delete Bugs | ✗ | ✓ | ✓ | ✗ |
| View Reports | ✓ | ✓ | ✓ | ✓ |
| Export Reports | ✓ | ✓ | ✓ | ✓ |
| Manage QA Settings | ✗ | ✓ | ✓ | ✗ |

---

### 6. Backend Permission Middleware

```typescript
// backend/src/middleware/qa.middleware.ts

export const canManageTestCases = async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  if (['ADMIN', 'PROJECT_MANAGER'].includes(user.role)) {
    return next();
  }

  if (user.role === 'QC') {
    const testCase = await prisma.testCase.findUnique({ where: { id } });
    if (testCase?.createdById === user.id) {
      return next();
    }
  }

  return res.status(403).json({ error: 'Insufficient permissions' });
};

export const canManageBugs = async (req, res, next) => { ... };
export const canDeleteTestCases = async (req, res, next) => { ... };
```

---

### 7. Frontend Permission Hook

```typescript
// frontend/src/hooks/useQAPermissions.ts

export const useQAPermissions = () => {
  const { user } = useAuthStore();

  return {
    canViewDashboard: true,
    canViewTestCases: true,
    canCreateTestCase: ['ADMIN', 'PROJECT_MANAGER', 'QC'].includes(user?.role),
    canEditTestCase: (createdById: string) => {
      if (['ADMIN', 'PROJECT_MANAGER'].includes(user?.role)) return true;
      return user?.role === 'QC' && user?.userId === createdById;
    },
    canDeleteTestCase: ['ADMIN', 'PROJECT_MANAGER'].includes(user?.role),
    canExecuteTests: ['ADMIN', 'PROJECT_MANAGER', 'QC'].includes(user?.role),
    canCreateBug: ['ADMIN', 'PROJECT_MANAGER', 'QC'].includes(user?.role),
    canUpdateBugStatus: (assignedToId: string) => {
      if (['ADMIN', 'PROJECT_MANAGER'].includes(user?.role)) return true;
      return user?.userId === assignedToId;
    },
    canDeleteBug: ['ADMIN', 'PROJECT_MANAGER'].includes(user?.role),
    canExportReports: true,
  };
};
```

---

### 8. Automation Status Module (Optional)

#### Backend API
```typescript
// POST /api/qa/automation/runs - Record automation run
// GET /api/qa/automation/runs - List runs
// GET /api/qa/automation/stats - Get stats
```

#### Components
```
frontend/src/components/qa/automation/
├── AutomationOverview.tsx    # Summary cards
├── AutomationRunHistory.tsx  # List of runs
├── FailedTestList.tsx        # Failed tests from last run
└── CoverageChart.tsx         # Automation coverage
```

---

### 9. Performance Optimizations

- [ ] Implement pagination on all lists
- [ ] Add infinite scroll option
- [ ] Optimize queries with proper indexes
- [ ] Add loading skeletons
- [ ] Implement optimistic updates
- [ ] Add React Query caching

---

### 10. UX Improvements

- [ ] Keyboard shortcuts (Ctrl+N for new, etc.)
- [ ] Bulk actions on lists
- [ ] Drag-and-drop for attachments
- [ ] Quick filters and saved views
- [ ] Toast notifications for all actions
- [ ] Confirmation dialogs for destructive actions

---

### 11. Final Routes

```typescript
// QA Routes (in App.tsx)
<Route path="/qa" element={<QCRoute><QALayout /></QCRoute>}>
  <Route index element={<QADashboardOverview />} />
  <Route path="test-cases" element={<TestCasesPage />} />
  <Route path="test-cases/new" element={<TestCaseFormPage />} />
  <Route path="test-cases/:id" element={<TestCaseDetailPage />} />
  <Route path="test-cases/:id/edit" element={<TestCaseFormPage />} />
  <Route path="executions" element={<ExecutionsPage />} />
  <Route path="bugs" element={<BugsPage />} />
  <Route path="bugs/new" element={<BugFormPage />} />
  <Route path="bugs/:id" element={<BugDetailPage />} />
  <Route path="reports" element={<ReportsPage />} />
  <Route path="reports/execution" element={<ExecutionReportPage />} />
  <Route path="reports/bugs" element={<BugReportPage />} />
  <Route path="reports/sprint" element={<SprintReportPage />} />
  <Route path="automation" element={<AutomationPage />} />
</Route>
```

---

### 12. Sidebar Navigation Update

```
QA Dashboard
├── Overview
├── Test Cases
│   ├── All Test Cases
│   └── My Test Cases
├── Executions
├── Bugs
│   ├── All Bugs
│   └── Assigned to Me
├── Reports
│   ├── Execution Report
│   ├── Bug Report
│   └── Sprint Report
└── Automation (optional)
```

---

## Success Criteria

- [ ] All reports generate correctly
- [ ] PDF export works with proper formatting
- [ ] Excel export works with all data
- [ ] Role-based access is enforced (backend)
- [ ] UI shows/hides based on permissions
- [ ] Edit/Delete only available to authorized users
- [ ] Performance is acceptable (<2s page load)
- [ ] All UX improvements implemented
- [ ] No console errors
- [ ] Mobile responsive (bonus)
