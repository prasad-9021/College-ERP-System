-- ============================================================
-- FILE 1 of 4 — PEOPLE: Faculty & Students
-- Run this FIRST. Creates 10 faculty (with login accounts)
-- and ~85 students, linked to your existing departments/
-- programs/batches.
-- ============================================================

-- ============================================================
-- SEED: FACULTY (10 records) — auth.users + profiles + user_roles
-- ============================================================
DO $$
DECLARE
  v_names text[][] := ARRAY[
    ARRAY['Rajesh','Kulkarni','CSE'],
    ARRAY['Sunita','Deshmukh','CSE'],
    ARRAY['Amit','Sharma','CSE'],
    ARRAY['Priya','Nair','ECE'],
    ARRAY['Vikram','Reddy','ECE'],
    ARRAY['Meera','Iyer','MECH'],
    ARRAY['Sanjay','Patil','MECH'],
    ARRAY['Anjali','Mehta','CIVIL'],
    ARRAY['Ramesh','Joshi','CIVIL'],
    ARRAY['Kavita','Rao','MBA']
  ];
  v_designations text[] := ARRAY['Professor','Associate Professor','Assistant Professor'];
  v_qualifications text[] := ARRAY['Ph.D','M.Tech, Ph.D','M.E., Ph.D','M.Tech'];
  v_uid uuid;
  v_email text;
  v_dept_code text;
  v_dept_id uuid;
  v_is_hod boolean;
  v_hod_depts text[] := ARRAY['CSE','ECE','MECH','CIVIL','MBA'];
  i int;
BEGIN
  -- Don't let the new-user trigger auto-assign student/super_admin roles;
  -- we set roles explicitly for staff we create here.
  ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

  FOR i IN 1..array_length(v_names,1) LOOP
    v_dept_code := v_names[i][3];
    v_email := lower(v_names[i][1] || '.' || v_names[i][2] || '@clgerp.edu.in');
    v_uid := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      v_email, crypt('Faculty@123', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_names[i][1] || ' ' || v_names[i][2]),
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_uid, v_uid::text,
      jsonb_build_object('sub', v_uid::text, 'email', v_email),
      'email', now(), now()
    );

    INSERT INTO public.profiles (id, full_name, email, phone)
    VALUES (
      v_uid, v_names[i][1] || ' ' || v_names[i][2], v_email,
      '9' || lpad((700000000 + (random()*99999999)::int)::text, 9, '0')
    );

    v_is_hod := v_dept_code = ANY(v_hod_depts) AND NOT EXISTS (
      SELECT 1 FROM public.departments WHERE code = v_dept_code AND hod_id IS NOT NULL
    );

    INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'faculty');
    IF v_is_hod THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'hod')
      ON CONFLICT DO NOTHING;
      SELECT id INTO v_dept_id FROM public.departments WHERE code = v_dept_code;
      UPDATE public.departments SET hod_id = v_uid WHERE id = v_dept_id;
    END IF;

    -- stash designation/qualification via raw_user_meta_data for reference (no dedicated faculty table exists)
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data
      || jsonb_build_object(
           'designation', v_designations[1 + (i % array_length(v_designations,1))],
           'qualification', v_qualifications[1 + (i % array_length(v_qualifications,1))],
           'department_code', v_dept_code
         )
    WHERE id = v_uid;
  END LOOP;

  ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
END $$;
-- ============================================================
-- SEED: STUDENTS (85 records)
-- ============================================================
DO $$
DECLARE
  v_first_male text[] := ARRAY['Aarav','Vivaan','Aditya','Arjun','Sai','Reyansh','Krishna','Ishaan','Rohan','Kabir',
    'Aryan','Dhruv','Karan','Nikhil','Yash','Rahul','Varun','Siddharth','Manav','Ayaan',
    'Devansh','Harsh','Om','Pranav','Raj','Vihaan','Shaurya','Aniket','Tanish','Yuvraj'];
  v_first_female text[] := ARRAY['Ananya','Diya','Ishita','Kavya','Myra','Saanvi','Anika','Riya','Sneha','Pooja',
    'Aditi','Neha','Priya','Shreya','Tanvi','Vidya','Anushka','Divya','Kritika','Meera',
    'Nandini','Radhika','Simran','Swara','Trisha','Vaishnavi','Yashika','Zoya','Isha','Kiara'];
  v_last_names text[] := ARRAY['Sharma','Verma','Gupta','Kumar','Singh','Patel','Reddy','Rao','Nair','Iyer',
    'Joshi','Mehta','Deshmukh','Kulkarni','Patil','Chauhan','Yadav','Mishra','Pandey','Agarwal',
    'Bhatt','Chatterjee','Bose','Das','Ghosh','Kapoor','Malhotra','Chopra','Saxena','Trivedi'];
  v_cities text[][] := ARRAY[
    ARRAY['Pune','Maharashtra','411001'], ARRAY['Mumbai','Maharashtra','400001'],
    ARRAY['Nagpur','Maharashtra','440001'], ARRAY['Nashik','Maharashtra','422001'],
    ARRAY['Bengaluru','Karnataka','560001'], ARRAY['Hyderabad','Telangana','500001'],
    ARRAY['Chennai','Tamil Nadu','600001'], ARRAY['Delhi','Delhi','110001'],
    ARRAY['Jaipur','Rajasthan','302001'], ARRAY['Ahmedabad','Gujarat','380001'],
    ARRAY['Lucknow','Uttar Pradesh','226001'], ARRAY['Bhopal','Madhya Pradesh','462001'],
    ARRAY['Kolkata','West Bengal','700001'], ARRAY['Patna','Bihar','800001'],
    ARRAY['Indore','Madhya Pradesh','452001'], ARRAY['Nagaland','Nagaland','797001']
  ];
  v_categories text[] := ARRAY['GEN','GEN','GEN','OBC','OBC','SC','ST'];
  v_blood_groups text[] := ARRAY['A+','B+','O+','AB+','A-','B-','O-'];
  v_relations text[] := ARRAY['Father','Mother','Guardian'];

  rec RECORD;
  v_first text;
  v_last text;
  v_gender public.gender;
  v_city_idx int;
  v_seq int := 1;
  v_status public.student_status;
  v_status_roll int;
  v_students_per_batch int;
  v_total int := 0;
  v_target int := 85;
  v_dob date;
  v_admission date;
  v_cgpa numeric(4,2);
  v_attendance numeric(5,2);
BEGIN
  FOR rec IN
    SELECT b.id AS batch_id, b.name AS batch_name, b.start_year, b.current_semester,
           p.id AS program_id, p.code AS program_code, p.total_semesters,
           d.id AS department_id, d.code AS dept_code
    FROM public.batches b
    JOIN public.programs p ON p.id = b.program_id
    JOIN public.departments d ON d.id = p.department_id
    ORDER BY d.code
  LOOP
    -- Roughly evenly split 85 students across the 5 batches (17 each), with some variance
    v_students_per_batch := 17 + (CASE WHEN rec.dept_code IN ('CSE') THEN 3
                                        WHEN rec.dept_code IN ('MBA','CIVIL') THEN -2
                                        ELSE 0 END);

    FOR v_status_roll IN 1..v_students_per_batch LOOP
      EXIT WHEN v_total >= v_target;

      v_gender := CASE WHEN random() < 0.55 THEN 'male' ELSE 'female' END;
      v_first := CASE WHEN v_gender = 'male'
                   THEN v_first_male[1 + floor(random()*array_length(v_first_male,1))::int]
                   ELSE v_first_female[1 + floor(random()*array_length(v_first_female,1))::int]
                 END;
      v_last := v_last_names[1 + floor(random()*array_length(v_last_names,1))::int];
      v_city_idx := 1 + floor(random()*array_length(v_cities,1))::int;

      v_admission := make_date(rec.start_year, 7, 1) + (floor(random()*30))::int;
      v_dob := v_admission - (interval '18 years') - (floor(random()*730) || ' days')::interval;

      -- Status distribution: mostly active, a few graduated/dropped/suspended for realism
      v_status := (ARRAY['active','active','active','active','active','active','active','active',
                          'active','active','active','active','inactive','graduated','dropped','suspended'])[1 + floor(random()*16)::int];

      v_cgpa := round((5.5 + random()*4.3)::numeric, 2);
      v_attendance := round((60 + random()*39)::numeric, 2);

      INSERT INTO public.students (
        enrollment_no, roll_no, first_name, last_name, email, phone, gender,
        date_of_birth, blood_group, nationality, category,
        address_line1, address_line2, city, state, pincode,
        guardian_name, guardian_phone, guardian_email, guardian_relation,
        department_id, program_id, batch_id, current_semester,
        admission_date, status, cgpa, attendance_pct
      ) VALUES (
        rec.dept_code || '-' || rec.start_year || '-' || lpad(v_seq::text, 4, '0'),
        rec.dept_code || lpad(v_seq::text, 3, '0'),
        v_first, v_last,
        lower(v_first || '.' || v_last || v_seq || '@student.clgerp.edu.in'),
        '9' || lpad((100000000 + (random()*899999999)::bigint)::text, 9, '0'),
        v_gender, v_dob,
        v_blood_groups[1 + floor(random()*array_length(v_blood_groups,1))::int],
        'Indian',
        v_categories[1 + floor(random()*array_length(v_categories,1))::int],
        (10 + floor(random()*900))::text || ', ' || (ARRAY['MG Road','Station Road','Gandhi Nagar','Shivaji Chowk','Park Street','Church Road'])[1+floor(random()*6)::int],
        (ARRAY['Near Bus Stand','Opp. City Hospital','Behind Market','',''])[1+floor(random()*5)::int],
        v_cities[v_city_idx][1], v_cities[v_city_idx][2], v_cities[v_city_idx][3],
        (ARRAY['Mr.','Mrs.'])[1+floor(random()*2)::int] || ' ' || v_last,
        '9' || lpad((100000000 + (random()*899999999)::bigint)::text, 9, '0'),
        lower(v_last || '.guardian' || v_seq || '@gmail.com'),
        v_relations[1 + floor(random()*array_length(v_relations,1))::int],
        rec.department_id, rec.program_id, rec.batch_id,
        LEAST(rec.current_semester, rec.total_semesters),
        v_admission, v_status, v_cgpa, v_attendance
      );

      v_seq := v_seq + 1;
      v_total := v_total + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Inserted % students', v_total;
END $$;
