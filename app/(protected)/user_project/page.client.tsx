'use client';

import ProjectAssignmentForm from './ProjectAssignmentForm';
import {
  assignUserToProjectAction,
  getAssignedProjectsAction,
  getUnassignedProjectsAction,
  unassignUserFromProjectAction,
} from '@/actions/formAction';
import { User } from '@prisma/client';

type Props = {
  users: User[];
};

export default function UserProjectClient({ users }: Props) {
  return (
    <div className='flex flex-col gap-4'>
      <ProjectAssignmentForm
        users={users}
        fetchProjects={getUnassignedProjectsAction} 
        submitAction={assignUserToProjectAction}
        submitButtonLabel="Assign User to Project"
        successMessage="User successfully assigned"
      />
      <ProjectAssignmentForm
        users={users}
        fetchProjects={getAssignedProjectsAction}
        submitAction={unassignUserFromProjectAction}
        submitButtonLabel="Unassign User from Project"
        successMessage="User unassigned from project successfully"
      />
    </div>
  );
} 