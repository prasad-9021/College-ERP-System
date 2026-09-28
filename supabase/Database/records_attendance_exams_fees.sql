-- ============================================================
-- FILE 3 of 4 — RECORDS: Attendance, Exams, Fees
-- Run this THIRD (after File 2). Generates attendance sessions
-- + marks, midterm/endterm exams + marks, and fee structures,
-- invoices, and payments for every student.
-- ============================================================

-- ============================================================
-- SEED: ATTENDANCE + EXAMS
-- ============================================================
DO $$
DECLARE
  v_off RECORD;
  v_session_id uuid;
  v_exam_id uuid;
  v_topics text[] := ARRAY['Introduction & Overview','Core Concepts I','Core Concepts II','Problem Solving Session',
                            'Case Study Discussion','Lab / Practical','Revision','Guest Lecture'];
  v_session_no int;
  v_session_date date;
  v_roll RECORD;
  v_status text;
  v_r numeric;
  v_marks numeric;
  v_grade text;
  v_max numeric;
BEGIN
  FOR v_off IN
    SELECT co.id AS offering_id, co.faculty_id
    FROM public.course_offerings co
  LOOP
    -- 5 attendance sessions per offering, spread over the last ~10 weeks
    FOR v_session_no IN 1..5 LOOP
      v_session_date := CURRENT_DATE - ((10 - v_session_no*2) * 7 + (v_session_no % 3));
      INSERT INTO public.attendance_sessions (offering_id, session_date, period, topic, taken_by, source)
      VALUES (v_off.offering_id, v_session_date, v_session_no, v_topics[1 + floor(random()*array_length(v_topics,1))::int], v_off.faculty_id, 'manual')
      RETURNING id INTO v_session_id;

      FOR v_roll IN
        SELECT student_id FROM public.enrollments WHERE offering_id = v_off.offering_id
      LOOP
        v_r := random();
        v_status := CASE WHEN v_r < 0.83 THEN 'present'
                          WHEN v_r < 0.93 THEN 'absent'
                          WHEN v_r < 0.98 THEN 'late'
                          ELSE 'excused' END;
        INSERT INTO public.attendance_marks (session_id, student_id, status)
        VALUES (v_session_id, v_roll.student_id, v_status)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;

    -- 2 exams per offering: Midterm + Endterm
    INSERT INTO public.exams (offering_id, name, exam_type, exam_date, max_marks, weightage)
    VALUES (v_off.offering_id, 'Mid Semester Exam', 'midterm', CURRENT_DATE - 45, 50, 30)
    RETURNING id INTO v_exam_id;

    FOR v_roll IN SELECT student_id FROM public.enrollments WHERE offering_id = v_off.offering_id LOOP
      v_max := 50;
      v_marks := round(LEAST(v_max, GREATEST(8, (random()*0.55 + 0.35) * v_max))::numeric, 1);
      v_grade := CASE WHEN v_marks >= v_max*0.9 THEN 'A+' WHEN v_marks >= v_max*0.8 THEN 'A'
                       WHEN v_marks >= v_max*0.7 THEN 'B+' WHEN v_marks >= v_max*0.6 THEN 'B'
                       WHEN v_marks >= v_max*0.5 THEN 'C' WHEN v_marks >= v_max*0.4 THEN 'D' ELSE 'F' END;
      INSERT INTO public.exam_marks (exam_id, student_id, marks_obtained, grade, entered_by)
      VALUES (v_exam_id, v_roll.student_id, v_marks, v_grade, v_off.faculty_id)
      ON CONFLICT DO NOTHING;
    END LOOP;

    INSERT INTO public.exams (offering_id, name, exam_type, exam_date, max_marks, weightage)
    VALUES (v_off.offering_id, 'End Semester Exam', 'endterm', CURRENT_DATE - 10, 100, 70)
    RETURNING id INTO v_exam_id;

    FOR v_roll IN SELECT student_id FROM public.enrollments WHERE offering_id = v_off.offering_id LOOP
      v_max := 100;
      v_marks := round(LEAST(v_max, GREATEST(15, (random()*0.55 + 0.35) * v_max))::numeric, 1);
      v_grade := CASE WHEN v_marks >= v_max*0.9 THEN 'A+' WHEN v_marks >= v_max*0.8 THEN 'A'
                       WHEN v_marks >= v_max*0.7 THEN 'B+' WHEN v_marks >= v_max*0.6 THEN 'B'
                       WHEN v_marks >= v_max*0.5 THEN 'C' WHEN v_marks >= v_max*0.4 THEN 'D' ELSE 'F' END;
      INSERT INTO public.exam_marks (exam_id, student_id, marks_obtained, grade, entered_by)
      VALUES (v_exam_id, v_roll.student_id, v_marks, v_grade, v_off.faculty_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Attendance sessions: %, marks: %, exams: %, exam_marks: %',
    (SELECT count(*) FROM public.attendance_sessions),
    (SELECT count(*) FROM public.attendance_marks),
    (SELECT count(*) FROM public.exams),
    (SELECT count(*) FROM public.exam_marks);
END $$;
-- ============================================================
-- SEED: FEES
-- ============================================================
DO $$
DECLARE
  v_prog RECORD;
  v_structure_id uuid;
  v_total numeric;
  v_tuition numeric;
  v_stu RECORD;
  v_invoice_id uuid;
  v_amount_due numeric;
  v_amount_paid numeric;
  v_status text;
  v_r numeric;
  v_invoice_no text;
  v_seq int := 1;
BEGIN
  FOR v_prog IN
    SELECT p.id AS program_id, p.code, p.degree_type, b.id AS batch_id
    FROM public.programs p JOIN public.batches b ON b.program_id = p.id
  LOOP
    v_tuition := CASE WHEN v_prog.degree_type = 'PG' THEN 95000 ELSE 65000 END;
    v_total := v_tuition + 15000 + 5000 + 3000;

    INSERT INTO public.fee_structures (name, program_id, batch_id, academic_year, total_amount, notes)
    VALUES (v_prog.code || ' Annual Fee 2025-26', v_prog.program_id, v_prog.batch_id, '2025-26', v_total,
            'Annual fee structure covering tuition, hostel, library and exam fees')
    RETURNING id INTO v_structure_id;

    INSERT INTO public.fee_components (structure_id, name, amount, is_optional) VALUES
      (v_structure_id, 'Tuition Fee', v_tuition, false),
      (v_structure_id, 'Hostel Fee', 15000, true),
      (v_structure_id, 'Library Fee', 3000, false),
      (v_structure_id, 'Examination Fee', 5000, false);

    FOR v_stu IN
      SELECT id FROM public.students WHERE batch_id = v_prog.batch_id
    LOOP
      v_r := random();
      v_amount_due := v_total;
      IF v_r < 0.55 THEN
        v_status := 'paid'; v_amount_paid := v_amount_due;
      ELSIF v_r < 0.85 THEN
        v_status := 'partial'; v_amount_paid := round((v_amount_due * (0.3 + random()*0.5))::numeric, 2);
      ELSE
        v_status := 'pending'; v_amount_paid := 0;
      END IF;

      v_invoice_no := 'INV-2025-' || lpad(v_seq::text, 5, '0');
      v_seq := v_seq + 1;

      INSERT INTO public.fee_invoices (invoice_number, student_id, structure_id, amount_due, amount_paid, due_date, status, issued_at)
      VALUES (v_invoice_no, v_stu.id, v_structure_id, v_amount_due, v_amount_paid,
              DATE '2025-08-15', v_status, TIMESTAMPTZ '2025-07-01')
      RETURNING id INTO v_invoice_id;

      IF v_amount_paid > 0 THEN
        INSERT INTO public.fee_payments (invoice_id, amount, method, reference, receipt_number, paid_at)
        VALUES (
          v_invoice_id, v_amount_paid,
          (ARRAY['online','cash','cheque','upi'])[1+floor(random()*4)::int],
          'TXN' || floor(random()*900000+100000)::text,
          'RCPT-' || lpad(v_seq::text, 6, '0'),
          TIMESTAMPTZ '2025-08-01' + (floor(random()*30) || ' days')::interval
        );
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Fee structures: %, invoices: %, payments: %',
    (SELECT count(*) FROM public.fee_structures),
    (SELECT count(*) FROM public.fee_invoices),
    (SELECT count(*) FROM public.fee_payments);
END $$;
