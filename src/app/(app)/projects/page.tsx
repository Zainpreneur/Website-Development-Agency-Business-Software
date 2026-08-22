import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/session";
import { PROJECT_STATUS } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Projects" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const canManage = user.role === "ADMIN" || user.role === "MANAGER";
  const { status } = await searchParams;
  const statusFilter = typeof status === "string" && status !== "ALL" ? status : undefined;

  const projects = await prisma.project.findMany({
    where: statusFilter ? { status: statusFilter as ProjectStatus } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      client: true,
      tasks: { select: { status: true } },
      members: { include: { user: true } },
    },
  });

  const filters = [{ label: "All", value: "ALL" }, ...Object.entries(PROJECT_STATUS).map(([value, m]) => ({ label: m.label, value }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted">Every engagement, from discovery to launch.</p>
        </div>
        {canManage && (
          <LinkButton href="/projects/new">
            <Plus className="h-4 w-4" /> New Project
          </LinkButton>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (statusFilter ?? "ALL") === f.value;
          return (
            <Link
              key={f.value}
              href={f.value === "ALL" ? "/projects" : `/projects?status=${f.value}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderKanban}
            title="No projects found"
            description={canManage ? "Create a project to start tracking tasks and billing." : "No projects match this filter."}
            action={
              canManage && (
                <LinkButton href="/projects/new" size="sm">
                  <Plus className="h-4 w-4" /> New Project
                </LinkButton>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const done = project.tasks.filter((t) => t.status === "DONE").length;
            const pct = project.tasks.length ? Math.round((done / project.tasks.length) * 100) : 0;
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{project.name}</p>
                        <p className="truncate text-sm text-muted">{project.client.company}</p>
                      </div>
                      <StatusBadge status={project.status} map={PROJECT_STATUS} />
                    </div>

                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-xs text-muted">
                        <span>{done}/{project.tasks.length} tasks done</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted">
                      <span>{formatCurrency(project.budget)}</span>
                      <span>Due {formatDate(project.dueDate)}</span>
                    </div>

                    {project.members.length > 0 && (
                      <div className="mt-4 flex -space-x-2">
                        {project.members.slice(0, 5).map((m) => (
                          <div
                            key={m.id}
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface text-[9px] font-semibold text-white"
                            style={{ backgroundColor: m.user.avatarColor }}
                            title={m.user.name}
                          >
                            {m.user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
