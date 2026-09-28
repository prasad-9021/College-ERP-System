import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listAttendanceSessions, createAttendanceSession, listOfferings } from "@/lib/phase2.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Fingerprint } from "lucide-react";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({ meta: [{ title: "Attendance — Collegium" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  const qc = useQueryClient();
  const sessFn = useServerFn(listAttendanceSessions);
  const offFn = useServerFn(listOfferings);
  const createFn = useServerFn(createAttendanceSession);
  const { data: sessions = [] } = useQuery({ queryKey: ["att-sessions"], queryFn: () => sessFn() });
  const { data: offs = [] } = useQuery({ queryKey: ["offerings"], queryFn: () => offFn() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ offering_id: "", session_date: new Date().toISOString().slice(0, 10), period: 1, topic: "" });

  const m = useMutation({
    mutationFn: () => createFn({ data: { ...form, period: Number(form.period), topic: form.topic || null } }),
    onSuccess: () => { toast.success("Session created"); setOpen(false); qc.invalidateQueries({ queryKey: ["att-sessions"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Attendance</h2>
          <p className="text-sm text-muted-foreground mt-1">Daily / period-wise sessions · biometric-ready</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled><Fingerprint className="h-4 w-4 mr-2" />Biometric sync</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New session</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Start attendance session</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
                <div><Label>Section</Label>
                  <Select value={form.offering_id} onValueChange={(v) => setForm({ ...form, offering_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{offs.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.courses?.code} · Sec {o.section}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} /></div>
                  <div><Label>Period</Label><Input type="number" value={form.period} onChange={(e) => setForm({ ...form, period: +e.target.value })} /></div>
                </div>
                <div><Label>Topic</Label><Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={m.isPending}>{m.isPending ? "…" : "Create"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="surface-elevated rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Section</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Topic</th><th className="px-4 py-3">Source</th></tr>
          </thead>
          <tbody>
            {sessions.map((s: any) => (
              <tr key={s.id} className="border-t border-border/40 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono text-xs"><Calendar className="inline h-3.5 w-3.5 mr-1.5" />{s.session_date}</td>
                <td className="px-4 py-3 font-medium">{s.course_offerings?.courses?.code} <span className="text-muted-foreground">{s.course_offerings?.courses?.title}</span></td>
                <td className="px-4 py-3">{s.course_offerings?.section}</td>
                <td className="px-4 py-3">{s.period ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.topic ?? "—"}</td>
                <td className="px-4 py-3"><span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-muted/40">{s.source}</span></td>
              </tr>
            ))}
            {sessions.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No attendance sessions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
