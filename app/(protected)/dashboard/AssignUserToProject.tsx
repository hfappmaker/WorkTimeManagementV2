import NewForm from "@/components/ui/new-form";
import { assignUserToProjectAction } from "@/actions/formAction";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";
import AssginUserToProject from "./AssignUserToProject.client";
import { db } from "@/lib/db";
import { getUnassignedProjects } from "@/data/work-time";

export default async function AssignUserToProjectPage() {
  const user = await currentUser();
  const userId = user?.id ?? "";
  const users = await db.user.findMany();
  const unassignedProjects = await getUnassignedProjects(userId);
  const revalidateKey = new Date().toISOString();
  return (
      <NewForm action={assignUserToProjectAction}>
         <div className="flex flex-col gap-4">
           <AssginUserToProject 
             defaultUserId={userId} 
             users={users} 
             defaultAssignableProjects={unassignedProjects}
             key={revalidateKey}
           />
           <Button type="submit">Assign User to Project</Button>
         </div>
      </NewForm>
  );
}