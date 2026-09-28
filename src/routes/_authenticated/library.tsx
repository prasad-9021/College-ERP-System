import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listBooks, createBook, listLoans, issueBook, returnBook } from "@/lib/phase2.functions";
import { listStudents } from "@/lib/students.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library, Plus, BookOpenCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Library — Collegium" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header>
        <h2 className="text-2xl font-display font-bold tracking-tight">Library</h2>
        <p className="text-sm text-muted-foreground mt-1">Catalog · issue / return · fines</p>
      </header>
      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog"><Library className="h-4 w-4 mr-2" />Catalog</TabsTrigger>
          <TabsTrigger value="loans"><BookOpenCheck className="h-4 w-4 mr-2" />Loans</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog" className="mt-6"><CatalogTab /></TabsContent>
        <TabsContent value="loans" className="mt-6"><LoansTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function CatalogTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listBooks);
  const createFn = useServerFn(createBook);
  const [search, setSearch] = useState("");
  const { data: books = [] } = useQuery({ queryKey: ["books", search], queryFn: () => listFn({ data: { search } }) });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", isbn: "", publisher: "", category: "", total_copies: 1, shelf_location: "" });

  const m = useMutation({
    mutationFn: () => createFn({ data: {
      title: form.title, author: form.author || null, isbn: form.isbn || null,
      publisher: form.publisher || null, category: form.category || null,
      total_copies: Number(form.total_copies), available_copies: Number(form.total_copies),
      shelf_location: form.shelf_location || null,
    } }),
    onSuccess: () => { toast.success("Book added"); setOpen(false); qc.invalidateQueries({ queryKey: ["books"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center justify-between">
        <Input className="max-w-sm" placeholder="Search title, author, ISBN…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add book</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add book to catalog</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="space-y-3">
              <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
                <div><Label>ISBN</Label><Input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Publisher</Label><Input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} /></div>
                <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Copies</Label><Input type="number" min={1} value={form.total_copies} onChange={(e) => setForm({ ...form, total_copies: +e.target.value })} /></div>
                <div><Label>Shelf</Label><Input value={form.shelf_location} onChange={(e) => setForm({ ...form, shelf_location: e.target.value })} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={m.isPending}>{m.isPending ? "…" : "Add"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="surface-elevated rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Author</th><th className="px-4 py-3">ISBN</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Available</th><th className="px-4 py-3">Shelf</th></tr>
          </thead>
          <tbody>
            {books.map((b: any) => (
              <tr key={b.id} className="border-t border-border/40 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{b.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.author ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{b.isbn ?? "—"}</td>
                <td className="px-4 py-3">{b.category ?? "—"}</td>
                <td className="px-4 py-3"><span className={b.available_copies > 0 ? "text-success" : "text-amber-500"}>{b.available_copies}</span> / {b.total_copies}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.shelf_location ?? "—"}</td>
              </tr>
            ))}
            {books.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No books in catalog.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoansTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listLoans);
  const bookFn = useServerFn(listBooks);
  const studFn = useServerFn(listStudents);
  const issueFn = useServerFn(issueBook);
  const returnFn = useServerFn(returnBook);
  const { data: loans = [] } = useQuery({ queryKey: ["loans"], queryFn: () => listFn() });
  const { data: books = [] } = useQuery({ queryKey: ["books-loan"], queryFn: () => bookFn({ data: {} }) });
  const { data: students = [] } = useQuery({ queryKey: ["students-loan"], queryFn: () => studFn() });
  const [open, setOpen] = useState(false);
  const due = new Date(); due.setDate(due.getDate() + 14);
  const [form, setForm] = useState({ book_id: "", student_id: "", due_at: due.toISOString().slice(0, 10) });

  const im = useMutation({
    mutationFn: () => issueFn({ data: { ...form, due_at: new Date(form.due_at).toISOString() } }),
    onSuccess: () => { toast.success("Book issued"); setOpen(false); qc.invalidateQueries({ queryKey: ["loans"] }); qc.invalidateQueries({ queryKey: ["books"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const rm = useMutation({
    mutationFn: (loan_id: string) => returnFn({ data: { loan_id } }),
    onSuccess: (d: any) => { toast.success(`Returned — fine ₹${d.fine}`); qc.invalidateQueries({ queryKey: ["loans"] }); qc.invalidateQueries({ queryKey: ["books"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Issue book</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Issue book</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); im.mutate(); }} className="space-y-3">
              <div><Label>Book</Label>
                <Select value={form.book_id} onValueChange={(v) => setForm({ ...form, book_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{books.filter((b: any) => b.available_copies > 0).map((b: any) => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Student</Label>
                <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.enrollment_no} — {s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Due date</Label><Input type="date" required value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={im.isPending}>{im.isPending ? "…" : "Issue"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="surface-elevated rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Book</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {loans.map((l: any) => (
              <tr key={l.id} className="border-t border-border/40 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{l.library_books?.title}</td>
                <td className="px-4 py-3">{l.students?.first_name} {l.students?.last_name}</td>
                <td className="px-4 py-3 font-mono text-xs">{new Date(l.issued_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-mono text-xs">{new Date(l.due_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {l.returned_at ? <span className="text-xs text-success">Returned · ₹{Number(l.fine_amount).toFixed(0)} fine</span>
                    : new Date(l.due_at) < new Date() ? <span className="text-xs text-destructive">Overdue</span>
                    : <span className="text-xs text-primary">Active</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  {!l.returned_at && <Button size="sm" variant="outline" onClick={() => rm.mutate(l.id)} disabled={rm.isPending}>Return</Button>}
                </td>
              </tr>
            ))}
            {loans.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No loans yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
