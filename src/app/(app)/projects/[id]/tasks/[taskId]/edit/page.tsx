import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { TaskForm } from "@/components/forms/task-form";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { deleteTask } from "@/lib/actions/tasks";
import { ConfirmSubmitButton } from "@/components/ui/submit-button";
import { Trash2 } from "lucide-react";

export const metadata = { title: "Edit Task" };

export default async function EditTaskPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  await requireUser();
  const { id, taskId } = await params;

  const [task, users] = await Promise.all([
    prisma.task.findUnique({ where: { id: taskId }, include: { project: true } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!task || task.projectId !== id) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Edit Task</h1>
        <p className="mt-1 text-sm text-muted">for {task.project.name}</p>
      </div>
      <Card>
        <CardHeader
          title="Task details"
          action={
            <form action={deleteTask.bind(null, task.id)}>
              <ConfirmSubmitButton variant="outline" size="sm" confirmMessage={`Delete task "${task.title}"?`}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </ConfirmSubmitButton>
            </form>
          }
        />
        <CardBody>
          <TaskForm task={task} projectId={task.projectId} users={users} backHref={`/projects/${task.projectId}/board`} />
        </CardBody>
      </Card>
    </div>
  );
}
