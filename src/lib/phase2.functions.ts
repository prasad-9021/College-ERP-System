import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const uuid = z.string().uuid();

// =================== ACADEMICS ===================
export const listCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("courses")
      .select("*, departments(name, code), programs(name)")
      .order("code")
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const CourseSchema = z.object({
  code: z.string().min(2).max(20),
  title: z.string().min(2).max(160),
  description: z.string().max(2000).optional().nullable(),
  credits: z.number().min(0).max(20).default(3),
  department_id: uuid.optional().nullable(),
  program_id: uuid.optional().nullable(),
  semester: z.number().int().min(1).max(12).optional().nullable(),
});
export const createCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => CourseSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("courses").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listOfferings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("course_offerings")
      .select("*, courses(code, title), batches(name), profiles:faculty_id(full_name)")
      .order("academic_year", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const OfferingSchema = z.object({
  course_id: uuid,
  batch_id: uuid.optional().nullable(),
  section: z.string().min(1).max(8).default("A"),
  academic_year: z.string().min(4).max(20),
  term: z.string().max(20).optional().nullable(),
  faculty_id: uuid.optional().nullable(),
  room: z.string().max(40).optional().nullable(),
  capacity: z.number().int().min(1).max(500).default(60),
});
export const createOffering = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => OfferingSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("course_offerings").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listTimetable = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("timetable_slots")
      .select("*, course_offerings(section, courses(code, title), profiles:faculty_id(full_name))")
      .order("day_of_week")
      .order("start_time");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const SlotSchema = z.object({
  offering_id: uuid,
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  room: z.string().max(40).optional().nullable(),
});
export const createTimetableSlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => SlotSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("timetable_slots").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ATTENDANCE ===================
export const listAttendanceSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("attendance_sessions")
      .select("*, course_offerings(section, courses(code, title))")
      .order("session_date", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const AttSessionSchema = z.object({
  offering_id: uuid,
  session_date: z.string(),
  period: z.number().int().optional().nullable(),
  topic: z.string().max(200).optional().nullable(),
});
export const createAttendanceSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => AttSessionSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("attendance_sessions")
      .insert({ ...data, taken_by: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// =================== EXAMS ===================
export const listExams = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("exams")
      .select("*, course_offerings(section, courses(code, title))")
      .order("exam_date", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const ExamSchema = z.object({
  offering_id: uuid,
  name: z.string().min(2).max(120),
  exam_type: z.string().max(40).default("midterm"),
  exam_date: z.string().optional().nullable(),
  max_marks: z.number().min(1).max(1000).default(100),
  weightage: z.number().min(0).max(100).default(100),
});
export const createExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => ExamSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("exams").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

// =================== FEES ===================
export const listInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("fee_invoices")
      .select("*, students(enrollment_no, first_name, last_name)")
      .order("issued_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const InvoiceSchema = z.object({
  student_id: uuid,
  invoice_number: z.string().min(2).max(40),
  amount_due: z.number().min(0),
  due_date: z.string().optional().nullable(),
});
export const createInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => InvoiceSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("fee_invoices").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

const PaymentSchema = z.object({
  invoice_id: uuid,
  amount: z.number().min(0.01),
  method: z.string().max(40).default("cash"),
  reference: z.string().max(80).optional().nullable(),
  receipt_number: z.string().min(2).max(40),
});
export const recordPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => PaymentSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("fee_payments")
      .insert({ ...data, recorded_by: context.userId });
    if (error) throw new Error(error.message);
    // bump invoice amount_paid + status
    const { data: inv } = await context.supabase
      .from("fee_invoices")
      .select("amount_due, amount_paid")
      .eq("id", data.invoice_id)
      .single();
    if (inv) {
      const newPaid = Number(inv.amount_paid) + data.amount;
      const status = newPaid >= Number(inv.amount_due) ? "paid" : "partial";
      await context.supabase.from("fee_invoices").update({ amount_paid: newPaid, status }).eq("id", data.invoice_id);
    }
    return { ok: true };
  });

// =================== LIBRARY ===================
export const listBooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { search?: string } | undefined) => i ?? {})
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("library_books").select("*").order("title").limit(500);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, "");
      q = q.or(`title.ilike.%${s}%,author.ilike.%${s}%,isbn.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const BookSchema = z.object({
  title: z.string().min(1).max(240),
  author: z.string().max(160).optional().nullable(),
  isbn: z.string().max(20).optional().nullable(),
  publisher: z.string().max(120).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  edition: z.string().max(40).optional().nullable(),
  total_copies: z.number().int().min(1).max(1000).default(1),
  available_copies: z.number().int().min(0).max(1000).default(1),
  shelf_location: z.string().max(40).optional().nullable(),
});
export const createBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => BookSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("library_books").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listLoans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("library_loans")
      .select("*, library_books(title, author), students(enrollment_no, first_name, last_name)")
      .order("issued_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const IssueSchema = z.object({
  book_id: uuid,
  student_id: uuid,
  due_at: z.string(),
});
export const issueBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => IssueSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("library_loans").insert({ ...data, issued_by: context.userId });
    if (error) throw new Error(error.message);
    const { data: b } = await context.supabase.from("library_books").select("available_copies").eq("id", data.book_id).single();
    if (b && b.available_copies > 0) {
      await context.supabase.from("library_books").update({ available_copies: b.available_copies - 1 }).eq("id", data.book_id);
    }
    return { ok: true };
  });

export const returnBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ loan_id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: loan, error } = await context.supabase
      .from("library_loans")
      .select("id, book_id, due_at, returned_at")
      .eq("id", data.loan_id)
      .single();
    if (error || !loan) throw new Error("Loan not found");
    if (loan.returned_at) throw new Error("Already returned");
    const overdueDays = Math.max(0, Math.floor((Date.now() - new Date(loan.due_at).getTime()) / 86400000));
    const fine = overdueDays * 5;
    await context.supabase
      .from("library_loans")
      .update({ returned_at: new Date().toISOString(), fine_amount: fine })
      .eq("id", data.loan_id);
    const { data: b } = await context.supabase.from("library_books").select("available_copies").eq("id", loan.book_id).single();
    if (b) {
      await context.supabase.from("library_books").update({ available_copies: b.available_copies + 1 }).eq("id", loan.book_id);
    }
    return { fine };
  });

// =================== PLACEMENTS ===================
export const listCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("placement_companies").select("*").order("name").limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const CompanySchema = z.object({
  name: z.string().min(1).max(160),
  industry: z.string().max(80).optional().nullable(),
  website: z.string().max(240).optional().nullable(),
  contact_email: z.string().email().max(160).optional().nullable().or(z.literal("")),
  contact_phone: z.string().max(20).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});
export const createCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => CompanySchema.parse(i))
  .handler(async ({ data, context }) => {
    const payload = { ...data, contact_email: data.contact_email || null };
    const { data: row, error } = await context.supabase.from("placement_companies").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listDrives = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("placement_drives")
      .select("*, placement_companies(name, logo_url, industry)")
      .order("drive_date", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const DriveSchema = z.object({
  company_id: uuid,
  job_title: z.string().min(2).max(120),
  job_description: z.string().max(4000).optional().nullable(),
  ctc_lpa: z.number().min(0).max(10000).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  eligibility_cgpa: z.number().min(0).max(10).default(0),
  drive_date: z.string().optional().nullable(),
});
export const createDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => DriveSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("placement_drives").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

// =================== COMMUNICATIONS ===================
export const listAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("announcements")
      .select("*, profiles:created_by(full_name)")
      .order("publish_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const AnnSchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().min(2).max(6000),
  audience: z.string().max(40).default("all"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  expires_at: z.string().optional().nullable(),
});
export const createAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => AnnSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("announcements")
      .insert({ ...data, created_by: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
