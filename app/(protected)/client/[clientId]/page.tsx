import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getClientByIdAction } from "@/actions/client";
import { currentUser } from "@/lib/auth";

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
  const client = await getClientByIdAction(clientId);
  if (!client || client.createUserId !== user?.id) {
    return notFound();
  }
  return <ClientClientDetailsPage client={client} userId={user.id}/>
}