"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { createClient, updateClient } from "@/lib/actions/clients";
import type { ActionState } from "@/lib/actions/shared";
import { Input, Textarea, Select, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { LinkButton } from "@/components/ui/button";
import { CLIENT_STATUS } from "@/lib/constants";

const initialState: ActionState = {};

interface ClientFormValues {
  id?: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  status: string;
  ownerId: string | null;
}

export function ClientForm({
  client,
  owners,
}: {
  client?: ClientFormValues;
  owners: { id: string; name: string }[];
}) {
  const action = client ? updateClient.bind(null, client.id!) : createClient;
  const [state, formAction] = useActionState(action, initialState);

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
          <Label htmlFor="company" required>
            Company
          </Label>
          <Input id="company" name="company" defaultValue={client?.company} required placeholder="Acme Co." />
          <FieldError message={state.fieldErrors?.company} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="name" required>
            Primary contact
          </Label>
          <Input id="name" name="name" defaultValue={client?.name} required placeholder="Jane Doe" />
          <FieldError message={state.fieldErrors?.name} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input id="email" name="email" type="email" defaultValue={client?.email} required placeholder="jane@acme.com" />
          <FieldError message={state.fieldErrors?.email} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} placeholder="(555) 555-0100" />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" defaultValue={client?.website ?? ""} placeholder="https://acme.com" />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="status" required>
            Status
          </Label>
          <Select id="status" name="status" defaultValue={client?.status ?? "LEAD"} required>
            {Object.entries(CLIENT_STATUS).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" defaultValue={client?.address ?? ""} placeholder="Street, City, State" />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="ownerId">Account owner</Label>
          <Select id="ownerId" name="ownerId" defaultValue={client?.ownerId ?? ""}>
            <option value="">Unassigned</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={client?.notes ?? ""} placeholder="Anything worth remembering about this account…" />
      </FieldGroup>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <SubmitButton>{client ? "Save changes" : "Create client"}</SubmitButton>
        <LinkButton href={client ? `/clients/${client.id}` : "/clients"} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
