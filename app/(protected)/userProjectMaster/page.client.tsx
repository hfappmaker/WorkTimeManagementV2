'use client';

import ProjectAssignmentForm from './ProjectAssignmentForm';
import {
  assignUserToProjectAction,
  getAssignedProjectsAction,
  getUnassignedProjectsAction,
  unassignUserFromProjectAction,
} from '@/actions/formAction';
import FormError from '@/components/form-error';
import FormSuccess from '@/components/form-success';
import { User } from '@prisma/client';
import React, { useTransition } from 'react';
import { useAtomValue } from 'jotai';
import { errorAtom, successAtom } from './atoms';
import Spinner from '@/components/spinner';
import { UserProjectSchema } from "@/schemas";
import { z } from "zod";

type Props = {
  users: User[];
};

export default function UserProjectMasterClient({ users }: Props) {
  const error = useAtomValue(errorAtom);
  const success = useAtomValue(successAtom);
  const [isPending, startTransition] = useTransition();
  return (
    <div className={`flex flex-col gap-4 ${isPending ? "pointer-events-none opacity-50" : ""}`}>
      {isPending && <div className='absolute inset-0 flex items-center justify-center bg-opacity-40 z-10'><Spinner /></div>}
      {error && <FormError message={error} />}
      {success && <FormSuccess message={success} />}
      <ProjectAssignmentForm
        users={users}
        fetchProjects={getUnassignedProjectsAction} 
        submitAction={(values: z.infer<typeof UserProjectSchema>) => assignUserToProjectAction(values)}
        submitButtonLabel="Assign User to Project"
        successMessage="User successfully assigned"
        startTransition={startTransition}
      />
      <ProjectAssignmentForm
        users={users}
        fetchProjects={getAssignedProjectsAction}
        submitAction={(values: z.infer<typeof UserProjectSchema>) => unassignUserFromProjectAction(values.userId, values.projectId)}
        submitButtonLabel="Unassign User from Project"
        successMessage="User unassigned from project successfully"
        startTransition={startTransition}
      />
    </div>
  );
} 