import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  Receipt,
  Library,
  Briefcase,
  Megaphone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const nav = [
  { group: "Overview", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { group: "Academics", items: [
    { to: "/students", label: "Students", icon: GraduationCap },
    { to: "/departments", label: "Departments", icon: Building2 },
    { to: "/programs", label: "Programs", icon: BookOpen },
    { to: "/academics", label: "Courses & Timetable", icon: Calendar },
    { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
    { to: "/examinations", label: "Examinations", icon: FileText },
  ]},
  { group: "Operations", items: [
    { to: "/fees", label: "Fees", icon: Receipt },
    { to: "/library", label: "Library", icon: Library },
    { to: "/placements", label: "Placements", icon: Briefcase },
    { to: "/communications", label: "Communications", icon: Megaphone },
  ]},
  { group: "System", items: [
    { to: "/audit", label: "Audit Log", icon: ShieldCheck },
  ]},
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="relative">
          <div className="h-9 w-9 rounded-xl bg-[image:var(--gradient-aurora)] flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display font-bold text-sidebar-foreground tracking-tight">Collegium</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Enterprise ERP</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {nav.map((section) => (
          <div key={section.group}>
            <h4 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
              {section.group}
            </h4>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-soft)]"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                      }`}
                    >
                      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-[image:var(--gradient-aurora)]" />}
                      <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                      <span className="flex-1 font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="m-3 rounded-xl glass p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium">System healthy</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Phase 1 active. Academics, Fees, Library & Placements ship in upcoming releases.
        </p>
      </div>
    </aside>
  );
}
