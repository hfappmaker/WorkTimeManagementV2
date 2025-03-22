export interface AttendanceEntry {
  startTime: Date | null;
  endTime: Date | null;
  breakDuration: number | null;
}

export interface AttendanceFormValues {
  [day: string]: AttendanceEntry;
}

export function getFormDataValue(formData: FormData, key: string): string {
  return formData.get(key)?.toString() ?? "";
} 