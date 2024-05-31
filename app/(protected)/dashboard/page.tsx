import { z } from 'zod';

const DaySchema = z.object({
  start: z.string(),
  end: z.string(),
});

const MonthlyAttendanceSchema = z.object({
  days: z.array(DaySchema),
});

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function DashboardPage() {
  // ...other code...

  const { register, control, handleSubmit } = useForm({
    resolver: zodResolver(MonthlyAttendanceSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'days',
  });

  const onSubmit = (data) => {
    console.log(data);
    // Submit the data...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <label>Day {index + 1}</label>
          <input {...register(`days.${index}.start`)} placeholder="Start time" />
          <input {...register(`days.${index}.end`)} placeholder="End time" />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ start: '', end: '' })}>
        Add Day
      </button>
      <input type="submit" />
    </form>
  );
}