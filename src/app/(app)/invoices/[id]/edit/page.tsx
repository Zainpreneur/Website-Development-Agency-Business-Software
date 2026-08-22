import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata = { title: "Edit Invoice" };

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(MANAGE_ROLES);
  const { id } = await params;

  const [invoice, clients, projects] = await Promise.all([
    prisma.invoice.findUnique({ where: { id }, include: { items: { orderBy: { position: "asc" } } } }),
    prisma.client.findMany({ orderBy: { company: "asc" }, select: { id: true, company: true } }),
    prisma.project.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, clientId: true } }),
  ]);

  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Edit {invoice.number}</h1>
      </div>
      <Card>
        <CardHeader title="Invoice details" />
        <CardBody>
          <InvoiceForm invoice={invoice} clients={clients} projects={projects} />
        </CardBody>
      </Card>
    </div>
  );
}
