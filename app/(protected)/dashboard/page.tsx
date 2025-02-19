import { User } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { Stack } from "@mui/material";
import { Suspense } from "react";
import Spinner from "@/components/spinner";
import { getAssignedProjects } from "@/data/work-time";
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from "@/components/ui/button";
export default async function DashboardPage() {
    const user = await currentUser() as User;
    const userId = user?.id ?? "";
    const projects = await getAssignedProjects(userId);

    return (
        <Stack spacing={3}>
            <Suspense fallback={<Spinner />}>
                <div className='grid grid-cols-1'>
                    {projects.map((project) => (
                        <Card key={project.id}>
                            <CardContent className='grid grid-cols-2 gap-4'>
                                <Link href={`/project/${project.id}`}>
                                    <Label className='align-middle'>{project.name}</Label>
                                </Link>
                                <div className="grid grid-cols-2 grid-rows-2">
                                    <Label className="text-right">Start Date:</Label>
                                    <Label className="ml-0.5">{project.startDate.toLocaleDateString('ja-JP')}</Label>
                                    <Label className="text-right">End Date:</Label>
                                    <Label className="ml-0.5">{project.endDate?.toLocaleDateString('ja-JP')}</Label>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Suspense>
            <Link href={`/user_project`}>
                <Button className='align-middle'>ユーザー割り当て</Button>
            </Link>
            <Link href={`/project_master`}>
                <Button className='align-middle'>プロジェクトマスター</Button>
            </Link>
        </Stack>
    )
}