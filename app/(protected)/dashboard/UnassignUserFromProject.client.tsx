"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { User } from "@prisma/client";
import { Project } from "@prisma/client";
import { useActionState } from "react";
import { getUnassignableProjectsAction } from "@/actions/formAction";
import Spinner from "@/components/spinner";
import { startTransition } from "react";
interface Props {
    defaultUserId: string;
    users: User[];
    defaultUnassignableProjects: Project[];
}

export default function UnassignUserFromProject({ defaultUserId, users, defaultUnassignableProjects }: Props) {
    const [unassignableProjects, getUnassignableProjects, isPending] = useActionState(
        getUnassignableProjectsAction,
        defaultUnassignableProjects  
    );
    return (
        <>
            <Select name="userId" required defaultValue={defaultUserId} 
                onValueChange={(value: string) => {
                    startTransition(() => {
                        getUnassignableProjects(value);
                    });
                }}
            >
                <SelectTrigger className="w-[400px] truncate">
                    <SelectValue placeholder="Select User" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                    {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                            {user.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {isPending ? <Spinner /> : 
            unassignableProjects.length === 0 ? <p>No unassignable projects available.</p> : 
                <Select name="projectId" required defaultValue={unassignableProjects[0].id}>
                    <SelectTrigger className="w-[400px] truncate">
                        <SelectValue placeholder="Select Project" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                        {unassignableProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                                {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            }
        </>
    )
}