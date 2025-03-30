import { Metadata } from "next";

import { currentUser } from "@/lib/auth";

import ClientClientListPage from "./page.client";

export const metadata: Metadata = {
  title: "クライアント一覧",
  description: "クライアント一覧",
};

export default async function ClientListPage() {
  const user = await currentUser();
  return <ClientClientListPage userId={user.id} />;
}