import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2, KanbanSquare, Receipt } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteProject } from "@/lib/actions/projects";
import { computeInvoiceTotals } from "@/lib/billing";
import { formatCurrency, formatDate, minutesToHoursLabel } from "@/lib/utils";
import { TASK_STATUS, INVOICE_STATUS, PROJECT_STATUS } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/submit-button";
import { Avatar } from "@/components/ui/avatar";
import { ProjectStatusControl } from "@/components/project-status-control";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const canManage = user.role === "ADMIN" || user.role === "MANAGER";
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      members: { include: { user: true } },
      tasks: true,
      timeEntries: { include: { user: true } },
      invoices: { include: { items: true, payments: true } },
    },
  });

  if (!project) notFound();

  const totalMinutes = project.timeEntries.reduce((s, t) => s + t.minutes, 0);
  const billableMinutes = project.timeEntries.filter((t) => t.billable).reduce((s, t) => s + t.minutes, 0);
  const tasksByStatus = Object.keys(TASK_STATUS).map((status) => ({
    status,
    count: project.tasks.filter((t) => t.status === status).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            <Link href={`/clients/${project.client.id}`} className="hover:text-primary">
              {project.client.company}
            </Link>
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">{project.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManage ? (
            <ProjectStatusControl projectId={project.id} status={project.status} />
          ) : (
            <StatusBadge status={project.status} map={PROJECT_STATUS} />
          )}
          <LinkButton href={`/projects/${project.id}/board`} variant="secondary" size="sm">
            <KanbanSquare className="h-3.5 w-3.5" /> Board
          </LinkButton>
          {canManage && (
            <>
              <LinkButton href={`/projects/${project.id}/edit`} variant="secondary" size="sm">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </LinkButton>
              <form action={deleteProject.bind(null, project.id)}>
                <ConfirmSubmitButton variant="outline" size="sm" confirmMessage={`Delete "${project.name}"? This deletes its tasks and time entries.`}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </ConfirmSubmitButton>
              </form>
            </>
          )}
        </div>
      </div>

      {project.description && <p className="max-w-3xl text-sm text-muted">{project.description}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Budget</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(project.budget)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Timeline</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDate(project.startDate)} – {formatDate(project.dueDate)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Hours logged</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{minutesToHoursLabel(totalMinutes)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Billable hours</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{minutesToHoursLabel(billableMinutes)}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Task breakdown" action={<LinkButton href={`/projects/${project.id}/board`} size="sm" variant="ghost">Open board →</LinkButton>} />
          <CardBody>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {tasksByStatus.map(({ status, count }) => (
                <div key={status} className="rounded-md border border-border p-3 text-center">
                  <p className="text-2xl font-semibold text-foreground">{count}</p>
                  <StatusBadge status={status} map={TASK_STATUS} className="mt-1" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Team" />
          <CardBody className="space-y-3">
            {project.members.length === 0 && <p className="text-sm text-muted">No team members assigned.</p>}
            {project.members.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5">
                <Avatar name={m.user.name} color={m.user.avatarColor} size="sm" />
                <div>
                  <p className="text-sm font-medium text-foreground">{m.user.name}</p>
                  <p className="text-xs text-muted">{m.user.title ?? m.user.role}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {canManage && project.invoices.length > 0 && (
        <Card>
          <CardHeader title="Invoices" action={<Receipt className="h-4 w-4 text-muted" />} />
          <CardBody>
            <div className="divide-y divide-border">
              {project.invoices.map((inv) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary">
                  <span className="font-medium text-foreground">{inv.number}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{formatCurrency(computeInvoiceTotals(inv.items, inv.taxRate).total)}</span>
                    <StatusBadge status={inv.status} map={INVOICE_STATUS} />
                  </div>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
