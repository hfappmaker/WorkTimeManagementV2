'use client';

import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/ui/select';
import { generateOllamaAction, createProjectAction, assignUserToProjectAction, getUnassignedProjectsAction, getAssignedProjectsAction, UnassignUserFromProjectAction, deleteProjectAction } from '../../../actions/formAction';
import NewForm from '@/components/ui/new-form';
import { TextArea } from '@/components/ui/textarea';
import { startTransition, useActionState, useEffect, useState } from 'react';
import Spinner from '@/components/spinner';
import { DateInput } from '@/components/ui/date-input';
import { TextBox } from '@/components/ui/textBox';
import { User } from '@prisma/client';
import { FormActionResult } from '@/models/form-action-result';

type Record = {
  id: string;
  name: string | null;
}

export default function DashboardPageClient({ userId, users }: { userId: string, users: User[] }) {
  const ollamaOptions = [
    { value: "deepseek-coder:latest", label: "deepseek-coder" },
    { value: "hf.co/unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF", label: "DeepSeek-R1-Distill-Llama-8B" },
    { value: "hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-14B-Japanese-gguf:latest", label: "DeepSeek-R1-Distill-Qwen-14B-Japanese" },
    { value: "hf.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF:deepseek-coder-6.7b-instruct.Q4_K_M.gguf", label: "deepseek-coder-6.7b-instruct.Q4_K_M" },
    { value: "hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-32B-Japanese-gguf:latest", label: "DeepSeek-R1-Distill-Qwen-32B-Japanese" },
  ];

  const [unassignedProjects, getUnassignedProjects, isPendingUnassignedProjects] = useActionState(
    getUnassignedProjectsAction,
    []
  );

  const [assignedProjects, getAssignedProjects, isPendingAssignedProjects] = useActionState(
    getAssignedProjectsAction,
    []
  );

  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    startTransition(() => {
      getUnassignedProjects(userId);
      getAssignedProjects(userId);
    });
  }, [userId, forceUpdate]);

  const forceUpdateOnSuccess = (result: FormActionResult) => {
    if (result.success) {
      setForceUpdate(forceUpdate + 1);
    }
  }

  const getOptions = (records: Record[]) => {
    return records.map((record) => ({ value: record.id, label: record.name ?? "" }));
  }

  return (
    <>
      <NewForm key={`assignUserToProject-${forceUpdate}`} action={assignUserToProjectAction} noValidate onSuccess={forceUpdateOnSuccess}>
        <div className="flex flex-col gap-4">
          <ComboBox name="userId"
            required
            placeholder="Select User"
            data-required-message="User is required"
            options={getOptions(users)} defaultValue={userId} onChange={(value) => {
              startTransition(() => {
                getUnassignedProjects(value);
              });
            }} />
          {isPendingUnassignedProjects ? <Spinner /> : <ComboBox name="projectId"
            required
            placeholder="Select Project"
            data-required-message="Project is required"
            options={getOptions(unassignedProjects)} />}
          <Button type="submit">Assign User to Project</Button>
        </div>
      </NewForm>
      <NewForm key={`createProject-${forceUpdate}`} action={createProjectAction} noValidate onSuccess={forceUpdateOnSuccess}>
        <TextBox name="projectName"
          required
          data-required-message="Project Name is required"
          placeholder="New Project Name"
          data-pattern="^.{10,}$"
          data-pattern-message="Project Name must be at least 10 characters long"
        />
        <DateInput name="startDate"
          required
          min={new Date().toISOString().split('T')[0]}  // 最小日付
          max="2099-12-31"  // 最大日付
          data-required-message="Start Date is required"
          placeholder="Select a Start Date"
        />
        <Button type="submit">Create New Project</Button>
      </NewForm>
      <NewForm key={`deleteProject-${forceUpdate}`} action={deleteProjectAction} noValidate onSuccess={forceUpdateOnSuccess}>
        <div className="flex flex-col gap-4">
          {isPendingUnassignedProjects ? <Spinner /> : <ComboBox name="projectId"
            required
            data-required-message="Project is required"
            placeholder="Select Project"
            defaultValue={unassignedProjects[0]?.id}
            options={getOptions(unassignedProjects)} />}
          <Button type="submit">Delete Project</Button>
        </div>
      </NewForm>
      <NewForm key={`unassignUserFromProject-${forceUpdate}`} action={UnassignUserFromProjectAction} noValidate onSuccess={forceUpdateOnSuccess}>
        <div className="flex flex-col gap-4">
          <ComboBox name="userId"
            required
            placeholder="Select User"
            data-required-message="User is required"
            options={getOptions(users)} defaultValue={userId} onChange={(value) => {
              startTransition(() => {
                getAssignedProjects(value);
              });
            }} />
          {isPendingAssignedProjects ? <Spinner /> : <ComboBox name="projectId"
            required
            placeholder="Select Project"
            data-required-message="Project is required"
            options={getOptions(assignedProjects)} />}
          <Button type="submit">Unassign User from Project</Button>
        </div>
      </NewForm>
      <NewForm key={`generateOllama-${forceUpdate}`} action={generateOllamaAction} noValidate>
        <ComboBox name="aiModel"
          required
          placeholder="Select AI Model"
          options={ollamaOptions}
          data-required-message="AI Model is required"
        />
        <TextArea name="deepSeekPrompt"
          required
          placeholder="Ask DeepSeek"
          data-required-message="DeepSeek Prompt is required"
        />
        <Button type="submit">Generate with Ollama</Button>
      </NewForm>
    </>
  );
}