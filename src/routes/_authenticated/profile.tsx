import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/components/auth-provider";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyRoles } from "@/lib/students.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Collegium" }] }),
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const fn = useServerFn(getMyRoles);
  const { data: roles = [] } = useQuery({ queryKey: ["my-roles"], queryFn: () => fn() });
  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-display font-bold tracking-tight">Profile</h2>
      <div className="surface-elevated rounded-2xl p-8 flex items-center gap-6">
        <div className="h-20 w-20 rounded-2xl bg-[image:var(--gradient-aurora)] flex items-center justify-center text-2xl font-display font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
          {initials}
        </div>
        <div className="flex-1">
          <p className="text-lg font-display font-semibold">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{user?.id}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {roles.map((r) => (
              <span key={r} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary/15 text-primary">{r.replace("_", " ")}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
