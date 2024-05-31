'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getDaysInMonth } from 'date-fns';
import { MonthlyAttendanceSchema } from '@/schemas';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as z from "zod";
import { useEffect, useLayoutEffect, useState } from 'react';
import { createWorkTime, getWorkTimesByUserIdAndDateRange, getWorkTimesByUserIdAndProjectId, updateWorkTime } from '@/data/work-time';
import { currentUser } from '@/lib/auth';
import { User } from '@prisma/client';

export default function DashboardPage() {
  const form = useForm<z.infer<typeof MonthlyAttendanceSchema>>({
    resolver: zodResolver(MonthlyAttendanceSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'days',
  });

  const onSubmit = async (data: z.infer<typeof MonthlyAttendanceSchema>) => {
    console.log(data);
    const user: User = await currentUser();
    for (const day of data.days) {
      await createWorkTime({
        startTime: day.startTime,
        endTime: day.endTime,
        userProjectUserId: user.id,
        userProjectProjectId: 'your_project_id', // Replace with the actual project ID
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {      
      const user : User = await currentUser();
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = getDaysInMonth(new Date(year, month));
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month, daysInMonth);
      const datas = await getWorkTimesByUserIdAndDateRange(user.id, startDate, endDate);

      if (datas) {
        for(const data of datas) {
          append({
            startTime: data.startTime.toISOString(), // Convert Date to string
            endTime: data.endTime.toISOString(), // Convert Date to string
          });
        }
      }
    };

    fetchData();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Start Time</th>
              <th>End Time</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((day, index) => (
              <tr key={day.id}>
                <td>{index + 1}</td>
                <td>
                  <Input
                    type="time"
                    {...form.register(`days.${index}.startTime`)}
                  />
                </td>
                <td>
                  <Input
                    type="time"
                    {...form.register(`days.${index}.endTime`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}