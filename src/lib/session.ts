import "server-only";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { AppRole } from "@/types/next-auth";

/** Requires an authenticated session. The proxy already redirects
 * unauthenticated requests, but pages still need the user for display
 * and role checks — this is the single place that reads the session. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** Requires the session user to hold one of the given roles, redirecting
 * back to the dashboard (with a query flag) otherwise. */
export async function requireRole(roles: AppRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/?forbidden=1");
  return user;
}

export const MANAGE_ROLES: AppRole[] = ["ADMIN", "MANAGER"];
export const ADMIN_ROLES: AppRole[] = ["ADMIN"];
