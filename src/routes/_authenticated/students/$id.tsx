import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getStudent } from "@/lib/students.functions";
import { ArrowLeft, Mail, Phone, Calendar, MapPin, User2, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/students/$id")({
  head: () => ({ meta: [{ title: "Student — Collegium" }] }),
  component: StudentDetail,
});

function StudentDetail() {
  const { id } = Route.useParams();
  const fn = useServerFn(getStudent);
  const { data: s, isLoading, error } = useQuery({ queryKey: ["student", id], queryFn: () => fn({ data: { id } }) });

  if (isLoading) return <div className="h-64 rounded-2xl bg-muted/30 animate-pulse max-w-4xl mx-auto" />;
  if (error || !s) return <div className="text-destructive max-w-4xl mx-auto">{(error as Error)?.message ?? "Not found"}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/students" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4 mr-1" />Students</Link>

      <div className="surface-elevated rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-glow)] opacity-50" />
        <div className="relative flex flex-col sm:flex-row gap-6 items-start">
          <div className="h-20 w-20 rounded-2xl bg-[image:var(--gradient-aurora)] flex items-center justify-center text-2xl font-display font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
            {s.first_name[0]}{s.last_name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl font-display font-bold tracking-tight">{s.first_name} {s.last_name}</h2>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                s.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              }`}>{s.status}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{s.enrollment_no}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{s.email}</span>
              {s.phone && <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{s.phone}</span>}
              <span className="flex items-center gap-1.5 text-muted-foreground"><GraduationCap className="h-3.5 w-3.5" />Semester {s.current_semester}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-right">
            <Stat label="CGPA" value={s.cgpa ?? "—"} />
            <Stat label="Attendance" value={s.attendance_pct ? `${s.attendance_pct}%` : "—"} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Academic">
          <Row icon={GraduationCap} label="Department" value={(s as any).departments?.name ?? "—"} />
          <Row icon={GraduationCap} label="Program" value={(s as any).programs?.name ?? "—"} />
          <Row icon={Calendar} label="Batch" value={(s as any).batches?.name ?? "—"} />
          <Row icon={Calendar} label="Admission" value={new Date(s.admission_date).toLocaleDateString()} />
        </Card>
        <Card title="Personal">
          <Row icon={User2} label="Gender" value={s.gender ?? "—"} />
          <Row icon={Calendar} label="Date of birth" value={s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString() : "—"} />
          <Row icon={User2} label="Category" value={s.category ?? "—"} />
          <Row icon={MapPin} label="City" value={s.city ?? "—"} />
        </Card>
        <Card title="Guardian">
          <Row icon={User2} label="Name" value={s.guardian_name ?? "—"} />
          <Row icon={Phone} label="Phone" value={s.guardian_phone ?? "—"} />
          <Row icon={Mail} label="Email" value={s.guardian_email ?? "—"} />
          <Row icon={User2} label="Relation" value={s.guardian_relation ?? "—"} />
        </Card>
        <Card title="Address">
          <p className="text-sm text-muted-foreground">
            {[s.address_line1, s.address_line2, s.city, s.state, s.pincode].filter(Boolean).join(", ") || "Not provided"}
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="surface-elevated rounded-2xl p-6"><h3 className="font-display font-semibold mb-4">{title}</h3><div className="space-y-3">{children}</div></div>;
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-2xl font-display font-bold mt-1">{value}</p></div>;
}
function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground w-28">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
