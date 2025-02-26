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
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type Record = {
  id: string;
  name: string | null;
};

interface ProjectAssignmentFormProps {
  users: Record[]; // For user ComboBox options
  fetchProjects: (userId: string) => Promise<Record[]>; // Fetch projects given a user id
  submitAction: (values: z.infer<typeof UserProjectSchema>) => Promise<any>;
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
      unitPrice: "",
      settlementMin: "",
      settlementMax: "",
      upperRate: "",
      middleRate: "",
      workReportPeriodUnit: "MONTH",
    },
  });

  // Consolidated submit handler
  const handleSubmitAction = async (values: z.infer<typeof UserProjectSchema>) => {
    try {
      await submitAction(values);
      setSuccess(successMessage);
      // Trigger update via jotai
      setUpdate((prev) => prev + 1);
    } catch (err) {
      setError(`Something went wrong! Error: ${err}`);
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
          {/* User Selection */}
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
                      field.onChange(value);
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

          {/* Project Selection */}
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

          {/* Unit Price */}
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>単価</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} type="number" placeholder="例: 5000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Settlement Min */}
          <FormField
            control={form.control}
            name="settlementMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>最小精算額</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} type="number" placeholder="例: 100000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Settlement Max */}
          <FormField
            control={form.control}
            name="settlementMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>最大精算額</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} type="number" placeholder="例: 500000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Upper Rate */}
          <FormField
            control={form.control}
            name="upperRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>上限レート</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="例: 1.5" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Middle Rate */}
          <FormField
            control={form.control}
            name="middleRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>中間レート</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="例: 1.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Work Report Period Unit */}
          <FormField
            control={form.control}
            name="workReportPeriodUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>作業報告書期間単位</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="期間単位を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DAY">日</SelectItem>
                    <SelectItem value="WEEK">週</SelectItem>
                    <SelectItem value="MONTH">月</SelectItem>
                  </SelectContent>
                </Select>
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