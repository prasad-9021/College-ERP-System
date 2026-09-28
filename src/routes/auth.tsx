import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in — Collegium ERP" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your inbox to verify.");
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { setLoading(false); return toast.error(result.error.message); }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden bg-sidebar">
        <div className="absolute inset-0 bg-[image:var(--gradient-glow)]" />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[image:var(--gradient-aurora)] flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Sparkles className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-bold text-xl tracking-tight">Collegium</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Enterprise ERP</p>
          </div>
        </div>
        <div className="relative space-y-6 max-w-md">
          <h2 className="text-4xl font-display font-bold leading-tight">
            The campus, <span className="gradient-text">unified.</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            One platform for students, faculty, departments, fees, library, exams, and placements.
            Built for the next decade of higher education.
          </p>
          <div className="flex gap-6 pt-4">
            {[
              { k: "10K+", v: "Students" },
              { k: "1K+", v: "Faculty" },
              { k: "99.9%", v: "Uptime" },
            ].map((s) => (
              <div key={s.v}>
                <p className="text-2xl font-display font-bold gradient-text">{s.k}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} Collegium · Built with care</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-[image:var(--gradient-aurora)] flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="font-display font-bold text-lg">Collegium</p>
          </div>

          <h1 className="text-3xl font-display font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your campus dashboard.</p>

          <Tabs defaultValue="signin" className="mt-8">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-pw">Password</Label>
                  <Input id="si-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-[image:var(--gradient-aurora)] hover:opacity-90 text-primary-foreground font-semibold shadow-[var(--shadow-glow)]" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pw">Password</Label>
                  <Input id="su-pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <p className="text-xs text-muted-foreground">First account becomes Super Admin automatically.</p>
                </div>
                <Button type="submit" className="w-full bg-[image:var(--gradient-aurora)] hover:opacity-90 text-primary-foreground font-semibold shadow-[var(--shadow-glow)]" disabled={loading}>
                  {loading ? "Creating…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button onClick={handleGoogle} variant="outline" className="w-full" disabled={loading}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.3 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C41.4 35.5 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
