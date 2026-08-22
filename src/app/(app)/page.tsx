import Link from "next/link";
import {
  FolderKanban,
  Users,
  Receipt,
  Clock,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { computeInvoiceTotals } from "@/lib/billing";
import { formatCurrency, formatDate, minutesToHoursLabel, timeAgo } from "@/lib/utils";
import { PROJECT_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { RevenueChart, type RevenuePoint } from "@/components/charts/revenue-chart";

export const metadata = { title: "Dashboard" };

function startOfWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export default async function DashboardPage() {
  const user = await requireUser();
  const canSeeFinancials = user.role === "ADMIN" || user.role === "MANAGER";

  const [
    activeProjectsCount,
    clientCount,
    invoices,
    weekMinutesAgg,
    projectsByStatus,
    recentActivity,
    upcomingTasks,
    upcomingProjects,
    myOpenTaskCount,
  ] = await Promise.all([
    prisma.project.count({ where: { status: { notIn: ["COMPLETED"] } } }),
    prisma.client.count({ where: { status: { not: "INACTIVE" } } }),
    prisma.invoice.findMany({ include: { items: true, payments: true } }),
    prisma.timeEntry.aggregate({
      _sum: { minutes: true },
      where: {
        date: { gte: startOfWeek() },
        ...(user.role === "MEMBER" ? { userId: user.id } : {}),
      },
    }),
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: true } }),
    prisma.task.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: { not: null, lte: daysFromNow(7) },
        ...(user.role === "MEMBER" ? { assigneeId: user.id } : {}),
      },
      orderBy: { dueDate: "asc" },
      take: 6,
      include: { project: { include: { client: true } }, assignee: true },
    }),
    prisma.project.findMany({
      where: { status: { notIn: ["COMPLETED", "ON_HOLD"] }, dueDate: { not: null, lte: daysFromNow(14) } },
      orderBy: { dueDate: "asc" },
      take: 4,
      include: { client: true },
    }),
    prisma.task.count({ where: { assigneeId: user.id, status: { not: "DONE" } } }),
  ]);

  const invoiceTotals = invoices.map((inv) => ({ inv, totals: computeInvoiceTotals(inv.items, inv.taxRate, inv.payments) }));
  const outstanding = invoiceTotals
    .filter(({ inv }) => inv.status === "SENT" || inv.status === "OVERDUE")
    .reduce((sum, { totals }) => sum + totals.balance, 0);
  const overdueCount = invoiceTotals.filter(({ inv }) => inv.status === "OVERDUE").length;

  const now = new Date();
  const monthKeyFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
  const months: { key: string; label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({ key: `${start.getFullYear()}-${start.getMonth()}`, label: monthKeyFmt.format(start), start, end });
  }
  const allPayments = invoices.flatMap((inv) => inv.payments);
  const revenueData: RevenuePoint[] = months.map((m) => ({
    month: m.label,
    revenue: allPayments.filter((p) => p.paidAt >= m.start && p.paidAt < m.end).reduce((s, p) => s + p.amount, 0),
  }));
  const monthToDateRevenue = revenueData[revenueData.length - 1]?.revenue ?? 0;

  const totalActiveOrPlanned = projectsByStatus.reduce((s, p) => s + p._count._all, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Welcome back, {user.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted">Here&apos;s what&apos;s happening across the agency.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={activeProjectsCount} icon={FolderKanban} trend={`${clientCount} active clients`} />
        {canSeeFinancials ? (
          <>
            <StatCard label="Revenue this month" value={formatCurrency(monthToDateRevenue)} icon={Receipt} trend="From recorded payments" tone="success" />
            <StatCard
              label="Outstanding"
              value={formatCurrency(outstanding)}
              icon={AlertTriangle}
              trend={overdueCount > 0 ? `${overdueCount} overdue` : "None overdue"}
              tone={overdueCount > 0 ? "danger" : "default"}
            />
          </>
        ) : (
          <>
            <StatCard label="My Open Tasks" value={myOpenTaskCount} icon={FolderKanban} trend="Across all projects" />
            <StatCard label="Clients" value={clientCount} icon={Users} trend="Active relationships" />
          </>
        )}
        <StatCard
          label={user.role === "MEMBER" ? "My Hours this Week" : "Team Hours this Week"}
          value={minutesToHoursLabel(weekMinutesAgg._sum.minutes ?? 0)}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {canSeeFinancials && (
          <Card className="lg:col-span-2">
            <CardHeader title="Revenue" description="Payments recorded over the last 6 months" />
            <CardBody>
              <RevenueChart data={revenueData} />
            </CardBody>
          </Card>
        )}

        <Card className={canSeeFinancials ? "" : "lg:col-span-2"}>
          <CardHeader title="Project pipeline" description="Where active work stands" />
          <CardBody className="space-y-3">
            {projectsByStatus.length === 0 && <p className="text-sm text-muted">No projects yet.</p>}
            {projectsByStatus.map((row) => {
              const entry = PROJECT_STATUS[row.status] ?? { label: row.status, tone: "gray" as const };
              const pct = Math.round((row._count._all / totalActiveOrPlanned) * 100);
              return (
                <div key={row.status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-foreground">{entry.label}</span>
                    <span className="text-muted">{row._count._all}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: "var(--color-primary)", opacity: 0.4 + pct / 200 }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Upcoming deadlines"
            description="Tasks and projects due in the next 1-2 weeks"
          />
          <CardBody className="space-y-4">
            {upcomingTasks.length === 0 && upcomingProjects.length === 0 && (
              <p className="text-sm text-muted">Nothing due soon. Nice and clear.</p>
            )}
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/projects/${task.projectId}/board`} className="truncate text-sm font-medium text-foreground hover:text-primary">
                    {task.title}
                  </Link>
                  <p className="truncate text-xs text-muted">
                    {task.project.client.company} · {task.project.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={task.priority} map={TASK_PRIORITY} />
                  <span className="text-xs text-muted">{formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))}
            {upcomingProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between gap-3 border-t border-border pt-3 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <Link href={`/projects/${project.id}`} className="truncate text-sm font-medium text-foreground hover:text-primary">
                    {project.name}
                  </Link>
                  <p className="truncate text-xs text-muted">{project.client.company} · project due date</p>
                </div>
                <span className="shrink-0 text-xs text-muted">{formatDate(project.dueDate)}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent activity" />
          <CardBody className="space-y-4">
            {recentActivity.length === 0 && <p className="text-sm text-muted">No activity yet.</p>}
            {recentActivity.map((a) => (
              <div key={a.id} className="flex gap-3">
                <Avatar name={a.user?.name ?? "?"} color={a.user?.avatarColor} size="xs" className="mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="text-xs text-muted">{timeAgo(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all projects <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        {canSeeFinancials && (
          <Link href="/invoices" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all invoices <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
        <Badge label={`${clientCount} clients`} tone="gray" />
      </div>
    </div>
  );
}
