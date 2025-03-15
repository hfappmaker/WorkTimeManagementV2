"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { updateWorkReportAction } from "@/actions/formAction";
import { FormControl, FormField, FormItem, FormMessage, Form, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import ExcelJS from 'exceljs';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { convertTimeStrToFractionOfDay } from "@/lib/utils";
import { useTransitionContext } from "@/contexts/TransitionContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimePickerField } from "@/components/ui/time-picker"

interface AttendanceEntry {
    start: string;
    end: string;
    breakDuration: string;
    memo: string;
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
    breakDuration: string | null;
    memo: string | null;
}

interface WorkReportClientProps {
    contractId: string;
    workReportId: string;
    workReport: WorkReportData;
    attendances: AttendanceRecord[];
    contractName: string;
    clientName: string;
    closingDay: number | null;
    userName: string;
    clientEmail: string;
    dailyWorkMinutes: number;
    monthlyWorkMinutes: number;
    basicStartTime: { hour: number; minute: number } | null;
    basicEndTime: { hour: number; minute: number } | null;
    basicBreakDuration: { hour: number; minute: number } | null;
}

// Helper to generate a key for each day between startDate and endDate (inclusive)
function generateAttendanceDefaults(year: number, month: number, closingDay: number | null): AttendanceFormValues {
    const defaults: AttendanceFormValues = {};
    const current = closingDay ? new Date(year, month - 1, closingDay + 1) : new Date(year, month - 1, 1);
    const end = closingDay ? new Date(year, month, closingDay + 1) : new Date(year, month, 1);
    while (current < end) {
        const dateKey = current.toLocaleDateString('ja-JP');
        defaults[dateKey] = { start: "", end: "", breakDuration: "", memo: "" };
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
                breakDuration: entry.breakDuration ?? "",
                memo: entry.memo ?? ""
            };
        }
    });
    return defaults;
}

// ---- Begin moved helper functions ----

const parseRangeReference = (ref: string | undefined): [string | null, string | null] => {
    if (!ref) {
        return [null, null];
    }
    const match = ref.match(/(?:'([^']+)'|([^!]+))!(.+)/);
    if (match) {
        const sheetName = match[1] || match[2];
        const address = match[3];
        return [sheetName, address];
    }
    return [null, ref];
};

type ExcelRange = { startRow: number; startCol: number; endRow: number; endCol: number };

const parseExcelRange = (range: string): ExcelRange => {
    const match = range.match(/(\$?)([A-Z]+)(\$?)(\d+):(\$?)([A-Z]+)(\$?)(\d+)/);
    if (match) {
        const startCol = columnNameToNumber(match[2]);
        const startRow = parseInt(match[4], 10);
        const endCol = columnNameToNumber(match[6]);
        const endRow = parseInt(match[8], 10);
        return { startRow, startCol, endRow, endCol };
    }
    const singleCellMatch = range.match(/(\$?)([A-Z]+)(\$?)(\d+)/);
    if (singleCellMatch) {
        const col = columnNameToNumber(singleCellMatch[2]);
        const row = parseInt(singleCellMatch[4], 10);
        return { startRow: row, startCol: col, endRow: row, endCol: col };
    }
    return { startRow: 1, startCol: 1, endRow: 100, endCol: 10 };
};

const columnNameToNumber = (name: string): number => {
    const cleanName = name.replace(/\$/g, '');
    let sum = 0;
    for (let i = 0; i < cleanName.length; i++) {
        sum = sum * 26 + (cleanName.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return sum;
};

function formatMonthDay(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// ---- End moved helper functions ----

// 時間間隔を設定するヘルパー関数（例：15分単位）
function generateTimeOptions(intervalMinutes: number = 15) {
    const options = [];
    const totalMinutes = 24 * 60; // 24時間分の分数

    for (let minutes = 0; minutes < totalMinutes; minutes += intervalMinutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        options.push(timeString);
    }

    return options;
}

const editFormSchema = z.object({
    startHour: z.string().optional(),
    startMinute: z.string().optional(),
    endHour: z.string().optional(),
    endMinute: z.string().optional(),
    breakHour: z.string().optional(),
    breakMinute: z.string().optional(),
    memo: z.string().optional(),
});

type EditFormValues = z.infer<typeof editFormSchema>;
const dateRangeModes = ["all", "weekday", "custom"] as const;
type dateRangeMode = typeof dateRangeModes[number];

// 日付が更新対象かどうかを判定する関数
const shouldUpdateDate = (
    date: Date,
    dateRangeMode: dateRangeMode,
    selectedDays?: number[],
    startDate?: string,
    endDate?: string
): boolean => {
    const dayOfWeek = date.getDay();

    switch (dateRangeMode) {
        case "all":
            return true;
        case "weekday":
            return selectedDays?.includes(dayOfWeek) ?? false;
        case "custom":
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                return date >= start && date <= end;
            }
            return false;
        default:
            return false;
    }
};

const bulkEditFormSchema = z.object({
    dateRangeMode: z.enum(dateRangeModes),
    selectedDays: z.array(z.number()).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    startHour: z.string().optional(),
    startMinute: z.string().optional(),
    endHour: z.string().optional(),
    endMinute: z.string().optional(),
    breakHour: z.string().optional(),
    breakMinute: z.string().optional(),
    memo: z.string().optional()
});

type BulkEditFormValues = z.infer<typeof bulkEditFormSchema>;

export default function ClientWorkReportPage({
    contractId,
    workReportId,
    workReport,
    attendances,
    contractName,
    clientName,
    closingDay,
    userName,
    clientEmail,
    dailyWorkMinutes,
    monthlyWorkMinutes,
    basicStartTime,
    basicEndTime,
    basicBreakDuration
}: WorkReportClientProps) {
    const [error, setError] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
    const [success, setSuccess] = useState<{ message: string, date: Date }>({ message: "", date: new Date() });
    const { startTransition } = useTransitionContext();
    // モーダルの状態管理
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    const [editingDate, setEditingDate] = useState<string | null>(null);
    // New state for holding the uploaded template file
    const [uploadedTemplateFile, setUploadedTemplateFile] = useState<File | null>(null);
    // New states for Create Report Dialog
    const [isCreateReportDialogOpen, setIsCreateReportDialogOpen] = useState(false);
    const [templateOption, setTemplateOption] = useState("default");  // 'default' or 'upload'
    const [extensionOption, setExtensionOption] = useState("excel");    // 'excel' or 'pdf'

    // Compute default attendance values for each day in the range…
    const defaults = generateAttendanceDefaults(workReport.year, workReport.month, closingDay);
    // … then overwrite with attendance records fetched from the server.
    const initialAttendance = mergeAttendances(defaults, attendances);

    // Use these merged defaults in your useForm hook.
    const attendanceForm = useForm<AttendanceFormValues>({
        defaultValues: initialAttendance
    });

    // 編集用フォーム
    const editForm = useForm<EditFormValues>({
        resolver: zodResolver(editFormSchema),
        defaultValues: {
            startHour: basicStartTime?.hour?.toString() || "",
            startMinute: basicStartTime?.minute?.toString() || "",
            endHour: basicEndTime?.hour?.toString() || "",
            endMinute: basicEndTime?.minute?.toString() || "",
            breakHour: basicBreakDuration?.hour?.toString() || "",
            breakMinute: basicBreakDuration?.minute?.toString() || "",
            memo: ""
        }
    });

    // 一括編集用フォーム
    const bulkEditForm = useForm<BulkEditFormValues>({
        resolver: zodResolver(bulkEditFormSchema),
        defaultValues: {
            dateRangeMode: "weekday",
            selectedDays: [1, 2, 3, 4, 5],
            startHour: basicStartTime?.hour?.toString() || "",
            startMinute: basicStartTime?.minute?.toString() || "",
            endHour: basicEndTime?.hour?.toString() || "",
            endMinute: basicEndTime?.minute?.toString() || "",
            breakHour: basicBreakDuration?.hour?.toString() || "",
            breakMinute: basicBreakDuration?.minute?.toString() || "",
            memo: "",
            startDate: "",
            endDate: "",
        }
    });

    const handleAttendanceSubmit = (data: AttendanceFormValues) => {
        startTransition(async () => {
            try {
                await updateWorkReportAction(contractId, workReportId, data);
                setSuccess({ message: "Attendance submitted successfully.", date: new Date() });
                setError({ message: "", date: new Date() });
            } catch (err) {
                console.error(err);
                setError({ message: "Failed to update attendance.", date: new Date() });
                setSuccess({ message: "", date: new Date() });
            }
        });
    };

    // 曜日名の配列
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

    // 一括編集を適用する
    const applyBulkEdit = (data: BulkEditFormValues) => {
        const formValues = attendanceForm.getValues();
        const updatedValues = { ...formValues };

        Object.keys(formValues).forEach(dateStr => {
            const date = new Date(dateStr);
            const shouldUpdate = shouldUpdateDate(
                date,
                data.dateRangeMode,
                data.selectedDays,
                data.startDate,
                data.endDate
            );

            if (shouldUpdate) {
                updatedValues[dateStr] = {
                    ...updatedValues[dateStr],
                    start: data.startHour && data.startMinute ? `${data.startHour}:${data.startMinute}` : updatedValues[dateStr].start,
                    end: data.endHour && data.endMinute ? `${data.endHour}:${data.endMinute}` : updatedValues[dateStr].end,
                    breakDuration: data.breakHour && data.breakMinute ? `${data.breakHour}:${data.breakMinute}` : updatedValues[dateStr].breakDuration,
                    memo: data.memo || updatedValues[dateStr].memo
                };
            }
        });

        attendanceForm.reset(updatedValues);
        setIsBulkEditModalOpen(false);
        setSuccess({ message: "一括編集を適用しました", date: new Date() });
    };

    // 編集フォームの送信処理
    const onEditSubmit = async (data: EditFormValues) => {
        try {
            if (!editingDate) return;

            startTransition(async () => {
                const formValues = attendanceForm.getValues();
                const updatedValues = { ...formValues };
                updatedValues[editingDate] = {
                    start: `${data.startHour}:${data.startMinute}`,
                    end: `${data.endHour}:${data.endMinute}`,
                    breakDuration: `${data.breakHour}:${data.breakMinute}`,
                    memo: data.memo || ""
                };
                // フォームの値を更新
                await updateWorkReportAction(contractId, workReportId, updatedValues);
                attendanceForm.reset(updatedValues);
                setEditingDate(null);
            })
            setSuccess({ message: "編集を適用しました", date: new Date() });
        } catch (error) {
            console.error("編集の適用に失敗しました", error);
            setError({ message: "編集の適用に失敗しました", date: new Date() });
        }
    };

    // openEditDialog関数を簡略化
    const openEditDialog = (date: string) => {
        setEditingDate(date);
    };

    // editingDateの変更を監視してフォームをリセット
    useEffect(() => {
        if (editingDate) {
            const formValues = attendanceForm.getValues();
            const entry = formValues[editingDate];

            editForm.reset({
                startHour: entry.start.split(':')[0] || '',
                startMinute: entry.start.split(':')[1] || '',
                endHour: entry.end.split(':')[0] || '',
                endMinute: entry.end.split(':')[1] || '',
                breakHour: entry.breakDuration.split(':')[0] || '',
                breakMinute: entry.breakDuration.split(':')[1] || '',
                memo: entry.memo
            });
        }
    }, [editingDate, attendanceForm, editForm]);

    // 編集をキャンセル
    const cancelEdit = () => {
        setEditingDate(null);
    };

    // テンプレートからの作業報告書作成
    const createReportFromTemplate = async (templateWorkbook: ExcelJS.Workbook) => {
        try {
            // フォームデータを取得
            const formData = attendanceForm.getValues();

            // 新しいワークブックを作成
            const workbook = new ExcelJS.Workbook();

            // テンプレートからシートをコピー
            for (const worksheet of templateWorkbook.worksheets) {
                // 新しいシートを作成
                const newSheet = workbook.addWorksheet(worksheet.name);

                // シートのプロパティをコピー
                newSheet.properties = { ...worksheet.properties };

                // 列の幅をコピー
                worksheet.columns.forEach((col, index) => {
                    if (col.width) {
                        newSheet.getColumn(index + 1).width = col.width;
                    }
                });

                // マージセル情報をコピーする
                if (worksheet.model && worksheet.model.merges) {
                    worksheet.model.merges.forEach((mergeRange) => {
                        newSheet.mergeCells(mergeRange);
                    });
                }

                // セルのスタイルをコピー
                worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                    const newRow = newSheet.getRow(rowNumber);
                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        const newCell = newRow.getCell(colNumber);
                        newCell.style = { ...cell.style };
                    });
                });

                // セルの値をコピー
                worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                    const newRow = newSheet.getRow(rowNumber);
                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        const newCell = newRow.getCell(colNumber);
                        newCell.value = cell.value;
                    });
                });

            }

            // コピー元のテンプレートに定義された名前付き範囲を新しいワークブックに追加する
            if (templateWorkbook.definedNames) {
                for (const definedName of templateWorkbook.definedNames.model) {
                    // Get the named ranges for "name"
                    console.log("definedName", definedName);
                    const ranges = templateWorkbook.definedNames.getRanges(definedName.name);
                    console.log("ranges", ranges);
                    if (ranges && ranges.ranges.length > 0) {
                        for (const range of ranges.ranges) {
                            workbook.definedNames.add(range, definedName.name);
                            console.log(`Added named range: ${definedName.name} -> ${range}`);
                        }
                    }
                }
            }

            // 年月の名前付き範囲を処理
            const workReportMonthRanges = templateWorkbook.definedNames.getRanges("タイトル");
            const [workReportMonthSheetName, workReportMonthRangeAddress] = parseRangeReference(workReportMonthRanges.ranges[0]);
            if (workReportMonthSheetName) {
                const targetWorkReportMonthSheet = workbook.getWorksheet(workReportMonthSheetName);
                if (targetWorkReportMonthSheet && workReportMonthRangeAddress) {
                    const workReportMonthCell = targetWorkReportMonthSheet.getCell(workReportMonthRangeAddress);
                    workReportMonthCell.value = `${workReport.year}年${workReport.month}月度作業報告書`;
                }
            }

            // ----- New code: Fill form data into the named ranges -----
            // Assume the named ranges '日付', '開始時刻', '終了時刻', '休憩時間' are each 31 cells vertically arranged
            const sortedDates = Object.keys(formData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            const fieldNames = ["日付", "開始時刻", "終了時刻", "休憩時間", "稼働時間", "作業内容"];
            fieldNames.forEach(fieldName => {
                const fieldRanges = workbook.definedNames.getRanges(fieldName);
                if (fieldRanges && fieldRanges.ranges && fieldRanges.ranges.length > 0) {
                    const [sheetName, rangeAddress] = parseRangeReference(fieldRanges.ranges[0]);
                    if (sheetName && rangeAddress) {
                        const { startRow, startCol } = parseExcelRange(rangeAddress);
                        const sheet = workbook.getWorksheet(sheetName);
                        if (sheet) {
                            for (let i = 0; i < 31; i++) {
                                const currentRow = startRow + i;
                                let value: string | number = "";
                                if (i < sortedDates.length) {
                                    const dateKey = sortedDates[i];
                                    const entry = formData[dateKey];
                                    if (fieldName === "日付") {
                                        value = formatMonthDay(dateKey);
                                    } else if (fieldName === "開始時刻") {
                                        if (entry.start) {
                                            value = convertTimeStrToFractionOfDay(entry.start);
                                            sheet.getCell(currentRow, startCol).numFmt = "[h]:mm";
                                        }
                                    } else if (fieldName === "終了時刻") {
                                        if (entry.end) {
                                            value = convertTimeStrToFractionOfDay(entry.end);
                                            sheet.getCell(currentRow, startCol).numFmt = "[h]:mm";
                                        }
                                    } else if (fieldName === "休憩時間") {
                                        if (entry.breakDuration) {
                                            value = convertTimeStrToFractionOfDay(entry.breakDuration);
                                            sheet.getCell(currentRow, startCol).numFmt = "[h]:mm";
                                        }
                                    } else if (fieldName === "稼働時間") {
                                        if (entry.start && entry.end) {
                                            const startMs = convertTimeStrToFractionOfDay(entry.start);
                                            const endMs = convertTimeStrToFractionOfDay(entry.end);
                                            if (entry.breakDuration) {
                                                const breakMs = convertTimeStrToFractionOfDay(entry.breakDuration);
                                                value = endMs - startMs - breakMs;
                                            } else {
                                                value = endMs - startMs;
                                            }
                                            sheet.getCell(currentRow, startCol).numFmt = "[h]:mm";
                                        }
                                    } else if (fieldName === "作業内容") {
                                        if (entry.memo) {
                                            value = entry.memo;
                                        }
                                    }
                                }
                                sheet.getCell(currentRow, startCol).value = value;
                            }
                        }
                    }
                }
            });
            // ----- End of new code -----

            // ファイルを保存
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${workReport.year}年${workReport.month}月度作業報告書.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);
            setSuccess({ message: "テンプレートからの作業報告書作成が完了しました", date: new Date() });
        } catch (err) {
            console.error("Error creating report from template:", err);
            setError({ message: "テンプレートからの作業報告書作成に失敗しました", date: new Date() });
        }
    };

    // メール送信用の関数を追加
    const createReportAndSendEmail = async () => {
        try {
            if (!window.confirm("作業報告書は自動で添付されません。\n「作業報告書を作成」でダウンロードしたファイルを手動で添付してください。")) {
                return;
            }
            // メーラーを起動
            const recipient = clientEmail; // 送信先
            const subject = encodeURIComponent(`【作業報告書】${workReport.year}年${workReport.month}月_${userName}`);
            const body = encodeURIComponent(`
${contractName ?? clientName} 様
   
お世話になっております。${userName}です。
        
${workReport.year}年${workReport.month}月分の作業報告書を送付いたします。
ご確認のほど、よろしくお願いいたします。    
`);
            window.open(`mailto:${recipient}?subject=${subject}&body=${body}`, '_blank');
        } catch (error) {
            console.error("作業報告書の作成に失敗しました", error);
            setError({ message: "作業報告書の作成に失敗しました", date: new Date() });
        }
    };

    const handleConfirmCreateReport = async () => {
        if (extensionOption === "excel") {
            if (templateOption === "upload") {
                if (!uploadedTemplateFile) {
                    setError({ message: "テンプレートファイルが選択されていません", date: new Date() });
                    return;
                }
                try {
                    const buffer = await uploadedTemplateFile.arrayBuffer();
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(buffer);
                    createReportFromTemplate(workbook);
                } catch (err) {
                    console.error("アップロードテンプレートの処理に失敗しました", err);
                    setError({ message: "アップロードテンプレートの処理に失敗しました", date: new Date() });
                    return;
                }
            }
            if (templateOption === "default") {
                try {
                    const response = await fetch("/workReportDefaultTemplate.xlsx");
                    if (!response.ok) {
                        throw new Error("デフォルトテンプレートの取得に失敗しました");
                    }
                    const buffer = await response.arrayBuffer();
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(buffer);
                    createReportFromTemplate(workbook);
                } catch (err) {
                    console.error("デフォルトテンプレートの読み込みに失敗しました:", err);
                    setError({ message: "デフォルトテンプレートの読み込みに失敗しました", date: new Date() });
                    return;
                }
            }
        } else if (extensionOption === "pdf") {
            setError({ message: "PDF形式での作業報告書作成は未実装です", date: new Date() });
            return;
        }
        setIsCreateReportDialogOpen(false);
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4 dark:text-white">
                {contractName}の作業報告書
            </h1>
            {error && <FormError message={error.message} resetSignal={error.date.getTime()} />}
            {success && <FormSuccess message={success.message} resetSignal={success.date.getTime()} />}

            <Form {...attendanceForm}>
                <form onSubmit={attendanceForm.handleSubmit(handleAttendanceSubmit)}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">出勤情報を入力</h2>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsBulkEditModalOpen(true)}
                            >
                                一括入力
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsCreateReportDialogOpen(true)}>
                                作業報告書を作成
                            </Button>
                            <Button type="button" variant="outline" onClick={createReportAndSendEmail}>
                                メール送信
                            </Button>
                        </div>
                    </div>

                    {/* 列ヘッダー */}
                    <div className="flex items-center space-x-4 mb-2">
                        <span className="w-32"></span>
                        <span className="w-16"></span>
                        <span className="flex-1 text-center font-medium">出勤時間</span>
                        <span className="flex-1 text-center font-medium">退勤時間</span>
                        <span className="flex-1 text-center font-medium">休憩時間</span>
                        <span className="w-[400px] text-center font-medium">作業内容</span>
                    </div>

                    {Object.keys(attendanceForm.getValues()).map((day) => (
                        <div key={day} className="flex items-center space-x-4 mb-2">

                            <div className="w-32 flex items-center justify-between">
                                <span>
                                    {(() => {
                                        const date = new Date(day);
                                        const dayOfWeek = date.getDay();
                                        return `${day}(${dayNames[dayOfWeek]})`;
                                    })()}
                                </span>
                            </div>
                            <div className="w-16 flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(day)}
                                >
                                    編集
                                </Button>
                            </div>
                            <div className="flex-1">
                                <FormField
                                    control={attendanceForm.control}
                                    name={`${day}.start`}
                                    render={({ field, fieldState }) => (
                                        <FormItem className="flex flex-col justify-center">
                                            <FormControl>
                                                <Input {...field} type="time" id={`start-${day}`} readOnly />
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
                                                <Input {...field} type="time" id={`end-${day}`} readOnly />
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
                                                <Input {...field} type="time" id={`break-${day}`} readOnly />
                                            </FormControl>
                                            <FormMessage>{fieldState.error?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex-1">
                                <FormField
                                    control={attendanceForm.control}
                                    name={`${day}.memo`}
                                    render={({ field, fieldState }) => (
                                        <FormItem className="flex flex-col justify-center">
                                            <FormControl>
                                                <Input {...field} type="text" id={`memo-${day}`} className="w-[400px]" readOnly />
                                            </FormControl>
                                            <FormMessage>{fieldState.error?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="flex flex-col gap-2 mt-4">
                        <Button type="submit">保存</Button>
                    </div>
                </form>
            </Form>

            {/* 一括編集用モーダルダイアログ */}
            <Dialog open={isBulkEditModalOpen} onOpenChange={setIsBulkEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>勤怠情報の一括入力</DialogTitle>
                    </DialogHeader>
                    <Form {...bulkEditForm}>
                        <form onSubmit={bulkEditForm.handleSubmit(applyBulkEdit)} className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium mb-2">適用範囲</h3>
                                <FormField
                                    control={bulkEditForm.control}
                                    name="dateRangeMode"
                                    render={({ field }) => (
                                        <FormItem className="flex space-x-4">
                                            <FormControl>
                                                <div className="flex space-x-4">
                                                    <Label className="flex items-center space-x-2">
                                                        <Input
                                                            type="radio"
                                                            className="h-4 w-4"
                                                            checked={field.value === "all"}
                                                            onChange={() => field.onChange("all")}
                                                        />
                                                        <span>全日</span>
                                                    </Label>
                                                    <Label className="flex items-center space-x-2">
                                                        <Input
                                                            type="radio"
                                                            className="h-4 w-4"
                                                            checked={field.value === "weekday"}
                                                            onChange={() => field.onChange("weekday")}
                                                        />
                                                        <span>曜日指定</span>
                                                    </Label>
                                                    <Label className="flex items-center space-x-2">
                                                        <Input
                                                            type="radio"
                                                            className="h-4 w-4"
                                                            checked={field.value === "custom"}
                                                            onChange={() => field.onChange("custom")}
                                                        />
                                                        <span>期間指定</span>
                                                    </Label>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {bulkEditForm.watch("dateRangeMode") === "weekday" && (
                                <div className="py-2">
                                    <h3 className="text-sm font-medium mb-2">曜日を選択</h3>
                                    <FormField
                                        control={bulkEditForm.control}
                                        name="selectedDays"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="flex flex-wrap gap-2">
                                                        {dayNames.map((day, index) => (
                                                            <div key={index} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`day-${index}`}
                                                                    checked={field.value?.includes(index)}
                                                                    onCheckedChange={(checked) => {
                                                                        const currentValue = field.value || [];
                                                                        if (checked) {
                                                                            field.onChange([...currentValue, index]);
                                                                        } else {
                                                                            field.onChange(currentValue.filter(d => d !== index));
                                                                        }
                                                                    }}
                                                                />
                                                                <Label htmlFor={`day-${index}`}>{day}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {bulkEditForm.watch("dateRangeMode") === "custom" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={bulkEditForm.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>開始日</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={bulkEditForm.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>終了日</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">勤怠情報</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={bulkEditForm.control}
                                        name="startHour"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>出勤時間</FormLabel>
                                                <TimePickerField
                                                    control={bulkEditForm.control}
                                                    hourFieldName="startHour"
                                                    minuteFieldName="startMinute"
                                                    minuteStep={dailyWorkMinutes}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={bulkEditForm.control}
                                        name="endHour"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>退勤時間</FormLabel>
                                                <TimePickerField
                                                    control={bulkEditForm.control}
                                                    hourFieldName="endHour"
                                                    minuteFieldName="endMinute"
                                                    minuteStep={dailyWorkMinutes}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={bulkEditForm.control}
                                        name="breakHour"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>休憩時間</FormLabel>
                                                <TimePickerField
                                                    control={bulkEditForm.control}
                                                    hourFieldName="breakHour"
                                                    minuteFieldName="breakMinute"
                                                    minuteStep={dailyWorkMinutes}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={bulkEditForm.control}
                                        name="memo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>作業内容</FormLabel>
                                                <FormControl>
                                                    <Input type="text" className="w-[400px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                                <Button type="submit">
                                    適用
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* テンプレート作成オプションダイアログ */}
            <Dialog open={isCreateReportDialogOpen} onOpenChange={setIsCreateReportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>作業報告書作成オプション</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <fieldset className="space-y-2">
                            <legend className="font-medium">テンプレート選択</legend>
                            <div className="flex space-x-4">
                                <Label htmlFor="defaultTemplate" className="inline-flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        id="defaultTemplate"
                                        name="templateOption"
                                        value="default"
                                        checked={templateOption === "default"}
                                        onChange={() => setTemplateOption("default")}
                                        className="h-4 w-4"
                                    />
                                    <span>デフォルトテンプレート</span>
                                </Label>
                                <Label htmlFor="uploadTemplateOption" className="inline-flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        id="uploadTemplateOption"
                                        name="templateOption"
                                        value="upload"
                                        checked={templateOption === "upload"}
                                        onChange={() => setTemplateOption("upload")}
                                        className="h-4 w-4"
                                    />
                                    <span>テンプレートをアップロード</span>
                                </Label>
                            </div>
                            {templateOption === "upload" && (
                                <div className="mt-2">
                                    <Label htmlFor="templateUpload" className="block mb-1">テンプレートファイルを選択</Label>
                                    <Input
                                        type="file"
                                        id="templateUpload"
                                        accept=".xlsx"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setUploadedTemplateFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </fieldset>

                        <fieldset className="space-y-2">
                            <legend className="font-medium">拡張子</legend>
                            <div className="flex space-x-4">
                                <Label htmlFor="excelFormat" className="inline-flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        id="excelFormat"
                                        name="extensionOption"
                                        value="excel"
                                        checked={extensionOption === "excel"}
                                        onChange={() => setExtensionOption("excel")}
                                        className="h-4 w-4"
                                    />
                                    <span>エクセル形式</span>
                                </Label>
                                <Label htmlFor="pdfFormat" className="inline-flex items-center gap-2">
                                    <Input
                                        type="radio"
                                        id="pdfFormat"
                                        name="extensionOption"
                                        value="pdf"
                                        checked={extensionOption === "pdf"}
                                        onChange={() => setExtensionOption("pdf")}
                                        className="h-4 w-4"
                                    />
                                    <span>PDF形式</span>
                                </Label>
                            </div>
                        </fieldset>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateReportDialogOpen(false)}>
                                キャンセル
                            </Button>
                            <Button type="button" onClick={handleConfirmCreateReport}>
                                作成
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 編集用モーダルダイアログ */}
            <Dialog open={editingDate !== null} onOpenChange={(open) => !open && setEditingDate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>勤怠情報の編集</DialogTitle>
                    </DialogHeader>
                    {editingDate && (
                        <Form {...editForm}>
                            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium mb-2">
                                        {(() => {
                                            const date = new Date(editingDate);
                                            const dayOfWeek = date.getDay();
                                            return `${editingDate}(${dayNames[dayOfWeek]})の勤怠情報を編集`;
                                        })()}
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex space-x-4">
                                        <FormField
                                            control={editForm.control}
                                            name="startHour"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel>出勤時間</FormLabel>
                                                    <TimePickerField
                                                        control={editForm.control}
                                                        hourFieldName="startHour"
                                                        minuteFieldName="startMinute"
                                                        minuteStep={dailyWorkMinutes}
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={editForm.control}
                                            name="endHour"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel>退勤時間</FormLabel>
                                                    <TimePickerField
                                                        control={editForm.control}
                                                        hourFieldName="endHour"
                                                        minuteFieldName="endMinute"
                                                        minuteStep={dailyWorkMinutes}
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={editForm.control}
                                            name="breakHour"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel>休憩時間</FormLabel>
                                                    <TimePickerField
                                                        control={editForm.control}
                                                        hourFieldName="breakHour"
                                                        minuteFieldName="breakMinute"
                                                        minuteStep={dailyWorkMinutes}
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={editForm.control}
                                        name="memo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>作業内容</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="text"
                                                        className="w-[400px]"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={cancelEdit}
                                    >
                                        キャンセル
                                    </Button>
                                    <Button type="submit">
                                        保存
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}