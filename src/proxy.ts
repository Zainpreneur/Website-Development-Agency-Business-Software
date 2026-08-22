import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

// Lightweight NextAuth instance (config only, no Prisma/bcrypt) used purely
// to gate routes on the presence of a valid session before a request
// reaches a page or route handler.
const { auth } = NextAuth(authConfig);

// Next.js statically detects the proxy export, so this must be a literal
// named function declaration rather than a renamed destructure.
export function proxy(...args: Parameters<typeof auth>) {
  return auth(...args);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
