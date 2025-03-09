"use client";

import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { updateWorkReportAction } from "@/actions/formAction";
import { FormControl, FormField, FormItem, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useIsClient } from "@/hooks/use-is-client";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import LoadingOverlay from "@/components/LoadingOverlay";
import ExcelJS from 'exceljs';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { convertTimeStrToFractionOfDay } from "@/lib/utils";

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
    workReportId: string;
    workReport: WorkReportData;
    attendances: AttendanceRecord[];
    contractName: string;
    clientName: string;
    closingDay: number | null;
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

export default function ClientWorkReportPage({
    workReportId,
    workReport,
    attendances,
    contractName,
    clientName,
    closingDay
}: WorkReportClientProps) {
    const isClient = useIsClient();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isPending, startTransition] = useTransition();
    // モーダルの状態管理
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    // 一括編集用の状態
    const [bulkStartTime, setBulkStartTime] = useState("09:00");
    const [bulkEndTime, setBulkEndTime] = useState("18:00");
    const [bulkBreakDuration, setBulkBreakDuration] = useState("01:00");
    const [bulkMemo, setBulkMemo] = useState("");
    // 曜日選択用の状態（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // デフォルトで平日を選択
    // 日付範囲選択用の状態
    const [dateRangeMode, setDateRangeMode] = useState<"all" | "weekday" | "custom">("weekday");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

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

    const handleAttendanceSubmit = (data: AttendanceFormValues) => {
        startTransition(async () => {
            try {
                await updateWorkReportAction(workReportId, data);
                setSuccess("Attendance submitted successfully.");
                setError("");
            } catch (err) {
                console.error(err);
                setError("Failed to update attendance.");
                setSuccess("");
            }
        });
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
            setSuccess("テンプレートからの作業報告書作成が完了しました");
        } catch (err) {
            console.error("Error creating report from template:", err);
            setError("テンプレートからの作業報告書作成に失敗しました");
        }
    };

    // メール送信用の関数を追加
    const createReportAndSendEmail = async () => {
        try {
            if (!window.confirm("作業報告書は自動で添付されません。\n「作業報告書を作成」でダウンロードしたファイルを手動で添付してください。")) {
                return;
            }
            // メーラーを起動
            const recipient = "example@example.com"; // 送信先
            const subject = encodeURIComponent(`【作業報告書】${workReport.year}年${workReport.month}月_${contractName}`);
            const body = encodeURIComponent(`
${clientName} 様
   
お疲れ様です。
        
${workReport.year}年${workReport.month}月分の作業報告書を添付いたします。
ご確認のほど、よろしくお願いいたします。    
`);
            window.open(`mailto:${recipient}?subject=${subject}&body=${body}`, '_blank');
        } catch (error) {
            console.error("作業報告書の作成に失敗しました", error);
            setError("作業報告書の作成に失敗しました");
        }
    };

    const handleConfirmCreateReport = async () => {
        if (extensionOption === "excel") {
            if (templateOption === "upload") {
                if (!uploadedTemplateFile) {
                    setError("テンプレートファイルが選択されていません");
                    return;
                }
                try {
                    const buffer = await uploadedTemplateFile.arrayBuffer();
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(buffer);
                    createReportFromTemplate(workbook);
                } catch (err) {
                    console.error("アップロードテンプレートの処理に失敗しました", err);
                    setError("アップロードテンプレートの処理に失敗しました");
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
                    setError("デフォルトテンプレートの読み込みに失敗しました");
                    return;
                }
            }
        } else if (extensionOption === "pdf") {
            setError("PDF形式での作業報告書作成は未実装です");
            return;
        }
        setIsCreateReportDialogOpen(false);
    };

    return (
        <LoadingOverlay isClient={isClient} isPending={isPending}>
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4 dark:text-white">
                    {contractName}の作業報告書
                </h1>
                {error && <FormError message={error} resetSignal={Date.now()} />}
                {success && <FormSuccess message={success} resetSignal={Date.now()} />}

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
                            <span className="flex-1 text-center font-medium">出勤時間</span>
                            <span className="flex-1 text-center font-medium">退勤時間</span>
                            <span className="flex-1 text-center font-medium">休憩時間</span>
                            <span className="w-[400px] text-center font-medium">作業内容</span>
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
                                                    <Input {...field} type="time" id={`break-${day}`} />
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
                                                    <Input {...field} type="text" id={`memo-${day}`} className="w-[400px]" />
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
                        </div>
                    </form>
                </Form>

                {/* 一括編集用モーダルダイアログ */}
                <Dialog open={isBulkEditModalOpen} onOpenChange={setIsBulkEditModalOpen}>
                    <DialogContent>
                        <DialogTitle>勤怠情報の一括入力</DialogTitle>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium mb-2">適用範囲</h3>
                                <div className="flex space-x-4">
                                    <Label className="flex items-center space-x-2">
                                        <Input
                                            type="radio"
                                            className="h-4 w-4"
                                            checked={dateRangeMode === "all"}
                                            onChange={() => setDateRangeMode("all")}
                                        />
                                        <span>全日</span>
                                    </Label>
                                    <Label className="flex items-center space-x-2">
                                        <Input
                                            type="radio"
                                            className="h-4 w-4"
                                            checked={dateRangeMode === "weekday"}
                                            onChange={() => setDateRangeMode("weekday")}
                                        />
                                        <span>曜日指定</span>
                                    </Label>
                                    <Label className="flex items-center space-x-2">
                                        <Input
                                            type="radio"
                                            className="h-4 w-4"
                                            checked={dateRangeMode === "custom"}
                                            onChange={() => setDateRangeMode("custom")}
                                        />
                                        <span>期間指定</span>
                                    </Label>
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
                                                <Label htmlFor={`day-${index}`}>{day}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 日付範囲選択（dateRangeMode === "custom"の場合に表示） */}
                            {dateRangeMode === "custom" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block mb-1">開始日</Label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="block mb-1">終了日</Label>
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
                                        <Label className="block mb-1">出勤時間</Label>
                                        <Input
                                            type="time"
                                            value={bulkStartTime}
                                            onChange={(e) => setBulkStartTime(e.target.value)}
                                            placeholder="例: 09:00"
                                        />
                                    </div>
                                    <div>
                                        <Label className="block mb-1">退勤時間</Label>
                                        <Input
                                            type="time"
                                            value={bulkEndTime}
                                            onChange={(e) => setBulkEndTime(e.target.value)}
                                            placeholder="例: 18:00"
                                        />
                                    </div>
                                    <div>
                                        <Label className="block mb-1">休憩時間</Label>
                                        <Input
                                            type="time"
                                            value={bulkBreakDuration}
                                            onChange={(e) => setBulkBreakDuration(e.target.value)}
                                            placeholder="例: 01:00"
                                        />
                                    </div>
                                    <div>
                                        <Label className="block mb-1">作業内容</Label>
                                        <Input
                                            type="text"
                                            className="w-[400px]"
                                            value={bulkMemo}
                                            onChange={(e) => setBulkMemo(e.target.value)}
                                            placeholder="例: 作業内容"
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
                    </DialogContent>
                </Dialog>

                {/* テンプレート作成オプションダイアログ */}
                <Dialog open={isCreateReportDialogOpen} onOpenChange={setIsCreateReportDialogOpen}>
                    <DialogContent>
                        <DialogTitle>作業報告書作成オプション</DialogTitle>
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
            </div>
        </LoadingOverlay>
    );
}