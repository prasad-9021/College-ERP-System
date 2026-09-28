
-- ============================================================
-- PHASE 2: Academics, Attendance, Exams, Fees, Library, Placements, Communications
-- ============================================================

-- helper: staff predicate
CREATE OR REPLACE FUNCTION public.is_staff(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_any_role(_uid, ARRAY['super_admin','principal','hod','faculty']::app_role[])
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;

-- ============================================================
-- ACADEMICS
-- ============================================================
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  credits numeric(4,2) NOT NULL DEFAULT 3,
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  semester int,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_read_auth" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "courses_write_staff" ON public.courses FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.course_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL,
  section text NOT NULL DEFAULT 'A',
  academic_year text NOT NULL,
  term text,
  faculty_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  room text,
  capacity int NOT NULL DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, section, academic_year, term)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_offerings TO authenticated;
GRANT ALL ON public.course_offerings TO service_role;
ALTER TABLE public.course_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offerings_read_auth" ON public.course_offerings FOR SELECT TO authenticated USING (true);
CREATE POLICY "offerings_write_staff" ON public.course_offerings FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_offerings_updated BEFORE UPDATE ON public.course_offerings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id uuid NOT NULL REFERENCES public.course_offerings(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'enrolled',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (offering_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enroll_read_self_or_staff" ON public.enrollments FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "enroll_write_staff" ON public.enrollments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id uuid NOT NULL REFERENCES public.course_offerings(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_slots TO authenticated;
GRANT ALL ON public.timetable_slots TO service_role;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tt_read_auth" ON public.timetable_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "tt_write_staff" ON public.timetable_slots FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE public.attendance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id uuid NOT NULL REFERENCES public.course_offerings(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  period int,
  topic text,
  taken_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_sessions TO authenticated;
GRANT ALL ON public.attendance_sessions TO service_role;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "att_sess_read_auth" ON public.attendance_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "att_sess_write_staff" ON public.attendance_sessions FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.attendance_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'present',
  remarks text,
  marked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_marks TO authenticated;
GRANT ALL ON public.attendance_marks TO service_role;
ALTER TABLE public.attendance_marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "att_mark_read" ON public.attendance_marks FOR SELECT TO authenticated USING (
  public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()
  )
);
CREATE POLICY "att_mark_write_staff" ON public.attendance_marks FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============================================================
-- EXAMINATIONS
-- ============================================================
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id uuid NOT NULL REFERENCES public.course_offerings(id) ON DELETE CASCADE,
  name text NOT NULL,
  exam_type text NOT NULL DEFAULT 'midterm',
  exam_date date,
  max_marks numeric(6,2) NOT NULL DEFAULT 100,
  weightage numeric(5,2) NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exams_read_auth" ON public.exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "exams_write_staff" ON public.exams FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_exams_updated BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.exam_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  marks_obtained numeric(6,2),
  grade text,
  remarks text,
  entered_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  entered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_marks TO authenticated;
GRANT ALL ON public.exam_marks TO service_role;
ALTER TABLE public.exam_marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "marks_read" ON public.exam_marks FOR SELECT TO authenticated USING (
  public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()
  )
);
CREATE POLICY "marks_write_staff" ON public.exam_marks FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============================================================
-- FEES
-- ============================================================
CREATE TABLE public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL,
  academic_year text NOT NULL,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_structures TO authenticated;
GRANT ALL ON public.fee_structures TO service_role;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fee_struct_read_auth" ON public.fee_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "fee_struct_write" ON public.fee_structures FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','accountant']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','accountant']::app_role[]));
CREATE TRIGGER trg_fee_struct_updated BEFORE UPDATE ON public.fee_structures
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.fee_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id uuid NOT NULL REFERENCES public.fee_structures(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  is_optional boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_components TO authenticated;
GRANT ALL ON public.fee_components TO service_role;
ALTER TABLE public.fee_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fee_comp_read_auth" ON public.fee_components FOR SELECT TO authenticated USING (true);
CREATE POLICY "fee_comp_write" ON public.fee_components FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','accountant']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','accountant']::app_role[]));

CREATE TABLE public.fee_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  structure_id uuid REFERENCES public.fee_structures(id) ON DELETE SET NULL,
  amount_due numeric(12,2) NOT NULL DEFAULT 0,
  amount_paid numeric(12,2) NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'pending',
  issued_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_invoices TO authenticated;
GRANT ALL ON public.fee_invoices TO service_role;
ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fee_inv_read" ON public.fee_invoices FOR SELECT TO authenticated USING (
  public.has_any_role(auth.uid(), ARRAY['super_admin','principal','accountant','hod']::app_role[])
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid())
);
CREATE POLICY "fee_inv_write" ON public.fee_invoices FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','accountant']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','accountant']::app_role[]));
CREATE TRIGGER trg_fee_inv_updated BEFORE UPDATE ON public.fee_invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.fee_invoices(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  method text NOT NULL DEFAULT 'cash',
  reference text,
  receipt_number text NOT NULL UNIQUE,
  paid_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_payments TO authenticated;
GRANT ALL ON public.fee_payments TO service_role;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fee_pay_read" ON public.fee_payments FOR SELECT TO authenticated USING (
  public.has_any_role(auth.uid(), ARRAY['super_admin','principal','accountant','hod']::app_role[])
  OR EXISTS (
    SELECT 1 FROM public.fee_invoices i
    JOIN public.students s ON s.id = i.student_id
    WHERE i.id = invoice_id AND s.user_id = auth.uid()
  )
);
CREATE POLICY "fee_pay_write" ON public.fee_payments FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','accountant']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','accountant']::app_role[]));

-- ============================================================
-- LIBRARY
-- ============================================================
CREATE TABLE public.library_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn text,
  title text NOT NULL,
  author text,
  publisher text,
  category text,
  edition text,
  language text DEFAULT 'English',
  total_copies int NOT NULL DEFAULT 1,
  available_copies int NOT NULL DEFAULT 1,
  shelf_location text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_books TO authenticated;
GRANT ALL ON public.library_books TO service_role;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lib_book_read_auth" ON public.library_books FOR SELECT TO authenticated USING (true);
CREATE POLICY "lib_book_write" ON public.library_books FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','librarian']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','librarian']::app_role[]));
CREATE TRIGGER trg_lib_book_updated BEFORE UPDATE ON public.library_books
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.library_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz NOT NULL,
  returned_at timestamptz,
  fine_amount numeric(10,2) NOT NULL DEFAULT 0,
  fine_paid boolean NOT NULL DEFAULT false,
  issued_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_loans TO authenticated;
GRANT ALL ON public.library_loans TO service_role;
ALTER TABLE public.library_loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lib_loan_read" ON public.library_loans FOR SELECT TO authenticated USING (
  public.has_any_role(auth.uid(), ARRAY['super_admin','principal','librarian','hod']::app_role[])
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid())
);
CREATE POLICY "lib_loan_write" ON public.library_loans FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','librarian']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','librarian']::app_role[]));

-- ============================================================
-- PLACEMENTS
-- ============================================================
CREATE TABLE public.placement_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  website text,
  contact_email text,
  contact_phone text,
  description text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.placement_companies TO authenticated;
GRANT ALL ON public.placement_companies TO service_role;
ALTER TABLE public.placement_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pc_read_auth" ON public.placement_companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "pc_write" ON public.placement_companies FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','placement_officer']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','placement_officer']::app_role[]));
CREATE TRIGGER trg_pc_updated BEFORE UPDATE ON public.placement_companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.placement_drives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.placement_companies(id) ON DELETE CASCADE,
  job_title text NOT NULL,
  job_description text,
  ctc_lpa numeric(10,2),
  location text,
  eligibility_cgpa numeric(4,2) DEFAULT 0,
  eligible_branches text[],
  drive_date date,
  registration_deadline timestamptz,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.placement_drives TO authenticated;
GRANT ALL ON public.placement_drives TO service_role;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pd_read_auth" ON public.placement_drives FOR SELECT TO authenticated USING (true);
CREATE POLICY "pd_write" ON public.placement_drives FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','placement_officer']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','placement_officer']::app_role[]));
CREATE TRIGGER trg_pd_updated BEFORE UPDATE ON public.placement_drives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.placement_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id uuid NOT NULL REFERENCES public.placement_drives(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'applied',
  applied_at timestamptz NOT NULL DEFAULT now(),
  offer_letter_url text,
  offered_ctc numeric(10,2),
  notes text,
  UNIQUE (drive_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.placement_applications TO authenticated;
GRANT ALL ON public.placement_applications TO service_role;
ALTER TABLE public.placement_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pa_read" ON public.placement_applications FOR SELECT TO authenticated USING (
  public.has_any_role(auth.uid(), ARRAY['super_admin','principal','placement_officer','hod']::app_role[])
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid())
);
CREATE POLICY "pa_insert_self" ON public.placement_applications FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid())
    OR public.has_any_role(auth.uid(), ARRAY['super_admin','principal','placement_officer']::app_role[])
  );
CREATE POLICY "pa_update_officer" ON public.placement_applications FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','placement_officer']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','placement_officer']::app_role[]));
CREATE POLICY "pa_delete_officer" ON public.placement_applications FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','placement_officer']::app_role[]));

-- ============================================================
-- COMMUNICATIONS
-- ============================================================
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  target_roles app_role[],
  target_department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  target_batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'normal',
  publish_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ann_read_auth" ON public.announcements FOR SELECT TO authenticated USING (
  publish_at <= now() AND (expires_at IS NULL OR expires_at > now())
);
CREATE POLICY "ann_write" ON public.announcements FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','hod','faculty','placement_officer','librarian']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','hod','faculty','placement_officer','librarian']::app_role[]));
CREATE TRIGGER trg_ann_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
