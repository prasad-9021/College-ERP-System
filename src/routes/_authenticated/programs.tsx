import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listPrograms } from "@/lib/students.functions";

export const Route = createFileRoute("/_authenticated/programs")({
  head: () => ({ meta: [{ title: "Programs — Collegium" }] }),
  component: Programs,
});

function Programs() {
  const fn = useServerFn(listPrograms);
  const { data = [] } = useQuery({ queryKey: ["progs"], queryFn: () => fn() });
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-display font-bold tracking-tight">Programs</h2>
      <div className="surface-elevated rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-5 py-3">Code</th><th className="text-left px-5 py-3">Program</th><th className="text-left px-5 py-3">Department</th><th className="text-left px-5 py-3">Type</th><th className="text-left px-5 py-3">Duration</th></tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20">
                <td className="px-5 py-3 font-mono text-xs">{p.code}</td>
                <td className="px-5 py-3 font-medium">{p.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{(p as any).departments?.name ?? "—"}</td>
                <td className="px-5 py-3"><span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent">{p.degree_type}</span></td>
                <td className="px-5 py-3">{p.duration_years} yrs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
