import { Metadata } from "next";
import { redirect } from "next/navigation";

import { currentUser } from "@/features/auth/lib/auth";

import ClientClientListPage from "./page.client";

export const metadata: Metadata = {
  title: "クライアント一覧",
  description: "クライアント一覧",
};

export default async function ClientListPage() {
  const user = await currentUser();
  if (!user?.id) {
    redirect("/auth/login");
  }
  return <ClientClientListPage userId={user.id} />;
}