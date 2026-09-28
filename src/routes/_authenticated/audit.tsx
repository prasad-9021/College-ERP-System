import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAuditLog } from "@/lib/students.functions";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({ meta: [{ title: "Audit Log — Collegium" }] }),
  component: Audit,
});

function Audit() {
  const fn = useServerFn(getAuditLog);
  const { data = [], isLoading } = useQuery({ queryKey: ["audit"], queryFn: () => fn() });
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-aurora)] flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Audit Log</h2>
          <p className="text-sm text-muted-foreground">Immutable record of administrative changes</p>
        </div>
      </div>
      <div className="surface-elevated rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-5 py-3">Time</th><th className="text-left px-5 py-3">Action</th><th className="text-left px-5 py-3">Entity</th><th className="text-left px-5 py-3">Entity ID</th><th className="text-left px-5 py-3">Details</th></tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {isLoading && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && data.length === 0 && <tr><td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">No events recorded yet</td></tr>}
            {data.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                <td className="px-5 py-3"><span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">{a.action}</span></td>
                <td className="px-5 py-3 font-medium">{a.entity_type}</td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{a.entity_id?.slice(0,8) ?? "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{a.metadata ? JSON.stringify(a.metadata) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
