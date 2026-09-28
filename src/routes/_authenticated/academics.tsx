import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listCourses, createCourse, listOfferings, createOffering, listTimetable, createTimetableSlot } from "@/lib/phase2.functions";
import { listDepartments, listPrograms, listBatches } from "@/lib/students.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Users, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/academics")({
  head: () => ({ meta: [{ title: "Academics — Collegium" }] }),
  component: AcademicsPage,
});

function AcademicsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header>
        <h2 className="text-2xl font-display font-bold tracking-tight">Academics</h2>
        <p className="text-sm text-muted-foreground mt-1">Courses, sections, faculty assignment & timetable</p>
      </header>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses"><BookOpen className="h-4 w-4 mr-2" />Courses</TabsTrigger>
          <TabsTrigger value="offerings"><Users className="h-4 w-4 mr-2" />Sections & Faculty</TabsTrigger>
          <TabsTrigger value="timetable"><Calendar className="h-4 w-4 mr-2" />Timetable</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="mt-6"><CoursesTab /></TabsContent>
        <TabsContent value="offerings" className="mt-6"><OfferingsTab /></TabsContent>
        <TabsContent value="timetable" className="mt-6"><TimetableTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function CoursesTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listCourses);
  const createFn = useServerFn(createCourse);
  const depFn = useServerFn(listDepartments);
  const progFn = useServerFn(listPrograms);
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => listFn() });
  const { data: depts = [] } = useQuery({ queryKey: ["depts"], queryFn: () => depFn() });
  const { data: programs = [] } = useQuery({ queryKey: ["progs"], queryFn: () => progFn() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", title: "", credits: 3, semester: 1, department_id: "", program_id: "", description: "" });

  const m = useMutation({
    mutationFn: (d: typeof form) => createFn({ data: {
      code: d.code, title: d.title, credits: Number(d.credits),
      semester: Number(d.semester),
      department_id: d.department_id || null,
      program_id: d.program_id || null,
      description: d.description || null,
    } }),
    onSuccess: () => { toast.success("Course created"); setOpen(false); qc.invalidateQueries({ queryKey: ["courses"] }); setForm({ code: "", title: "", credits: 3, semester: 1, department_id: "", program_id: "", description: "" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{courses.length} course{courses.length === 1 ? "" : "s"}</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Course</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create course</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); m.mutate(form); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Code</Label><Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS101" /></div>
                <div><Label>Credits</Label><Input type="number" step="0.5" value={form.credits} onChange={(e) => setForm({ ...form, credits: +e.target.value })} /></div>
              </div>
              <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Department</Label>
                  <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{depts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Program</Label>
                  <Select value={form.program_id} onValueChange={(v) => setForm({ ...form, program_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Semester</Label><Input type="number" min={1} max={12} value={form.semester} onChange={(e) => setForm({ ...form, semester: +e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button type="submit" disabled={m.isPending} className="w-full">{m.isPending ? "Saving…" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="surface-elevated rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Dept</th><th className="px-4 py-3">Sem</th><th className="px-4 py-3">Credits</th></tr>
          </thead>
          <tbody>
            {courses.map((c: any) => (
              <tr key={c.id} className="border-t border-border/40 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.departments?.name ?? "—"}</td>
                <td className="px-4 py-3">{c.semester ?? "—"}</td>
                <td className="px-4 py-3">{c.credits}</td>
              </tr>
            ))}
            {courses.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No courses yet — create the first.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OfferingsTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listOfferings);
  const courseFn = useServerFn(listCourses);
  const batchFn = useServerFn(listBatches);
  const createFn = useServerFn(createOffering);
  const { data: offs = [] } = useQuery({ queryKey: ["offerings"], queryFn: () => listFn() });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => courseFn() });
  const { data: batches = [] } = useQuery({ queryKey: ["batches"], queryFn: () => batchFn() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ course_id: "", batch_id: "", section: "A", academic_year: "2025-26", term: "Sem 1", capacity: 60, room: "" });

  const m = useMutation({
    mutationFn: () => createFn({ data: {
      course_id: form.course_id, batch_id: form.batch_id || null,
      section: form.section, academic_year: form.academic_year, term: form.term || null,
      capacity: Number(form.capacity), room: form.room || null,
    } }),
    onSuccess: () => { toast.success("Section created"); setOpen(false); qc.invalidateQueries({ queryKey: ["offerings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{offs.length} section{offs.length === 1 ? "" : "s"}</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Section</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Open section</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
              <div><Label>Course</Label>
                <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>{courses.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.code} — {c.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Section</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
                <div><Label>Batch</Label>
                  <Select value={form.batch_id} onValueChange={(v) => setForm({ ...form, batch_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{batches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Academic year</Label><Input required value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} /></div>
                <div><Label>Term</Label><Input value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} /></div>
                <div><Label>Room</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
              </div>
              <Button type="submit" disabled={m.isPending} className="w-full">{m.isPending ? "…" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="surface-elevated rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Section</th><th className="px-4 py-3">Year/Term</th><th className="px-4 py-3">Faculty</th><th className="px-4 py-3">Capacity</th></tr>
          </thead>
          <tbody>
            {offs.map((o: any) => (
              <tr key={o.id} className="border-t border-border/40 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono text-xs">{o.courses?.code} <span className="text-muted-foreground">{o.courses?.title}</span></td>
                <td className="px-4 py-3 font-medium">{o.section}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.academic_year} · {o.term ?? "—"}</td>
                <td className="px-4 py-3">{o.profiles?.full_name ?? <span className="text-muted-foreground">Unassigned</span>}</td>
                <td className="px-4 py-3">{o.capacity}</td>
              </tr>
            ))}
            {offs.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No sections yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function TimetableTab() {
  const qc = useQueryClient();
  const ttFn = useServerFn(listTimetable);
  const offFn = useServerFn(listOfferings);
  const createFn = useServerFn(createTimetableSlot);
  const { data: slots = [] } = useQuery({ queryKey: ["timetable"], queryFn: () => ttFn() });
  const { data: offs = [] } = useQuery({ queryKey: ["offerings"], queryFn: () => offFn() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ offering_id: "", day_of_week: 1, start_time: "09:00", end_time: "10:00", room: "" });

  const m = useMutation({
    mutationFn: () => createFn({ data: { ...form, day_of_week: Number(form.day_of_week), room: form.room || null } }),
    onSuccess: () => { toast.success("Slot added"); setOpen(false); qc.invalidateQueries({ queryKey: ["timetable"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const grid: Record<number, any[]> = {};
  for (let d = 0; d < 7; d++) grid[d] = [];
  slots.forEach((s: any) => grid[s.day_of_week].push(s));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Slot</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule slot</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
              <div><Label>Section</Label>
                <Select value={form.offering_id} onValueChange={(v) => setForm({ ...form, offering_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                  <SelectContent>{offs.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.courses?.code} · Sec {o.section}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Day</Label>
                <Select value={String(form.day_of_week)} onValueChange={(v) => setForm({ ...form, day_of_week: +v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
                <div><Label>End</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
              </div>
              <div><Label>Room</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
              <Button type="submit" disabled={m.isPending} className="w-full">{m.isPending ? "…" : "Add"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {DAYS.map((d, i) => (
          <div key={i} className="surface-elevated rounded-xl p-3 min-h-[180px]">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">{d}</h4>
            <ul className="space-y-2">
              {grid[i].map((s) => (
                <li key={s.id} className="rounded-lg bg-primary/10 border border-primary/20 p-2 text-xs">
                  <p className="font-mono">{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}</p>
                  <p className="font-semibold mt-1">{s.course_offerings?.courses?.code}</p>
                  <p className="text-muted-foreground truncate">{s.course_offerings?.courses?.title}</p>
                  {s.room && <p className="text-[10px] text-muted-foreground mt-1">📍 {s.room}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
