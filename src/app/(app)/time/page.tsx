import Link from "next/link";
import { Clock, Trash2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatDate, minutesToHoursLabel, cn } from "@/lib/utils";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TimeEntryForm } from "@/components/forms/time-entry-form";
import { ConfirmSubmitButton } from "@/components/ui/submit-button";
import { deleteTimeEntry } from "@/lib/actions/time";
import { Avatar } from "@/components/ui/avatar";

export const metadata = { title: "Time Tracking" };

function startOfWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default async function TimeTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const user = await requireUser();
  const { scope } = await searchParams;
  const showAll = scope === "all" && (user.role === "ADMIN" || user.role === "MANAGER");

  const [projects, entries, weekTotal] = await Promise.all([
    prisma.project.findMany({
      where: { status: { notIn: ["COMPLETED"] } },
      orderBy: { name: "asc" },
      include: { client: { select: { company: true } }, tasks: { select: { id: true, title: true } } },
    }),
    prisma.timeEntry.findMany({
      where: showAll ? {} : { userId: user.id },
      orderBy: { date: "desc" },
      take: 60,
      include: { project: { include: { client: true } }, task: true, user: true },
    }),
    prisma.timeEntry.aggregate({
      _sum: { minutes: true },
      where: { date: { gte: startOfWeek() }, ...(showAll ? {} : { userId: user.id }) },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Time Tracking</h1>
          <p className="mt-1 text-sm text-muted">
            {minutesToHoursLabel(weekTotal._sum.minutes ?? 0)} logged this week
            {showAll ? " (whole team)" : ""}.
          </p>
        </div>
        {(user.role === "ADMIN" || user.role === "MANAGER") && (
          <div className="flex gap-2">
            <Link href="/time" className={cn("rounded-full px-3 py-1 text-xs font-medium", !showAll ? "bg-primary text-primary-foreground" : "bg-surface-hover text-muted-foreground")}>
              Mine
            </Link>
            <Link href="/time?scope=all" className={cn("rounded-full px-3 py-1 text-xs font-medium", showAll ? "bg-primary text-primary-foreground" : "bg-surface-hover text-muted-foreground")}>
              Whole team
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
          <CardHeader title="Log time" />
          <CardBody>
            {projects.length === 0 ? (
              <p className="text-sm text-muted">No active projects to log time against.</p>
            ) : (
              <TimeEntryForm projects={projects} />
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Recent entries" />
          <CardBody className="p-0">
            {entries.length === 0 ? (
              <EmptyState icon={Clock} title="No time logged yet" description="Use the form to log your first entry." />
            ) : (
              <div className="divide-y divide-border">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {showAll && <Avatar name={entry.user.name} color={entry.user.avatarColor} size="xs" />}
                        <p className="truncate text-sm font-medium text-foreground">
                          {entry.project.client.company} — {entry.project.name}
                        </p>
                      </div>
                      {(entry.task || entry.note) && (
                        <p className="mt-0.5 truncate text-xs text-muted">
                          {entry.task ? `${entry.task.title}${entry.note ? " — " : ""}` : ""}
                          {entry.note}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="text-xs text-muted">{formatDate(entry.date)}</span>
                      <span className="text-sm font-medium text-foreground">{minutesToHoursLabel(entry.minutes)}</span>
                      {!entry.billable && <span className="text-xs text-muted">non-billable</span>}
                      {(entry.userId === user.id || user.role === "ADMIN") && (
                        <form action={deleteTimeEntry.bind(null, entry.id)}>
                          <ConfirmSubmitButton variant="ghost" size="icon" confirmMessage="Delete this time entry?">
                            <Trash2 className="h-3.5 w-3.5 text-muted" />
                          </ConfirmSubmitButton>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
