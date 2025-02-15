import { User } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Suspense } from "react";
import { Stack } from '@mui/material';
import DashboardPageClient from "./page.client";
import Spinner from "@/components/spinner";
import AssignedProjects from "./AssignedProjects";

export default async function DashboardPage(){
    const user = await currentUser() as User;
    const userId = user?.id ?? "";
    const users = await db.user.findMany();
    return (
        <Stack spacing={3}>
            <Suspense fallback={<Spinner />}>
                <AssignedProjects userId={userId}/>
            </Suspense>
            <DashboardPageClient userId={userId} users={users} />
        </Stack>
    )
}