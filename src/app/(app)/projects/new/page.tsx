import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { ProjectForm } from "@/components/forms/project-form";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata = { title: "New Project" };

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  await requireRole(MANAGE_ROLES);
  const { clientId } = await searchParams;

  const [clients, users] = await Promise.all([
    prisma.client.findMany({ orderBy: { company: "asc" }, select: { id: true, company: true } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">New Project</h1>
        <p className="mt-1 text-sm text-muted">Kick off a new engagement.</p>
      </div>
      <Card>
        <CardHeader title="Project details" />
        <CardBody>
          <ProjectForm clients={clients} users={users} defaultClientId={clientId} />
        </CardBody>
      </Card>
    </div>
  );
}
