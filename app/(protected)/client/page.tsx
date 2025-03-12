import ClientClientListPage from "./page.client";
import { currentUser } from "@/lib/auth";

export default async function ClientListPage() {
  const user = await currentUser();
  return <ClientClientListPage userId={user.id} />;
}