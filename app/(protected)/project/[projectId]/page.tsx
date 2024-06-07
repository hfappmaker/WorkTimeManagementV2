import { Input } from '@/components/ui/input';
import { getOpenedWorkTimeReport } from '@/data/work-time';
import { currentUser } from '@/lib/auth';
import { createWorkTime } from '@/data/work-time';
import { Button } from '@/components/ui/button';
import { getDaysInMonth } from 'date-fns';

const date = new Date(); // 現在の日付
const daysInMonth = getDaysInMonth(date); // 月の日数を取得

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
    const user = await currentUser();
    const workTimes = await getOpenedWorkTimeReport(user.id, params.projectId);

    const date = new Date();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    // create an array of days in the month
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    // create an array of work times for each day
    const workTimesByDay = days.map(day => {
        var filteredWorkTimes = workTimes?.filter((workTime) => workTime.startTime.getDate() === day);
        var workTimeList = (filteredWorkTimes?.length ?? 0) > 0 ?
            filteredWorkTimes?.map(workTime => {return {
                startTime: workTime.startTime.getHours().toString() + ":" + workTime.startTime.getMinutes().toString(),
                endTime: workTime.endTime.getHours().toString() + ":" + workTime.endTime.getMinutes().toString(),
            }}) : [{ startTime: '', endTime: '' }];
    return {
        day: day,
        workTimes: workTimeList
    };
});

const handleSubmit = async (formData: FormData) => {
    'use server';

    const date = new Date();
    const startTimeString = formData.get('start1')?.toString() ?? '';
    const [startHours, startMinutes] = startTimeString.split(':').map(Number);
    const endTimeString = formData.get('end1')?.toString() ?? '';
    const [endHours, endMinutes] = endTimeString.split(':').map(Number);

    var start1Data = new Date(date.getFullYear(), date.getMonth(), 1, startHours, startMinutes, 0);
    var end1Data = new Date(date.getFullYear(), date.getMonth(), 1, endHours, endMinutes, 0);
    await createWorkTime({ startTime: start1Data, endTime: end1Data, userProjectUserId: user.id, userProjectProjectId: params.projectId });
    console.log(formData);
}

return (
    <form action={handleSubmit}>
        {workTimesByDay.map(({ day, workTimes }) => (
            <div key={day} style={{ display: "flex" }}>
                <label>{day}</label>
                {workTimes?.map(workTime => {
                    return (
                        <div style={{ display: "flex" }}>
                            <Input type="time" name={"start" + day.toString()} defaultValue={workTime.startTime} />
                            <Input type="time" name={"end" + day.toString()} defaultValue={workTime.endTime} />
                        </div>
                    );
                })}
            </div>
        ))}
        <Button style={{ marginTop: 10 }} type="submit">
            Post question
        </Button>
    </form>
)
};

