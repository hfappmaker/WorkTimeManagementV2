import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { currentUser } from "@/features/auth/lib/auth";
import { getClientByIdAction } from "@/features/client/actions/client";

import ClientClientDetailsPage from "./page.client";

export const metadata: Metadata = {
  title: "クライアント詳細",
  description: "クライアント詳細",
};

export default async function ClientDetailsPage({
  params
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params;
  const user = await currentUser();
  if (!user?.id) {
    redirect("/");
  }
  const client = await getClientByIdAction(clientId);
  if (!client || client.createUserId !== user.id) {
    return notFound();
  }
  return <ClientClientDetailsPage client={client} userId={user.id} />
}