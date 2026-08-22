import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ListChecks,
  Clock,
  FileText,
  Receipt,
  UsersRound,
  Settings,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import type { NavItem } from "@/components/nav-links";
import { requireUser } from "@/lib/session";

const iconClass = "h-4 w-4 shrink-0";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className={iconClass} /> },
    { href: "/clients", label: "Clients", icon: <Users className={iconClass} /> },
    { href: "/projects", label: "Projects", icon: <FolderKanban className={iconClass} /> },
    { href: "/tasks", label: "My Tasks", icon: <ListChecks className={iconClass} /> },
    { href: "/time", label: "Time Tracking", icon: <Clock className={iconClass} /> },
  ];

  if (user.role === "ADMIN" || user.role === "MANAGER") {
    navItems.push(
      { href: "/proposals", label: "Proposals", icon: <FileText className={iconClass} /> },
      { href: "/invoices", label: "Invoices", icon: <Receipt className={iconClass} /> },
    );
  }

  if (user.role === "ADMIN") {
    navItems.push({ href: "/team", label: "Team", icon: <UsersRound className={iconClass} /> });
  }

  navItems.push({ href: "/settings", label: "Settings", icon: <Settings className={iconClass} /> });

  return (
    <AppShell
      user={{
        name: user.name ?? user.email ?? "User",
        email: user.email ?? "",
        role: user.role,
        title: user.title,
        avatarColor: user.avatarColor,
      }}
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
