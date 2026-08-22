import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { ClientForm } from "@/components/forms/client-form";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata = { title: "New Client" };

export default async function NewClientPage() {
  await requireRole(MANAGE_ROLES);
  const owners = await prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">New Client</h1>
        <p className="mt-1 text-sm text-muted">Add a lead or active client to the CRM.</p>
      </div>
      <Card>
        <CardHeader title="Client details" />
        <CardBody>
          <ClientForm owners={owners} />
        </CardBody>
      </Card>
    </div>
  );
}
