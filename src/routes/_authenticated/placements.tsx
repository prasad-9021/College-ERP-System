import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listCompanies, createCompany, listDrives, createDrive } from "@/lib/phase2.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Building, Plus, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/placements")({
  head: () => ({ meta: [{ title: "Placements — Collegium" }] }),
  component: PlacementsPage,
});

function PlacementsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header>
        <h2 className="text-2xl font-display font-bold tracking-tight">Placements</h2>
        <p className="text-sm text-muted-foreground mt-1">Companies, drives, applications & offers</p>
      </header>
      <Tabs defaultValue="drives">
        <TabsList>
          <TabsTrigger value="drives"><Briefcase className="h-4 w-4 mr-2" />Drives</TabsTrigger>
          <TabsTrigger value="companies"><Building className="h-4 w-4 mr-2" />Companies</TabsTrigger>
        </TabsList>
        <TabsContent value="drives" className="mt-6"><DrivesTab /></TabsContent>
        <TabsContent value="companies" className="mt-6"><CompaniesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function CompaniesTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listCompanies);
  const createFn = useServerFn(createCompany);
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => listFn() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", industry: "", website: "", contact_email: "", contact_phone: "", description: "" });

  const m = useMutation({
    mutationFn: () => createFn({ data: {
      name: form.name, industry: form.industry || null, website: form.website || null,
      contact_email: form.contact_email || null, contact_phone: form.contact_phone || null,
      description: form.description || null,
    } }),
    onSuccess: () => { toast.success("Company added"); setOpen(false); qc.invalidateQueries({ queryKey: ["companies"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add company</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Recruiter profile</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Industry</Label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
              </div>
              <div><Label>Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={m.isPending}>{m.isPending ? "…" : "Add"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {companies.map((c: any) => (
          <div key={c.id} className="surface-elevated rounded-2xl p-5 hover:translate-y-[-2px] transition">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-aurora)] flex items-center justify-center">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.industry ?? "—"}</p>
              </div>
            </div>
            {c.description && <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{c.description}</p>}
            <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground space-y-1">
              {c.contact_email && <p>✉ {c.contact_email}</p>}
              {c.website && <p>🌐 {c.website}</p>}
            </div>
          </div>
        ))}
        {companies.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-16 surface-elevated rounded-2xl">No companies yet.</div>}
      </div>
    </div>
  );
}

function DrivesTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listDrives);
  const compFn = useServerFn(listCompanies);
  const createFn = useServerFn(createDrive);
  const { data: drives = [] } = useQuery({ queryKey: ["drives"], queryFn: () => listFn() });
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => compFn() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company_id: "", job_title: "", job_description: "", ctc_lpa: 0, location: "", eligibility_cgpa: 6, drive_date: "" });

  const m = useMutation({
    mutationFn: () => createFn({ data: {
      ...form,
      ctc_lpa: Number(form.ctc_lpa) || null,
      eligibility_cgpa: Number(form.eligibility_cgpa),
      drive_date: form.drive_date || null,
      job_description: form.job_description || null,
      location: form.location || null,
    } }),
    onSuccess: () => { toast.success("Drive created"); setOpen(false); qc.invalidateQueries({ queryKey: ["drives"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New drive</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule placement drive</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
              <div><Label>Company</Label>
                <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{companies.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Job title</Label><Input required value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.job_description} onChange={(e) => setForm({ ...form, job_description: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>CTC (LPA)</Label><Input type="number" step="0.1" value={form.ctc_lpa} onChange={(e) => setForm({ ...form, ctc_lpa: +e.target.value })} /></div>
                <div><Label>Min CGPA</Label><Input type="number" step="0.1" value={form.eligibility_cgpa} onChange={(e) => setForm({ ...form, eligibility_cgpa: +e.target.value })} /></div>
                <div><Label>Date</Label><Input type="date" value={form.drive_date} onChange={(e) => setForm({ ...form, drive_date: e.target.value })} /></div>
              </div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={m.isPending}>{m.isPending ? "…" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {drives.map((d: any) => (
          <div key={d.id} className="surface-elevated rounded-2xl p-5 hover:translate-y-[-2px] transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold text-lg">{d.job_title}</h3>
                <p className="text-sm text-primary">{d.placement_companies?.name}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-success/20 text-success">{d.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div><p className="text-muted-foreground">CTC</p><p className="font-mono mt-0.5">{d.ctc_lpa ? `₹${d.ctc_lpa} LPA` : "—"}</p></div>
              <div><p className="text-muted-foreground">Min CGPA</p><p className="font-mono mt-0.5">{d.eligibility_cgpa}</p></div>
              <div><p className="text-muted-foreground">Date</p><p className="font-mono mt-0.5">{d.drive_date ?? "TBD"}</p></div>
            </div>
            {d.location && <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{d.location}</p>}
          </div>
        ))}
        {drives.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-16 surface-elevated rounded-2xl">No drives scheduled yet.</div>}
      </div>
    </div>
  );
}
