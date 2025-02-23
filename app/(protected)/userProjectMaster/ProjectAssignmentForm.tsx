'use client';

import React, { TransitionFunction } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserProjectSchema } from '@/schemas';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ComboBox } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { projectsUpdateAtom, errorAtom, successAtom } from './atoms';

type Record = {
  id: string;
  name: string | null;
};

interface ProjectAssignmentFormProps {
  users: Record[]; // For user ComboBox options
  fetchProjects: (userId: string) => Promise<Record[]>; // Fetch projects given a user id
  submitAction: (userId: string, projectId: string) => Promise<any>;
  submitButtonLabel: string;
  successMessage: string;
  startTransition: (scope: TransitionFunction) => void;
}

export default function ProjectAssignmentForm({
  users,
  fetchProjects,
  submitAction,
  submitButtonLabel,
  successMessage,
  startTransition,
}: ProjectAssignmentFormProps) {
  const [projectOptions, setProjectOptions] = React.useState<Record[]>([]);
  const [update, setUpdate] = useAtom(projectsUpdateAtom);
  const [error, setError] = useAtom(errorAtom);
  const [success, setSuccess] = useAtom(successAtom);

  const form = useForm<z.infer<typeof UserProjectSchema>>({
    resolver: zodResolver(UserProjectSchema),
    defaultValues: {
      userId: "",
      projectId: "",
    },
  });

  // Consolidated submit handler
  const handleSubmitAction = async (values: z.infer<typeof UserProjectSchema>) => {
    try {
      await submitAction(values.userId, values.projectId);
      setSuccess(successMessage);
      // Trigger update via jotai
      setUpdate((prev) => prev + 1);
      // setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Something went wrong! Error: ${err}`);
      // setTimeout(() => setError(""), 3000);
    }
  };

  React.useEffect(() => {
    const currentUserId = form.getValues("userId");
    if (currentUserId) {
      fetchProjects(currentUserId).then((projects) => {
        setProjectOptions(projects);
        // Reset the project field so that the display is cleared
        form.resetField("projectId");
      });
    }
  }, [update, form, fetchProjects]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            await handleSubmitAction(values);
          });
        })}
        className="space-y-6"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User</FormLabel>
                <FormControl>
                  <ComboBox
                    {...field}
                    placeholder="Select User"
                    options={users.map((u) => ({
                      value: u.id,
                      label: u.name || "",
                    }))}
                    onValueChange={(value) => {
                      startTransition(async () => {
                        const projects = await fetchProjects(value);
                        setProjectOptions(projects);
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <FormControl>
                  <ComboBox
                    {...field}
                    placeholder="Select Project"
                    options={projectOptions.map((p) => ({
                      value: p.id,
                      label: p.name || "",
                    }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full hover:bg-sky-400">
          {submitButtonLabel}
        </Button>
      </form>
    </Form>
  );
} 