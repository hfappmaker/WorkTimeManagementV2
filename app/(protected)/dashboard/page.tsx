import { useEffect, useState } from 'react';
import { getProjectsByUserId } from '@/data/work-time';
import { useCurrentUser } from '@/hooks/use-current-user';
import Link from 'next/link';
import { getSession } from 'next-auth/react';
import { currentUser } from '@/lib/auth';

interface Project {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
}

export default async function DashboardPage() {
  const user = await currentUser();
  const projects = await getProjectsByUserId(user.id);
  // useEffect(() => {
  //   const fetchData = async () => {

  //   };

  //   fetchData();
  // }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Start Time</th>
          <th>End Time</th>
        </tr>
      </thead>
      <tbody>
        {projects?.map(project => (
          <tr key={project.id}>
            <td>
              <Link href={`/dashborad?projectId=${project.id}`}>
                {project.name}
              </Link>
            </td>
            <td>{project.startDate.toDateString()}</td>
            <td>{project.endDate?.toDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
