import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStudent, listDepartments, listPrograms, listBatches } from "@/lib/students.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/students/new")({
  head: () => ({ meta: [{ title: "Add student — Collegium" }] }),
  component: NewStudent,
});

function NewStudent() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createStudent);
  const depFn = useServerFn(listDepartments);
  const progFn = useServerFn(listPrograms);
  const batchFn = useServerFn(listBatches);

  const { data: depts = [] } = useQuery({ queryKey: ["depts"], queryFn: () => depFn() });
  const { data: programs = [] } = useQuery({ queryKey: ["progs"], queryFn: () => progFn() });
  const { data: batches = [] } = useQuery({ queryKey: ["batches"], queryFn: () => batchFn() });

  const [form, setForm] = useState({
    enrollment_no: "", first_name: "", last_name: "", email: "", phone: "",
    gender: "" as "" | "male" | "female" | "other",
    date_of_birth: "", category: "", guardian_name: "", guardian_phone: "",
    department_id: "", program_id: "", batch_id: "", current_semester: 1,
  });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: () => create({ data: {
      enrollment_no: form.enrollment_no,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone || null,
      gender: form.gender || null,
      date_of_birth: form.date_of_birth || null,
      category: form.category || null,
      guardian_name: form.guardian_name || null,
      guardian_phone: form.guardian_phone || null,
      department_id: form.department_id || null,
      program_id: form.program_id || null,
      batch_id: form.batch_id || null,
      current_semester: form.current_semester,
    } }),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success(`${s.first_name} added`);
      navigate({ to: "/students/$id", params: { id: s.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const programsFiltered = form.department_id ? programs.filter((p) => p.department_id === form.department_id) : programs;
  const batchesFiltered = form.program_id ? batches.filter((b) => b.program_id === form.program_id) : batches;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/students" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4 mr-1" />Back to students</Link>
      <div>
        <h2 className="text-2xl font-display font-bold tracking-tight">Add new student</h2>
        <p className="text-sm text-muted-foreground mt-1">Onboard a student into the system. Fields marked * are required.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="space-y-8">
        <Section title="Identity">
          <Field label="Enrollment no *"><Input required value={form.enrollment_no} onChange={(e) => set("enrollment_no", e.target.value)} placeholder="e.g. 2024CSE001" /></Field>
          <Field label="First name *"><Input required value={form.first_name} onChange={(e) => set("first_name", e.target.value)} /></Field>
          <Field label="Last name *"><Input required value={form.last_name} onChange={(e) => set("last_name", e.target.value)} /></Field>
          <Field label="Email *"><Input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Gender">
            <Select value={form.gender} onValueChange={(v) => set("gender", v as "male" | "female" | "other")}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date of birth"><Input type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} /></Field>
          <Field label="Category"><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="GEN / OBC / SC / ST" /></Field>
        </Section>

        <Section title="Academic">
          <Field label="Department">
            <Select value={form.department_id} onValueChange={(v) => { set("department_id", v); set("program_id", ""); set("batch_id", ""); }}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{depts.map((d) => <SelectItem key={d.id} value={d.id}>{d.code} — {d.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Program">
            <Select value={form.program_id} onValueChange={(v) => { set("program_id", v); set("batch_id", ""); }} disabled={!form.department_id}>
              <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
              <SelectContent>{programsFiltered.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Batch">
            <Select value={form.batch_id} onValueChange={(v) => set("batch_id", v)} disabled={!form.program_id}>
              <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
              <SelectContent>{batchesFiltered.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Current semester"><Input type="number" min={1} max={12} value={form.current_semester} onChange={(e) => set("current_semester", Number(e.target.value))} /></Field>
        </Section>

        <Section title="Guardian">
          <Field label="Guardian name"><Input value={form.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} /></Field>
          <Field label="Guardian phone"><Input value={form.guardian_phone} onChange={(e) => set("guardian_phone", e.target.value)} /></Field>
        </Section>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/students" })}>Cancel</Button>
          <Button type="submit" disabled={mut.isPending} className="bg-[image:var(--gradient-aurora)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:opacity-90">
            {mut.isPending ? "Saving…" : "Create student"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-elevated rounded-2xl p-6">
      <h3 className="font-display font-semibold mb-5">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
