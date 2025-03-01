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
import * as XLSX from 'xlsx';

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
    year: number;
    month: number;
}

interface AttendanceRecord {
    date: string;
    start: string | null;
    end: string | null;
}

interface WorkReportClientProps {
    contractId: string;
    workReportId: string;
    workReport: WorkReportData;
    attendances: AttendanceRecord[];
    contractName: string;
}

// Helper to generate a key for each day between startDate and endDate (inclusive)
function generateAttendanceDefaults(year: number, month: number): AttendanceFormValues {
    const defaults: AttendanceFormValues = {};
    const current = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    while (current < end) {
        const dateKey = current.toLocaleDateString('ja-JP');
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
    contractId,
    workReportId,
    workReport,
    attendances,
    contractName
}: WorkReportClientProps) {
    const isClient = useIsClient();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isPending, startTransition] = useTransition();

    // Compute default attendance values for each day in the range…
    const defaults = generateAttendanceDefaults(workReport.year, workReport.month);
    // … then overwrite with attendance records fetched from the server.
    const initialAttendance = mergeAttendances(defaults, attendances);

    // Use these merged defaults in your useForm hook.
    const attendanceForm = useForm<AttendanceFormValues>({
        defaultValues: initialAttendance
    });

    const handleAttendanceSubmit = (data: AttendanceFormValues) => {
        startTransition(async () => {
            try {
                await updateWorkReportAction(contractId, workReportId, data);
                setSuccess("Attendance submitted successfully.");
                setError("");
            } catch (err) {
                console.error(err);
                setError("Failed to update attendance.");
                setSuccess("");
            }
        });
    };

    // Function to handle Excel export
    const exportToExcel = () => {
        try {
            const data = attendanceForm.getValues();
            
            // Transform data for better Excel format
            const workSheetData = Object.entries(data).map(([date, value]) => ({
                Date: date,
                StartTime: value.start,
                EndTime: value.end,
                // Calculate duration if both start and end times exist
                Duration: (value.start && value.end) 
                    ? calculateDuration(value.start, value.end) 
                    : ''
            }));
            
            // Create worksheet from the transformed data
            const worksheet = XLSX.utils.json_to_sheet(workSheetData);
            
            // Set column widths for better readability
            const columnWidths = [
                { wch: 15 }, // Date column
                { wch: 10 }, // Start Time column
                { wch: 10 }, // End Time column
                { wch: 10 }  // Duration column
            ];
            worksheet['!cols'] = columnWidths;
            
            // Create workbook and append the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
            
            // Generate Excel file
            const fileName = `Work_Report_${contractId}_${workReportId}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            setSuccess("Excel export successful.");
        } catch (err) {
            console.error("Export to Excel failed:", err);
            setError("Failed to export to Excel.");
        }
    };
    
    // Helper function to calculate duration between two times
    const calculateDuration = (start: string, end: string): string => {
        if (!start || !end) return '';
        
        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);
        
        let durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        
        // Handle case where end time is on the next day
        if (durationMinutes < 0) {
            durationMinutes += 24 * 60;
        }
        
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        return `${hours}h ${minutes}m`;
    };

    return (
        <LoadingOverlay isClient={isClient} isPending={isPending}>
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">
                    {contractName}の作業報告書
                </h1>
                {error && <FormError message={error} />}
                {success && <FormSuccess message={success} />}
                <Form {...attendanceForm}>
                    <form onSubmit={attendanceForm.handleSubmit(handleAttendanceSubmit)}>
                        <h2 className="text-lg font-semibold mb-2">出勤情報を入力</h2>
                        {Object.keys(attendanceForm.getValues()).map((day) => (
                            <div key={day} className="flex items-center space-x-4 mb-2">
                                <span className="w-32">{day}</span>
                                <FormField
                                    control={attendanceForm.control}
                                    name={`${day}.start`}
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>出勤時間</FormLabel>
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
                                            <FormLabel>退勤時間</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="time" id={`end-${day}`} />
                                            </FormControl>
                                            <FormMessage>{fieldState.error?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                        <div className="flex flex-col gap-2 mt-4">
                            <Button type="submit">出勤情報を送信</Button>
                            <Button type="button" onClick={exportToExcel} variant="outline">
                                出勤情報をExcelにエクスポート
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </LoadingOverlay>
    );
}