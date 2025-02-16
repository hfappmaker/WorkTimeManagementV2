import { getOpenedWorkTimeReport, getWorkTimesByWorkTimeReportId, updateWorkTime } from '@/data/work-time';
import { currentUser } from '@/lib/auth';
import { addDays, differenceInCalendarDays, addHours } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ValidationFrom from '@/components/ui/validation-form';
import { FormActionResult } from '@/models/form-action-result';

function areDatesEqual(date1: Date, date2: Date): boolean {
    const year1 = date1.getFullYear();
    const month1 = date1.getMonth();
    const day1 = date1.getDate();

    const year2 = date2.getFullYear();
    const month2 = date2.getMonth();
    const day2 = date2.getDate();

    return year1 === year2 && month1 === month2 && day1 === day2;
}

export default async function ProjectPage(props: { params: Promise<{ projectId: string }> }) {
    const params = await props.params;
    const user = await currentUser();
    const workTimeReport = await getOpenedWorkTimeReport(user.id, params.projectId);

    if (workTimeReport === null) {
        return <div>Work time report is not opened</div>;
    }

    const workTimesInPeriod = await getWorkTimesByWorkTimeReportId(workTimeReport.id);
    const daysInPeriod = differenceInCalendarDays(workTimeReport.endDate, workTimeReport.startDate) + 1;
    const datesInPeriod = Array.from({ length: daysInPeriod }, (_, i) => addDays(workTimeReport.startDate, i));
    const workTimesByDay = datesInPeriod.map(day => ({
        day: day,
        workTimes: workTimesInPeriod.filter((workTime) => areDatesEqual(workTime.startTime, day)),
    }));

    const handleAction = async (_prevResult: FormActionResult, formData: FormData) => {
        'use server'
        function getTimeFromFormData(day: Date, formData: FormData, prefix: string, id: string): Date | null {
            const timeString = formData.get(`${prefix}-${id}`);
            if (timeString === null || timeString === undefined) {
                return null;
            }
            const [hour, minute] = timeString.toString().split(':');
            if (hour === undefined || minute === undefined) {
                return null;
            }
            const newDay = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate(), parseInt(hour), parseInt(minute), 0, 0), -9);
            return newDay;
        }

        for (const { day, workTimes } of workTimesByDay) {
            for (const workTime of workTimes) {
                const startDate = getTimeFromFormData(day, formData, 'start', workTime.id);
                const endDate = getTimeFromFormData(day, formData, 'end', workTime.id);
                if (startDate === null || endDate === null) {
                    continue;
                }
                await updateWorkTime(workTime.id, startDate, endDate, workTime.workTimeReportId);
            }
        }

        return { success: 'Work times are updated' };
    }

    return (
        <ValidationFrom action={handleAction}>
            <div className="grid grid-cols-1">
                {workTimesByDay.map(({ day, workTimes }) => (
                    <div className="grid grid-cols-2 gap-4" key={day.toLocaleDateString('ja-JP')}>
                        <Label color='primary'>{day.toLocaleDateString('ja-JP')}</Label>
                        <div className='grid grid-cols-1'>
                            {workTimes.map(workTime => (
                                <div className='grid grid-cols-2' key={workTime.id}>
                                    <Input
                                        color='primary'
                                        type="time"
                                        name={`start-${workTime.id}`}
                                        defaultValue={workTime.startTime.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false, hour: '2-digit', minute: '2-digit' }).slice(0, 5)} // Convert Date to string in the format "HH:mm"
                                    ></Input>
                                    <Input
                                        color='primary'
                                        type="time"
                                        name={`end-${workTime.id}`}
                                        defaultValue={workTime.endTime.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false, hour: '2-digit', minute: '2-digit' }).slice(0, 5)} // Convert Date to Japanese time format "HH:mm"
                                    ></Input>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <Button color="primary" type="submit" style={{ marginTop: 10 }}>
                    Update
                </Button>
            </div>
        </ValidationFrom>
    );
};

