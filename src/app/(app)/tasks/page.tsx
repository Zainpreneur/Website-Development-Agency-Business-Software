import Link from "next/link";
import { ListChecks } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { TASK_PRIORITY } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskStatusControl } from "@/components/task-status-control";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "My Tasks" };

export default async function MyTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const user = await requireUser();
  const { scope } = await searchParams;
  const showAll = scope === "all" && (user.role === "ADMIN" || user.role === "MANAGER");

  const tasks = await prisma.task.findMany({
    where: showAll ? {} : { assigneeId: user.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: { project: { include: { client: true } }, assignee: true },
  });

  const now = new Date();
  const open = tasks.filter((t) => t.status !== "DONE");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{showAll ? "All Tasks" : "My Tasks"}</h1>
          <p className="mt-1 text-sm text-muted">{showAll ? "Every task across every project." : "Everything currently assigned to you."}</p>
        </div>
        {(user.role === "ADMIN" || user.role === "MANAGER") && (
          <div className="flex gap-2">
            <Link
              href="/tasks"
              className={cn("rounded-full px-3 py-1 text-xs font-medium", !showAll ? "bg-primary text-primary-foreground" : "bg-surface-hover text-muted-foreground")}
            >
              Mine
            </Link>
            <Link
              href="/tasks?scope=all"
              className={cn("rounded-full px-3 py-1 text-xs font-medium", showAll ? "bg-primary text-primary-foreground" : "bg-surface-hover text-muted-foreground")}
            >
              All
            </Link>
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <Card>
          <EmptyState icon={ListChecks} title="No tasks" description="Nothing assigned yet." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Task</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  {showAll && <th className="px-5 py-3 font-medium">Assignee</th>}
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...open, ...done].map((task) => {
                  const overdue = task.dueDate && task.dueDate < now && task.status !== "DONE";
                  return (
                    <tr key={task.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                      <td className="px-5 py-3">
                        <Link href={`/projects/${task.projectId}/tasks/${task.id}/edit`} className="font-medium text-foreground hover:text-primary">
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        <Link href={`/projects/${task.projectId}/board`} className="hover:text-primary">
                          {task.project.name}
                        </Link>
                        <div className="text-xs">{task.project.client.company}</div>
                      </td>
                      {showAll && <td className="px-5 py-3 text-muted">{task.assignee?.name ?? "Unassigned"}</td>}
                      <td className="px-5 py-3">
                        <StatusBadge status={task.priority} map={TASK_PRIORITY} />
                      </td>
                      <td className={cn("px-5 py-3", overdue ? "font-medium text-danger" : "text-muted")}>{formatDate(task.dueDate)}</td>
                      <td className="px-5 py-3">
                        <TaskStatusControl taskId={task.id} status={task.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
