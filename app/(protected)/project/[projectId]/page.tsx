import { getOpenedWorkTimeReport, getWorkTimesByWorkTimeReportId, updateWorkTime } from '@/data/work-time';
import { currentUser } from '@/lib/auth';
import { addDays, differenceInCalendarDays, addHours } from 'date-fns';
import { Grid, TextField } from '@mui/material';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stack } from '@mui/material';
import { Label } from '@/components/ui/label';
import NewForm from '@/components/ui/new-form';
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

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
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

    const handleAction = async (prevResult: FormActionResult, formData: FormData) => {
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
        <NewForm action={handleAction}>
            <Stack>
                {workTimesByDay.map(({ day, workTimes }) => (
                    <Grid key={day.toLocaleDateString('ja-JP')} container spacing={2} alignItems="center" direction="row">
                        <Grid item xs={12}>
                            <Label color='primary'>{day.toLocaleDateString('ja-JP')}</Label>
                        </Grid>
                        {workTimes.map(workTime => (
                            <Grid item xs={12} key={workTime.id}>
                                <TextField
                                    color='primary'
                                    type="time"
                                    name={`start-${workTime.id}`}
                                    defaultValue={workTime.startTime.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false, hour: '2-digit', minute: '2-digit' }).slice(0, 5)} // Convert Date to string in the format "HH:mm"
                                    variant="outlined" // Add this line to display the text field border
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    style={{ backgroundColor: 'white' }} // Add this line to change the background color
                                ></TextField>
                                <TextField
                                    color='primary'
                                    type="time"
                                    name={`end-${workTime.id}`}
                                    defaultValue={workTime.endTime.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false, hour: '2-digit', minute: '2-digit' }).slice(0, 5)} // Convert Date to Japanese time format "HH:mm"
                                    variant="outlined" // Add this line to display the text field border
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    style={{ backgroundColor: 'white' }} // Add this line to change the background color
                                ></TextField>
                            </Grid>
                        ))}
                    </Grid>
                ))}
                <Button color="primary" type="submit" style={{ marginTop: 10 }}>
                    Update
                </Button>
            </Stack>
        </NewForm>
    );
};

