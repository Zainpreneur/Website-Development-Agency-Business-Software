"use client";

import { useActionState } from "react";
import { Briefcase, TriangleAlert } from "lucide-react";

import { loginAction, type LoginState } from "@/lib/actions/login";
import { Input, Label, FieldGroup } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: LoginState = {};

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "ava@forgeco.dev" },
  { role: "Manager", email: "marcus@forgeco.dev" },
  { role: "Member", email: "priya@forgeco.dev" },
];

export function LoginForm({ appName }: { appName: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{appName}</h1>
          <p className="mt-1 text-sm text-muted">Sign in to your agency workspace</p>
        </div>

        <form action={formAction} className="space-y-4 rounded-md border border-border bg-surface p-6 shadow-sm">
          {state?.error && (
            <div className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <FieldGroup>
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@agency.com" />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
          </FieldGroup>

          <SubmitButton className="w-full justify-center">Sign in</SubmitButton>
        </form>

        <div className="mt-6 rounded-md border border-dashed border-border p-4 text-xs text-muted">
          <p className="mb-2 font-medium text-foreground">Demo accounts</p>
          <ul className="space-y-1">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email} className="flex items-center justify-between gap-2">
                <span>{a.role}</span>
                <code className="text-foreground">{a.email}</code>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Password for all demo accounts: <code className="text-foreground">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
