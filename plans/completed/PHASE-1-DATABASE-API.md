# Phase 1: Database Schema & Core API Foundation
**Status: COMPLETED**
**Completed Date: 2026-01-16**

---

## Overview
Build the data layer and basic CRUD operations for the QA module.

---

## Deliverables

### 1. Database Schema (Prisma)

#### New Enums Added:
- `TestCaseStatus` - DRAFT, ACTIVE, DEPRECATED
- `TestCasePriority` - CRITICAL, HIGH, MEDIUM, LOW
- `TestCaseType` - MANUAL, AUTOMATION
- `ExecutionStatus` - NOT_RUN, PASS, FAIL, BLOCKED, SKIPPED
- `BugSeverity` - CRITICAL, HIGH, MEDIUM, LOW
- `BugStatus` - OPEN, IN_PROGRESS, FIXED, RETEST, CLOSED, REOPENED
- `QAAttachmentType` - IMAGE, VIDEO, DOCUMENT, OTHER

#### New Models Created:
| Model | Location | Description |
|-------|----------|-------------|
| `TestCase` | `prisma/schema.prisma:910` | Test cases linked to Task, Project, Milestone |
| `TestExecution` | `prisma/schema.prisma:949` | Test run history with step results |
| `Bug` | `prisma/schema.prisma:981` | Bug tracking with full lifecycle |
| `BugActivity` | `prisma/schema.prisma:1040` | Audit trail for bug changes |
| `QAAttachment` | `prisma/schema.prisma:1060` | Polymorphic attachments |
| `AutomationRun` | `prisma/schema.prisma:1090` | Automation test tracking |

#### Updated Models:
- `User` - Added QA relations (createdTestCases, testExecutions, reportedBugs, etc.)
- `Project` - Added testCases, bugs, automationRuns relations
- `Milestone` - Added testCases, testExecutions, bugs relations
- `Task` - Added testCases, bugs relations

---

### 2. Backend Services Created

| Service | File | Purpose |
|---------|------|---------|
| TestCaseService | `src/services/testCase.service.ts` | CRUD + stats for test cases |
| TestExecutionService | `src/services/testExecution.service.ts` | Execution management + trends |
| BugService | `src/services/bug.service.ts` | Bug lifecycle + activity logging |
| QAAttachmentService | `src/services/qaAttachment.service.ts` | File upload/download |
| QADashboardService | `src/services/qaDashboard.service.ts` | Aggregated dashboard data |

---

### 3. Backend Controllers Created

| Controller | File |
|------------|------|
| TestCaseController | `src/controllers/testCase.controller.ts` |
| TestExecutionController | `src/controllers/testExecution.controller.ts` |
| BugController | `src/controllers/bug.controller.ts` |
| QAAttachmentController | `src/controllers/qaAttachment.controller.ts` |
| QADashboardController | `src/controllers/qaDashboard.controller.ts` |

---

### 4. API Routes (`/api/qa/...`)

#### Dashboard Endpoints:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Overall QA dashboard data |
| GET | `/dashboard/projects` | Project-wise QA stats |
| GET | `/dashboard/activity` | Recent QA activity |
| GET | `/dashboard/milestone/:id` | Milestone QA stats |
| GET | `/dashboard/automation` | Automation stats |

#### Test Case Endpoints:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/test-cases` | List with filters & pagination |
| GET | `/test-cases/:id` | Get by ID with full details |
| GET | `/test-cases/stats` | Statistics |
| GET | `/test-cases/task/:taskId` | Get by task |
| GET | `/test-cases/project/:projectId` | Get by project |
| POST | `/test-cases` | Create test case |
| PATCH | `/test-cases/:id` | Update test case |
| DELETE | `/test-cases/:id` | Delete test case |

#### Test Execution Endpoints:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/executions` | List executions |
| GET | `/executions/:id` | Get by ID |
| GET | `/executions/stats` | Execution statistics |
| GET | `/executions/trend` | Trend data |
| GET | `/executions/history/:testCaseId` | Execution history |
| POST | `/executions` | Execute test |
| POST | `/executions/bulk` | Bulk execute |
| PATCH | `/executions/:id` | Update result |

#### Bug Endpoints:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bugs` | List with filters |
| GET | `/bugs/:id` | Get by ID with activities |
| GET | `/bugs/stats` | Bug statistics |
| GET | `/bugs/trend` | Bug trend data |
| GET | `/bugs/project/:projectId` | Get by project |
| GET | `/bugs/test-case/:testCaseId` | Get by test case |
| POST | `/bugs` | Create bug |
| PATCH | `/bugs/:id` | Update bug |
| POST | `/bugs/:id/status` | Update status |
| POST | `/bugs/:id/assign` | Assign to user |
| POST | `/bugs/:id/comments` | Add comment |
| DELETE | `/bugs/:id` | Delete bug |

#### Attachment Endpoints:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/attachments/upload` | Upload single file |
| POST | `/attachments/upload-multiple` | Upload multiple (max 5) |
| GET | `/attachments/:id` | Get metadata |
| GET | `/attachments/:id/serve` | Serve file inline |
| GET | `/attachments/:id/download` | Download file |
| GET | `/attachments/test-case/:id` | Get by test case |
| GET | `/attachments/execution/:id` | Get by execution |
| GET | `/attachments/bug/:id` | Get by bug |
| DELETE | `/attachments/:id` | Delete attachment |

---

### 5. File Upload Configuration

Updated `src/middleware/upload.ts`:
- Added `uploads/qa/` directory
- Supports: JPEG, PNG, GIF, WebP, SVG, MP4, WebM, MOV, AVI, PDF
- Max file size: 50MB (for videos)
- Max files per upload: 5

---

## Files Modified/Created

### Created:
- `src/services/testCase.service.ts`
- `src/services/testExecution.service.ts`
- `src/services/bug.service.ts`
- `src/services/qaAttachment.service.ts`
- `src/services/qaDashboard.service.ts`
- `src/controllers/testCase.controller.ts`
- `src/controllers/testExecution.controller.ts`
- `src/controllers/bug.controller.ts`
- `src/controllers/qaAttachment.controller.ts`
- `src/controllers/qaDashboard.controller.ts`
- `src/routes/qa.routes.ts`

### Modified:
- `prisma/schema.prisma` - Added QA models and relations
- `src/middleware/upload.ts` - Added QA upload config
- `src/routes/index.ts` - Registered QA routes

---

## Testing

All endpoints tested and verified:
```bash
# Dashboard
curl /api/qa/dashboard ✓

# Test Cases
curl /api/qa/test-cases ✓

# Bugs
curl /api/qa/bugs ✓

# Executions
curl /api/qa/executions ✓
```

---

## Notes
- All APIs require JWT authentication
- QC role required for create/update/delete operations
- Admin role required for delete operations
- Bug activities are automatically logged
- Task.hasBugs flag is automatically updated
