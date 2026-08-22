import path from "node:path";

/**
 * Resolves DATABASE_URL for direct driver-adapter use (Prisma Client at
 * runtime, and the seed script). `prisma.config.ts` lives at the project
 * root, so the Prisma CLI resolves a relative `file:` SQLite path
 * relative to the project root — this mirrors that (via process.cwd(),
 * which Next.js and npm scripts always set to the project root) so both
 * the CLI and the app/seed script open the same physical file.
 *
 * Non-file URLs (e.g. a Postgres connection string in production) pass
 * through unchanged.
 */
export function resolveDatabaseUrl(raw = process.env.DATABASE_URL ?? "file:./dev.db") {
  if (!raw.startsWith("file:")) return raw;

  const relativePath = raw.slice("file:".length);
  if (path.isAbsolute(relativePath)) return raw;

  // This branch only fires for local/demo SQLite (`file:` URLs) — a real
  // deployment's DATABASE_URL points at Postgres/MySQL/etc. and never
  // reaches here. The ignore comment stops Turbopack from tracing the
  // whole project into the server bundle just because it can't prove
  // that statically.
  const absolutePath = path.join(/* turbopackIgnore: true */ process.cwd(), relativePath);
  return `file:${absolutePath}`;
}
