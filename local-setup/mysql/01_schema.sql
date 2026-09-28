-- ============================================================
-- College ERP — MySQL Schema (Local Development)
-- ============================================================
-- Database name: college_erp
-- MySQL version: 8.0+
-- Charset: utf8mb4
-- ============================================================

DROP DATABASE IF EXISTS college_erp;
CREATE DATABASE college_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE college_erp;

-- ============================================================
-- 1. USERS & ROLES
-- ============================================================

CREATE TABLE users (
  id            CHAR(36) PRIMARY KEY,            -- UUID
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,           -- bcrypt hash
  full_name     VARCHAR(160),
  phone         VARCHAR(20),
  avatar_url    VARCHAR(500),
  is_active     TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
  id      CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  role    ENUM('super_admin','principal','hod','faculty','accountant','librarian','placement_officer','student') NOT NULL,
  UNIQUE KEY uq_user_role (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 2. ORG STRUCTURE — departments, programs, batches
-- ============================================================

CREATE TABLE departments (
  id                CHAR(36) PRIMARY KEY,
  code              VARCHAR(20) NOT NULL UNIQUE,
  name              VARCHAR(160) NOT NULL,
  description       TEXT,
  established_year  INT,
  hod_id            CHAR(36),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hod_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE programs (
  id              CHAR(36) PRIMARY KEY,
  code            VARCHAR(20) NOT NULL UNIQUE,
  name            VARCHAR(160) NOT NULL,
  degree_type     VARCHAR(40),                   -- B.Tech, M.Tech, BBA, MBA, etc.
  duration_years  INT DEFAULT 4,
  department_id   CHAR(36),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE batches (
  id                CHAR(36) PRIMARY KEY,
  name              VARCHAR(80) NOT NULL,        -- e.g. "CSE 2024-28"
  start_year        INT NOT NULL,
  end_year          INT NOT NULL,
  program_id        CHAR(36),
  current_semester  INT DEFAULT 1,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL
);

-- ============================================================
-- 3. STUDENTS
-- ============================================================

CREATE TABLE students (
  id                CHAR(36) PRIMARY KEY,
  enrollment_no     VARCHAR(40) NOT NULL UNIQUE,
  roll_no           VARCHAR(40),
  user_id           CHAR(36),                    -- linked login account (optional)
  first_name        VARCHAR(80) NOT NULL,
  last_name         VARCHAR(80) NOT NULL,
  email             VARCHAR(160) NOT NULL,
  phone             VARCHAR(20),
  gender            ENUM('male','female','other'),
  date_of_birth     DATE,
  category          VARCHAR(20),                 -- General / OBC / SC / ST
  guardian_name     VARCHAR(120),
  guardian_phone    VARCHAR(20),
  address           TEXT,
  photo_url         VARCHAR(500),
  department_id     CHAR(36),
  program_id        CHAR(36),
  batch_id          CHAR(36),
  current_semester  INT DEFAULT 1,
  cgpa              DECIMAL(4,2) DEFAULT 0.00,
  attendance_pct    DECIMAL(5,2) DEFAULT 0.00,
  status            ENUM('active','graduated','dropped','suspended') DEFAULT 'active',
  admission_date    DATE,
  created_by        CHAR(36),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (program_id)    REFERENCES programs(id) ON DELETE SET NULL,
  FOREIGN KEY (batch_id)      REFERENCES batches(id) ON DELETE SET NULL
);

-- ============================================================
-- 4. ACADEMICS — courses, offerings, timetable
-- ============================================================

CREATE TABLE courses (
  id            CHAR(36) PRIMARY KEY,
  code          VARCHAR(20) NOT NULL UNIQUE,
  title         VARCHAR(160) NOT NULL,
  description   TEXT,
  credits       INT DEFAULT 3,
  department_id CHAR(36),
  program_id    CHAR(36),
  semester      INT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (program_id)    REFERENCES programs(id) ON DELETE SET NULL
);

CREATE TABLE course_offerings (
  id            CHAR(36) PRIMARY KEY,
  course_id     CHAR(36) NOT NULL,
  batch_id      CHAR(36),
  section       VARCHAR(8) DEFAULT 'A',
  academic_year VARCHAR(20) NOT NULL,            -- "2025-26"
  term          VARCHAR(20),                     -- "Fall" / "Spring"
  faculty_id    CHAR(36),
  room          VARCHAR(40),
  capacity      INT DEFAULT 60,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id)   REFERENCES batches(id) ON DELETE SET NULL,
  FOREIGN KEY (faculty_id) REFERENCES users(id)   ON DELETE SET NULL
);

CREATE TABLE timetable_slots (
  id           CHAR(36) PRIMARY KEY,
  offering_id  CHAR(36) NOT NULL,
  day_of_week  TINYINT NOT NULL,                 -- 0=Sun .. 6=Sat
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  room         VARCHAR(40),
  FOREIGN KEY (offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. ATTENDANCE
-- ============================================================

CREATE TABLE attendance_sessions (
  id           CHAR(36) PRIMARY KEY,
  offering_id  CHAR(36) NOT NULL,
  session_date DATE NOT NULL,
  period       INT,
  topic        VARCHAR(200),
  taken_by     CHAR(36),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
  FOREIGN KEY (taken_by)    REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE attendance_records (
  id         CHAR(36) PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  student_id CHAR(36) NOT NULL,
  status     ENUM('present','absent','late','excused') DEFAULT 'present',
  remarks    VARCHAR(200),
  UNIQUE KEY uq_session_student (session_id, student_id),
  FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ============================================================
-- 6. EXAMS & MARKS
-- ============================================================

CREATE TABLE exams (
  id          CHAR(36) PRIMARY KEY,
  offering_id CHAR(36) NOT NULL,
  name        VARCHAR(120) NOT NULL,
  exam_type   VARCHAR(40) DEFAULT 'midterm',     -- midterm / final / quiz / assignment
  exam_date   DATE,
  max_marks   DECIMAL(6,2) DEFAULT 100,
  weightage   DECIMAL(5,2) DEFAULT 100,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
);

CREATE TABLE exam_marks (
  id          CHAR(36) PRIMARY KEY,
  exam_id     CHAR(36) NOT NULL,
  student_id  CHAR(36) NOT NULL,
  marks       DECIMAL(6,2) NOT NULL,
  grade       VARCHAR(4),
  remarks     VARCHAR(200),
  UNIQUE KEY uq_exam_student (exam_id, student_id),
  FOREIGN KEY (exam_id)    REFERENCES exams(id)    ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ============================================================
-- 7. FEES
-- ============================================================

CREATE TABLE fee_invoices (
  id             CHAR(36) PRIMARY KEY,
  student_id     CHAR(36) NOT NULL,
  invoice_number VARCHAR(40) NOT NULL UNIQUE,
  amount_due     DECIMAL(12,2) NOT NULL,
  amount_paid    DECIMAL(12,2) DEFAULT 0,
  status         ENUM('pending','partial','paid','cancelled') DEFAULT 'pending',
  due_date       DATE,
  issued_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE fee_payments (
  id             CHAR(36) PRIMARY KEY,
  invoice_id     CHAR(36) NOT NULL,
  amount         DECIMAL(12,2) NOT NULL,
  method         VARCHAR(40) DEFAULT 'cash',     -- cash / card / upi / bank_transfer
  reference      VARCHAR(80),
  receipt_number VARCHAR(40) NOT NULL,
  recorded_by    CHAR(36),
  paid_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id)  REFERENCES fee_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 8. LIBRARY
-- ============================================================

CREATE TABLE library_books (
  id                CHAR(36) PRIMARY KEY,
  title             VARCHAR(240) NOT NULL,
  author            VARCHAR(160),
  isbn              VARCHAR(20),
  publisher         VARCHAR(120),
  category          VARCHAR(80),
  edition           VARCHAR(40),
  total_copies      INT DEFAULT 1,
  available_copies  INT DEFAULT 1,
  shelf_location    VARCHAR(40),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE library_loans (
  id          CHAR(36) PRIMARY KEY,
  book_id     CHAR(36) NOT NULL,
  student_id  CHAR(36) NOT NULL,
  issued_by   CHAR(36),
  issued_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_at      TIMESTAMP NOT NULL,
  returned_at TIMESTAMP NULL,
  fine_amount DECIMAL(8,2) DEFAULT 0,
  FOREIGN KEY (book_id)    REFERENCES library_books(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id)      ON DELETE CASCADE,
  FOREIGN KEY (issued_by)  REFERENCES users(id)         ON DELETE SET NULL
);

-- ============================================================
-- 9. PLACEMENTS
-- ============================================================

CREATE TABLE placement_companies (
  id            CHAR(36) PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  industry      VARCHAR(80),
  website       VARCHAR(240),
  contact_email VARCHAR(160),
  contact_phone VARCHAR(20),
  logo_url      VARCHAR(500),
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE placement_drives (
  id                CHAR(36) PRIMARY KEY,
  company_id        CHAR(36) NOT NULL,
  job_title         VARCHAR(120) NOT NULL,
  job_description   TEXT,
  ctc_lpa           DECIMAL(8,2),                -- Lakhs Per Annum
  location          VARCHAR(120),
  eligibility_cgpa  DECIMAL(4,2) DEFAULT 0,
  drive_date        DATE,
  status            ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES placement_companies(id) ON DELETE CASCADE
);

CREATE TABLE placement_applications (
  id           CHAR(36) PRIMARY KEY,
  drive_id     CHAR(36) NOT NULL,
  student_id   CHAR(36) NOT NULL,
  status       ENUM('applied','shortlisted','interviewed','offered','rejected','accepted') DEFAULT 'applied',
  applied_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_drive_student (drive_id, student_id),
  FOREIGN KEY (drive_id)   REFERENCES placement_drives(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id)         ON DELETE CASCADE
);

-- ============================================================
-- 10. COMMUNICATIONS
-- ============================================================

CREATE TABLE announcements (
  id          CHAR(36) PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  audience    VARCHAR(40) DEFAULT 'all',         -- all / students / faculty / staff
  priority    ENUM('low','normal','high','urgent') DEFAULT 'normal',
  publish_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at  TIMESTAMP NULL,
  created_by  CHAR(36),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 11. AUDIT LOG
-- ============================================================

CREATE TABLE audit_log (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36),
  action      VARCHAR(80) NOT NULL,              -- create / update / delete / login
  entity_type VARCHAR(80) NOT NULL,
  entity_id   CHAR(36),
  metadata    JSON,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- Helpful indexes
-- ============================================================
CREATE INDEX idx_students_dept   ON students(department_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_attendance_date ON attendance_sessions(session_date);
CREATE INDEX idx_invoices_status ON fee_invoices(status);
CREATE INDEX idx_audit_created   ON audit_log(created_at);
