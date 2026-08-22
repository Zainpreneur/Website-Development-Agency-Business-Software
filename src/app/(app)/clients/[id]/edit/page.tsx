import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { ClientForm } from "@/components/forms/client-form";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata = { title: "Edit Client" };

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(MANAGE_ROLES);
  const { id } = await params;

  const [client, owners] = await Promise.all([
    prisma.client.findUnique({ where: { id } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!client) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Edit {client.company}</h1>
      </div>
      <Card>
        <CardHeader title="Client details" />
        <CardBody>
          <ClientForm client={client} owners={owners} />
        </CardBody>
      </Card>
    </div>
  );
}
