export interface InvoiceLineItem {
  quantity: number;
  rate: number;
}

export interface InvoiceTotals {
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
}

export function computeInvoiceTotals(
  items: InvoiceLineItem[],
  taxRate: number,
  payments: { amount: number }[] = [],
): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  return { subtotal, tax, total, paid, balance: Math.max(total - paid, 0) };
}
