import { Input } from '@/components/ui/input';
import { getWorkTimesByUserIdAndProjectId } from '@/data/work-time';
import { currentUser } from '@/lib/auth';
import { createWorkTime } from '@/data/work-time';

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
    const user = await currentUser();
    const workTimes = await getWorkTimesByUserIdAndProjectId(user.id, params.projectId);

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
    // const workTimes = workTimesByDay.map(({ day }) => {
    //     const workTimes = formData.getAll(day.toString());
    //     return workTimes.map((workTime: FormDataEntryValue) => {
    //         const [startTime, endTime] = workTime.toString().split(',');
    //         return { startTime, endTime };
    //     });
    // });
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
        <button style={{ marginTop: 10 }} type="submit">
            Post question
        </button>
    </form>
)
    // return (
    //     <Form.Root className="FormRoot"
    //         // `onSubmit` only triggered if it passes client-side validation
    //         // onSubmit={async (event) => {
    //         //     'use server'
    //         //     const data = Object.fromEntries(new FormData(event.currentTarget));
    //         //     // prevent default form submission
    //         //     event.preventDefault();
    //         // }}
    //         >
    //         {workTimesByDay.map(({ day, workTimes }) => (
    //             <Form.Field className="FormField" key={day} name={day.toString()}>
    //                 <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
    //                     <Form.Label className="FormLabel">{day}</Form.Label>
    //                     {workTimes?.map(workTime => <div>
    //                         <Form.Control asChild>
    //                             <Input className="Input" type="time" required >{workTime.startTime}</Input>
    //                         </Form.Control>
    //                         <Form.Control asChild>
    //                             <Input className="Input" type="time" required >{workTime.endTime}</Input>
    //                         </Form.Control>
    //                     </div>
    //                     )}
    //                 </div>
    //             </Form.Field>
    //         ))}
    //         <Form.Submit asChild>
    //             <button className="Button" style={{ marginTop: 10 }}>
    //                 Post question
    //             </button>
    //         </Form.Submit>
    //     </Form.Root>
    // );
};

