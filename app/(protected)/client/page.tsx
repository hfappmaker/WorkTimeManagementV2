import ClientClient from "./page.client";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function Client() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return <ClientClient userId={user.id} />;
}