'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getDaysInMonth } from 'date-fns';
import { MonthlyAttendanceSchema } from '@/schemas';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as z from "zod";
import { useEffect, useLayoutEffect } from 'react';

export default function DashboardPage() {
  const form = useForm<z.infer<typeof MonthlyAttendanceSchema>>({
    resolver: zodResolver(MonthlyAttendanceSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'days',
  });

  const onSubmit = (data: z.infer<typeof MonthlyAttendanceSchema>) => {
    console.log(data);
  };

  useLayoutEffect(() => {
    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();
    const daysInMonth = getDaysInMonth(new Date(year, month));
    for (let i = 0; i < daysInMonth; i++) {
      append({ startTime: '', endTime: '' });
    }
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