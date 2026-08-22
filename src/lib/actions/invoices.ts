"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { InvoiceStatus } from "@/generated/prisma/enums";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { invoiceSchema, paymentSchema } from "@/lib/validation";
import { type ActionState, flattenZodError, logActivity } from "@/lib/actions/shared";

function parseInvoiceForm(formData: FormData) {
  const descriptions = formData.getAll("itemDescription");
  const quantities = formData.getAll("itemQuantity");
  const rates = formData.getAll("itemRate");

  const items = descriptions.map((description, i) => ({
    description,
    quantity: quantities[i],
    rate: rates[i],
  }));

  return invoiceSchema.safeParse({
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId"),
    status: formData.get("status"),
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate"),
    taxRate: formData.get("taxRate"),
    notes: formData.get("notes"),
    items,
  });
}

async function nextInvoiceNumber() {
  const last = await prisma.invoice.findFirst({ orderBy: { createdAt: "desc" }, select: { number: true } });
  const lastNumeric = last ? Number.parseInt(last.number.replace(/\D/g, ""), 10) : 1000;
  const next = Number.isFinite(lastNumeric) ? lastNumeric + 1 : 1001;
  return `INV-${next}`;
}

export async function createInvoice(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(MANAGE_ROLES);
  const parsed = parseInvoiceForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const { items, projectId, ...rest } = parsed.data;
  const number = await nextInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      ...rest,
      number,
      projectId: projectId || null,
      ownerId: user.id,
      issueDate: new Date(rest.issueDate),
      dueDate: new Date(rest.dueDate),
      items: { create: items.map((item, position) => ({ ...item, position })) },
    },
  });

  await logActivity(`created invoice ${invoice.number}`, "invoice", invoice.id);

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(invoiceId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(MANAGE_ROLES);
  const parsed = parseInvoiceForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const { items, projectId, ...rest } = parsed.data;
  await prisma.$transaction([
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...rest,
        projectId: projectId || null,
        issueDate: new Date(rest.issueDate),
        dueDate: new Date(rest.dueDate),
      },
    }),
    prisma.invoiceItem.deleteMany({ where: { invoiceId } }),
    prisma.invoiceItem.createMany({
      data: items.map((item, position) => ({ ...item, invoiceId, position })),
    }),
  ]);

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}`);
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  await requireRole(MANAGE_ROLES);
  const invoice = await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
  await logActivity(`marked invoice ${invoice.number} as ${status.toLowerCase()}`, "invoice", invoice.id);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function deleteInvoice(invoiceId: string) {
  await requireRole(MANAGE_ROLES);
  const invoice = await prisma.invoice.delete({ where: { id: invoiceId } });
  await logActivity(`deleted invoice ${invoice.number}`, "invoice", invoiceId);
  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function addPayment(invoiceId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(MANAGE_ROLES);
  const parsed = paymentSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method"),
    paidAt: formData.get("paidAt"),
    reference: formData.get("reference"),
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { items: true, payments: true },
  });

  await prisma.payment.create({
    data: { ...parsed.data, invoiceId, paidAt: new Date(parsed.data.paidAt) },
  });

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const total = subtotal * (1 + invoice.taxRate / 100);
  const paidSoFar = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + parsed.data.amount;

  if (paidSoFar >= total && invoice.status !== "PAID") {
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "PAID" } });
  }

  await logActivity(
    `recorded a $${parsed.data.amount.toFixed(2)} payment on invoice ${invoice.number}`,
    "payment",
    invoice.id,
  );

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  return {};
}
