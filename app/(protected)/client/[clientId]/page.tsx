import { getClientByIdAction } from "@/actions/formAction";
import ClientDetailsClient from "./page.client";
import { currentUser } from "@/lib/auth";

export default async function ClientDetails({
  params
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params;
  const user = await currentUser();
  if (!user) {
    return <div>User not found</div>;
  }
  const client = await getClientByIdAction(clientId);
  if (!client) {
    return <div>Client not found</div>;
  }
  return <ClientDetailsClient client={client} userId={user.id}/>
}