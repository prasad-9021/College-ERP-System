-- ============================================================
-- College ERP — Example/Seed Data for local testing
-- ============================================================
-- Run AFTER 01_schema.sql
-- Default password for all users below: "password123"
-- bcrypt hash used: $2b$10$8K1p/a0dCVZJjqW0Z3y2Q.uZc7m1xKQp8u7Bz9XdC0LpYbR4nQqSm
-- (In production, generate fresh hashes with bcrypt.)
-- ============================================================

USE college_erp;

-- ---------- USERS ----------
INSERT INTO users (id, email, password_hash, full_name, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@college.edu',     '$2b$10$8K1p/a0dCVZJjqW0Z3y2Q.uZc7m1xKQp8u7Bz9XdC0LpYbR4nQqSm', 'System Admin',     '9000000001'),
  ('22222222-2222-2222-2222-222222222222', 'principal@college.edu', '$2b$10$8K1p/a0dCVZJjqW0Z3y2Q.uZc7m1xKQp8u7Bz9XdC0LpYbR4nQqSm', 'Dr. R. Sharma',    '9000000002'),
  ('33333333-3333-3333-3333-333333333333', 'hod.cse@college.edu',   '$2b$10$8K1p/a0dCVZJjqW0Z3y2Q.uZc7m1xKQp8u7Bz9XdC0LpYbR4nQqSm', 'Dr. A. Verma',     '9000000003'),
  ('44444444-4444-4444-4444-444444444444', 'faculty1@college.edu',  '$2b$10$8K1p/a0dCVZJjqW0Z3y2Q.uZc7m1xKQp8u7Bz9XdC0LpYbR4nQqSm', 'Prof. S. Iyer',    '9000000004'),
  ('55555555-5555-5555-5555-555555555555', 'librarian@college.edu', '$2b$10$8K1p/a0dCVZJjqW0Z3y2Q.uZc7m1xKQp8u7Bz9XdC0LpYbR4nQqSm', 'Ms. P. Nair',      '9000000005');

-- ---------- ROLES ----------
INSERT INTO user_roles (id, user_id, role) VALUES
  (UUID(), '11111111-1111-1111-1111-111111111111', 'super_admin'),
  (UUID(), '22222222-2222-2222-2222-222222222222', 'principal'),
  (UUID(), '33333333-3333-3333-3333-333333333333', 'hod'),
  (UUID(), '44444444-4444-4444-4444-444444444444', 'faculty'),
  (UUID(), '55555555-5555-5555-5555-555555555555', 'librarian');

-- ---------- DEPARTMENTS ----------
INSERT INTO departments (id, code, name, established_year, hod_id) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'CSE', 'Computer Science & Engineering', 1995, '33333333-3333-3333-3333-333333333333'),
  ('d0000002-0000-0000-0000-000000000002', 'ECE', 'Electronics & Communication',    1998, NULL),
  ('d0000003-0000-0000-0000-000000000003', 'ME',  'Mechanical Engineering',         1990, NULL);

-- ---------- PROGRAMS ----------
INSERT INTO programs (id, code, name, degree_type, duration_years, department_id) VALUES
  ('p0000001-0000-0000-0000-000000000001', 'BTCSE', 'B.Tech Computer Science',  'B.Tech', 4, 'd0000001-0000-0000-0000-000000000001'),
  ('p0000002-0000-0000-0000-000000000002', 'BTECE', 'B.Tech Electronics',       'B.Tech', 4, 'd0000002-0000-0000-0000-000000000002'),
  ('p0000003-0000-0000-0000-000000000003', 'MTCSE', 'M.Tech Computer Science',  'M.Tech', 2, 'd0000001-0000-0000-0000-000000000001');

-- ---------- BATCHES ----------
INSERT INTO batches (id, name, start_year, end_year, program_id, current_semester) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'CSE 2024-28', 2024, 2028, 'p0000001-0000-0000-0000-000000000001', 3),
  ('b0000002-0000-0000-0000-000000000002', 'ECE 2024-28', 2024, 2028, 'p0000002-0000-0000-0000-000000000002', 3);

-- ---------- STUDENTS ----------
INSERT INTO students (id, enrollment_no, roll_no, first_name, last_name, email, phone, gender, date_of_birth,
                      category, guardian_name, guardian_phone, department_id, program_id, batch_id,
                      current_semester, cgpa, attendance_pct, status, admission_date) VALUES
  ('s0000001-0000-0000-0000-000000000001', 'CSE2024001', '24CSE01', 'Rahul',  'Kumar',  'rahul.k@stud.college.edu',  '9111111111', 'male',   '2006-04-12', 'General', 'Suresh Kumar',  '9222222221', 'd0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 3, 8.45, 92.50, 'active', '2024-08-01'),
  ('s0000002-0000-0000-0000-000000000002', 'CSE2024002', '24CSE02', 'Priya',  'Singh',  'priya.s@stud.college.edu',  '9111111112', 'female', '2006-06-22', 'OBC',     'Ramesh Singh',  '9222222222', 'd0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 3, 9.10, 96.00, 'active', '2024-08-01'),
  ('s0000003-0000-0000-0000-000000000003', 'CSE2024003', '24CSE03', 'Aman',   'Patel',  'aman.p@stud.college.edu',   '9111111113', 'male',   '2006-01-05', 'General', 'Vijay Patel',   '9222222223', 'd0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 3, 7.80, 85.20, 'active', '2024-08-01'),
  ('s0000004-0000-0000-0000-000000000004', 'ECE2024001', '24ECE01', 'Sneha',  'Reddy',  'sneha.r@stud.college.edu',  '9111111114', 'female', '2006-09-18', 'General', 'Krishna Reddy', '9222222224', 'd0000002-0000-0000-0000-000000000002', 'p0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002', 3, 8.90, 94.10, 'active', '2024-08-01'),
  ('s0000005-0000-0000-0000-000000000005', 'ECE2024002', '24ECE02', 'Vikram', 'Joshi',  'vikram.j@stud.college.edu', '9111111115', 'male',   '2006-03-30', 'SC',      'Mohan Joshi',   '9222222225', 'd0000002-0000-0000-0000-000000000002', 'p0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002', 3, 8.20, 89.50, 'active', '2024-08-01');

-- ---------- COURSES ----------
INSERT INTO courses (id, code, title, credits, department_id, program_id, semester) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'CS301', 'Data Structures & Algorithms', 4, 'd0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 3),
  ('c0000002-0000-0000-0000-000000000002', 'CS302', 'Database Management Systems',  4, 'd0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 3),
  ('c0000003-0000-0000-0000-000000000003', 'CS303', 'Operating Systems',            3, 'd0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 3),
  ('c0000004-0000-0000-0000-000000000004', 'EC301', 'Digital Signal Processing',    4, 'd0000002-0000-0000-0000-000000000002', 'p0000002-0000-0000-0000-000000000002', 3);

-- ---------- COURSE OFFERINGS ----------
INSERT INTO course_offerings (id, course_id, batch_id, section, academic_year, term, faculty_id, room, capacity) VALUES
  ('o0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'A', '2025-26', 'Fall', '44444444-4444-4444-4444-444444444444', 'LH-101', 60),
  ('o0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'A', '2025-26', 'Fall', '44444444-4444-4444-4444-444444444444', 'LH-102', 60),
  ('o0000003-0000-0000-0000-000000000003', 'c0000004-0000-0000-0000-000000000004', 'b0000002-0000-0000-0000-000000000002', 'A', '2025-26', 'Fall', '44444444-4444-4444-4444-444444444444', 'LH-201', 60);

-- ---------- TIMETABLE ----------
INSERT INTO timetable_slots (id, offering_id, day_of_week, start_time, end_time, room) VALUES
  (UUID(), 'o0000001-0000-0000-0000-000000000001', 1, '09:00:00', '10:00:00', 'LH-101'),
  (UUID(), 'o0000001-0000-0000-0000-000000000001', 3, '09:00:00', '10:00:00', 'LH-101'),
  (UUID(), 'o0000002-0000-0000-0000-000000000002', 1, '10:00:00', '11:00:00', 'LH-102'),
  (UUID(), 'o0000003-0000-0000-0000-000000000003', 2, '11:00:00', '12:00:00', 'LH-201');

-- ---------- ATTENDANCE ----------
INSERT INTO attendance_sessions (id, offering_id, session_date, period, topic, taken_by) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'o0000001-0000-0000-0000-000000000001', '2026-06-02', 1, 'Linked Lists', '44444444-4444-4444-4444-444444444444');

INSERT INTO attendance_records (id, session_id, student_id, status) VALUES
  (UUID(), 'a0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'present'),
  (UUID(), 'a0000001-0000-0000-0000-000000000001', 's0000002-0000-0000-0000-000000000002', 'present'),
  (UUID(), 'a0000001-0000-0000-0000-000000000001', 's0000003-0000-0000-0000-000000000003', 'absent');

-- ---------- EXAMS ----------
INSERT INTO exams (id, offering_id, name, exam_type, exam_date, max_marks, weightage) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'o0000001-0000-0000-0000-000000000001', 'Midterm 1', 'midterm', '2026-05-15', 50, 30);

INSERT INTO exam_marks (id, exam_id, student_id, marks, grade) VALUES
  (UUID(), 'e0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 42, 'A'),
  (UUID(), 'e0000001-0000-0000-0000-000000000001', 's0000002-0000-0000-0000-000000000002', 47, 'A+'),
  (UUID(), 'e0000001-0000-0000-0000-000000000001', 's0000003-0000-0000-0000-000000000003', 35, 'B');

-- ---------- FEES ----------
INSERT INTO fee_invoices (id, student_id, invoice_number, amount_due, amount_paid, status, due_date) VALUES
  ('f0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'INV-2026-0001', 75000.00, 75000.00, 'paid',    '2026-07-31'),
  ('f0000002-0000-0000-0000-000000000002', 's0000002-0000-0000-0000-000000000002', 'INV-2026-0002', 75000.00, 25000.00, 'partial', '2026-07-31'),
  ('f0000003-0000-0000-0000-000000000003', 's0000003-0000-0000-0000-000000000003', 'INV-2026-0003', 75000.00,     0.00, 'pending', '2026-07-31');

INSERT INTO fee_payments (id, invoice_id, amount, method, receipt_number, recorded_by) VALUES
  (UUID(), 'f0000001-0000-0000-0000-000000000001', 75000.00, 'upi',  'RCPT-001', '11111111-1111-1111-1111-111111111111'),
  (UUID(), 'f0000002-0000-0000-0000-000000000002', 25000.00, 'cash', 'RCPT-002', '11111111-1111-1111-1111-111111111111');

-- ---------- LIBRARY ----------
INSERT INTO library_books (id, title, author, isbn, publisher, category, total_copies, available_copies, shelf_location) VALUES
  ('l0000001-0000-0000-0000-000000000001', 'Introduction to Algorithms', 'Cormen et al.',     '9780262033848', 'MIT Press',        'CS', 5, 4, 'A-12'),
  ('l0000002-0000-0000-0000-000000000002', 'Database System Concepts',   'Silberschatz',      '9780078022159', 'McGraw Hill',      'CS', 3, 3, 'A-15'),
  ('l0000003-0000-0000-0000-000000000003', 'Operating System Concepts',  'Silberschatz',      '9781118063330', 'Wiley',            'CS', 4, 4, 'A-18');

INSERT INTO library_loans (id, book_id, student_id, issued_by, due_at) VALUES
  (UUID(), 'l0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', DATE_ADD(NOW(), INTERVAL 14 DAY));

-- ---------- PLACEMENTS ----------
INSERT INTO placement_companies (id, name, industry, website, contact_email) VALUES
  ('pc000001-0000-0000-0000-000000000001', 'Infosys',  'IT Services', 'https://infosys.com', 'campus@infosys.com'),
  ('pc000002-0000-0000-0000-000000000002', 'Google',   'Technology',  'https://google.com',  'university@google.com'),
  ('pc000003-0000-0000-0000-000000000003', 'TCS',      'IT Services', 'https://tcs.com',     'campus@tcs.com');

INSERT INTO placement_drives (id, company_id, job_title, ctc_lpa, location, eligibility_cgpa, drive_date, status) VALUES
  ('pd000001-0000-0000-0000-000000000001', 'pc000002-0000-0000-0000-000000000002', 'Software Engineer L3', 28.00, 'Bengaluru',  8.0, '2026-09-15', 'upcoming'),
  ('pd000002-0000-0000-0000-000000000002', 'pc000001-0000-0000-0000-000000000001', 'Systems Engineer',      6.50, 'Pune',       6.5, '2026-08-20', 'upcoming');

INSERT INTO placement_applications (id, drive_id, student_id, status) VALUES
  (UUID(), 'pd000001-0000-0000-0000-000000000001', 's0000002-0000-0000-0000-000000000002', 'applied'),
  (UUID(), 'pd000002-0000-0000-0000-000000000002', 's0000001-0000-0000-0000-000000000001', 'shortlisted');

-- ---------- ANNOUNCEMENTS ----------
INSERT INTO announcements (id, title, body, audience, priority, created_by) VALUES
  (UUID(), 'Welcome to Fall Semester 2026', 'Classes begin August 1st. Check your timetable.',  'all',      'normal', '22222222-2222-2222-2222-222222222222'),
  (UUID(), 'Fee Payment Deadline',           'Last date to pay semester fees is July 31, 2026.', 'students', 'high',   '11111111-1111-1111-1111-111111111111'),
  (UUID(), 'Google Campus Drive',            'Google is visiting on Sept 15. Register by Sept 5.', 'students','urgent', '11111111-1111-1111-1111-111111111111');

-- ---------- DONE ----------
SELECT 'Seed data loaded successfully!' AS status;
