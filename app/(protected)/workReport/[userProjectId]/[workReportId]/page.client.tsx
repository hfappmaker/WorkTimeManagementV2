"use client";

import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { updateWorkReportAction } from "@/actions/formAction";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsClient } from "@/hooks/use-is-client";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import LoadingOverlay from "@/components/LoadingOverlay";

interface AttendanceEntry {
    start: string;
    end: string;
}

export interface AttendanceFormValues {
    [day: string]: AttendanceEntry;
}

// Adjust the types as needed; here we assume workReport contains startDate and endDate as strings
// and attendances is an array of records with a "date" field.
interface WorkReportData {
    startDate: string; // For example, in ISO format "2023-09-01"
    endDate: string;
}

interface AttendanceRecord {
    date: string;
    start: string | null;
    end: string | null;
}

interface WorkReportClientProps {
    userProjectId: string;
    workReportId: string;
    workReport: WorkReportData;
    attendances: AttendanceRecord[];
}

// Helper to generate a key for each day between startDate and endDate (inclusive)
function generateAttendanceDefaults(startDate: string, endDate: string): AttendanceFormValues {
    const defaults: AttendanceFormValues = {};
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
        const dateKey = current.toISOString().split("T")[0];
        defaults[dateKey] = { start: "", end: "" };
        current.setDate(current.getDate() + 1);
    }
    return defaults;
}

// Merge server attendances into the defaults: if an attendance exists for a day, overwrite it.
function mergeAttendances(
    defaults: AttendanceFormValues,
    attendances: AttendanceRecord[]
): AttendanceFormValues {
    attendances.forEach((entry) => {
        if (defaults[entry.date]) {
            defaults[entry.date] = { start: entry.start ?? "", end: entry.end ?? "" };
        }
    });
    return defaults;
}

export default function WorkReportClient({
    userProjectId,
    workReportId,
    workReport,
    attendances
}: WorkReportClientProps) {
    const isClient = useIsClient();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isPending, startTransition] = useTransition();

    // Compute default attendance values for each day in the range…
    const defaults = generateAttendanceDefaults(workReport.startDate, workReport.endDate);
    // … then overwrite with attendance records fetched from the server.
    const initialAttendance = mergeAttendances(defaults, attendances);

    // Use these merged defaults in your useForm hook.
    const attendanceForm = useForm<AttendanceFormValues>({
        defaultValues: initialAttendance
    });

    const handleAttendanceSubmit = (data: AttendanceFormValues) => {
        startTransition(async () => {
            try {
                await updateWorkReportAction(userProjectId, workReportId, data);
                setSuccess("Attendance submitted successfully.");
                setError("");
            } catch (err) {
                console.error(err);
                setError("Failed to update attendance.");
                setSuccess("");
            }
        });
    };

    return (
        <LoadingOverlay isClient={isClient} isPending={isPending}>
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">
                    Work Report for Project {userProjectId}
                </h1>
                {error && <FormError message={error} />}
                {success && <FormSuccess message={success} />}
                <Form {...attendanceForm}>
                    <form onSubmit={attendanceForm.handleSubmit(handleAttendanceSubmit)}>
                        <h2 className="text-lg font-semibold mb-2">Enter Your Attendance</h2>
                        {Object.keys(attendanceForm.getValues()).map((day) => (
                            <div key={day} className="flex items-center space-x-4 mb-2">
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
        </LoadingOverlay>
    );
}