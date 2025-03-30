import { Metadata } from "next";
import { notFound } from "next/navigation";

import { currentUser } from "@/lib/auth";

import EmailTemplateClientPage from "./page.client";

export const metadata: Metadata = {
    title: "メールテンプレート",
    description: "メールテンプレート",
};

export default async function EmailTemplatePage() {
  return notFound();
  const user = await currentUser();
  return <EmailTemplateClientPage userId={user.id} />;
}
