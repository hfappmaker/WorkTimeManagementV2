'use server';
import { getProjectsByUserId } from '@/data/work-time';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { Typography, Stack } from '@mui/material';
import { Card, CardContent } from '@/components/ui/card';

const Dashborad = async () => {
  const user = await currentUser();
  const projects = await getProjectsByUserId(user.id);
  return <>
    {projects.map(project => (
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <Link href={`/project/${project.id}`}>
              <Typography variant="h6" component="h2">
                {project.name}
              </Typography>
            </Link>
            <Typography variant="body2" color="textSecondary" component="p">Start Date: {project.startDate.toLocaleDateString()}</Typography>
            <Typography variant="body2" color="textSecondary" component="p">End Date: {project.endDate?.toLocaleDateString()}</Typography>
          </Stack>
        </CardContent>
      </Card>
    ))}
  </>
}

export default Dashborad;