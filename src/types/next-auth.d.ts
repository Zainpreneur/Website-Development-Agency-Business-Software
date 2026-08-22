import type { DefaultSession } from "next-auth";

export type AppRole = "ADMIN" | "MANAGER" | "MEMBER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      title: string | null;
      avatarColor: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    title?: string | null;
    avatarColor?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    title: string | null;
    avatarColor: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    title: string | null;
    avatarColor: string;
  }
}
