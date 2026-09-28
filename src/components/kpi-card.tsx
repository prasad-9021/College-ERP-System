import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  accent?: "violet" | "cyan" | "emerald" | "amber";
}

const accentMap = {
  violet: "from-[oklch(0.7_0.22_295)] to-[oklch(0.65_0.2_270)]",
  cyan: "from-[oklch(0.78_0.16_215)] to-[oklch(0.7_0.18_245)]",
  emerald: "from-[oklch(0.72_0.17_155)] to-[oklch(0.68_0.18_180)]",
  amber: "from-[oklch(0.82_0.16_75)] to-[oklch(0.75_0.18_45)]",
};

export function KpiCard({ label, value, delta, icon: Icon, accent = "violet" }: KpiCardProps) {
  return (
    <div className="surface-elevated rounded-2xl p-5 relative overflow-hidden group hover:translate-y-[-2px] transition-transform duration-300">
      <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${accentMap[accent]} opacity-20 blur-2xl group-hover:opacity-30 transition`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-3xl font-display font-bold tracking-tight">{value}</p>
          {delta && <p className="mt-1 text-xs text-success font-medium">{delta}</p>}
        </div>
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accentMap[accent]} flex items-center justify-center shadow-lg`}>
          <Icon className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
