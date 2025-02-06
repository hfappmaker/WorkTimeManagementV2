"use client";

import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Select } from "@/components/ui/select";
import { startTransition, Suspense } from "react";
import AssignableProjects from "./AssignableProjects.server";
import { User, Project } from "@prisma/client";
import { useActionState } from "react"; 
import { getAssignableProjectsAction } from "@/actions/formAction";
import Spinner from "@/components/spinner";

interface Props {
    defaultUserId: string;
    users: User[];
    defaultAssignableProjects: Project[];
}

export default function AssginUserToProject({ defaultUserId, users, defaultAssignableProjects }: Props) {
const [assignableProjects, getAssignableProjects, isPending] = useActionState(
        getAssignableProjectsAction,
        defaultAssignableProjects  
);

return (
    <>
        <Select 
            name="userId" 
            defaultValue={defaultUserId} 
            onValueChange={(value: string) => {
              startTransition(() => {
                   getAssignableProjects(value);
              });
            }}
        >
            <SelectTrigger className="w-[200px] truncate">
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
        {isPending ? <Spinner /> : <AssignableProjects assignableProjects={assignableProjects} />}
    </>
);
} 