import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listAnnouncements, createAnnouncement } from "@/lib/phase2.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Plus, Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/communications")({
  head: () => ({ meta: [{ title: "Communications — Collegium" }] }),
  component: CommsPage,
});

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-muted/40 text-muted-foreground",
  normal: "bg-primary/15 text-primary",
  high: "bg-amber-500/20 text-amber-500",
  urgent: "bg-destructive/20 text-destructive",
};

function CommsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAnnouncements);
  const createFn = useServerFn(createAnnouncement);
  const { data: anns = [] } = useQuery({ queryKey: ["anns"], queryFn: () => listFn() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "all", priority: "normal" as const, expires_at: "" });

  const m = useMutation({
    mutationFn: () => createFn({ data: { ...form, expires_at: form.expires_at || null } }),
    onSuccess: () => { toast.success("Announcement published"); setOpen(false); qc.invalidateQueries({ queryKey: ["anns"] }); setForm({ title: "", body: "", audience: "all", priority: "normal", expires_at: "" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Communications</h2>
          <p className="text-sm text-muted-foreground mt-1">Announcements · email · SMS broadcasts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New announcement</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Publish announcement</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
              <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Body</Label><Textarea required rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Audience</Label>
                  <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["all", "students", "faculty", "staff", "parents"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["low", "normal", "high", "urgent"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Expires at</Label><Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={m.isPending}>{m.isPending ? "…" : "Publish"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="space-y-3">
        {anns.map((a: any) => (
          <article key={a.id} className="surface-elevated rounded-2xl p-5 hover:translate-y-[-2px] transition">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-aurora)] flex items-center justify-center shrink-0">
                <Megaphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold">{a.title}</h3>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${PRIORITY_STYLES[a.priority] ?? PRIORITY_STYLES.normal}`}>{a.priority}</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-muted/40 text-muted-foreground">{a.audience}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">{a.body}</p>
                <p className="text-[11px] text-muted-foreground mt-3">
                  By {a.profiles?.full_name ?? "System"} · {new Date(a.publish_at).toLocaleString()}
                </p>
              </div>
            </div>
          </article>
        ))}
        {anns.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-20 surface-elevated rounded-2xl">
            <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            No announcements yet — publish the first.
          </div>
        )}
      </div>
    </div>
  );
}
