export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Forge & Co.";

type Tone = "gray" | "blue" | "amber" | "green" | "red" | "purple" | "pink";

export const CLIENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  LEAD: { label: "Lead", tone: "amber" },
  ACTIVE: { label: "Active", tone: "green" },
  INACTIVE: { label: "Inactive", tone: "gray" },
};

export const PROJECT_STATUS: Record<string, { label: string; tone: Tone }> = {
  PLANNING: { label: "Planning", tone: "purple" },
  IN_PROGRESS: { label: "In Progress", tone: "blue" },
  REVIEW: { label: "In Review", tone: "amber" },
  ON_HOLD: { label: "On Hold", tone: "gray" },
  COMPLETED: { label: "Completed", tone: "green" },
};

export const TASK_STATUS: Record<string, { label: string; tone: Tone }> = {
  TODO: { label: "To Do", tone: "gray" },
  IN_PROGRESS: { label: "In Progress", tone: "blue" },
  REVIEW: { label: "In Review", tone: "amber" },
  DONE: { label: "Done", tone: "green" },
};

export const TASK_PRIORITY: Record<string, { label: string; tone: Tone }> = {
  LOW: { label: "Low", tone: "gray" },
  MEDIUM: { label: "Medium", tone: "blue" },
  HIGH: { label: "High", tone: "amber" },
  URGENT: { label: "Urgent", tone: "red" },
};

export const PROPOSAL_STATUS: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Draft", tone: "gray" },
  SENT: { label: "Sent", tone: "blue" },
  ACCEPTED: { label: "Accepted", tone: "green" },
  DECLINED: { label: "Declined", tone: "red" },
};

export const INVOICE_STATUS: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Draft", tone: "gray" },
  SENT: { label: "Sent", tone: "blue" },
  PAID: { label: "Paid", tone: "green" },
  OVERDUE: { label: "Overdue", tone: "red" },
  CANCELLED: { label: "Cancelled", tone: "gray" },
};

export const ROLE_LABEL: Record<string, { label: string; tone: Tone }> = {
  ADMIN: { label: "Admin", tone: "purple" },
  MANAGER: { label: "Manager", tone: "blue" },
  MEMBER: { label: "Member", tone: "gray" },
};

export const TASK_BOARD_COLUMNS = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

export const TONE_CLASSES: Record<Tone, string> = {
  gray: "bg-zinc-100 text-zinc-700 ring-zinc-600/10 dark:bg-zinc-500/15 dark:text-zinc-300 dark:ring-zinc-400/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/20",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
  green:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/20",
  purple:
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/20",
  pink: "bg-pink-50 text-pink-700 ring-pink-600/20 dark:bg-pink-500/15 dark:text-pink-300 dark:ring-pink-400/20",
};
