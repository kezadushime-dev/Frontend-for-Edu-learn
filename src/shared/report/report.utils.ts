import type { ReportApproverRole, ReportRequest, ReportRequestStatus, ReportSubjectRow } from '../types/report';

type UnknownRecord = Record<string, unknown>;

const statusValues: ReadonlyArray<ReportRequestStatus> = ['PENDING', 'APPROVED', 'REJECTED'];

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? (value as UnknownRecord) : {};

const getString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};

const getNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const average = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((sum, current) => sum + current, 0) / values.length;
};

export const clampScore = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

export const normalizeRequestStatus = (value: unknown): ReportRequestStatus => {
  const normalized = getString(value)?.toUpperCase();
  return statusValues.includes(normalized as ReportRequestStatus) ? (normalized as ReportRequestStatus) : 'PENDING';
};

const normalizeApproverRole = (value: unknown): ReportApproverRole => {
  const normalized = getString(value)?.toUpperCase();
  if (normalized === 'ADMIN' || normalized === 'INSTRUCTOR') return normalized;
  return null;
};

const pickString = (record: UnknownRecord, keys: string[]): string | null => {
  for (const key of keys) {
    const value = getString(record[key]);
    if (value) return value;
  }
  return null;
};

const buildName = (record: UnknownRecord): string | null => {
  const direct = pickString(record, ['name', 'fullName', 'full_name', 'displayName', 'display_name']);
  if (direct) return direct;

  const first = pickString(record, ['firstName', 'first_name']) || '';
  const last = pickString(record, ['lastName', 'last_name']) || '';
  const full = `${first} ${last}`.trim();
  return full || null;
};

export const normalizeReportRequest = (value: unknown): ReportRequest => {
  const record = toRecord(value);
  const student = toRecord(record.student);
  const learner = toRecord(record.learner);
  const course = toRecord(record.course);
  const approver = toRecord(record.approver);
  const user = toRecord(record.user);
  const requestedBy = toRecord(record.requestedBy ?? record.requested_by);
  const createdBy = toRecord(record.createdBy ?? record.created_by);
  const studentFromId = toRecord(record.studentId ?? record.student_id);
  const learnerFromId = toRecord(record.learnerId ?? record.learner_id);
  const courseFromId = toRecord(record.courseId ?? record.course_id);
  const lesson = toRecord(record.lesson);
  const lessonFromId = toRecord(record.lessonId ?? record.lesson_id);
  const quiz = toRecord(record.quiz);
  const quizLesson = toRecord(quiz.lesson);
  const quizCourse = toRecord(quiz.course);

  const id = pickString(record, ['id', '_id', 'requestId', 'request_id']) || '';
  const studentId =
    pickString(record, ['studentId', 'student_id', 'learnerId', 'learner_id']) ||
    pickString(student, ['id', '_id', 'studentId', 'student_id']) ||
    pickString(learner, ['id', '_id', 'learnerId', 'learner_id']) ||
    pickString(studentFromId, ['id', '_id', 'studentId', 'student_id']) ||
    pickString(learnerFromId, ['id', '_id', 'learnerId', 'learner_id']) ||
    pickString(user, ['id', '_id']) ||
    pickString(requestedBy, ['id', '_id']) ||
    pickString(createdBy, ['id', '_id']) ||
    '';
  const studentName =
    pickString(record, ['studentName', 'student_name', 'learnerName', 'learner_name']) ||
    buildName(student) ||
    buildName(learner) ||
    buildName(studentFromId) ||
    buildName(learnerFromId) ||
    buildName(user) ||
    buildName(requestedBy) ||
    buildName(createdBy) ||
    studentId ||
    'Unknown Learner';
  const courseId =
    pickString(record, ['courseId', 'course_id']) ||
    pickString(course, ['id', '_id', 'courseId', 'course_id']) ||
    pickString(courseFromId, ['id', '_id', 'courseId', 'course_id']) ||
    pickString(record, ['lessonId', 'lesson_id']) ||
    pickString(lesson, ['id', '_id', 'lessonId', 'lesson_id']) ||
    pickString(lessonFromId, ['id', '_id', 'lessonId', 'lesson_id']) ||
    pickString(quizLesson, ['id', '_id', 'lessonId', 'lesson_id']) ||
    pickString(quizCourse, ['id', '_id', 'courseId', 'course_id']) ||
    '';
  const courseName =
    pickString(record, ['courseName', 'course_name']) ||
    pickString(course, ['name', 'title', 'courseName', 'course_name']) ||
    pickString(courseFromId, ['name', 'title', 'courseName', 'course_name']) ||
    pickString(record, ['lessonTitle', 'lesson_title']) ||
    pickString(lesson, ['name', 'title', 'lessonTitle', 'lesson_title']) ||
    pickString(lessonFromId, ['name', 'title', 'lessonTitle', 'lesson_title']) ||
    pickString(quizLesson, ['name', 'title', 'lessonTitle', 'lesson_title']) ||
    pickString(quizCourse, ['name', 'title', 'courseName', 'course_name']) ||
    pickString(quiz, ['title', 'quizTitle', 'quiz_title']) ||
    courseId ||
    'General Course';
  const approvedBy = pickString(record, ['approvedBy', 'approved_by', 'actionBy', 'action_by']) || pickString(approver, ['id', '_id']);
  const approvedByName =
    pickString(record, ['approvedByName', 'approved_by_name', 'actionByName', 'action_by_name', 'reviewedByName', 'reviewed_by_name']) ||
    pickString(approver, ['name', 'fullName', 'full_name']);
  const approvedByRole = normalizeApproverRole(
    record.approvedByRole ??
      record.approved_by_role ??
      record.actionByRole ??
      record.action_by_role ??
      record.reviewedByRole ??
      record.reviewed_by_role ??
      approver.role
  );
  const createdAt = pickString(record, ['createdAt', 'created_at', 'requestedAt', 'requested_at']);
  const updatedAt = pickString(record, ['updatedAt', 'updated_at', 'reviewedAt', 'reviewed_at']);

  return {
    id,
    studentId,
    studentName,
    courseId,
    courseName,
    status: normalizeRequestStatus(record.status),
    approvedBy,
    approvedByName,
    approvedByRole,
    createdAt,
    updatedAt
  };
};

export const normalizeRequestCollection = (raw: unknown): ReportRequest[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeReportRequest(item))
    .filter((item) => item.id || item.studentId || item.studentName !== 'Unknown Learner');
};

const resolveSubjectName = (item: UnknownRecord, index: number): string =>
  pickString(item, ['subject', 'module', 'lessonTitle', 'quizTitle', 'courseName', 'title', 'name']) ||
  `Subject ${index + 1}`;

const resolveBaseScore = (item: UnknownRecord): number => {
  const directFields = [
    'averageScore',
    'avgScore',
    'overallAverage',
    'percentage',
    'percent',
    'score',
    'total',
    'mean'
  ];
  for (const field of directFields) {
    const maybe = getNumber(item[field]);
    if (maybe !== null) return clampScore(maybe);
  }

  const passed = getNumber(item.passed);
  const attempts = getNumber(item.attempts);
  if (passed !== null && attempts !== null && attempts > 0) {
    return clampScore((passed / attempts) * 100);
  }

  const totalScore = getNumber(item.totalScore);
  const totalPossible = getNumber(item.totalPossible);
  if (totalScore !== null && totalPossible !== null && totalPossible > 0) {
    return clampScore((totalScore / totalPossible) * 100);
  }

  return 0;
};

const resolveTermScores = (item: UnknownRecord, index: number): { first: number; second: number; third: number } => {
  const first =
    getNumber(item.firstTerm) ??
    getNumber(item.term1) ??
    getNumber(item.first) ??
    getNumber(item.semester1) ??
    null;
  const second =
    getNumber(item.secondTerm) ??
    getNumber(item.term2) ??
    getNumber(item.second) ??
    getNumber(item.semester2) ??
    null;
  const third =
    getNumber(item.thirdTerm) ??
    getNumber(item.term3) ??
    getNumber(item.third) ??
    getNumber(item.semester3) ??
    null;

  if (first !== null && second !== null && third !== null) {
    return {
      first: clampScore(first),
      second: clampScore(second),
      third: clampScore(third)
    };
  }

  const base = resolveBaseScore(item);
  const drift = (index % 3) - 1;
  return {
    first: clampScore(base - 4 + drift),
    second: clampScore(base + drift),
    third: clampScore(base + 4 + drift)
  };
};

export const getGradeFromScore = (score: number): string => {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  return 'D';
};

export const getPerformanceLevel = (score: number): string => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Very Good';
  if (score >= 55) return 'Good';
  return 'Needs Improvement';
};

const aggregateSubjectRows = (
  groupedRows: Map<string, Array<{ first: number; second: number; third: number }>>
): ReportSubjectRow[] =>
  Array.from(groupedRows.entries()).map(([subject, values]) => {
    const firstTerm = clampScore(average(values.map((item) => item.first)));
    const secondTerm = clampScore(average(values.map((item) => item.second)));
    const thirdTerm = clampScore(average(values.map((item) => item.third)));
    const total = clampScore((firstTerm + secondTerm + thirdTerm) / 3);

    return {
      subject,
      firstTerm,
      secondTerm,
      thirdTerm,
      total,
      grade: getGradeFromScore(total)
    };
  });

export const buildSubjectRows = (analytics: unknown[], fallbackSubjects: string[] = []): ReportSubjectRow[] => {
  const groupedRows = new Map<string, Array<{ first: number; second: number; third: number }>>();

  analytics.forEach((entry, index) => {
    const item = toRecord(entry);
    const subject = resolveSubjectName(item, index);
    const terms = resolveTermScores(item, index);
    const existing = groupedRows.get(subject) || [];
    existing.push(terms);
    groupedRows.set(subject, existing);
  });

  if (!groupedRows.size) {
    fallbackSubjects.forEach((subject, index) => {
      const safeSubject = subject.trim() || `Subject ${index + 1}`;
      groupedRows.set(safeSubject, [{ first: 0, second: 0, third: 0 }]);
    });
  }

  return aggregateSubjectRows(groupedRows).sort((a, b) => a.subject.localeCompare(b.subject));
};

export const calculateOverallAverage = (subjects: ReportSubjectRow[]): number => {
  if (!subjects.length) return 0;
  return clampScore(average(subjects.map((subject) => subject.total)));
};

export const buildFeedbackComment = (subjects: ReportSubjectRow[], performanceLevel: string): string => {
  if (!subjects.length) {
    return 'No assessment data is available yet. Complete quizzes to generate your academic feedback.';
  }

  const strongest = [...subjects].sort((a, b) => b.total - a.total)[0];
  const weakest = [...subjects].sort((a, b) => a.total - b.total)[0];

  if (performanceLevel === 'Excellent') {
    return `The learner has shown strong progress in ${strongest.subject} and maintains outstanding consistency across subjects.`;
  }
  if (performanceLevel === 'Very Good') {
    return `The learner performs very well overall, especially in ${strongest.subject}. More revision in ${weakest.subject} can raise performance further.`;
  }
  if (performanceLevel === 'Good') {
    return `The learner demonstrates steady progress. Targeted practice in ${weakest.subject} will help move from good to very good performance.`;
  }
  return `The learner needs additional support, particularly in ${weakest.subject}. Focused weekly practice and instructor guidance are recommended.`;
};

export const formatReportDate = (value?: string | null): string => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

export const getSchoolYearLabel = (reference: Date = new Date()): string => {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  if (month >= 7) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
};
