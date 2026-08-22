"use client";

import { StatusSelect } from "@/components/status-select";
import { updateInvoiceStatus } from "@/lib/actions/invoices";
import { INVOICE_STATUS } from "@/lib/constants";
import type { InvoiceStatus } from "@/generated/prisma/enums";

export function InvoiceStatusControl({ invoiceId, status }: { invoiceId: string; status: InvoiceStatus }) {
  return (
    <StatusSelect value={status} options={INVOICE_STATUS} onChange={(next) => updateInvoiceStatus(invoiceId, next)} />
  );
}
