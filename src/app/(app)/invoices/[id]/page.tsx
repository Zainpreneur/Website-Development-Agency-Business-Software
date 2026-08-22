import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { deleteInvoice } from "@/lib/actions/invoices";
import { computeInvoiceTotals } from "@/lib/billing";
import { formatCurrency, formatDate } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/submit-button";
import { InvoiceStatusControl } from "@/components/invoice-status-control";
import { PaymentForm } from "@/components/forms/payment-form";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(MANAGE_ROLES);
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      project: true,
      items: { orderBy: { position: "asc" } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!invoice) notFound();

  const totals = computeInvoiceTotals(invoice.items, invoice.taxRate, invoice.payments);
  const overdue = invoice.status !== "PAID" && invoice.status !== "CANCELLED" && invoice.dueDate < new Date();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            <Link href={`/clients/${invoice.client.id}`} className="hover:text-primary">
              {invoice.client.company}
            </Link>
            {invoice.project && (
              <>
                {" "}
                ·{" "}
                <Link href={`/projects/${invoice.project.id}`} className="hover:text-primary">
                  {invoice.project.name}
                </Link>
              </>
            )}
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">{invoice.number}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InvoiceStatusControl invoiceId={invoice.id} status={invoice.status} />
          <LinkButton href={`/invoices/${invoice.id}/edit`} variant="secondary" size="sm">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </LinkButton>
          <form action={deleteInvoice.bind(null, invoice.id)}>
            <ConfirmSubmitButton variant="outline" size="sm" confirmMessage={`Delete invoice ${invoice.number}?`}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="text-lg font-semibold text-foreground">{APP_NAME}</p>
                <p className="text-sm text-muted">Invoice {invoice.number}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted">Issued {formatDate(invoice.issueDate)}</p>
                <p className={overdue ? "font-medium text-danger" : "text-muted"}>Due {formatDate(invoice.dueDate)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Bill to</p>
              <p className="mt-1 font-medium text-foreground">{invoice.client.company}</p>
              <p className="text-sm text-muted">{invoice.client.name}</p>
              <p className="text-sm text-muted">{invoice.client.email}</p>
              {invoice.client.address && <p className="text-sm text-muted">{invoice.client.address}</p>}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 font-medium">Description</th>
                    <th className="py-2 text-right font-medium">Qty</th>
                    <th className="py-2 text-right font-medium">Rate</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 text-foreground">{item.description}</td>
                      <td className="py-2.5 text-right text-muted">{item.quantity}</td>
                      <td className="py-2.5 text-right text-muted">{formatCurrency(item.rate)}</td>
                      <td className="py-2.5 text-right text-foreground">{formatCurrency(item.quantity * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Tax ({invoice.taxRate}%)</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Paid</span>
                <span>{formatCurrency(totals.paid)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-semibold text-foreground">
                <span>Balance due</span>
                <span>{formatCurrency(totals.balance)}</span>
              </div>
            </div>

            {invoice.notes && (
              <div className="border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wide text-muted">Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{invoice.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Record a payment" />
            <CardBody>
              {totals.balance <= 0 ? (
                <p className="text-sm text-muted">This invoice is fully paid.</p>
              ) : (
                <PaymentForm invoiceId={invoice.id} suggestedAmount={totals.balance} />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Payment history" />
            <CardBody className="space-y-3">
              {invoice.payments.length === 0 ? (
                <p className="text-sm text-muted">No payments recorded yet.</p>
              ) : (
                invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-foreground">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-muted">
                        {p.method} · {formatDate(p.paidAt)}
                      </p>
                    </div>
                    {p.reference && <span className="text-xs text-muted">{p.reference}</span>}
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
