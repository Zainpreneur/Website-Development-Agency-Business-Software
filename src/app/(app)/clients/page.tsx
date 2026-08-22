import Link from "next/link";
import { Plus, Users, Globe, Mail } from "lucide-react";

import { prisma } from "@/lib/prisma";
import type { ClientStatus } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/session";
import { CLIENT_STATUS } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Clients" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const canManage = user.role === "ADMIN" || user.role === "MANAGER";
  const { status } = await searchParams;
  const statusFilter = typeof status === "string" && status !== "ALL" ? status : undefined;

  const clients = await prisma.client.findMany({
    where: statusFilter ? { status: statusFilter as ClientStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { owner: true, projects: { select: { id: true } } },
  });

  const filters: { label: string; value: string }[] = [
    { label: "All", value: "ALL" },
    { label: "Leads", value: "LEAD" },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Clients</h1>
          <p className="mt-1 text-sm text-muted">Every account this agency works with, past and present.</p>
        </div>
        {canManage && (
          <LinkButton href="/clients/new">
            <Plus className="h-4 w-4" /> New Client
          </LinkButton>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (statusFilter ?? "ALL") === f.value;
          return (
            <Link
              key={f.value}
              href={f.value === "ALL" ? "/clients" : `/clients?status=${f.value}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground" : "bg-surface-hover text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {clients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No clients yet"
            description={canManage ? "Add your first client to start tracking projects and invoices." : "No clients match this filter."}
            action={
              canManage && (
                <LinkButton href="/clients/new" size="sm">
                  <Plus className="h-4 w-4" /> New Client
                </LinkButton>
              )
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium">Projects</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-5 py-3">
                      <Link href={`/clients/${client.id}`} className="font-medium text-foreground hover:text-primary">
                        {client.company}
                      </Link>
                      {client.website && (
                        <a
                          href={client.website}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 inline-flex items-center text-muted hover:text-primary"
                        >
                          <Globe className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      <div>{client.name}</div>
                      <a href={`mailto:${client.email}`} className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary">
                        <Mail className="h-3 w-3" /> {client.email}
                      </a>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={client.status} map={CLIENT_STATUS} />
                    </td>
                    <td className="px-5 py-3">
                      {client.owner ? <Avatar name={client.owner.name} color={client.owner.avatarColor} size="xs" /> : <span className="text-muted">—</span>}
                    </td>
                    <td className="px-5 py-3 text-muted">{client.projects.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
