# EduLearn Frontend

React + TypeScript frontend for EduLearn with role-based dashboards and a report-card download permission workflow.

## Quick Start

```bash
npm install
npm run dev
```

Optional checks:

```bash
npm run build
npm run test:reports
```

## Report Card Permission Workflow

### Learner Flow
- Route: `/learner/report-card` (also `/report-card`)
- Pulls quiz analytics from `GET /api/v1/quizzes/analytics`
- Shows a report preview with:
  - Student info
  - Academic performance table (Subject, 1st/2nd/3rd Term, Total, Grade)
  - Overall average and performance level
  - Feedback section
  - Approval section (approver name/role/date)
- Request action:
  - `PATCH /api/v1/reports/request-download`
- Download action (only if approved):
  - `GET /api/v1/reports/download`

### Instructor/Admin Flow
- Instructor route: `/instructor/report-requests`
- Admin route: `/admin/report-requests`
- Required table columns implemented:
  - Student
  - Course
  - Date
  - Status
  - Action
- Actions:
  - Approve
  - Reject
- Sync behavior:
  - Polls every 12 seconds
  - Updates are persisted through backend API and reflected across both roles
  - Finalized requests are not re-treated as pending

## API Integration

Implemented in `src/shared/services/report.api.ts`:

- `requestDownload()` -> `PATCH /reports/request-download`
- `downloadApprovedReport()` -> `GET /reports/download`
- `getLearnerRequest()` -> learner current request status
- `listRequests()` -> admin/instructor request queue
- `decideRequest()` -> approve/reject request

The service includes endpoint fallbacks for backend variants and normalizes response payloads.

## Frontend Modules Added

- `src/features/learner/pages/LearnerReportPage.tsx`
- `src/features/instructor/pages/InstructorReportRequestsPage.tsx`
- `src/features/admin/pages/AdminReportRequestsPage.tsx`
- `src/components/ReportStatusBadge.tsx`
- `src/components/ReportRequestTable.tsx`
- `src/shared/services/report.api.ts`
- `src/shared/report/report.utils.ts`
- `src/shared/types/report.ts`

Routes are wired in:
- `src/features/learner/routes.ts`
- `src/features/instructor/routes.ts`
- `src/features/admin/routes.ts`

## DB Schema / Model Contract

Backend should persist request and generated report records (Mongo or SQL equivalent).
Reference files included:
- `docs/report-schema.sql`
- `docs/report-schema.mongodb.js`

### `report_requests`
- `id` (string/uuid)
- `studentId` (string)
- `courseId` (string)
- `status` (`PENDING` | `APPROVED` | `REJECTED`)
- `approvedBy` (nullable string)
- `approvedByName` (nullable string)
- `approvedByRole` (`ADMIN` | `INSTRUCTOR`, nullable)
- `createdAt` (date)
- `updatedAt` (date)

### `reports`
- `id` (string/uuid)
- `studentId` (string)
- `courseId` (string)
- `analyticsSnapshot` (JSON)
- `overallAverage` (number)
- `performanceLevel` (string)
- `approvedBy` (string)
- `approvalDate` (date)
- `generatedAt` (date)

## Backend Behavior Required

The frontend expects backend rules:

- Learner cannot download unless request status is `APPROVED`.
- Instructor/Admin can approve or reject.
- Once approved/rejected by one role, it is not pending for the other role.
- Approver identity and timestamp are returned in API responses.
- `GET /reports/download` returns report file only when approved.
- Store analytics snapshot at generation time for audit consistency.

## Basic Tests

Added Node tests for approval and permission logic:

- `tests/report-workflow.test.mjs`

Run:

```bash
npm run test:reports
```
