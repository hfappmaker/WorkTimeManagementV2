import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getWorkTimesByUserIdAndProjectId } from '@/data/work-time';
import { currentUser } from '@/lib/auth';
import { FormEvent } from 'react';

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
    const user = await currentUser();
    const workTimes = await getWorkTimesByUserIdAndProjectId(user.id, params.projectId);

    const date = new Date();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    // create an array of days in the month
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    // create an array of work times for each day
    const workTimesByDay = days.map(day => {
        return {
            day: day,
            workTimes: workTimes?.filter((workTime) => workTime.startTime.getDate() === day)
        };
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        "use server";
        // throw new Error('Function not implemented.');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Work Time List</h2>
            <ul>
                {workTimesByDay.map(({ day, workTimes }) => (
                    <li key={day}>
                        <h3>{day}</h3>
                        <ul>
                            {(workTimes?.length ?? 0) > 0 ? workTimes?.map(workTime => (
                                <li key={workTime.id}>
                                    <Input type="time">
                                        {workTime.startTime.toLocaleTimeString()}
                                    </Input>
                                    <Input type="time">
                                        {workTime.endTime.toLocaleTimeString()}
                                    </Input>
                                </li>
                            )) : (<li>
                                <Input type="time">
                                </Input>
                                <Input type="time">
                                </Input>
                            </li>)}
                        </ul>
                    </li>
                ))}
            </ul>
            <Button type="submit">Like</Button>
        </form>
    );
};

