import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2, FolderPlus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { deleteProposal } from "@/lib/actions/proposals";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/submit-button";
import { ProposalStatusControl } from "@/components/proposal-status-control";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(MANAGE_ROLES);
  const { id } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { client: true, owner: true },
  });

  if (!proposal) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            <Link href={`/clients/${proposal.client.id}`} className="hover:text-primary">
              {proposal.client.company}
            </Link>
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">{proposal.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ProposalStatusControl proposalId={proposal.id} status={proposal.status} />
          {proposal.status === "ACCEPTED" && (
            <LinkButton href={`/projects/new?clientId=${proposal.client.id}`} variant="secondary" size="sm">
              <FolderPlus className="h-3.5 w-3.5" /> Start Project
            </LinkButton>
          )}
          <LinkButton href={`/proposals/${proposal.id}/edit`} variant="secondary" size="sm">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </LinkButton>
          <form action={deleteProposal.bind(null, proposal.id)}>
            <ConfirmSubmitButton variant="outline" size="sm" confirmMessage={`Delete proposal "${proposal.title}"?`}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Amount</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(proposal.amount)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Valid until</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatDate(proposal.validUntil)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-muted">Owner</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{proposal.owner?.name ?? "—"}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Scope of work" />
        <CardBody>
          {proposal.content ? (
            <p className="whitespace-pre-wrap text-sm text-foreground">{proposal.content}</p>
          ) : (
            <p className="text-sm text-muted">No scope written yet.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
