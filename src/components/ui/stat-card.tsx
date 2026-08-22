import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  trend?: string;
  tone?: "default" | "danger" | "success";
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs",
            tone === "danger" && "text-danger",
            tone === "success" && "text-success",
            tone === "default" && "text-muted",
          )}
        >
          {trend}
        </p>
      )}
    </div>
  );
}
