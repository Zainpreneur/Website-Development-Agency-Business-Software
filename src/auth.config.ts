import type { NextAuthConfig } from "next-auth";

/**
 * Edge/proxy-safe auth config: no database or bcrypt imports here so this
 * can be bundled into the route proxy. The Credentials provider (which does
 * touch Prisma) is added on top of this in `src/auth.ts`, which is only
 * used from route handlers and server components.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  // Self-hosted deployments (not Vercel) sit behind a proxy that sets the
  // Host header themselves — Auth.js trusts it by default only on Vercel.
  // Set AUTH_URL (or NEXTAUTH_URL) in production instead if the deployment
  // host isn't otherwise controlled/known.
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth");

      if (isAuthApi) return true;

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.title = user.title ?? null;
        token.avatarColor = user.avatarColor ?? "#6366f1";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.title = token.title;
        session.user.avatarColor = token.avatarColor;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
