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
import ModalDialog from "@/components/ModalDialog";
import { Checkbox } from "@/components/ui/checkbox";

interface AttendanceEntry {
    start: string;
    end: string;
    breakDuration: string;
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
    breakDuration: number | null;
}

interface WorkReportClientProps {
    contractId: string;
    workReportId: string;
    workReport: WorkReportData;
    attendances: AttendanceRecord[];
    contractName: string;
    closingDay: number | null;
}

// Helper to generate a key for each day between startDate and endDate (inclusive)
function generateAttendanceDefaults(year: number, month: number, closingDay: number | null): AttendanceFormValues {
    const defaults: AttendanceFormValues = {};
    const current = closingDay ? new Date(year, month - 1, closingDay + 1) : new Date(year, month - 1, 1);
    const end = closingDay ? new Date(year, month, closingDay + 1) : new Date(year, month, 1);
    while (current < end) {
        const dateKey = current.toLocaleDateString('ja-JP');
        defaults[dateKey] = { start: "", end: "", breakDuration: "0" };
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
            defaults[entry.date] = { 
                start: entry.start ?? "", 
                end: entry.end ?? "", 
                breakDuration: entry.breakDuration?.toString() ?? "0" 
            };
        }
    });
    return defaults;
}

export default function WorkReportClient({
    contractId,
    workReportId,
    workReport,
    attendances,
    contractName,
    closingDay
}: WorkReportClientProps) {
    const isClient = useIsClient();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isPending, startTransition] = useTransition();
    // モーダルの状態管理
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    // 一括編集用の状態
    const [bulkStartTime, setBulkStartTime] = useState("");
    const [bulkEndTime, setBulkEndTime] = useState("");
    const [bulkBreakDuration, setBulkBreakDuration] = useState("60");
    // 曜日選択用の状態（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // デフォルトで平日を選択
    // 日付範囲選択用の状態
    const [dateRangeMode, setDateRangeMode] = useState<"all" | "weekday" | "custom">("weekday");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Compute default attendance values for each day in the range…
    const defaults = generateAttendanceDefaults(workReport.year, workReport.month, closingDay);
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
                BreakDuration: `${value.breakDuration} min`,
                // Calculate duration if both start and end times exist
                Duration: (value.start && value.end) 
                    ? calculateDuration(value.start, value.end, value.breakDuration) 
                    : ''
            }));
            
            // Create worksheet from the transformed data
            const worksheet = XLSX.utils.json_to_sheet(workSheetData);
            
            // Set column widths for better readability
            const columnWidths = [
                { wch: 15 }, // Date column
                { wch: 10 }, // Start Time column
                { wch: 10 }, // End Time column
                { wch: 12 }, // Break Duration column
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
    const calculateDuration = (start: string, end: string, breakDuration: string = "0"): string => {
        if (!start || !end) return '';
        
        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);
        
        let durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        
        // Handle case where end time is on the next day
        if (durationMinutes < 0) {
            durationMinutes += 24 * 60;
        }
        
        // Subtract break duration from total time
        const breakMinutes = parseInt(breakDuration) || 0;
        durationMinutes -= breakMinutes;
        
        // Ensure duration is not negative
        durationMinutes = Math.max(0, durationMinutes);
        
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        return `${hours}h ${minutes}m`;
    };

    // 曜日選択のトグル
    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    // 曜日名の配列
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

    // 一括編集を適用する
    const applyBulkEdit = () => {
        const formValues = attendanceForm.getValues();
        const updatedValues = { ...formValues };

        // 全ての日付を取得
        Object.keys(formValues).forEach(dateStr => {
            const date = new Date(dateStr);
            const dayOfWeek = date.getDay(); // 0-6（日-土）

            let shouldUpdate = false;

            // 選択モードに応じて更新するかどうかを決定
            if (dateRangeMode === "all") {
                shouldUpdate = true;
            } else if (dateRangeMode === "weekday") {
                shouldUpdate = selectedDays.includes(dayOfWeek);
            } else if (dateRangeMode === "custom") {
                // 日付範囲の選択がある場合
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    shouldUpdate = date >= start && date <= end;
                }
            }

            // 更新条件を満たす場合、値を更新
            if (shouldUpdate) {
                updatedValues[dateStr] = {
                    ...updatedValues[dateStr],
                    start: bulkStartTime || updatedValues[dateStr].start,
                    end: bulkEndTime || updatedValues[dateStr].end,
                    breakDuration: bulkBreakDuration || updatedValues[dateStr].breakDuration
                };
            }
        });

        // フォームの値を更新
        attendanceForm.reset(updatedValues);
        setIsBulkEditModalOpen(false);
        setSuccess("一括編集を適用しました");
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">出勤情報を入力</h2>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsBulkEditModalOpen(true)}
                            >
                                一括入力
                            </Button>
                        </div>
                        
                        {/* 列ヘッダー */}
                        <div className="flex items-center space-x-4 mb-2">
                            <span className="w-32"></span>
                            <span className="flex-1 text-center font-medium">出勤時間</span>
                            <span className="flex-1 text-center font-medium">退勤時間</span>
                            <span className="flex-1 text-center font-medium">休憩時間（分）</span>
                        </div>

                        {Object.keys(attendanceForm.getValues()).map((day) => (
                            <div key={day} className="flex items-center space-x-4 mb-2">
                                <span className="w-32 flex items-center">
                                    {(() => {
                                        const date = new Date(day);
                                        const dayOfWeek = date.getDay();
                                        return `${day}(${dayNames[dayOfWeek]})`;
                                    })()}
                                </span>
                                <div className="flex-1">
                                    <FormField
                                        control={attendanceForm.control}
                                        name={`${day}.start`}
                                        render={({ field, fieldState }) => (
                                            <FormItem className="flex flex-col justify-center">
                                                <FormControl>
                                                    <Input {...field} type="time" id={`start-${day}`} />
                                                </FormControl>
                                                <FormMessage>{fieldState.error?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex-1">
                                    <FormField
                                        control={attendanceForm.control}
                                        name={`${day}.end`}
                                        render={({ field, fieldState }) => (
                                            <FormItem className="flex flex-col justify-center">
                                                <FormControl>
                                                    <Input {...field} type="time" id={`end-${day}`} />
                                                </FormControl>
                                                <FormMessage>{fieldState.error?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex-1">
                                    <FormField
                                        control={attendanceForm.control}
                                        name={`${day}.breakDuration`}
                                        render={({ field, fieldState }) => (
                                            <FormItem className="flex flex-col justify-center">
                                                <FormControl>
                                                    <Input {...field} type="number" min="0" id={`break-${day}`} />
                                                </FormControl>
                                                <FormMessage>{fieldState.error?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>
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

                {/* 一括編集用モーダルダイアログ */}
                <ModalDialog 
                    isOpen={isBulkEditModalOpen} 
                    title="勤怠情報の一括入力"
                >
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2">適用範囲</h3>
                            <div className="flex space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        checked={dateRangeMode === "all"}
                                        onChange={() => setDateRangeMode("all")}
                                    />
                                    <span>全日</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        checked={dateRangeMode === "weekday"}
                                        onChange={() => setDateRangeMode("weekday")}
                                    />
                                    <span>曜日指定</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        checked={dateRangeMode === "custom"}
                                        onChange={() => setDateRangeMode("custom")}
                                    />
                                    <span>期間指定</span>
                                </label>
                            </div>
                        </div>

                        {/* 曜日選択（dateRangeMode === "weekday"の場合に表示） */}
                        {dateRangeMode === "weekday" && (
                            <div className="py-2">
                                <h3 className="text-sm font-medium mb-2">曜日を選択</h3>
                                <div className="flex flex-wrap gap-2">
                                    {dayNames.map((day, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`day-${index}`}
                                                checked={selectedDays.includes(index)}
                                                onCheckedChange={() => toggleDay(index)}
                                            />
                                            <label htmlFor={`day-${index}`}>{day}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 日付範囲選択（dateRangeMode === "custom"の場合に表示） */}
                        {dateRangeMode === "custom" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">開始日</label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">終了日</label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">勤怠情報</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">出勤時間</label>
                                    <Input
                                        type="time"
                                        value={bulkStartTime}
                                        onChange={(e) => setBulkStartTime(e.target.value)}
                                        placeholder="例: 09:00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">退勤時間</label>
                                    <Input
                                        type="time"
                                        value={bulkEndTime}
                                        onChange={(e) => setBulkEndTime(e.target.value)}
                                        placeholder="例: 18:00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">休憩時間（分）</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={bulkBreakDuration}
                                        onChange={(e) => setBulkBreakDuration(e.target.value)}
                                        placeholder="例: 60"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsBulkEditModalOpen(false)}
                            >
                                キャンセル
                            </Button>
                            <Button
                                type="button"
                                onClick={applyBulkEdit}
                            >
                                適用
                            </Button>
                        </div>
                    </div>
                </ModalDialog>
            </div>
        </LoadingOverlay>
    );
}