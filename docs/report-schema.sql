-- SQL schema for EduLearn report download permission workflow

CREATE TABLE IF NOT EXISTS report_requests (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  status VARCHAR(16) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  approved_by VARCHAR(64) NULL,
  approved_by_name VARCHAR(255) NULL,
  approved_by_role VARCHAR(16) NULL CHECK (approved_by_role IN ('ADMIN', 'INSTRUCTOR')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  analytics_snapshot JSON NOT NULL,
  overall_average DECIMAL(5,2) NOT NULL,
  performance_level VARCHAR(64) NOT NULL,
  approved_by VARCHAR(64) NOT NULL,
  approval_date TIMESTAMP NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_report_requests_student_course ON report_requests(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_report_requests_status ON report_requests(status);
