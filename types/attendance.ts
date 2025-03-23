export interface AttendanceEntry {
  startTime?: Date;
  endTime?: Date;
  breakDuration?: number;
  memo?: string;
}

export interface AttendanceFormValues {
  [day: string]: AttendanceEntry;
}