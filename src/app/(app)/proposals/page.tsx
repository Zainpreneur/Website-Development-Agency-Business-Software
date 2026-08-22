import Link from "next/link";
import { Plus, FileText } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { PROPOSAL_STATUS } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Proposals" };

export default async function ProposalsPage() {
  await requireRole(MANAGE_ROLES);

  const proposals = await prisma.proposal.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, owner: true },
  });

  const totals = {
    pipeline: proposals.filter((p) => p.status === "SENT").reduce((s, p) => s + p.amount, 0),
    accepted: proposals.filter((p) => p.status === "ACCEPTED").reduce((s, p) => s + p.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Proposals</h1>
          <p className="mt-1 text-sm text-muted">
            {formatCurrency(totals.pipeline)} in open pipeline · {formatCurrency(totals.accepted)} accepted
          </p>
        </div>
        <LinkButton href="/proposals/new">
          <Plus className="h-4 w-4" /> New Proposal
        </LinkButton>
      </div>

      {proposals.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No proposals yet"
            description="Draft a proposal to start moving a lead toward a signed project."
            action={
              <LinkButton href="/proposals/new" size="sm">
                <Plus className="h-4 w-4" /> New Proposal
              </LinkButton>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Proposal</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Valid until</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-5 py-3">
                      <Link href={`/proposals/${p.id}`} className="font-medium text-foreground hover:text-primary">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted">{p.client.company}</td>
                    <td className="px-5 py-3 text-foreground">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(p.validUntil)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} map={PROPOSAL_STATUS} />
                    </td>
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
