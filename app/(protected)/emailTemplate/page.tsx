import { currentUser } from "@/lib/auth";
import EmailTemplateClientPage from "./page.client";

export default async function EmailTemplatePage() {
  const user = await currentUser();
  return <EmailTemplateClientPage userId={user.id} />;
}
