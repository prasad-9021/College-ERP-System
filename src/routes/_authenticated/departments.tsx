import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listDepartments, listPrograms } from "@/lib/students.functions";
import { Building2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/departments")({
  head: () => ({ meta: [{ title: "Departments — Collegium" }] }),
  component: Departments,
});

function Departments() {
  const depFn = useServerFn(listDepartments);
  const progFn = useServerFn(listPrograms);
  const { data: depts = [] } = useQuery({ queryKey: ["depts"], queryFn: () => depFn() });
  const { data: programs = [] } = useQuery({ queryKey: ["progs"], queryFn: () => progFn() });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-display font-bold tracking-tight">Departments & Programs</h2>
        <p className="text-sm text-muted-foreground mt-1">Academic structure of your institution</p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {depts.map((d) => {
          const ps = programs.filter((p) => p.department_id === d.id);
          return (
            <div key={d.id} className="surface-elevated rounded-2xl p-6 group hover:translate-y-[-2px] transition">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-aurora)] flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{d.code}</span>
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg">{d.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">Est. {d.established_year ?? "—"}</p>
              <div className="mt-4 pt-4 border-t border-border/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Programs ({ps.length})</p>
                <ul className="space-y-1.5">
                  {ps.map((p) => (
                    <li key={p.id} className="text-sm flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />{p.name}
                      <span className="text-[10px] text-muted-foreground ml-auto">{p.degree_type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
