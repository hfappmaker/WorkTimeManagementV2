import { getClientByIdAction } from "@/actions/formAction";
import ClientClientDetailsPage from "./page.client";
import { currentUser } from "@/lib/auth";
import { notFound } from "next/navigation";

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