import { currentUser } from "@/lib/auth";
import EmailTemplateClientPage from "./page.client";

export default async function EmailTemplatePage() {
  const user = await currentUser();
  if (!user) {
    return <div>User not found</div>;
  }
  return <EmailTemplateClientPage userId={user.id} />;
}
