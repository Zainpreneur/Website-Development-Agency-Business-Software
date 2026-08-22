import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Globe, MapPin, Pencil, Trash2, Plus, FolderKanban } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { deleteClient } from "@/lib/actions/clients";
import { computeInvoiceTotals } from "@/lib/billing";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CLIENT_STATUS, PROJECT_STATUS, PROPOSAL_STATUS, INVOICE_STATUS } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/submit-button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const canManage = user.role === "ADMIN" || user.role === "MANAGER";
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      owner: true,
      projects: { orderBy: { createdAt: "desc" } },
      proposals: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" }, include: { items: true, payments: true } },
    },
  });

  if (!client) notFound();

  const totalBilled = client.invoices.reduce((sum, inv) => sum + computeInvoiceTotals(inv.items, inv.taxRate).total, 0);
  const totalOutstanding = client.invoices.reduce(
    (sum, inv) => sum + computeInvoiceTotals(inv.items, inv.taxRate, inv.payments).balance,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{client.company}</h1>
            <StatusBadge status={client.status} map={CLIENT_STATUS} />
          </div>
          <p className="mt-1 text-sm text-muted">Primary contact: {client.name}</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <LinkButton href={`/clients/${client.id}/edit`} variant="secondary" size="sm">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </LinkButton>
            <form action={deleteClient.bind(null, client.id)}>
              <ConfirmSubmitButton
                variant="outline"
                size="sm"
                confirmMessage={`Delete ${client.company}? This also deletes their projects, proposals, and invoices.`}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </ConfirmSubmitButton>
            </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Contact" />
          <CardBody className="space-y-3 text-sm">
            <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-foreground hover:text-primary">
              <Mail className="h-4 w-4 text-muted" /> {client.email}
            </a>
            {client.phone && (
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="h-4 w-4 text-muted" /> {client.phone}
              </div>
            )}
            {client.website && (
              <a href={client.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary">
                <Globe className="h-4 w-4 text-muted" /> {client.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {client.address && (
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-muted" /> {client.address}
              </div>
            )}
            {client.owner && (
              <div className="flex items-center gap-2 pt-2">
                <Avatar name={client.owner.name} color={client.owner.avatarColor} size="xs" />
                <span className="text-muted">Owned by {client.owner.name}</span>
              </div>
            )}
            {client.notes && <p className="border-t border-border pt-3 text-muted">{client.notes}</p>}
          </CardBody>
        </Card>

        {canManage && (
          <Card className="lg:col-span-2">
            <CardHeader title="Billing summary" />
            <CardBody>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted">Total billed</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(totalBilled)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Outstanding</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(totalOutstanding)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Invoices</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{client.invoices.length}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader
          title="Projects"
          action={
            canManage && (
              <LinkButton href={`/projects/new?clientId=${client.id}`} size="sm" variant="secondary">
                <Plus className="h-3.5 w-3.5" /> New Project
              </LinkButton>
            )
          }
        />
        <CardBody>
          {client.projects.length === 0 ? (
            <EmptyState icon={FolderKanban} title="No projects yet" />
          ) : (
            <div className="divide-y divide-border">
              {client.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary"
                >
                  <span className="font-medium text-foreground">{project.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{formatDate(project.dueDate)}</span>
                    <StatusBadge status={project.status} map={PROJECT_STATUS} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {canManage && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Proposals" />
            <CardBody>
              {client.proposals.length === 0 ? (
                <p className="text-sm text-muted">No proposals yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {client.proposals.map((p) => (
                    <Link key={p.id} href={`/proposals/${p.id}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary">
                      <span className="font-medium text-foreground">{p.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted">{formatCurrency(p.amount)}</span>
                        <StatusBadge status={p.status} map={PROPOSAL_STATUS} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Invoices" />
            <CardBody>
              {client.invoices.length === 0 ? (
                <p className="text-sm text-muted">No invoices yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {client.invoices.map((inv) => (
                    <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary">
                      <span className="font-medium text-foreground">{inv.number}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted">{formatCurrency(computeInvoiceTotals(inv.items, inv.taxRate).total)}</span>
                        <StatusBadge status={inv.status} map={INVOICE_STATUS} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
