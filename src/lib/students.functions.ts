import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const StudentCreateSchema = z.object({
  enrollment_no: z.string().min(2).max(40),
  roll_no: z.string().max(40).optional().nullable(),
  first_name: z.string().min(1).max(80),
  last_name: z.string().min(1).max(80),
  email: z.string().email().max(160),
  phone: z.string().max(20).optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  category: z.string().max(20).optional().nullable(),
  guardian_name: z.string().max(120).optional().nullable(),
  guardian_phone: z.string().max(20).optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  program_id: z.string().uuid().optional().nullable(),
  batch_id: z.string().uuid().optional().nullable(),
  current_semester: z.number().int().min(1).max(12).optional().nullable(),
});

export const listStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { search?: string; status?: string; departmentId?: string } | undefined) => input ?? {})
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("students")
      .select("id, enrollment_no, first_name, last_name, email, phone, status, current_semester, cgpa, attendance_pct, photo_url, department_id, program_id, batch_id, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, "");
      q = q.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,enrollment_no.ilike.%${s}%,email.ilike.%${s}%`);
    }
    if (data.status) q = q.eq("status", data.status as "active");
    if (data.departmentId) q = q.eq("department_id", data.departmentId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getStudent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("students")
      .select("*, departments(name, code), programs(name, code), batches(name)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Student not found");
    return row;
  });

export const createStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => StudentCreateSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("students")
      .insert({ ...data, created_by: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    // audit
    const { recordAudit } = await import("./audit.server");
    await recordAudit({
      userId: context.userId,
      action: "create",
      entityType: "student",
      entityId: row.id,
      metadata: { enrollment_no: row.enrollment_no },
    });
    return row;
  });

export const studentStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [total, active, depts, programs] = await Promise.all([
      context.supabase.from("students").select("id", { count: "exact", head: true }),
      context.supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
      context.supabase.from("departments").select("id", { count: "exact", head: true }),
      context.supabase.from("programs").select("id", { count: "exact", head: true }),
    ]);
    return {
      totalStudents: total.count ?? 0,
      activeStudents: active.count ?? 0,
      departments: depts.count ?? 0,
      programs: programs.count ?? 0,
    };
  });

export const listDepartments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("departments")
      .select("id, code, name, description, established_year")
      .order("code");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listPrograms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("programs")
      .select("id, code, name, degree_type, duration_years, department_id, departments(name, code)")
      .order("code");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listBatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("batches")
      .select("id, name, start_year, end_year, program_id, current_semester, programs(name, code)")
      .order("start_year", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("audit_log")
      .select("id, user_id, action, entity_type, entity_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    return (data ?? []).map((r) => r.role);
  });
