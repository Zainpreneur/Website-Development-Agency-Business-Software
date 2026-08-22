"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { createProposal, updateProposal } from "@/lib/actions/proposals";
import type { ActionState } from "@/lib/actions/shared";
import { Input, Textarea, Select, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { LinkButton } from "@/components/ui/button";
import { PROPOSAL_STATUS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/utils";

const initialState: ActionState = {};

interface ProposalFormValues {
  id: string;
  clientId: string;
  title: string;
  status: string;
  amount: number;
  validUntil: Date | null;
  content: string | null;
}

export function ProposalForm({
  proposal,
  clients,
  defaultClientId,
}: {
  proposal?: ProposalFormValues;
  clients: { id: string; company: string }[];
  defaultClientId?: string;
}) {
  const action = proposal ? updateProposal.bind(null, proposal.id) : createProposal;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <FieldGroup>
        <Label htmlFor="title" required>
          Title
        </Label>
        <Input id="title" name="title" defaultValue={proposal?.title} required placeholder="Website Redesign Proposal" />
        <FieldError message={state.fieldErrors?.title} />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="clientId" required>
            Client
          </Label>
          <Select id="clientId" name="clientId" defaultValue={proposal?.clientId ?? defaultClientId ?? ""} required>
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </Select>
          <FieldError message={state.fieldErrors?.clientId} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="status" required>
            Status
          </Label>
          <Select id="status" name="status" defaultValue={proposal?.status ?? "DRAFT"} required>
            {Object.entries(PROPOSAL_STATUS).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="amount" required>
            Amount (USD)
          </Label>
          <Input id="amount" name="amount" type="number" min="0" step="50" defaultValue={proposal?.amount ?? 0} required />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="validUntil">Valid until</Label>
          <Input id="validUntil" name="validUntil" type="date" defaultValue={toDateInputValue(proposal?.validUntil)} />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="content">Scope of work</Label>
        <Textarea id="content" name="content" defaultValue={proposal?.content ?? ""} className="min-h-32" placeholder="Describe deliverables, timeline, and terms…" />
      </FieldGroup>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <SubmitButton>{proposal ? "Save changes" : "Create proposal"}</SubmitButton>
        <LinkButton href={proposal ? `/proposals/${proposal.id}` : "/proposals"} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
