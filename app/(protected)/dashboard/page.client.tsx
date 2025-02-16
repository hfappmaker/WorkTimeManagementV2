'use client';

import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/ui/select';
import { generateOllamaAction, createProjectAction, assignUserToProjectAction, getUnassignedProjectsAction, getAssignedProjectsAction, UnassignUserFromProjectAction, deleteProjectAction } from '../../../actions/formAction';
import ValidationForm from '@/components/ui/validation-form';
import { TextArea } from '@/components/ui/textarea';
import { startTransition, useActionState, useEffect, useState } from 'react';
import Spinner from '@/components/spinner';
import { DateInput } from '@/components/ui/date-input';
import { TextBox } from '@/components/ui/textBox';
import { User } from '@prisma/client';
import { toast } from 'sonner';
import { FormActionResult } from '@/models/form-action-result';
import { debounceTime, filter, map, Observable } from 'rxjs';
import ValidationFormBehavior from '@/components/ui/validation-form-behavior';

type Record = {
  id: string;
  name: string | null;
};

type DashboardPageProps = {
  userId: string;
  users: User[];
};

export default function DashboardPageClient({ userId, users }: DashboardPageProps) {
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

  const [updateCount, setUpdateCount] = useState(0);

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    startTransition(() => {
      getUnassignedProjects(userId);
      getAssignedProjects(userId);
    });
  }, [userId, updateCount]);

  const getOptions = (records: Record[]) => {
    return records.map((record) => ({ value: record.id, label: record.name ?? "" }));
  }

  const successTrigger = (obs: Observable<{result: FormActionResult, isPending: boolean}>) => {
    return obs.pipe(
      filter(({result, isPending}) => result.success !== undefined && isPending === false),
      map(({result}) => result.success ?? "")
    );
  }

  const isPendingTrigger = (obs: Observable<{result: FormActionResult, isPending: boolean}>) => {
    return obs.pipe(
      map(({isPending}) => isPending),
      debounceTime(100)
    );
  }

  const isPendingAction = (isPending: boolean) => {
    console.log('isPendingAction:' + isPending);
    setIsPending(isPending)
  }

  const successAction = (message: string) => {
    toast.success(message);
    setUpdateCount(prev => prev + 1);
  }

  return (
    <>
      <ValidationForm key ={`assignUserToProject-${updateCount}`} action={assignUserToProjectAction}>
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
          <Button type="submit" disabled={unassignedProjects.length === 0 || isPendingUnassignedProjects || isPending}>Assign User to Project</Button>
        </div>
        <ValidationFormBehavior trigger={successTrigger} action={successAction} />
        <ValidationFormBehavior trigger={isPendingTrigger} action={isPendingAction} />
      </ValidationForm>
      <ValidationForm key={`createProject-${updateCount}`} action={createProjectAction}>
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
        <Button type="submit" disabled={isPending}>Create New Project</Button>
        <ValidationFormBehavior trigger={successTrigger} action={successAction} />
        <ValidationFormBehavior trigger={isPendingTrigger} action={isPendingAction} />
      </ValidationForm>
      <ValidationForm key={`deleteProject-${updateCount}`} action={deleteProjectAction}>
        <div className="flex flex-col gap-4">
          {isPendingUnassignedProjects ? <Spinner /> : <ComboBox name="projectId"
            required
            data-required-message="Project is required"
            placeholder="Select Project"
            defaultValue={unassignedProjects[0]?.id}
            options={getOptions(unassignedProjects)} />}
          <Button type="submit" disabled={unassignedProjects.length === 0 || isPendingUnassignedProjects || isPending}>Delete Project</Button>
        </div>
        <ValidationFormBehavior trigger={successTrigger} action={successAction} />
        <ValidationFormBehavior trigger={isPendingTrigger} action={isPendingAction} />
      </ValidationForm>
      <ValidationForm key={`unassignUserFromProject-${updateCount}`} action={UnassignUserFromProjectAction}>
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
          <Button type="submit" disabled={assignedProjects.length === 0 || isPendingAssignedProjects || isPending}>Unassign User from Project</Button>
        </div>
        <ValidationFormBehavior trigger={successTrigger} action={successAction} />
        <ValidationFormBehavior trigger={isPendingTrigger} action={isPendingAction} />
      </ValidationForm>
      <ValidationForm key={`generateOllama-${updateCount}`} action={generateOllamaAction}>
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
        <Button type="submit" disabled={isPending}>Generate with Ollama</Button>
        <ValidationFormBehavior trigger={successTrigger} action={successAction} />
        <ValidationFormBehavior trigger={isPendingTrigger} action={isPendingAction} />
      </ValidationForm>
    </>
  );
}