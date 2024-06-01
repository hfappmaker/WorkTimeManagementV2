import { getProjectsByUserId } from '@/data/work-time';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { Label } from '@/components/ui/label';

export default async function DashboardPage() {
  const user = await currentUser();
  const projects = await getProjectsByUserId(user.id);
  const currentProjects = projects?.filter(project =>  project.endDate == null || project.endDate > new Date());
  return (
    <table>
      <thead>
        <tr>
          <th>Project Name</th>
          <th>Start Date</th>
          <th>End Date</th>
        </tr>
      </thead>
      <tbody>
        {currentProjects?.map(project => (
          <tr key={project.id}>
            <td>
              <Link href={`/project/${project.id}`}>
                {project.name}
              </Link>
            </td>
            <td><Label>{project.startDate.toLocaleDateString()}</Label></td>
            <td><Label>{project.endDate?.toLocaleDateString()}</Label></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
