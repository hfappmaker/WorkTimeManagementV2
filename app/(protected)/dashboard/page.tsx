import { User, Project } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { Stack } from "@mui/material";
import { Suspense } from "react";
import Spinner from "@/components/spinner";
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Button } from "@/components/ui/button";
import { truncate } from "@/lib/utils";
import { getUserProjectsAction } from "@/actions/formAction";

export default async function DashboardPage() {
    const user = await currentUser() as User;
    const userId = user?.id ?? "";
    const userProjects = await getUserProjectsAction(userId);

    return (    
        <Stack spacing={3}>
            <Suspense fallback={<Spinner />}>
                <div className="p-4">
                    {userProjects.length === 0 ? (
                        <p>No projects found.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {userProjects.map((userProject: {project: Project, id: string}) => (
                                <li
                                    key={userProject.id}
                                    className="py-4 cursor-pointer hover:text-blue-500"
                                >
                                    <Link href={`/workReport/${userProject.id}`}>
                                        <div className="flex flex-col">
                                            {/* プロジェクト名が長い場合は省略表示 (例: 最大30文字) */}
                                            <Label className="truncate max-w-[300px]">
                                                {truncate(userProject.project.name, 30)}
                                            </Label>
                                            {/* プロジェクト名の右下に日付情報を表示 */}
                                            <div className="self-end text-right text-xs mt-1 flex justify-end">
                                                <span className="font-semibold">Start Date:</span>{' '}
                                                {userProject.project.startDate.toLocaleDateString('ja-JP')}
                                                <span className="font-semibold ml-2">End Date:</span>{' '}
                                                {userProject.project.endDate ? userProject.project.endDate.toLocaleDateString('ja-JP') : 'N/A'}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Suspense>
            <Link href={`/userProjectMaster`}>
                <Button className='align-middle'>ユーザー割り当て</Button>
            </Link>
            <Link href={`/projectMaster`}>
                <Button className='align-middle'>プロジェクトマスタ</Button>
            </Link>
        </Stack>
    )
}