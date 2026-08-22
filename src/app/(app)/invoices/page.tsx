import Link from "next/link";
import { Plus, Receipt } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { computeInvoiceTotals } from "@/lib/billing";
import { INVOICE_STATUS } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  await requireRole(MANAGE_ROLES);

  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: "desc" },
    include: { client: true, items: true, payments: true },
  });

  const outstanding = invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + computeInvoiceTotals(i.items, i.taxRate, i.payments).balance, 0);
  const paidThisYear = invoices
    .flatMap((i) => i.payments)
    .filter((p) => p.paidAt.getFullYear() === new Date().getFullYear())
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Invoices</h1>
          <p className="mt-1 text-sm text-muted">
            {formatCurrency(outstanding)} outstanding · {formatCurrency(paidThisYear)} collected this year
          </p>
        </div>
        <LinkButton href="/invoices/new">
          <Plus className="h-4 w-4" /> New Invoice
        </LinkButton>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            description="Create your first invoice to start billing clients."
            action={
              <LinkButton href="/invoices/new" size="sm">
                <Plus className="h-4 w-4" /> New Invoice
              </LinkButton>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Issued</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Balance</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const totals = computeInvoiceTotals(inv.items, inv.taxRate, inv.payments);
                  return (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                      <td className="px-5 py-3">
                        <Link href={`/invoices/${inv.id}`} className="font-medium text-foreground hover:text-primary">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted">{inv.client.company}</td>
                      <td className="px-5 py-3 text-muted">{formatDate(inv.issueDate)}</td>
                      <td className="px-5 py-3 text-muted">{formatDate(inv.dueDate)}</td>
                      <td className="px-5 py-3 text-foreground">{formatCurrency(totals.total)}</td>
                      <td className="px-5 py-3 text-foreground">{formatCurrency(totals.balance)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={inv.status} map={INVOICE_STATUS} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
