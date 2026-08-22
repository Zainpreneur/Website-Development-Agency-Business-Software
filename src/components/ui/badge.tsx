import { cn } from "@/lib/utils";
import { TONE_CLASSES } from "@/lib/constants";

export function Badge({
  label,
  tone = "gray",
  className,
}: {
  label: string;
  tone?: keyof typeof TONE_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function StatusBadge({
  status,
  map,
  className,
}: {
  status: string;
  map: Record<string, { label: string; tone: keyof typeof TONE_CLASSES }>;
  className?: string;
}) {
  const entry = map[status] ?? { label: status, tone: "gray" as const };
  return <Badge label={entry.label} tone={entry.tone} className={className} />;
}
