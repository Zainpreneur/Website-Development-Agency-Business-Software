import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata = { title: "New Invoice" };

export default async function NewInvoicePage() {
  await requireRole(MANAGE_ROLES);

  const [clients, projects] = await Promise.all([
    prisma.client.findMany({ orderBy: { company: "asc" }, select: { id: true, company: true } }),
    prisma.project.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, clientId: true } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">New Invoice</h1>
      </div>
      <Card>
        <CardHeader title="Invoice details" />
        <CardBody>
          <InvoiceForm clients={clients} projects={projects} />
        </CardBody>
      </Card>
    </div>
  );
}
