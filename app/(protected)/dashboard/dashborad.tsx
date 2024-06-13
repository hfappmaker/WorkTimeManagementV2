'use server';

import { getProjectsByUserId } from '@/data/work-time';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const Dashborad = async () => {
  const user = await currentUser();
  const projects = await getProjectsByUserId(user.id);
  return <>
    {projects.map(project => (
      <Card>
        <CardContent style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Link href={`/project/${project.id}`}>
              <Label>
                {project.name}
              </Label>
            </Link>
            <Label >Start Date: {project.startDate.toLocaleDateString('ja-JP')}</Label>
            <Label >End Date: {project.endDate?.toLocaleDateString('ja-JP')}</Label>
        </CardContent>
      </Card>
    ))}
  </>;
}

export default Dashborad;