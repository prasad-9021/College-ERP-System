import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listInvoices, createInvoice, recordPayment } from "@/lib/phase2.functions";
import { listStudents } from "@/lib/students.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Receipt, Plus, IndianRupee, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/fees")({
  head: () => ({ meta: [{ title: "Fees — Collegium" }] }),
  component: FeesPage,
});

function FeesPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listInvoices);
  const studFn = useServerFn(listStudents);
  const createFn = useServerFn(createInvoice);
  const payFn = useServerFn(recordPayment);
  const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: () => listFn() });
  const { data: students = [] } = useQuery({ queryKey: ["students-fee"], queryFn: () => studFn() });
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ student_id: "", invoice_number: "", amount_due: 0, due_date: "" });
  const [pay, setPay] = useState({ amount: 0, method: "cash", receipt_number: "", reference: "" });

  const m = useMutation({
    mutationFn: () => createFn({ data: { ...form, amount_due: Number(form.amount_due), due_date: form.due_date || null } }),
    onSuccess: () => { toast.success("Invoice issued"); setOpen(false); qc.invalidateQueries({ queryKey: ["invoices"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const pm = useMutation({
    mutationFn: (invoice_id: string) => payFn({ data: { ...pay, amount: Number(pay.amount), invoice_id, reference: pay.reference || null } }),
    onSuccess: () => { toast.success("Payment recorded"); setPayOpen(null); qc.invalidateQueries({ queryKey: ["invoices"] }); setPay({ amount: 0, method: "cash", receipt_number: "", reference: "" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const total = invoices.reduce((a: number, i: any) => a + Number(i.amount_due), 0);
  const paid = invoices.reduce((a: number, i: any) => a + Number(i.amount_paid), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Fees</h2>
          <p className="text-sm text-muted-foreground mt-1">Invoices, payments & receipts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New invoice</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Issue invoice</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
              <div><Label>Student</Label>
                <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.enrollment_no} — {s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Invoice #</Label><Input required value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} placeholder="INV-2025-001" /></div>
                <div><Label>Amount due</Label><Input type="number" step="0.01" required value={form.amount_due} onChange={(e) => setForm({ ...form, amount_due: +e.target.value })} /></div>
              </div>
              <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={m.isPending}>{m.isPending ? "…" : "Issue"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="surface-elevated rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Total billed</p><p className="text-2xl font-display font-bold mt-2 gradient-text">₹{total.toLocaleString()}</p></div>
        <div className="surface-elevated rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Collected</p><p className="text-2xl font-display font-bold mt-2 text-success">₹{paid.toLocaleString()}</p></div>
        <div className="surface-elevated rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Outstanding</p><p className="text-2xl font-display font-bold mt-2 text-amber-500">₹{(total - paid).toLocaleString()}</p></div>
      </div>

      <div className="surface-elevated rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {invoices.map((i: any) => (
              <tr key={i.id} className="border-t border-border/40 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono text-xs"><Receipt className="inline h-3.5 w-3.5 mr-1.5" />{i.invoice_number}</td>
                <td className="px-4 py-3">{i.students?.first_name} {i.students?.last_name} <span className="text-muted-foreground">({i.students?.enrollment_no})</span></td>
                <td className="px-4 py-3 font-mono">₹{Number(i.amount_due).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-success">₹{Number(i.amount_paid).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {i.status === "paid" ? <span className="inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" />Paid</span>
                    : <span className="inline-flex items-center gap-1 text-xs text-amber-500"><AlertCircle className="h-3.5 w-3.5" />{i.status}</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  {i.status !== "paid" && (
                    <Dialog open={payOpen === i.id} onOpenChange={(o) => setPayOpen(o ? i.id : null)}>
                      <DialogTrigger asChild><Button size="sm" variant="outline"><IndianRupee className="h-3.5 w-3.5 mr-1" />Record</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); pm.mutate(i.id); }} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div><Label>Amount</Label><Input type="number" step="0.01" required value={pay.amount} onChange={(e) => setPay({ ...pay, amount: +e.target.value })} /></div>
                            <div><Label>Method</Label>
                              <Select value={pay.method} onValueChange={(v) => setPay({ ...pay, method: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["cash", "card", "upi", "netbanking", "cheque", "dd"].map((x) => <SelectItem key={x} value={x}>{x.toUpperCase()}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div><Label>Receipt #</Label><Input required value={pay.receipt_number} onChange={(e) => setPay({ ...pay, receipt_number: e.target.value })} placeholder="RCP-001" /></div>
                          <div><Label>Reference</Label><Input value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} /></div>
                          <Button type="submit" className="w-full" disabled={pm.isPending}>{pm.isPending ? "…" : "Record payment"}</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No invoices yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
