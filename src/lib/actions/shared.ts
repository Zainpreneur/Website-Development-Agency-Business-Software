import "server-only";
import type { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export function flattenZodError(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) out[key] = issue.message;
  }
  return out;
}

/** Records a line in the dashboard activity feed, attributed to the
 * current session user. */
export async function logActivity(message: string, entity: string, entityId: string) {
  const user = await requireUser();
  await prisma.activity.create({
    data: { message: `${user.name} ${message}`, entity, entityId, userId: user.id },
  });
}
