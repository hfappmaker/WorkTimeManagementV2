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
import ExcelJS, { Worksheet } from 'exceljs';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface AttendanceEntry {
    start: string;
    end: string;
    breakDuration: string;
}

export interface AttendanceFormValues {
    [day: string]: AttendanceEntry;
}

interface TemplateConfig {
    yearMonthName: string;
    rangeName: string;
    startTimeColumn: string;
    endTimeColumn: string;
    breakDurationColumn: string;
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
    const [bulkStartTime, setBulkStartTime] = useState("09:00");
    const [bulkEndTime, setBulkEndTime] = useState("18:00");
    const [bulkBreakDuration, setBulkBreakDuration] = useState("60");
    // 曜日選択用の状態（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // デフォルトで平日を選択
    // 日付範囲選択用の状態
    const [dateRangeMode, setDateRangeMode] = useState<"all" | "weekday" | "custom">("weekday");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Excelテンプレート関連の状態
    const [templateFile, setTemplateFile] = useState<File | null>(null);
    const [templateFileName, setTemplateFileName] = useState<string>("");
    const [isTemplateConfigModalOpen, setIsTemplateConfigModalOpen] = useState(false);
    const [templateConfig, setTemplateConfig] = useState<TemplateConfig>({
        yearMonthName: "",
        rangeName: "",
        startTimeColumn: "1",
        endTimeColumn: "2",
        breakDurationColumn: "3"
    });
    // テンプレートのワークブック
    const [templateWorkbook, setTemplateWorkbook] = useState<ExcelJS.Workbook | null>(null);

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

    // テンプレートアップロード関数
    const uploadTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            setError("");
            setTemplateFile(file);
            setTemplateFileName(file.name);

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const buffer = e.target?.result as ArrayBuffer;
                    // Log info for debugging
                    console.log("File size:", buffer.byteLength, "bytes");

                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(buffer);

                    console.log("Parsed workbook:", workbook);
                    console.log("Sheet names:", workbook.worksheets.map(sheet => sheet.name));

                    // Validate workbook structure
                    if (!workbook || workbook.worksheets.length === 0) {
                        throw new Error("Invalid template format or no sheets found");
                    }

                    setTemplateWorkbook(workbook);
                    setSuccess("テンプレートのアップロードが完了しました");
                } catch (err) {
                    console.error("Template parsing error:", err);
                    setError("テンプレートの解析中にエラーが発生しました");
                    setTemplateFile(null);
                    setTemplateFileName("");
                    setTemplateWorkbook(null);
                }
            };

            reader.onerror = () => {
                setError("ファイルの読み込み中にエラーが発生しました");
                setTemplateFile(null);
                setTemplateFileName("");
            };

            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error("Template upload failed:", err);
            setError("テンプレートのアップロードに失敗しました");
        } finally {
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    // テンプレート設定の更新
    const updateTemplateConfig = (field: keyof typeof templateConfig, value: string) => {
        setTemplateConfig({
            ...templateConfig,
            [field]: value
        });
    };

    // テンプレートからの作業報告書作成
    const createReportFromTemplate = async () => {
        if (!templateWorkbook) {
            setError("テンプレートがアップロードされていません");
            return;
        }

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
            if (templateConfig.yearMonthName) {
                const yearMonthRanges = templateWorkbook.definedNames.getRanges(templateConfig.yearMonthName);
                if (yearMonthRanges) {
                    const [sheetName, rangeAddress] = parseRangeReference(yearMonthRanges.ranges[0]);
                    if (sheetName) {
                        console.log("sheetName", sheetName);
                        console.log("rangeAddress", rangeAddress);
                        const targetYearMonthSheet = workbook.getWorksheet(sheetName) as Worksheet;
                        console.log("targetYearMonthSheet", targetYearMonthSheet);
                        if (targetYearMonthSheet && rangeAddress) {
                            // 年月を設定
                            const yearMonthCell = targetYearMonthSheet.getCell(rangeAddress);
                            console.log("yearMonthCell", yearMonthCell);
                            console.log("yearMonthCell.value", yearMonthCell.value);
                            const timeValue = new Date(workReport.year, workReport.month);
                            yearMonthCell.value = timeValue;
                        }
                    }
                }
            }

            // 勤怠データの名前付き範囲を処理
            if (templateConfig.rangeName) {
                const rangeRanges = templateWorkbook.definedNames.getRanges(templateConfig.rangeName);
                if (rangeRanges) {
                    const [sheetName, rangeAddress] = parseRangeReference(rangeRanges.ranges[0]);
                    if (sheetName) {
                        const targetSheet = workbook.getWorksheet(sheetName) as Worksheet;

                        if (targetSheet && rangeAddress) {
                            const { startRow, startCol, endRow, endCol } = parseExcelRange(rangeAddress);
                            const targetRange = {
                                start: { row: startRow, col: startCol },
                                end: { row: endRow, col: endCol }
                            };

                            // フォームデータを埋め込む
                            let row = 0;
                            Object.entries(formData).forEach(([date, values]) => {
                                const currentRow = targetRange!.start.row + row;

                                if (currentRow <= targetRange!.end.row) {
                                    // 開始時間を設定 (Convert "HH:mm" to a Date object)
                                    if (values.start && templateConfig.startTimeColumn) {
                                        const [hours, minutes] = values.start.split(":").map(Number);
                                        console.log("hours", hours);
                                        console.log("minutes", minutes);
                                        // Use a base date (e.g., 1899-12-30) so that Excel recognizes it as a time.
                                        const timeValue = new Date(1899, 11, 30, hours, minutes);
                                        const startCol = targetRange!.start.col + (parseInt(templateConfig.startTimeColumn, 10) - 1);
                                        const cell = targetSheet.getCell(currentRow, startCol);
                                        console.log("cell:start", cell);
                                        console.log("timeValue:start", timeValue.toLocaleTimeString());
                                        cell.value = values.start;
                                    }

                                    // 終了時間を設定 (Convert "HH:mm" to a Date object)
                                    if (values.end && templateConfig.endTimeColumn) {
                                        const [hours, minutes] = values.end.split(":").map(Number);
                                        console.log("hours", hours);
                                        console.log("minutes", minutes);
                                        const timeValue = new Date(1899, 11, 30, hours, minutes);
                                        const endCol = targetRange!.start.col + (parseInt(templateConfig.endTimeColumn, 10) - 1);
                                        const cell = targetSheet.getCell(currentRow, endCol);
                                        console.log("cell:end", cell);
                                        console.log("timeValue:end", timeValue.toLocaleTimeString());
                                        cell.value = values.end;
                                    }

                                    // 休憩時間は数値のままでOK
                                    if (values.breakDuration && templateConfig.breakDurationColumn) {
                                        const breakCol = targetRange!.start.col + (parseInt(templateConfig.breakDurationColumn, 10) - 1);
                                        const cell = targetSheet.getCell(currentRow, breakCol);
                                        console.log("cell:breakDuration", cell);
                                        cell.value = parseInt(values.breakDuration, 10);
                                    }

                                    row++;
                                }
                            });
                        }
                    }
                }
            }

            // ファイルを保存
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${workReport.year}年${workReport.month}月度作業報告書.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);

            setSuccess("テンプレートからの作業報告書作成が完了しました");
            setIsTemplateConfigModalOpen(false);
            // 関数の最後で、生成したExcelファイルのBlobを返す
            return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        } catch (err) {
            console.error("Error creating report from template:", err);
            setError("テンプレートからの作業報告書作成に失敗しました");
        }
    };

    // ヘルパー関数: Excel参照のパース
    const parseRangeReference = (ref: string | undefined): [string | null, string | null] => {
        // エクセルの参照をシート名と範囲アドレスに分解
        // 例: 'Sheet1'!A1:C10 -> ['Sheet1', 'A1:C10']
        if (!ref) {
            return [null, null];
        }

        const match = ref.match(/(?:'([^']+)'|([^!]+))!(.+)/);
        if (match) {
            const sheetName = match[1] || match[2];
            const address = match[3];
            return [sheetName, address];
        }
        return [null, ref]; // シート名が指定されていない場合
    };

    // ヘルパー関数: Excelの範囲アドレスを解析
    const parseExcelRange = (range: string) => {
        // A1:C10や$A$1:$C$10のような形式から行と列の情報を抽出（絶対参照$記号に対応）
        const match = range.match(/(\$?)([A-Z]+)(\$?)(\d+):(\$?)([A-Z]+)(\$?)(\d+)/);
        if (match) {
            const startCol = columnNameToNumber(match[2]); // $記号を除いた列名
            const startRow = parseInt(match[4], 10);
            const endCol = columnNameToNumber(match[6]); // $記号を除いた列名
            const endRow = parseInt(match[8], 10);
            return { startRow, startCol, endRow, endCol };
        }

        // 単一セル（例: A1または$A$1）の場合
        const singleCellMatch = range.match(/(\$?)([A-Z]+)(\$?)(\d+)/);
        if (singleCellMatch) {
            const col = columnNameToNumber(singleCellMatch[2]); // $記号を除いた列名
            const row = parseInt(singleCellMatch[4], 10);
            return { startRow: row, startCol: col, endRow: row, endCol: col };
        }

        return { startRow: 1, startCol: 1, endRow: 100, endCol: 10 }; // デフォルト値
    };

    // ヘルパー関数: 列名を数値に変換 (A -> 1, B -> 2, ...)
    const columnNameToNumber = (name: string): number => {
        // $記号が含まれている場合は削除
        const cleanName = name.replace('$', '');
        let sum = 0;
        for (let i = 0; i < cleanName.length; i++) {
            sum = sum * 26 + (cleanName.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
        }
        return sum;
    };

    // メール送信用の関数を追加
    const createReportAndSendEmail = async () => {
        try {

            startTransition(async () => {
                // テンプレートから作業報告書を作成
                const blob = await createReportFromTemplate();
                if (!blob) {
                    setError("作業報告書の作成に失敗しました");
                    return;
                }

                // 作成したファイルを保存
                const fileName = `作業報告書_${workReport.year}年${workReport.month}月_${contractName}.xlsx`;
                const url = URL.createObjectURL(blob);

                // ファイルのダウンロード
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // メーラーを起動
                setTimeout(() => {
                    const recipient = "example@example.com"; // 送信先
                    const subject = encodeURIComponent(`【作業報告書】${workReport.year}年${workReport.month}月_${contractName}`);
                    const body = encodeURIComponent(`
${contractName} 様

お疲れ様です。

${workReport.year}年${workReport.month}月分の作業報告書を添付いたします。
ご確認のほど、よろしくお願いいたします。

`);
                    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
                }, 1000); // ダウンロードが完了するのを少し待ってからメーラーを起動
            });
        } catch (error) {
            console.error("作業報告書の作成に失敗しました", error);
            setError("作業報告書の作成に失敗しました");
        }
    };

    return (
        <LoadingOverlay isClient={isClient} isPending={isPending}>
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4 dark:text-white">
                    {contractName}の作業報告書
                </h1>
                {error && <FormError message={error} />}
                {success && <FormSuccess message={success} />}

                {/* テンプレート情報表示 */}
                {templateFileName && (
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 mb-4 rounded-md border border-gray-300 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="font-medium mr-2 dark:text-gray-200">テンプレート:</span>
                                <span className="text-gray-900 dark:text-gray-200">{templateFileName}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsTemplateConfigModalOpen(true)}
                                >
                                    テンプレートから作業報告書作成
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={createReportAndSendEmail}
                                    disabled={!templateFileName}
                                >
                                    作業報告書をメールで送信
                                </Button>
                            </div>
                        </div>
                    </div>
                )}



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
                                <div className="relative">
                                    <Input
                                        type="file"
                                        id="template-upload"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".xltx,.xltm,.xlt,.xlsx,.xls,.xlsm"
                                        onChange={uploadTemplate}
                                    />
                                    <Button type="button" variant="outline">
                                        テンプレートをアップロード
                                    </Button>
                                </div>
                            </div>
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
                                        checked={dateRangeMode === "all"}
                                        onChange={() => setDateRangeMode("all")}
                                    />
                                    <span>全日</span>
                                </Label>
                                <Label className="flex items-center space-x-2">
                                    <Input
                                        type="radio"
                                        checked={dateRangeMode === "weekday"}
                                        onChange={() => setDateRangeMode("weekday")}
                                    />
                                    <span>曜日指定</span>
                                </Label>
                                <Label className="flex items-center space-x-2">
                                    <Input
                                        type="radio"
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
                                    <Label className="block mb-1">休憩時間（分）</Label>
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
                  </DialogContent>
                </Dialog>

                {/* テンプレート設定用モーダルダイアログ */}
                <Dialog open={isTemplateConfigModalOpen} onOpenChange={setIsTemplateConfigModalOpen}>
                  <DialogContent>
                    <DialogTitle>テンプレート設定</DialogTitle>
                    <div className="space-y-4">
                        <div>
                            <Label className="block mb-1">年月の名前</Label>
                            <Input
                                type="text"
                                value={templateConfig.yearMonthName}
                                onChange={(e) => updateTemplateConfig('yearMonthName', e.target.value)}
                                placeholder="例:yearMonth"
                            />
                        </div>
                        <div>
                            <Label className="block mb-1">範囲の名前</Label>
                            <Input
                                type="text"
                                value={templateConfig.rangeName}
                                onChange={(e) => updateTemplateConfig('rangeName', e.target.value)}
                                placeholder="例: ReportRange"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Excelで定義された範囲の名前。空白の場合はデータが含まれる範囲全体を使用
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label className="block mb-1">開始時間の列</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={templateConfig.startTimeColumn}
                                    onChange={(e) => updateTemplateConfig('startTimeColumn', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="block mb-1">終了時間の列</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={templateConfig.endTimeColumn}
                                    onChange={(e) => updateTemplateConfig('endTimeColumn', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="block mb-1">休憩時間の列</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={templateConfig.breakDurationColumn}
                                    onChange={(e) => updateTemplateConfig('breakDurationColumn', e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            列の番号は、範囲の左端を1として相対的に指定してください。
                        </p>

                        <div className="flex justify-end space-x-2 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsTemplateConfigModalOpen(false)}
                            >
                                キャンセル
                            </Button>
                            <Button
                                type="button"
                                onClick={createReportFromTemplate}
                            >
                                OK
                            </Button>
                        </div>
                    </div>
                  </DialogContent>
                </Dialog>
            </div>
        </LoadingOverlay>
    );
}