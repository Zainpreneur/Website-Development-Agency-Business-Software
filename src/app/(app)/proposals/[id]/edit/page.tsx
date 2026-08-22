import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { ProposalForm } from "@/components/forms/proposal-form";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata = { title: "Edit Proposal" };

export default async function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(MANAGE_ROLES);
  const { id } = await params;

  const [proposal, clients] = await Promise.all([
    prisma.proposal.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { company: "asc" }, select: { id: true, company: true } }),
  ]);

  if (!proposal) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Edit {proposal.title}</h1>
      </div>
      <Card>
        <CardHeader title="Proposal details" />
        <CardBody>
          <ProposalForm proposal={proposal} clients={clients} />
        </CardBody>
      </Card>
    </div>
  );
}
