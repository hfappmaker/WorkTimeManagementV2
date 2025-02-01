'use server';

import { getProjectsByUserId } from '@/data/work-time';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const Dashboard = async () => {
  const user = await currentUser();
  const projects = await getProjectsByUserId(user.id);
  return (
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
  );
};

export default Dashboard;