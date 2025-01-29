import { Stack } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Dashborad from './dashborad';
import { createProjectAndWorkTimeReport, deleteAllProjectAndWorkTimeReport, generateOllamaAction } from '../../../actions/formAction';
import NewForm from '@/components/ui/new-form';

export default function DashboardPage() {
  return (
    <Stack>
      <Dashborad />
      <NewForm action={createProjectAndWorkTimeReport}>
        <Input name="newProjectName" type="text" required placeholder="New Project Name"></Input>
        <Button type="submit">Create New Project And WortTimeReport</Button>
      </NewForm>
      <NewForm action={deleteAllProjectAndWorkTimeReport}>
        <Button type="submit">Delete All Projects</Button>
      </NewForm>
      <NewForm action={generateOllamaAction}>
        <Input name="deepSeekPrompt" type="text" required placeholder="Ask DeepSeek"></Input>
        <Button type="submit">Generate with Ollama</Button>
      </NewForm>
    </Stack>
  );
}
