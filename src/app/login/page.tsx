import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return <LoginForm appName={APP_NAME} />;
}
