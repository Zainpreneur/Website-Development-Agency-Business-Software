"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { addPayment } from "@/lib/actions/invoices";
import type { ActionState } from "@/lib/actions/shared";
import { Input, Select, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function PaymentForm({ invoiceId, suggestedAmount }: { invoiceId: string; suggestedAmount: number }) {
  const [state, formAction] = useActionState(addPayment.bind(null, invoiceId), initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label htmlFor="amount" required>
            Amount
          </Label>
          <Input id="amount" name="amount" type="number" min="0.01" step="0.01" defaultValue={suggestedAmount > 0 ? suggestedAmount.toFixed(2) : undefined} required />
          <FieldError message={state.fieldErrors?.amount} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="paidAt" required>
            Date
          </Label>
          <Input id="paidAt" name="paidAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="method">Method</Label>
        <Select id="method" name="method" defaultValue="Bank Transfer">
          <option>Bank Transfer</option>
          <option>Credit Card</option>
          <option>Check</option>
          <option>Cash</option>
          <option>Other</option>
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="reference">Reference (optional)</Label>
        <Input id="reference" name="reference" placeholder="Check #, transaction id…" />
      </FieldGroup>

      <SubmitButton className="w-full justify-center">Record payment</SubmitButton>
    </form>
  );
}
