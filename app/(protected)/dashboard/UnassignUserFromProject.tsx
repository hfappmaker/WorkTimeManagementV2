import { UnassignUserFromProjectAction } from "@/actions/formAction";
import NewForm from "@/components/ui/new-form";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import UnassignUserFromProject from "./UnassignUserFromProject.client";
import { getAssignedProjects } from "@/data/work-time";

export default async function UnassignUserFromProjectPage() {
  const user = await currentUser();
  const userId = user?.id ?? "";
  const users = await db.user.findMany();
  const assignedProjects = await getAssignedProjects(userId);
  const revalidateKey = new Date().toISOString();
  
  return (
    <NewForm action={UnassignUserFromProjectAction}>
      <div className="flex flex-col gap-4">
        <UnassignUserFromProject 
          defaultUserId={userId}
          users={users}
          defaultUnassignableProjects={assignedProjects}
          key={revalidateKey}
        />
        <Button type="submit">Unassign User from Project</Button>
      </div>
    </NewForm>
  );
}
