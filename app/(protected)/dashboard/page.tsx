import { Stack } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import { createProjectAndWorkTimeReport, deleteAllProjectAndWorkTimeReport, generateOllamaAction, createProjectAction } from '../../../actions/formAction';
import NewForm from '@/components/ui/new-form';
import Dashboard from './dashboard';
import { TextArea } from '@/components/ui/textarea';
import { Suspense } from 'react';
import Spinner from '@/components/spinner';
import { DateInput } from '@/components/ui/date-input';

export default function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Suspense fallback={<Spinner />}>
        <Dashboard />
      </Suspense>
      <NewForm action={createProjectAction}>
        <Input name="projectName" type="text" required placeholder="New Project Name" />
        <DateInput name="startDate" required placeholder="Select a Start Date" />
        <Button type="submit">Create New Project</Button>
      </NewForm>
      <NewForm action={createProjectAndWorkTimeReport}>
        <Input name="newProjectName" type="text" required placeholder="New Project Name"></Input>
        <Button type="submit">Create New Project And WortTimeReport</Button>
      </NewForm>
      <NewForm action={deleteAllProjectAndWorkTimeReport}>
        <Button type="submit">Delete All Projects</Button>
      </NewForm>
      <NewForm action={generateOllamaAction}>
        <Select name="aiModel" defaultValue="">
          <SelectTrigger className="w-[400px] truncate">
            <SelectValue placeholder="Select AI Model" className="truncate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deepseek-coder:latest">
              deepseek-coder
            </SelectItem>
            <SelectItem value="hf.co/unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF">
              DeepSeek-R1-Distill-Llama-8B
            </SelectItem>
            <SelectItem value="hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-14B-Japanese-gguf:latest">
              DeepSeek-R1-Distill-Qwen-14B-Japanese
            </SelectItem>
            <SelectItem value="hf.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF:deepseek-coder-6.7b-instruct.Q4_K_M.gguf">
              deepseek-coder-6.7b-instruct.Q4_K_M
            </SelectItem>
            <SelectItem value="hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-32B-Japanese-gguf:latest">
              DeepSeek-R1-Distill-Qwen-32B-Japanese
            </SelectItem>
          </SelectContent>
        </Select>
        <TextArea name="deepSeekPrompt" required placeholder="Ask DeepSeek" />
        <Button type="submit">Generate with Ollama</Button>
      </NewForm>
    </Stack>
  );
}