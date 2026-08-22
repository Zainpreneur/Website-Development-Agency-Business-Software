import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { TASK_BOARD_COLUMNS, TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { TaskStatusControl } from "@/components/task-status-control";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Board" };

export default async function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      tasks: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        include: { assignee: true },
      },
    },
  });

  if (!project) notFound();

  const now = new Date();

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            <Link href={`/projects/${project.id}`} className="hover:text-primary">
              {project.name}
            </Link>{" "}
            · {project.client.company}
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">Board</h1>
        </div>
        <LinkButton href={`/projects/${project.id}/tasks/new`} size="sm">
          <Plus className="h-4 w-4" /> New Task
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-2 sm:grid-cols-2 xl:grid-cols-4">
        {TASK_BOARD_COLUMNS.map((column) => {
          const tasks = project.tasks.filter((t) => t.status === column);
          const meta = TASK_STATUS[column]!;
          return (
            <div key={column} className="flex min-w-0 flex-col rounded-md border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <span className="text-sm font-medium text-foreground">{meta.label}</span>
                <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs text-muted">{tasks.length}</span>
              </div>
              <div className="thin-scrollbar flex-1 space-y-2 overflow-y-auto p-2" style={{ maxHeight: "calc(100vh - 260px)" }}>
                {tasks.length === 0 && <p className="px-2 py-4 text-center text-xs text-muted">No tasks</p>}
                {tasks.map((task) => {
                  const overdue = task.dueDate && task.dueDate < now && task.status !== "DONE";
                  return (
                    <div key={task.id} className="group rounded-md border border-border bg-background p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/projects/${project.id}/tasks/${task.id}/edit`}
                          className="text-sm font-medium text-foreground hover:text-primary"
                        >
                          {task.title}
                        </Link>
                        <Link
                          href={`/projects/${project.id}/tasks/${task.id}/edit`}
                          className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
                        >
                          <Pencil className="h-3 w-3" />
                        </Link>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <StatusBadge status={task.priority} map={TASK_PRIORITY} />
                        {task.assignee && <Avatar name={task.assignee.name} color={task.assignee.avatarColor} size="xs" />}
                      </div>

                      {task.dueDate && (
                        <p className={cn("mt-2 text-xs", overdue ? "font-medium text-danger" : "text-muted")}>
                          Due {formatDate(task.dueDate)}
                        </p>
                      )}

                      <div className="mt-2">
                        <TaskStatusControl taskId={task.id} status={task.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
