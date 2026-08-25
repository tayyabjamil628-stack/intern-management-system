export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE';

export interface Attendance {
  id: number;
  intern_id: number;
  attendance_date: string;
  status: AttendanceStatus;
  remarks: string | null;
  created_at?: string;
}

export interface AttendanceCreate {
  intern_id: number;
  attendance_date: string;
  status: AttendanceStatus;
  remarks?: string | null;
}

export interface AttendanceUpdate {
  intern_id?: number;
  attendance_date?: string;
  status?: AttendanceStatus;
  remarks?: string | null;
}

export interface AttendanceQueryParams {
  intern_id?: number | string;
  status?: string;
  date?: string;
}
