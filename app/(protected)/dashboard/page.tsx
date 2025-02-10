import { Stack } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { generateOllamaAction, createProjectAction } from '../../../actions/formAction';
import NewForm from '@/components/ui/new-form';
import AssignedProjects from './AssignedProjects';
import { TextArea } from '@/components/ui/textarea';
import { Suspense } from 'react';
import Spinner from '@/components/spinner';
import { DateInput } from '@/components/ui/date-input';
import AssignUserToProjectPage from './AssignUserToProject';
import UnassignUserFromProjectPage from './UnassignUserFromProject'

export default async function DashboardPage() {
  // Define the list of select items
  const selectItems = [
    { value: "deepseek-coder:latest", label: "deepseek-coder" },
    { value: "hf.co/unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF", label: "DeepSeek-R1-Distill-Llama-8B" },
    { value: "hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-14B-Japanese-gguf:latest", label: "DeepSeek-R1-Distill-Qwen-14B-Japanese" },
    { value: "hf.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF:deepseek-coder-6.7b-instruct.Q4_K_M.gguf", label: "deepseek-coder-6.7b-instruct.Q4_K_M" },
    { value: "hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-32B-Japanese-gguf:latest", label: "DeepSeek-R1-Distill-Qwen-32B-Japanese" },
  ];

  return (
    <Stack spacing={3}>
      <Suspense fallback={<Spinner />}>
        <AssignedProjects />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <AssignUserToProjectPage />
      </Suspense>
      <NewForm action={createProjectAction} noValidate>
        <Input name="projectName" type="text" required placeholder="New Project Name" />
        <DateInput name="startDate" required placeholder="Select a Start Date" />
        <Button type="submit">Create New Project</Button>
      </NewForm>
      <Suspense fallback={<Spinner />}>
        <UnassignUserFromProjectPage />
      </Suspense>
      <NewForm action={generateOllamaAction} noValidate>
        <Select name="aiModel">
          <SelectTrigger className="w-[400px] truncate">
            <SelectValue placeholder="Select AI Model" className="truncate" />
          </SelectTrigger>
          <SelectContent>
            {selectItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TextArea name="deepSeekPrompt" required placeholder="Ask DeepSeek" />
        <Button type="submit">Generate with Ollama</Button>
      </NewForm>
    </Stack>
  );
}