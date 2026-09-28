
-- ============= ENUMS =============
CREATE TYPE public.app_role AS ENUM (
  'super_admin','principal','hod','faculty','student',
  'parent','accountant','librarian','placement_officer'
);

CREATE TYPE public.student_status AS ENUM ('active','inactive','graduated','dropped','suspended');
CREATE TYPE public.gender AS ENUM ('male','female','other');

-- ============= PROFILES =============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============= USER ROLES (separate table - critical for security) =============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer role check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

CREATE OR REPLACE FUNCTION public.current_user_roles()
RETURNS SETOF public.app_role
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid()
$$;

-- ============= DEPARTMENTS =============
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  hod_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  established_year INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- ============= PROGRAMS (B.Tech CSE, MBA, etc) =============
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  degree_type TEXT NOT NULL, -- 'UG','PG','Diploma','PhD'
  duration_years NUMERIC(3,1) NOT NULL DEFAULT 4,
  total_semesters INT NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- ============= BATCHES (e.g. 2024-2028 cohort) =============
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "2024-2028"
  start_year INT NOT NULL,
  end_year INT NOT NULL,
  current_semester INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(program_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.batches TO authenticated;
GRANT ALL ON public.batches TO service_role;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- ============= STUDENTS =============
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  enrollment_no TEXT NOT NULL UNIQUE,
  roll_no TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  gender public.gender,
  date_of_birth DATE,
  blood_group TEXT,
  nationality TEXT DEFAULT 'Indian',
  category TEXT, -- GEN/OBC/SC/ST
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  guardian_relation TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  current_semester INT DEFAULT 1,
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.student_status NOT NULL DEFAULT 'active',
  photo_url TEXT,
  cgpa NUMERIC(4,2),
  attendance_pct NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_students_dept ON public.students(department_id);
CREATE INDEX idx_students_program ON public.students(program_id);
CREATE INDEX idx_students_batch ON public.students(batch_id);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_enrollment ON public.students(enrollment_no);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ============= AUDIT LOG =============
CREATE TABLE public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_log(created_at DESC);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.audit_log_id_seq TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============= UPDATED_AT TRIGGER =============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_departments_updated BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_programs_updated BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= AUTO-CREATE PROFILE ON SIGNUP =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  -- First registered user gets super_admin automatically (bootstrapping)
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= RLS POLICIES =============

-- profiles: everyone authed can read; users update own; admins update any
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal']::public.app_role[]));

-- user_roles: users see own; admins see all
CREATE POLICY "roles_read_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['super_admin','principal']::public.app_role[]));

-- departments / programs / batches: all authed read; only admins write
CREATE POLICY "dept_read" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "dept_write" ON public.departments FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal']::public.app_role[]));

CREATE POLICY "prog_read" ON public.programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "prog_write" ON public.programs FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','hod']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','hod']::public.app_role[]));

CREATE POLICY "batch_read" ON public.batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "batch_write" ON public.batches FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','hod']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','hod']::public.app_role[]));

-- students: staff read all; students read self; staff write
CREATE POLICY "students_read" ON public.students FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_any_role(auth.uid(), ARRAY['super_admin','principal','hod','faculty','accountant','librarian','placement_officer']::public.app_role[])
  );
CREATE POLICY "students_write" ON public.students FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','hod']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','hod']::public.app_role[]));

-- audit log: admins read; system inserts
CREATE POLICY "audit_read" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal']::public.app_role[]));
CREATE POLICY "audit_insert" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============= SEED DATA =============
INSERT INTO public.departments (code, name, description, established_year) VALUES
  ('CSE', 'Computer Science & Engineering', 'Department of Computer Science and Engineering', 1995),
  ('ECE', 'Electronics & Communication', 'Department of Electronics and Communication Engineering', 1998),
  ('MECH', 'Mechanical Engineering', 'Department of Mechanical Engineering', 1992),
  ('CIVIL', 'Civil Engineering', 'Department of Civil Engineering', 1990),
  ('MBA', 'School of Management', 'School of Business Administration', 2005);

INSERT INTO public.programs (department_id, code, name, degree_type, duration_years, total_semesters)
SELECT id, 'BT-' || code, 'B.Tech in ' || name, 'UG', 4, 8 FROM public.departments WHERE code IN ('CSE','ECE','MECH','CIVIL');

INSERT INTO public.programs (department_id, code, name, degree_type, duration_years, total_semesters)
SELECT id, 'MBA', 'Master of Business Administration', 'PG', 2, 4 FROM public.departments WHERE code = 'MBA';

INSERT INTO public.batches (program_id, name, start_year, end_year, current_semester)
SELECT id, '2024-' || (2024 + duration_years)::INT, 2024, (2024 + duration_years)::INT, 3 FROM public.programs;
