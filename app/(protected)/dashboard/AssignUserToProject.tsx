import UserSelect from "./UserSelect";
import AssignableProjects from "./AssignableProjects.server";
import AvailableUsers from "./AvailableUsers.server";
import NewForm from "@/components/ui/new-form";
import { assignUserToProjectAction } from "@/actions/formAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  searchParams: { userId?: string };
}

export default async function AssignUserToProjectPage({ searchParams }: Props) {
  // サーバー側でユーザー一覧を取得（Prisma もここで実行可能）
  const selectedUser = searchParams.userId ?? "";

  return (
      <NewForm action={assignUserToProjectAction}>
        <UserSelect initialSelectedUser={selectedUser}>
          <AvailableUsers />
        </UserSelect>
        {selectedUser && <AssignableProjects userId={selectedUser} />}
        <Input name="role" defaultValue="USER" />
        <Button type="submit">Assign User to Project</Button>
      </NewForm>
  );
}