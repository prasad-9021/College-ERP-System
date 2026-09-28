import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listExams, createExam, listOfferings } from "@/lib/phase2.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/examinations")({
  head: () => ({ meta: [{ title: "Examinations — Collegium" }] }),
  component: ExamsPage,
});

function ExamsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listExams);
  const offFn = useServerFn(listOfferings);
  const createFn = useServerFn(createExam);
  const { data: exams = [] } = useQuery({ queryKey: ["exams"], queryFn: () => listFn() });
  const { data: offs = [] } = useQuery({ queryKey: ["offerings"], queryFn: () => offFn() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ offering_id: "", name: "", exam_type: "midterm", exam_date: "", max_marks: 100, weightage: 30 });

  const m = useMutation({
    mutationFn: () => createFn({ data: { ...form, max_marks: Number(form.max_marks), weightage: Number(form.weightage), exam_date: form.exam_date || null } }),
    onSuccess: () => { toast.success("Exam scheduled"); setOpen(false); qc.invalidateQueries({ queryKey: ["exams"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Examinations</h2>
          <p className="text-sm text-muted-foreground mt-1">Exams, marks entry & grade computation</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Schedule exam</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule exam</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
              <div><Label>Section</Label>
                <Select value={form.offering_id} onValueChange={(v) => setForm({ ...form, offering_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{offs.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.courses?.code} · Sec {o.section}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Midterm 1" /></div>
                <div><Label>Type</Label>
                  <Select value={form.exam_type} onValueChange={(v) => setForm({ ...form, exam_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["quiz", "assignment", "midterm", "final", "practical", "viva"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Date</Label><Input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} /></div>
                <div><Label>Max marks</Label><Input type="number" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: +e.target.value })} /></div>
                <div><Label>Weightage %</Label><Input type="number" value={form.weightage} onChange={(e) => setForm({ ...form, weightage: +e.target.value })} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={m.isPending}>{m.isPending ? "…" : "Schedule"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {exams.map((e: any) => (
          <div key={e.id} className="surface-elevated rounded-2xl p-5 hover:translate-y-[-2px] transition">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-aurora)] flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-muted/40">{e.exam_type}</span>
            </div>
            <h3 className="mt-4 font-display font-semibold">{e.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{e.course_offerings?.courses?.code} · Sec {e.course_offerings?.section}</p>
            <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-3 gap-2 text-xs">
              <div><p className="text-muted-foreground">Date</p><p className="font-mono mt-0.5">{e.exam_date ?? "TBD"}</p></div>
              <div><p className="text-muted-foreground">Max</p><p className="font-mono mt-0.5">{e.max_marks}</p></div>
              <div><p className="text-muted-foreground">Weight</p><p className="font-mono mt-0.5">{e.weightage}%</p></div>
            </div>
          </div>
        ))}
        {exams.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-16 surface-elevated rounded-2xl">No exams scheduled yet.</div>}
      </div>
    </div>
  );
}
