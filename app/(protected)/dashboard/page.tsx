import { Stack } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Dashborad from './dashborad';
import { Suspense } from "react";
import FormAction from './formAction';

export default async function DashboardPage() {
  return (
    <Stack>
      <Suspense fallback={<div >処理中</div>}>
        <Dashborad />
      </Suspense>
      <form action={FormAction}>
        <Input name="newProjectName" type="text" required placeholder="New Project Name"></Input>
        <Button type="submit">Create New Project And WortTimeReport</Button>
      </form>
    </Stack>
  );
}
