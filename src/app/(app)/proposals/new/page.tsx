import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { ProposalForm } from "@/components/forms/proposal-form";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata = { title: "New Proposal" };

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  await requireRole(MANAGE_ROLES);
  const { clientId } = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: { company: "asc" }, select: { id: true, company: true } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">New Proposal</h1>
      </div>
      <Card>
        <CardHeader title="Proposal details" />
        <CardBody>
          <ProposalForm clients={clients} defaultClientId={clientId} />
        </CardBody>
      </Card>
    </div>
  );
}
