"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2, TriangleAlert } from "lucide-react";

import { createInvoice, updateInvoice } from "@/lib/actions/invoices";
import type { ActionState } from "@/lib/actions/shared";
import { Input, Textarea, Select, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button, LinkButton } from "@/components/ui/button";
import { INVOICE_STATUS } from "@/lib/constants";
import { formatCurrency, toDateInputValue } from "@/lib/utils";

const initialState: ActionState = {};

interface LineItem {
  key: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceFormValues {
  id: string;
  clientId: string;
  projectId: string | null;
  status: string;
  issueDate: Date;
  dueDate: Date;
  taxRate: number;
  notes: string | null;
  items: { description: string; quantity: number; rate: number }[];
}

let keySeed = 0;
function newKey() {
  keySeed += 1;
  return `item-${keySeed}`;
}

export function InvoiceForm({
  invoice,
  clients,
  projects,
}: {
  invoice?: InvoiceFormValues;
  clients: { id: string; company: string }[];
  projects: { id: string; name: string; clientId: string }[];
}) {
  const action = invoice ? updateInvoice.bind(null, invoice.id) : createInvoice;
  const [state, formAction] = useActionState(action, initialState);

  const [clientId, setClientId] = useState(invoice?.clientId ?? clients[0]?.id ?? "");
  const [items, setItems] = useState<LineItem[]>(
    invoice?.items.length
      ? invoice.items.map((i) => ({ ...i, key: newKey() }))
      : [{ key: newKey(), description: "", quantity: 1, rate: 0 }],
  );
  const [taxRate, setTaxRate] = useState(invoice?.taxRate ?? 0);

  const clientProjects = useMemo(() => projects.filter((p) => p.clientId === clientId), [projects, clientId]);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  function updateItem(key: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function addItem() {
    setItems((prev) => [...prev, { key: newKey(), description: "", quantity: 1, rate: 0 }]);
  }

  function removeItem(key: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.key !== key) : prev));
  }

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="clientId" required>
            Client
          </Label>
          <Select id="clientId" name="clientId" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </Select>
          <FieldError message={state.fieldErrors?.clientId} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="projectId">Project</Label>
          <Select id="projectId" name="projectId" defaultValue={invoice?.projectId ?? ""}>
            <option value="">No specific project</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="status" required>
            Status
          </Label>
          <Select id="status" name="status" defaultValue={invoice?.status ?? "DRAFT"} required>
            {Object.entries(INVOICE_STATUS).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="taxRate">Tax rate (%)</Label>
          <Input
            id="taxRate"
            name="taxRate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="issueDate" required>
            Issue date
          </Label>
          <Input id="issueDate" name="issueDate" type="date" defaultValue={toDateInputValue(invoice?.issueDate) || new Date().toISOString().slice(0, 10)} required />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="dueDate" required>
            Due date
          </Label>
          <Input id="dueDate" name="dueDate" type="date" defaultValue={toDateInputValue(invoice?.dueDate)} required />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label>Line items</Label>
        <FieldError message={state.fieldErrors?.items} />
        <div className="space-y-2 rounded-md border border-border p-3">
          <div className="hidden grid-cols-[1fr_90px_110px_110px_32px] gap-2 px-1 text-xs text-muted sm:grid">
            <span>Description</span>
            <span>Qty</span>
            <span>Rate</span>
            <span className="text-right">Amount</span>
            <span />
          </div>
          {items.map((item) => (
            <div key={item.key} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_90px_110px_110px_32px] sm:items-center">
              <Input
                name="itemDescription"
                value={item.description}
                onChange={(e) => updateItem(item.key, { description: e.target.value })}
                placeholder="Service or milestone"
                className="col-span-2 sm:col-span-1"
                required
              />
              <Input
                name="itemQuantity"
                type="number"
                min="0.01"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(item.key, { quantity: Number(e.target.value) || 0 })}
              />
              <Input
                name="itemRate"
                type="number"
                min="0"
                step="0.01"
                value={item.rate}
                onChange={(e) => updateItem(item.key, { rate: Number(e.target.value) || 0 })}
              />
              <span className="text-right text-sm text-muted sm:text-left">{formatCurrency(item.quantity * item.rate)}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.key)} aria-label="Remove line item">
                <Trash2 className="h-4 w-4 text-muted" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" /> Add line item
          </Button>
        </div>

        <div className="ml-auto mt-2 w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Tax ({taxRate || 0}%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={invoice?.notes ?? ""} placeholder="Payment terms, thank-you note, etc." />
      </FieldGroup>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <SubmitButton>{invoice ? "Save changes" : "Create invoice"}</SubmitButton>
        <LinkButton href={invoice ? `/invoices/${invoice.id}` : "/invoices"} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
