import ClientClientListPage from "./page.client";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function ClientListPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return <ClientClientListPage userId={user.id} />;
}