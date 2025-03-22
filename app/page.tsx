import { redirect } from "next/navigation";

export const metadata = {
  title: "ログイン",
};

export default function Home() {
  return redirect("/auth/login");
}
