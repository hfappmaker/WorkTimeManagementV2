import { User } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import DashboardClient from "./page.client";

export default async function DashboardPage() {
    const user = await currentUser() as User;

    return (    
        <DashboardClient user={user} />
    )
}