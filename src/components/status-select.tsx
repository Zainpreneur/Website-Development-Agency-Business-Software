"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function StatusSelect<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: Record<string, { label: string }>;
  onChange: (value: T) => Promise<void>;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative inline-flex items-center">
      <Select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as T;
          startTransition(() => {
            onChange(next);
          });
        }}
        className={cn("h-8 w-auto pr-7 text-xs", className)}
      >
        {Object.entries(options).map(([val, meta]) => (
          <option key={val} value={val}>
            {meta.label}
          </option>
        ))}
      </Select>
      {pending && <Loader2 className="pointer-events-none absolute right-1.5 h-3.5 w-3.5 animate-spin text-muted" />}
    </div>
  );
}
