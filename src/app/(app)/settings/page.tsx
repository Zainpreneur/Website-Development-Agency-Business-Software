import { requireUser } from "@/lib/session";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL, APP_NAME } from "@/lib/constants";
import { ProfileForm } from "@/components/forms/profile-form";
import { PasswordForm } from "@/components/forms/password-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your profile and account security.</p>
      </div>

      <Card>
        <CardBody className="flex items-center gap-4">
          <Avatar name={user.name ?? user.email ?? "?"} color={user.avatarColor} size="lg" />
          <div>
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <Badge label={ROLE_LABEL[user.role]?.label ?? user.role} tone={ROLE_LABEL[user.role]?.tone ?? "gray"} className="mt-2" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Profile" />
        <CardBody>
          <ProfileForm name={user.name ?? ""} title={user.title} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Change password" />
        <CardBody>
          <PasswordForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="About" />
        <CardBody className="text-sm text-muted">
          <p>{APP_NAME} workspace · role-based access for agency team members.</p>
        </CardBody>
      </Card>
    </div>
  );
}
