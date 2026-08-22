"use client";

import { useState } from "react";
import { LogOut, Menu, X, Briefcase } from "lucide-react";

import { NavLinks, type NavItem } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { ROLE_LABEL, APP_NAME } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { signOutAction } from "@/lib/actions/auth";

interface ShellUser {
  name: string;
  email: string;
  role: string;
  title: string | null;
  avatarColor: string;
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-4 py-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
        <Briefcase className="h-4 w-4" />
      </div>
      <span className="text-sm font-semibold tracking-tight text-white">{APP_NAME}</span>
    </div>
  );
}

function SidebarFooter({ user }: { user: ShellUser }) {
  return (
    <div className="border-t border-sidebar-border px-3 py-3">
      <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
        <Avatar name={user.name} color={user.avatarColor} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user.name}</p>
          <p className="truncate text-xs text-sidebar-foreground">{user.title || ROLE_LABEL[user.role]?.label}</p>
        </div>
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-active/60 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </div>
  );
}

export function AppShell({
  user,
  navItems,
  children,
}: {
  user: ShellUser;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar md:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto thin-scrollbar py-2">
          <NavLinks items={navItems} />
        </div>
        <SidebarFooter user={user} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="mr-3 flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-active"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto thin-scrollbar py-2">
              <NavLinks items={navItems} onNavigate={() => setMobileOpen(false)} />
            </div>
            <SidebarFooter user={user} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Badge label={ROLE_LABEL[user.role]?.label ?? user.role} tone={ROLE_LABEL[user.role]?.tone ?? "gray"} className="hidden sm:inline-flex" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
