'use client';

import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/ui/select';
import { generateOllamaAction, createProjectAction, assignUserToProjectAction, getUnassignedProjectsAction, getAssignedProjectsAction, UnassignUserFromProjectAction, deleteProjectAction, assignUserToProjectAction2, getUnassignedProjectsAction2, getAssignedProjectsAction2, UnassignUserFromProjectAction2, unassignUserFromProjectAction2 } from '../../../actions/formAction';
import { startTransition, useActionState, useEffect, useState, useTransition } from 'react';
import Spinner from '@/components/spinner';
import { DateInput } from '@/components/ui/date-input';
import { User } from '@prisma/client';
import { Form, FormField, FormLabel, FormControl, useFormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIsClient } from '@/hooks/use-is-client';
import { UserProjectSchema } from '@/schemas';
import { z } from 'zod';
import FormSuccess from '@/components/form-success';
import FormError from '@/components/form-error';
import Link from 'next/link';

type Record = {
  id: string;
  name: string | null;
}

type DashboardPageProps = {
  userId: string;
  users: User[];
};

export default function DashboardPageClient({ users }: DashboardPageProps) {

  // useEffect(() => {
  //   startTransition(() => {
  //     getUnassignedProjects(userId);
  //     getAssignedProjects(userId);
  //   });
  // }, [userId]);


};

// return (
//   <>
//     {/* <Form.Root className="FormRoot">
//         <Form.Field className="FormField" name="email">
//           <div
//             style={{
//               display: "flex",
//               alignItems: "baseline",
//               justifyContent: "space-between",
//             }}
//           >
//             <Form.Label className="FormLabel">Email</Form.Label>
//             <Form.Message className="FormMessage" match="valueMissing">
//               Please enter your email
//             </Form.Message>
//             <Form.Message className="FormMessage" match="typeMismatch">
//               Please provide a valid email
//             </Form.Message>
//           </div>
//           <InputV2 type="email" required />
//         </Form.Field>
//         <Form.Field className="FormField" name="question">
//           <div className="flex flex-col gap-2">
//             <Form.Label className="FormLabel bg-background">Question</Form.Label>
//             <Form.Message className="FormMessage" match="valueMissing">
//               Please enter a question
//             </Form.Message>
//           </div>
//           <Form.Control asChild>
//             <textarea className="Textarea" required />
//           </Form.Control>
//         </Form.Field>
//         <Form.Submit asChild>
//           <button className="Button" style={{ marginTop: 10 }}>
//             Post question
//           </button>
//         </Form.Submit>
//       </Form.Root> */}
//     <Form {...form}>
//       <FormField name="email">
//         <FormLabel>Email</FormLabel>
//         <FormControl type="email" required />
//       </FormField>
//     </Form>
//     <ValidationForm key={`assignUserToProject-${updateCount}`} action={assignUserToProjectAction}>
//       <div className="flex flex-col gap-4">
//         <ComboBox name="userId"
//           required
//           placeholder="Select User"
//           data-required-message="User is required"
//           options={getOptions(users)} defaultValue={userId} onChange={(value) => {
//             startTransition(() => {
//               getUnassignedProjects(value);
//             });
//           }} />
//         {isPendingUnassignedProjects ? <Spinner /> : <ComboBox name="projectId"
//           required
//           placeholder="Select Project"
//           data-required-message="Project is required"
//           options={getOptions(unassignedProjects)} />}
//         <Button type="submit" disabled={unassignedProjects.length === 0 || isPendingUnassignedProjects || isPending}>Assign User to Project</Button>
//       </div>
//       <ValidationFormBehavior trigger={successTrigger} action={successAction} />
//       <ValidationFormBehavior trigger={isPendingTrigger} action={isPendingAction} />
//     </ValidationForm>
//     <ValidationForm key={`createProject-${updateCount}`} action={createProjectAction}>
//       <TextBox name="projectName"
//         required
//         data-required-message="Project Name is required"
//         placeholder="New Project Name"
//         data-pattern="^.{10,}$"
//         data-pattern-message="Project Name must be at least 10 characters long"
//       />
//       <DateInput name="startDate"
//         required
//         min={new Date().toISOString().split('T')[0]}  // 最小日付
//         max="2099-12-31"  // 最大日付
//         data-required-message="Start Date is required"
//         placeholder="Select a Start Date"
//       />
//       <Button type="submit" disabled={isPending}>Create New Project</Button>
//       <ValidationFormBehavior trigger={successTrigger} action={successAction} />
//       <ValidationFormBehavior trigger={isPendingTrigger} action={isPendingAction} />
//     </ValidationForm>
//     <ValidationForm key={`deleteProject-${updateCount}`} action={deleteProjectAction}>
//       <div className="flex flex-col gap-4">
//         {isPendingUnassignedProjects ? <Spinner /> : <ComboBox name="projectId"
//           required
//           data-required-message="Project is required"
//           placeholder="Select Project"
//           defaultValue={unassignedProjects[0]?.id}
//           options={getOptions(unassignedProjects)} />}
//         <Button type="submit" disabled={unassignedProjects.length === 0 || isPendingUnassignedProjects || isPending}>Delete Project</Button>
//       </div>
//       <ValidationFormBehavior trigger={successTrigger} action={successAction} />
//       <ValidationFormBehavior trigger={isPendingTrigger} action={isPendingAction} />
//     </ValidationForm>
//     <ValidationForm key={`unassignUserFromProject-${updateCount}`} action={UnassignUserFromProjectAction}>
//       <div className="flex flex-col gap-4">
//         <ComboBox name="userId"
//           required
//           placeholder="Select User"
//           data-required-message="User is required"
//           options={getOptions(users)} defaultValue={userId} onChange={(value) => {
//             startTransition(() => {
//               getAssignedProjects(value);
//             });
//           }} />
//         {isPendingAssignedProjects ? <Spinner /> : <ComboBox name="projectId"
//           required
//           placeholder="Select Project"
//           data-required-message="Project is required"
//           options={getOptions(assignedProjects)} />}
//         <Button type="submit" disabled={assignedProjects.length === 0 || isPendingAssignedProjects || isPending}>Unassign User from Project</Button>
//       </div>
//       <ValidationFormBehavior trigger={successTrigger} action={successAction} />
//       <ValidationFormBehavior trigger={isPendingTrigger} action={isPendingAction} />
//     </ValidationForm>
//     <ValidationForm key={`generateOllama-${updateCount}`} action={generateOllamaAction}>
//       <ComboBox name="aiModel"
//         required
//         placeholder="Select AI Model"
//         options={ollamaOptions}
//         data-required-message="AI Model is required"
//       />
//       <TextArea name="deepSeekPrompt"
//         required
//         placeholder="Ask DeepSeek"
//         data-required-message="DeepSeek Prompt is required"
//       />
//       <Button type="submit" disabled={isPending}>Generate with Ollama</Button>
//       <ValidationFormBehavior trigger={successTrigger} action={successAction} />
//       <ValidationFormBehavior trigger={isPendingTrigger} action={isPendingAction} />
//     </ValidationForm>
//   </>
// );