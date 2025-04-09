import { redirect } from "next/navigation";

import { currentUser } from "@/features/auth/lib/auth";

export default async function Home() {
  const user = await currentUser();
  if (user) {
    return redirect("/dashboard");
  }
  return redirect("/auth/login");
}
