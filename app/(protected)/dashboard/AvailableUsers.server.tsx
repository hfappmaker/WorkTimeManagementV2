import { SelectItem } from "@/components/ui/select";
import { db } from "@/lib/db";

export default async function AvailableUsers() {
  const users = await db.user.findMany();

  return (
    <>
      {users.map((user) => (
        <SelectItem key={user.id} value={user.id}>
          {user.name || user.email || user.id}
        </SelectItem>
      ))}
    </>
  );
} 