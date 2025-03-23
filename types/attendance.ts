export interface AttendanceEntry {
  startTime?: Date;
  endTime?: Date;
  breakDuration?: number;
  memo?: string;
}

export interface AttendanceFormValues {
  [day: string]: AttendanceEntry;
}

export function getFormDataValue(formData: FormData, key: string): string {
  return formData.get(key)?.toString() ?? "";
} 