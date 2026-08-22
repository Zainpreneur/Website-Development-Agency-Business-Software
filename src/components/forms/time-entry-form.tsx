"use client";

import { useActionState, useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";

import { createTimeEntry } from "@/lib/actions/time";
import type { ActionState } from "@/lib/actions/shared";
import { Input, Select, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

interface ProjectOption {
  id: string;
  name: string;
  client: { company: string };
  tasks: { id: string; title: string }[];
}

export function TimeEntryForm({ projects }: { projects: ProjectOption[] }) {
  const [state, formAction] = useActionState(createTimeEntry, initialState);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");

  const tasks = useMemo(() => projects.find((p) => p.id === projectId)?.tasks ?? [], [projects, projectId]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <FieldGroup>
        <Label htmlFor="projectId" required>
          Project
        </Label>
        <Select id="projectId" name="projectId" value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.client.company} — {p.name}
            </option>
          ))}
        </Select>
        <FieldError message={state.fieldErrors?.projectId} />
      </FieldGroup>

      {tasks.length > 0 && (
        <FieldGroup>
          <Label htmlFor="taskId">Task (optional)</Label>
          <Select id="taskId" name="taskId" defaultValue="">
            <option value="">No specific task</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <Label htmlFor="date" required>
            Date
          </Label>
          <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="hours" required>
            Hours
          </Label>
          <Input id="hours" name="hours" type="number" min="0.25" step="0.25" max="24" defaultValue="1" required />
          <FieldError message={state.fieldErrors?.hours} />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" name="note" placeholder="What did you work on?" className="min-h-16" />
      </FieldGroup>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="billable" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
        Billable
      </label>

      <SubmitButton className="w-full justify-center">Log time</SubmitButton>
    </form>
  );
}
