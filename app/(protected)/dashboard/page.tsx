import { Stack } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { createProjectAndWorkTimeReport, deleteAllProjectAndWorkTimeReport, generateOllamaAction } from '../../../actions/formAction';
import NewForm from '@/components/ui/new-form';
import Dashboard from './dashboard';
  
export default function DashboardPage() {
  return (
    <Stack>
      <Dashboard />
      <NewForm action={createProjectAndWorkTimeReport}>
        <Input name="newProjectName" type="text" required placeholder="New Project Name"></Input>
        <Button type="submit">Create New Project And WortTimeReport</Button>
      </NewForm>
      <NewForm action={deleteAllProjectAndWorkTimeReport}>
        <Button type="submit">Delete All Projects</Button>
      </NewForm>
      <NewForm action={generateOllamaAction}>
        <Select name="aiModel" defaultValue="">
          <SelectTrigger>
            <SelectValue placeholder="Select AI Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deepseek-coder:latest">
              deepseek-coder:latest
            </SelectItem>
            <SelectItem value="hf.co/unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF">
              hf.co/unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF
            </SelectItem>
            <SelectItem value="hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-14B-Japanese-gguf:latest">
              hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-14B-Japanese-gguf:latest
            </SelectItem>
            <SelectItem value="hf.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF:deepseek-coder-6.7b-instruct.Q4_K_M.gguf">
              hf.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF:deepseek-coder-6.7b-instruct.Q4_K_M.gguf
            </SelectItem>
            <SelectItem value="hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-32B-Japanese-gguf:latest">
              hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-32B-Japanese-gguf:latest
            </SelectItem>
          </SelectContent>
        </Select>
        <Input name="deepSeekPrompt" type="text" required placeholder="Ask DeepSeek" />
        <Button type="submit">Generate with Ollama</Button>
      </NewForm>
    </Stack>
  );
}
