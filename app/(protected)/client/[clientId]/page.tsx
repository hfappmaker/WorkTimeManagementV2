import { getClientByIdAction } from "@/actions/formAction";
import ClientClientDetailsPage from "./page.client";
import { currentUser } from "@/lib/auth";

export default async function ClientDetailsPage({
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
  return <ClientClientDetailsPage client={client} userId={user.id}/>
}