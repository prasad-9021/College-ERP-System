import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { studentStats, listStudents, getAuditLog } from "@/lib/students.functions";
import { KpiCard } from "@/components/kpi-card";
import { Users, GraduationCap, Building2, BookOpen, Activity, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Collegium" }] }),
  component: Dashboard,
  errorComponent: ({ error }) => <div className="p-6 text-destructive">{error.message}</div>,
});

function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground">Good day,</p>
        <h2 className="text-3xl font-display font-bold tracking-tight mt-1">Your campus at a glance</h2>
      </div>

      <Suspense fallback={<KpiSkeleton />}><StatsRow /></Suspense>

      <div className="grid lg:grid-cols-3 gap-6">
        <Suspense fallback={<div className="lg:col-span-2 h-96 rounded-2xl bg-muted/30 animate-pulse" />}>
          <RecentStudents />
        </Suspense>
        <Suspense fallback={<div className="h-96 rounded-2xl bg-muted/30 animate-pulse" />}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}

const statsQO = (fn: () => Promise<any>) => queryOptions({ queryKey: ["dashboard-stats"], queryFn: fn });

function StatsRow() {
  const fn = useServerFn(studentStats);
  const { data } = useSuspenseQuery(statsQO(() => fn()));
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Total Students" value={data.totalStudents.toLocaleString()} delta="+12% this term" icon={GraduationCap} accent="violet" />
      <KpiCard label="Active" value={data.activeStudents.toLocaleString()} icon={Users} accent="cyan" />
      <KpiCard label="Departments" value={data.departments} icon={Building2} accent="emerald" />
      <KpiCard label="Programs" value={data.programs} icon={BookOpen} accent="amber" />
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0,1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-muted/30 animate-pulse" />)}
    </div>
  );
}

function RecentStudents() {
  const fn = useServerFn(listStudents);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["recent-students"], queryFn: () => fn({ data: {} }) }));
  const recent = data.slice(0, 6);
  return (
    <section className="lg:col-span-2 surface-elevated rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-semibold text-lg">Recent students</h3>
          <p className="text-xs text-muted-foreground">Latest admissions across all programs</p>
        </div>
        <Link to="/students" className="text-xs flex items-center gap-1 text-primary hover:underline">
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      {recent.length === 0 ? (
        <div className="py-12 text-center">
          <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No students yet</p>
          <Link to="/students/new" className="inline-block mt-3 text-sm text-primary hover:underline">Add the first student →</Link>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {recent.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <div className="h-9 w-9 rounded-full bg-[image:var(--gradient-aurora)] flex items-center justify-center text-xs font-semibold text-primary-foreground">
                {s.first_name[0]}{s.last_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.first_name} {s.last_name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.enrollment_no} · Sem {s.current_semester ?? "-"}</p>
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                s.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              }`}>{s.status}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentActivity() {
  const fn = useServerFn(getAuditLog);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["recent-activity"], queryFn: () => fn() }));
  const recent = data.slice(0, 8);
  return (
    <section className="surface-elevated rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="font-display font-semibold text-lg">Activity</h3>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No activity yet</p>
      ) : (
        <ul className="space-y-3">
          {recent.map((a) => (
            <li key={a.id} className="text-sm">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="font-medium capitalize">{a.action}</span>
                <span className="text-muted-foreground">{a.entity_type}</span>
              </div>
              <p className="text-[11px] text-muted-foreground ml-3.5 mt-0.5">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
