import { getOpenedWorkTimeReport, getWorkTimesByWorkTimeReportId } from '@/data/work-time';
import { currentUser } from '@/lib/auth';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { Grid, TextField, FormControlLabel, FormLabel } from '@mui/material';
import { Button } from '@/components/ui/button';

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

    const handleAction = async (formData: FormData) => {
        'use server';
        const date = new Date();
        const startTimeString = formData.get('start1')?.toString() ?? '';
        const [startHours, startMinutes] = startTimeString.split(':').map(Number);
        const endTimeString = formData.get('end1')?.toString() ?? '';
        const [endHours, endMinutes] = endTimeString.split(':').map(Number);

        var start1Data = new Date(date.getFullYear(), date.getMonth(), 1, startHours, startMinutes, 0);
        var end1Data = new Date(date.getFullYear(), date.getMonth(), 1, endHours, endMinutes, 0);
        // await createWorkTime({ startTime: start1Data, endTime: end1Data, userProjectUserId: user.id, userProjectProjectId: params.projectId });
        console.log(formData);
    }

    return (
        <form action={handleAction}>
            {workTimesByDay.map(({ day, workTimes }) => (
                <Grid key={day.toISOString()} container spacing={2} alignItems="center">
                    <Grid item>
                        <FormLabel>{day.toLocaleDateString()}</FormLabel>
                    </Grid>
                    {workTimes.map(workTime => (
                        <Grid item key={workTime.id}>
                            <TextField
                                type="time"
                                defaultValue={workTime.startTime}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                type="time"
                                defaultValue={workTime.endTime}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            ))}
            <Button color="primary" type="submit" style={{ marginTop: 10 }}>
                Post question
            </Button>
        </form>
    );
};

