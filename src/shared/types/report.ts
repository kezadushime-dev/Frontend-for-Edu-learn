export type ReportRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ReportApproverRole = 'ADMIN' | 'INSTRUCTOR' | null;

export type ReportRequest = {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  status: ReportRequestStatus;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedByRole: ReportApproverRole;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ReportDecision = Exclude<ReportRequestStatus, 'PENDING'>;

export type ReportSubjectRow = {
  subject: string;
  firstTerm: number;
  secondTerm: number;
  thirdTerm: number;
  total: number;
  grade: string;
};

export type LearnerReportSummary = {
  reportId: string;
  studentName: string;
  courseName: string;
  classLevel: string;
  schoolYear: string;
  generatedAt: string;
  overallAverage: number;
  performanceLevel: string;
  feedback: string;
  subjects: ReportSubjectRow[];
  request: ReportRequest | null;
};
