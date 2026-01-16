# Phase 4: Attachment System & QA Dashboard Overview
**Status: PENDING**

---

## Overview
File handling system and main QA dashboard with analytics and visualizations.

---

## Deliverables

### 1. Attachment Components

```
frontend/src/components/qa/
├── AttachmentUploader.tsx    # Drag & drop upload component
├── AttachmentPreview.tsx     # Image/Video preview thumbnail
├── AttachmentGallery.tsx     # Grid of attachments
└── AttachmentViewer.tsx      # Full-screen viewer modal
```

#### AttachmentUploader Component
Features:
- Drag & drop zone
- File type validation
- Progress indicator
- Multiple file support
- Size limit display

#### AttachmentViewer Component
Features:
- Full-screen modal
- Image zoom/pan
- Video player with controls
- Navigation between attachments
- Download button

---

### 2. Frontend Services

#### `qaAttachment.service.ts`
```typescript
export const qaAttachmentService = {
  upload(file: File, context: AttachmentContext): Promise<QAAttachment>,
  uploadMultiple(files: File[], context: AttachmentContext): Promise<QAAttachment[]>,
  delete(id: string): Promise<void>,
  getPreviewUrl(id: string): string,
  getDownloadUrl(id: string): string,
};
```

#### `qaDashboard.service.ts`
```typescript
export const qaDashboardService = {
  getDashboard(projectId?: string): Promise<QADashboardData>,
  getProjectStats(): Promise<ProjectQAStats[]>,
  getRecentActivity(limit?: number): Promise<QAActivity[]>,
  getMilestoneStats(milestoneId: string): Promise<MilestoneQAStats>,
  getAutomationStats(projectId?: string): Promise<AutomationStats>,
};
```

---

### 3. QA Dashboard Overview Page

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ QA Dashboard                              [Export] [Date Range ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│ │  OVERALL    │ │ Test Cases  │ │ Pass Rate   │ │ Open Bugs   │    │
│ │  ✓ READY    │ │    156      │ │   87.5%     │ │     12      │    │
│ │             │ │ +5 this wk  │ │ ↑ 3.2%      │ │ 3 critical  │    │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                                     │
│ ┌──────────────────────────────────┐ ┌────────────────────────────┐│
│ │ Test Execution Trend             │ │ Bug Severity Distribution  ││
│ │                                  │ │                            ││
│ │    [Line Chart - Pass/Fail]      │ │    [Donut Chart]           ││
│ │                                  │ │                            ││
│ └──────────────────────────────────┘ └────────────────────────────┘│
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ Project-wise QA Health                                           ││
│ │ ┌────────────────────────────────────────────────────────────┐  ││
│ │ │ Project A    [████████████░░░░] 78%  │ 45 TC │ 5 bugs │ ✓  │  ││
│ │ │ Project B    [██████████████░░] 92%  │ 32 TC │ 2 bugs │ ✓  │  ││
│ │ │ Project C    [████████░░░░░░░░] 54%  │ 28 TC │ 8 bugs │ ⚠  │  ││
│ │ └────────────────────────────────────────────────────────────┘  ││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────┐ ┌──────────────────────────────────┐│
│ │ Recent Test Executions      │ │ Critical/High Bugs               ││
│ │ ─────────────────────────── │ │ ────────────────────────────────  ││
│ │ ✓ Login Test        2m ago  │ │ 🔴 BUG-45 Payment failing        ││
│ │ ✗ Checkout Test    15m ago  │ │ 🟠 BUG-42 Form validation        ││
│ │ ✓ Search Test      30m ago  │ │ 🟠 BUG-38 API timeout            ││
│ └─────────────────────────────┘ └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

### 4. Dashboard Metrics

```typescript
interface QADashboardData {
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
  };

  bugs: {
    total: number;
    open: number;
    criticalHighOpen: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
  };

  trends: {
    executions: TrendData[];
    bugs: TrendData[];
  };

  projectStats: ProjectQAStats[];
}
```

---

### 5. Components to Create

```
frontend/src/components/qa/dashboard/
├── QAOverviewStats.tsx       # Top metric cards
├── QAStatusBadge.tsx         # READY/AT_RISK/NOT_READY badge
├── ExecutionTrendChart.tsx   # Line chart for executions
├── BugSeverityChart.tsx      # Donut chart for bug severity
├── ProjectHealthList.tsx     # Project-wise progress bars
├── RecentExecutionsList.tsx  # Recent test runs
├── CriticalBugsList.tsx      # Critical/High bug list
└── QAActivityFeed.tsx        # Recent activity timeline
```

---

### 6. Chart Implementation

Use existing chart library pattern or add:
- recharts or chart.js (check existing dependencies)
- Line chart for execution trends
- Donut/Pie chart for bug severity
- Progress bars for project health

---

### 7. Pages

#### `QADashboardOverviewPage.tsx`
Main dashboard with all widgets and charts.

---

### 8. TypeScript Types

```typescript
export interface QAAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  uploadedById: string;
  uploadedBy?: User;
  createdAt: string;
}

export interface AttachmentContext {
  testCaseId?: string;
  testExecutionId?: string;
  bugId?: string;
}

export interface TrendData {
  date: string;
  pass?: number;
  fail?: number;
  blocked?: number;
  total?: number;
  opened?: number;
  closed?: number;
  critical?: number;
  high?: number;
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
```

---

## Success Criteria

- [ ] Can upload attachments via drag & drop
- [ ] File type validation works
- [ ] Image preview works
- [ ] Video playback works
- [ ] Full-screen viewer works
- [ ] Dashboard shows all metrics
- [ ] Charts render correctly
- [ ] Project health indicators work
- [ ] Recent activity shows real-time data
- [ ] Date range filter works
