'use client';

import { Form, useForm } from "react-hook-form";
import { useState } from "react";
import { updateWorkReportAction } from "@/actions/formAction";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AttendanceEntry {
    start: string;
    end: string;
}

interface AttendanceFormValues {
    [day: string]: AttendanceEntry;
}

export default function WorkReportClient({ userProjectId, workReportId }: { userProjectId: string, workReportId: string }) {
    const [message, setMessage] = useState('');
    const attendanceForm = useForm<AttendanceFormValues>({
        defaultValues: {} // default will be updated when report is created
    });

    const handleAttendanceSubmit = async (data: AttendanceFormValues) => {
        console.log('Submitting attendance for workReport:', data);
        await updateWorkReportAction(userProjectId, workReportId, data);
        setMessage('Attendance submitted successfully.');
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">
                Work Report for Project {userProjectId}
            </h1>
            {message && <p className="mb-4 text-red-500">{message}</p>}
            <Form {...attendanceForm}>
                <form onSubmit={attendanceForm.handleSubmit(handleAttendanceSubmit)} className="space-y-4">
                    <h2 className="text-lg font-semibold mb-2">Enter Your Attendance</h2>
                    {Object.keys(attendanceForm.getValues()).map((day) => (
                        <div key={day} className="flex items-center space-x-4">
                            <span className="w-32">{day}</span>
                            <FormField
                                control={attendanceForm.control}
                                name={`${day}.start`}
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel>Start</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="time" id={`start-${day}`} />
                                        </FormControl>
                                        <FormMessage>{fieldState.error?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={attendanceForm.control}
                                name={`${day}.end`}
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel>End</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="time" id={`end-${day}`} />
                                        </FormControl>
                                        <FormMessage>{fieldState.error?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                    <Button type="submit">Submit Attendance</Button>
                </form>
            </Form>
        </div>
    );
}