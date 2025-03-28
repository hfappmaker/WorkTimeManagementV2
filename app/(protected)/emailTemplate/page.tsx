import { currentUser } from "@/lib/auth";
import EmailTemplateClientPage from "./page.client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "メールテンプレート",
    description: "メールテンプレート",
};

export default async function EmailTemplatePage() {
  return notFound();
  const user = await currentUser();
  return <EmailTemplateClientPage userId={user.id} />;
}
