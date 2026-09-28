-- ============================================================
-- FILE 4 of 4 — CAMPUS: Library, Placements, Announcements
-- Run this LAST (after File 1, for faculty/students to exist).
-- Populates the library catalog + loans, placement companies/
-- drives/applications, and campus announcements.
-- ============================================================

-- ============================================================
-- SEED: LIBRARY
-- ============================================================
DO $$
DECLARE
  v_books text[][] := ARRAY[
    ARRAY['Introduction to Algorithms','Thomas H. Cormen','MIT Press','Computer Science'],
    ARRAY['Database System Concepts','Abraham Silberschatz','McGraw-Hill','Computer Science'],
    ARRAY['Operating System Concepts','Silberschatz & Galvin','Wiley','Computer Science'],
    ARRAY['Computer Networking: A Top-Down Approach','Kurose & Ross','Pearson','Computer Science'],
    ARRAY['Clean Code','Robert C. Martin','Prentice Hall','Computer Science'],
    ARRAY['Digital Design','M. Morris Mano','Pearson','Electronics'],
    ARRAY['Microelectronic Circuits','Sedra & Smith','Oxford University Press','Electronics'],
    ARRAY['Signals and Systems','Oppenheim & Willsky','Pearson','Electronics'],
    ARRAY['Control Systems Engineering','Norman S. Nise','Wiley','Electronics'],
    ARRAY['Engineering Thermodynamics','P.K. Nag','McGraw-Hill','Mechanical'],
    ARRAY['Theory of Machines','R.S. Khurmi','S. Chand','Mechanical'],
    ARRAY['Strength of Materials','R.K. Bansal','Laxmi Publications','Mechanical'],
    ARRAY['Fluid Mechanics and Hydraulic Machines','R.K. Bansal','Laxmi Publications','Mechanical'],
    ARRAY['Surveying Vol 1','B.C. Punmia','Laxmi Publications','Civil'],
    ARRAY['Building Construction','B.C. Punmia','Laxmi Publications','Civil'],
    ARRAY['Concrete Technology','M.S. Shetty','S. Chand','Civil'],
    ARRAY['Soil Mechanics and Foundation Engineering','K.R. Arora','Standard Publishers','Civil'],
    ARRAY['Principles of Marketing','Philip Kotler','Pearson','Management'],
    ARRAY['Financial Management','I.M. Pandey','Vikas Publishing','Management'],
    ARRAY['Human Resource Management','Gary Dessler','Pearson','Management'],
    ARRAY['Organizational Behaviour','Stephen Robbins','Pearson','Management'],
    ARRAY['Business Statistics','Ken Black','Wiley','Management'],
    ARRAY['Discrete Mathematics and Its Applications','Kenneth Rosen','McGraw-Hill','Mathematics'],
    ARRAY['Engineering Mathematics','B.S. Grewal','Khanna Publishers','Mathematics'],
    ARRAY['Probability and Statistics for Engineers','Walpole','Pearson','Mathematics'],
    ARRAY['A Brief History of Time','Stephen Hawking','Bantam Books','General Science'],
    ARRAY['Sapiens: A Brief History of Humankind','Yuval Noah Harari','Harper','General'],
    ARRAY['The Lean Startup','Eric Ries','Crown Business','Management'],
    ARRAY['Wings of Fire','A.P.J. Abdul Kalam','Universities Press','Biography'],
    ARRAY['Zero to One','Peter Thiel','Crown Business','Management']
  ];
  i int;
  v_total_copies int;
  v_available int;
  v_book_id uuid;
  v_stu RECORD;
  v_issued_at timestamptz;
  v_due_at timestamptz;
  v_returned boolean;
  v_returned_at timestamptz;
  v_fine numeric;
BEGIN
  FOR i IN 1..array_length(v_books,1) LOOP
    v_total_copies := 2 + floor(random()*4)::int;
    INSERT INTO public.library_books (title, author, publisher, category, isbn, edition, language, total_copies, available_copies, shelf_location)
    VALUES (
      v_books[i][1], v_books[i][2], v_books[i][3], v_books[i][4],
      '978' || floor(random()*9000000000+1000000000)::text,
      (ARRAY['1st','2nd','3rd','4th'])[1+floor(random()*4)::int] || ' Edition',
      'English', v_total_copies, v_total_copies,
      (ARRAY['A','B','C','D'])[1+floor(random()*4)::int] || '-' || (1+floor(random()*20))::text
    );
  END LOOP;

  -- 40 random loans against active students
  FOR i IN 1..40 LOOP
    SELECT id, available_copies INTO v_book_id, v_available
    FROM public.library_books ORDER BY random() LIMIT 1;

    SELECT id INTO v_stu FROM public.students WHERE status = 'active' ORDER BY random() LIMIT 1;

    v_issued_at := now() - ((5 + floor(random()*60)) || ' days')::interval;
    v_due_at := v_issued_at + interval '14 days';
    v_returned := random() < 0.6;

    IF v_returned THEN
      v_returned_at := v_issued_at + ((3 + floor(random()*20)) || ' days')::interval;
      v_fine := GREATEST(0, round((EXTRACT(EPOCH FROM (v_returned_at - v_due_at))/86400 * 5)::numeric, 2));
    ELSE
      v_returned_at := NULL;
      v_fine := GREATEST(0, round((EXTRACT(EPOCH FROM (now() - v_due_at))/86400 * 5)::numeric, 2));
    END IF;

    INSERT INTO public.library_loans (book_id, student_id, issued_at, due_at, returned_at, fine_amount, fine_paid)
    VALUES (v_book_id, v_stu.id, v_issued_at, v_due_at, v_returned_at, v_fine, v_fine > 0 AND random() < 0.7);

    IF v_available > 0 AND NOT v_returned THEN
      UPDATE public.library_books SET available_copies = GREATEST(0, available_copies - 1) WHERE id = v_book_id;
    END IF;
  END LOOP;

  RAISE NOTICE 'Books: %, loans: %',
    (SELECT count(*) FROM public.library_books),
    (SELECT count(*) FROM public.library_loans);
END $$;
-- ============================================================
-- SEED: PLACEMENTS
-- ============================================================
DO $$
DECLARE
  v_companies text[][] := ARRAY[
    ARRAY['Tata Consultancy Services','IT Services','https://www.tcs.com'],
    ARRAY['Infosys Limited','IT Services','https://www.infosys.com'],
    ARRAY['Wipro Technologies','IT Services','https://www.wipro.com'],
    ARRAY['Tech Mahindra','IT Services','https://www.techmahindra.com'],
    ARRAY['Persistent Systems','Software Product','https://www.persistent.com'],
    ARRAY['Larsen & Toubro','Engineering & Construction','https://www.larsentoubro.com'],
    ARRAY['Bajaj Auto','Automobile','https://www.bajajauto.com'],
    ARRAY['Zensar Technologies','IT Services','https://www.zensar.com'],
    ARRAY['ICICI Bank','Banking & Finance','https://www.icicibank.com'],
    ARRAY['Deloitte India','Consulting','https://www2.deloitte.com/in']
  ];
  v_titles text[] := ARRAY['Software Engineer Trainee','Graduate Engineer Trainee','Associate Software Engineer',
                            'Business Analyst','Management Trainee','Design Engineer','Site Engineer','Data Analyst'];
  v_branches_pool text[] := ARRAY['CSE,ECE','CSE','MECH,CIVIL','CSE,ECE,MECH','MBA','CIVIL','MECH','CSE,MBA'];
  v_eligible text[];
  v_company_id uuid;
  v_drive_id uuid;
  i int;
  v_ctc numeric;
  v_elig_cgpa numeric;
  v_status text;
  v_stu RECORD;
  v_app_status text;
  v_r numeric;
BEGIN
  FOR i IN 1..array_length(v_companies,1) LOOP
    INSERT INTO public.placement_companies (name, industry, website, contact_email, contact_phone, description)
    VALUES (
      v_companies[i][1], v_companies[i][2], v_companies[i][3],
      lower(replace(v_companies[i][1], ' ', '')) || '.hr@example.com',
      '9' || lpad((100000000+floor(random()*899999999))::text, 9, '0'),
      'Campus recruitment partner for ' || v_companies[i][2] || ' roles.'
    )
    RETURNING id INTO v_company_id;

    -- one drive per company
    v_ctc := round((3.5 + random()*12)::numeric, 2);
    v_elig_cgpa := round((6 + random()*1.5)::numeric, 2);
    v_status := (ARRAY['open','closed','closed','completed'])[1+floor(random()*4)::int];
    v_eligible := string_to_array(v_branches_pool[i], ',');

    INSERT INTO public.placement_drives (
      company_id, job_title, job_description, ctc_lpa, location, eligibility_cgpa,
      eligible_branches, drive_date, registration_deadline, status
    ) VALUES (
      v_company_id,
      v_titles[1+floor(random()*array_length(v_titles,1))::int],
      'On-campus recruitment drive for eligible final and pre-final year students.',
      v_ctc,
      (ARRAY['Pune','Bengaluru','Hyderabad','Mumbai','Chennai','Remote'])[1+floor(random()*6)::int],
      v_elig_cgpa,
      v_eligible,
      CURRENT_DATE + (10 + i*5),
      (CURRENT_DATE + (3 + i*5))::timestamptz,
      v_status
    )
    RETURNING id INTO v_drive_id;

    -- applications from eligible active students in matching branches
    FOR v_stu IN
      SELECT s.id, s.cgpa FROM public.students s
      JOIN public.departments d ON d.id = s.department_id
      WHERE s.status = 'active' AND s.cgpa >= v_elig_cgpa AND d.code = ANY(v_eligible)
      ORDER BY random() LIMIT 6
    LOOP
      v_r := random();
      v_app_status := CASE WHEN v_r < 0.4 THEN 'applied'
                            WHEN v_r < 0.65 THEN 'shortlisted'
                            WHEN v_r < 0.8 THEN 'selected'
                            ELSE 'rejected' END;

      INSERT INTO public.placement_applications (drive_id, student_id, status, offered_ctc)
      VALUES (
        v_drive_id, v_stu.id, v_app_status,
        CASE WHEN v_app_status = 'selected' THEN v_ctc ELSE NULL END
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Companies: %, drives: %, applications: %',
    (SELECT count(*) FROM public.placement_companies),
    (SELECT count(*) FROM public.placement_drives),
    (SELECT count(*) FROM public.placement_applications);
END $$;
-- ============================================================
-- SEED: ANNOUNCEMENTS
-- ============================================================
DO $$
DECLARE
  v_author uuid;
  v_dept_id uuid;
BEGIN
  SELECT user_id INTO v_author FROM public.user_roles WHERE role = 'faculty' ORDER BY random() LIMIT 1;

  INSERT INTO public.announcements (title, body, audience, target_roles, priority, publish_at, expires_at, created_by) VALUES
  ('Mid-Semester Examination Schedule Released',
   'The mid-semester examination timetable for all departments has been published. Students are advised to check their respective portals and report any clashes to the examination cell by end of this week.',
   'all', ARRAY['student']::app_role[], 'high', now() - interval '5 days', now() + interval '25 days', v_author),

  ('Library Timings Extended During Exam Week',
   'The central library will remain open from 8:00 AM to 10:00 PM during the upcoming examination week to support student preparation.',
   'all', ARRAY['student','faculty']::app_role[], 'normal', now() - interval '3 days', now() + interval '15 days', v_author),

  ('Campus Placement Drive: Multiple Companies Visiting',
   'Several companies will be conducting on-campus placement drives over the next month. Eligible final and pre-final year students should update their resumes on the placement portal.',
   'all', ARRAY['student']::app_role[], 'high', now() - interval '2 days', now() + interval '30 days', v_author),

  ('Fee Payment Deadline Reminder',
   'Students who have not yet cleared their semester fee dues are requested to do so before the due date to avoid late fee charges and holds on examination admit cards.',
   'all', ARRAY['student']::app_role[], 'urgent', now() - interval '1 days', now() + interval '20 days', v_author),

  ('Faculty Development Program on AI in Education',
   'A two-day faculty development program on integrating AI tools in teaching will be conducted by the Training and Development Cell. All faculty members are encouraged to register.',
   'department', ARRAY['faculty','hod']::app_role[], 'normal', now() - interval '7 days', now() + interval '10 days', v_author),

  ('Annual Sports Meet 2025-26',
   'The annual inter-department sports meet will be held next month. Students interested in participating should register with their respective department sports coordinators.',
   'all', ARRAY['student']::app_role[], 'normal', now() - interval '4 days', now() + interval '18 days', v_author),

  ('Guest Lecture Series: Industry Experts',
   'A series of guest lectures by industry professionals will be organized across departments this semester to bridge the gap between academic learning and industry practice.',
   'all', NULL, 'normal', now() - interval '6 days', now() + interval '22 days', v_author),

  ('Hostel Allotment for New Academic Year',
   'Hostel room allotment for the upcoming academic year will begin shortly. Students requiring accommodation must submit their applications through the student portal.',
   'all', ARRAY['student']::app_role[], 'normal', now() - interval '2 days', now() + interval '12 days', v_author),

  ('Semester Grade Cards Available',
   'Grade cards for the recently concluded semester examinations are now available for download from the student portal.',
   'all', ARRAY['student']::app_role[], 'normal', now() - interval '1 days', now() + interval '40 days', v_author),

  ('Holiday Notice: Institute Closed',
   'The institute will remain closed on account of a national holiday. Regular classes will resume the following working day.',
   'all', NULL, 'low', now() - interval '10 days', now() + interval '2 days', v_author);

  RAISE NOTICE 'Announcements: %', (SELECT count(*) FROM public.announcements);
END $$;
