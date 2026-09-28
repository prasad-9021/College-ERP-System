import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Search, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/students": "Students",
  "/students/new": "Add Student",
  "/departments": "Departments",
  "/programs": "Programs",
  "/audit": "Audit Log",
  "/profile": "Profile",
};

export function AppHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titleMap[pathname] ?? "Collegium";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-6 border-b border-border/60 glass">
      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-lg font-display font-semibold tracking-tight">{title}</h1>
        <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/40 border border-border/60 max-w-md flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search students, courses, faculty…"
            className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded border border-border/60">⌘K</kbd>
        </div>
      </div>

      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-muted/50 transition">
            <Avatar className="h-8 w-8 ring-2 ring-primary/30">
              <AvatarFallback className="bg-[image:var(--gradient-aurora)] text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium truncate max-w-[140px]">{user?.email}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Signed in</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={signOut} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
