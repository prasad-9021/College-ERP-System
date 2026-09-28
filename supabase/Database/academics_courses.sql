-- ============================================================
-- FILE 2 of 4 — ACADEMICS: Courses, Offerings, Timetable, Enrollments
-- Run this SECOND (after File 1). Creates the course catalog,
-- assigns faculty to sections, builds a weekly timetable, and
-- enrolls students into their department's courses.
-- ============================================================

-- ============================================================
-- SEED: COURSES, COURSE OFFERINGS, TIMETABLE, ENROLLMENTS
-- ============================================================
DO $$
DECLARE
  v_dept RECORD;
  v_pool text[];
  v_pools jsonb := '{
    "CSE": ["Programming Fundamentals","Data Structures","Object Oriented Programming","Digital Logic Design",
            "Discrete Mathematics","Database Management Systems","Computer Organization","Operating Systems",
            "Design and Analysis of Algorithms","Computer Networks","Software Engineering","Theory of Computation"],
    "ECE": ["Circuit Theory","Electronic Devices","Digital Electronics","Signals and Systems",
            "Analog Communication","Electromagnetic Theory","Microprocessors","Control Systems",
            "Digital Signal Processing","VLSI Design","Communication Systems","Antenna and Wave Propagation"],
    "MECH": ["Engineering Mechanics","Thermodynamics","Strength of Materials","Manufacturing Processes",
             "Fluid Mechanics","Machine Design","Heat Transfer","Kinematics of Machinery",
             "Industrial Engineering","CAD CAM","Refrigeration and Air Conditioning","Automobile Engineering"],
    "CIVIL": ["Engineering Mechanics","Building Materials","Surveying","Structural Analysis",
              "Fluid Mechanics","Geotechnical Engineering","Concrete Technology","Transportation Engineering",
              "Environmental Engineering","Design of Steel Structures","Water Resources Engineering","Construction Management"],
    "MBA": ["Principles of Management","Financial Accounting","Business Economics","Organizational Behaviour",
            "Marketing Management","Human Resource Management","Business Statistics","Operations Management",
            "Financial Management","Strategic Management","Business Law","Entrepreneurship"]
  }'::jsonb;
  v_sem int;
  v_c int;
  v_title text;
  v_course_id uuid;
  v_offering_id uuid;
  v_faculty_ids uuid[];
  v_faculty_id uuid;
  v_room text;
  v_day int;
  v_courses_per_sem int := 4;
  v_idx int;
BEGIN
  FOR v_dept IN
    SELECT d.id AS department_id, d.code AS dept_code, p.id AS program_id,
           p.total_semesters, b.id AS batch_id, b.current_semester
    FROM public.departments d
    JOIN public.programs p ON p.department_id = d.id
    JOIN public.batches b ON b.program_id = p.id
  LOOP
    -- faculty belonging to this department (by email prefix stashed at seed time via profiles+roles;
    -- simplest robust match: profiles whose full_name matches one of our known faculty for this dept)
    SELECT array_agg(u.id) INTO v_faculty_ids
    FROM auth.users u
    WHERE u.raw_user_meta_data->>'department_code' = v_dept.dept_code;

    IF v_faculty_ids IS NULL OR array_length(v_faculty_ids,1) = 0 THEN
      SELECT array_agg(ur.user_id) INTO v_faculty_ids
      FROM public.user_roles ur WHERE ur.role = 'faculty';
    END IF;

    v_pool := ARRAY(SELECT jsonb_array_elements_text(v_pools -> v_dept.dept_code));
    v_idx := 1;

    FOR v_sem IN 1..LEAST(v_dept.current_semester, 3) LOOP
      FOR v_c IN 1..v_courses_per_sem LOOP
        v_title := v_pool[v_idx];
        v_idx := v_idx + 1;

        INSERT INTO public.courses (code, title, description, credits, program_id, department_id, semester, is_active)
        VALUES (
          v_dept.dept_code || v_sem || (100 + v_c),
          v_title,
          'Core course covering ' || v_title || ' concepts for semester ' || v_sem,
          (ARRAY[3,3,4,3])[v_c],
          v_dept.program_id, v_dept.department_id, v_sem, true
        )
        RETURNING id INTO v_course_id;

        v_faculty_id := v_faculty_ids[1 + floor(random()*array_length(v_faculty_ids,1))::int];
        v_room := (ARRAY['A','B','C'])[1+floor(random()*3)::int] || (100 + floor(random()*20))::text;

        INSERT INTO public.course_offerings (course_id, batch_id, section, academic_year, term, faculty_id, room, capacity)
        VALUES (v_course_id, v_dept.batch_id, 'A', '2025-26', 'Semester ' || v_sem, v_faculty_id, v_room, 70)
        RETURNING id INTO v_offering_id;

        v_day := 1 + floor(random()*5)::int; -- Mon-Fri
        INSERT INTO public.timetable_slots (offering_id, day_of_week, start_time, end_time, room)
        VALUES (v_offering_id, v_day, (make_time(9,0,0) + (v_c * interval '1 hour')), (make_time(9,0,0) + (v_c * interval '1 hour') + interval '50 minutes'), v_room);

        INSERT INTO public.timetable_slots (offering_id, day_of_week, start_time, end_time, room)
        VALUES (v_offering_id, ((v_day + 2) % 5) + 1, (make_time(9,0,0) + (v_c * interval '1 hour')), (make_time(9,0,0) + (v_c * interval '1 hour') + interval '50 minutes'), v_room);

        -- Enroll all active/inactive students of this department+batch into the offering
        INSERT INTO public.enrollments (offering_id, student_id, status)
        SELECT v_offering_id, s.id, CASE WHEN s.status = 'active' THEN 'enrolled' ELSE 'completed' END
        FROM public.students s
        WHERE s.department_id = v_dept.department_id
          AND s.batch_id = v_dept.batch_id
          AND s.status IN ('active','inactive','graduated');
      END LOOP;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Courses: %, Offerings: %, Enrollments: %',
    (SELECT count(*) FROM public.courses),
    (SELECT count(*) FROM public.course_offerings),
    (SELECT count(*) FROM public.enrollments);
END $$;
