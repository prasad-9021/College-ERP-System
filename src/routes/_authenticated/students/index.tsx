import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listStudents } from "@/lib/students.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/students/")({
  head: () => ({ meta: [{ title: "Students — Collegium" }] }),
  component: StudentsList,
});

function StudentsList() {
  const fn = useServerFn(listStudents);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["students", search],
    queryFn: () => fn({ data: { search: search || undefined } }),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">All students</h2>
          <p className="text-sm text-muted-foreground mt-1">{data?.length ?? 0} records</p>
        </div>
        <Link to="/students/new">
          <Button className="bg-[image:var(--gradient-aurora)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> Add student
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-muted/40 border border-border/60 flex-1 min-w-64">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, enrollment, email…"
            className="bg-transparent border-0 h-auto p-0 focus-visible:ring-0"
          />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filters</Button>
      </div>

      <div className="surface-elevated rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Student</th>
              <th className="text-left px-5 py-3 font-medium">Enrollment</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Email</th>
              <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Semester</th>
              <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">CGPA</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {isLoading && [0,1,2,3].map(i => (
              <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-8 rounded bg-muted/40 animate-pulse" /></td></tr>
            ))}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <tr><td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                No students found. <Link to="/students/new" className="text-primary hover:underline">Add the first →</Link>
              </td></tr>
            )}
            {data?.map((s) => (
              <tr key={s.id} className="hover:bg-muted/20 transition cursor-pointer">
                <td className="px-5 py-3">
                  <Link to="/students/$id" params={{ id: s.id }} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[image:var(--gradient-aurora)] flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                    <span className="font-medium">{s.first_name} {s.last_name}</span>
                  </Link>
                </td>
                <td className="px-5 py-3 font-mono text-xs">{s.enrollment_no}</td>
                <td className="px-5 py-3 hidden md:table-cell text-muted-foreground">{s.email}</td>
                <td className="px-5 py-3 hidden lg:table-cell">{s.current_semester ?? "—"}</td>
                <td className="px-5 py-3 hidden lg:table-cell">{s.cgpa ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    s.status === "active" ? "bg-success/15 text-success" :
                    s.status === "graduated" ? "bg-accent/15 text-accent" :
                    "bg-muted text-muted-foreground"
                  }`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
