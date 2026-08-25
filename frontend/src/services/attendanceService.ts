import { apiClient } from './apiClient';
import {
  Attendance,
  AttendanceCreate,
  AttendanceUpdate,
  AttendanceQueryParams,
} from '../types/attendance';

export const attendanceService = {
  /**
   * Fetch attendance list from backend with optional filters (intern_id, status, date).
   * Calls GET /api/v1/attendance?intern_id=...&status=...&date=...
   */
  async getAttendance(params?: AttendanceQueryParams): Promise<Attendance[]> {
    const queryParams: Record<string, string | number> = {};

    if (params?.intern_id !== undefined && params.intern_id !== '' && params.intern_id !== null) {
      queryParams.intern_id = Number(params.intern_id);
    }
    if (params?.status && params.status.trim()) {
      queryParams.status = params.status.trim();
    }
    if (params?.date && params.date.trim()) {
      queryParams.date = params.date.trim();
    }

    return apiClient.get<Attendance[]>('/attendance', { params: queryParams });
  },

  /**
   * Fetch single attendance record by ID.
   * Calls GET /api/v1/attendance/{id}
   */
  async getAttendanceById(id: number | string): Promise<Attendance> {
    return apiClient.get<Attendance>(`/attendance/${id}`);
  },

  /**
   * Create / Log a new attendance record.
   * Calls POST /api/v1/attendance
   */
  async createAttendance(data: AttendanceCreate): Promise<Attendance> {
    const payload: AttendanceCreate = {
      intern_id: Number(data.intern_id),
      attendance_date: data.attendance_date,
      status: data.status,
      remarks: data.remarks && data.remarks.trim() ? data.remarks.trim() : null,
    };
    return apiClient.post<Attendance>('/attendance', payload);
  },

  /**
   * Update existing attendance record.
   * Calls PUT /api/v1/attendance/{id}
   */
  async updateAttendance(id: number | string, data: AttendanceUpdate): Promise<Attendance> {
    const payload: AttendanceUpdate = {};

    if (data.intern_id !== undefined) payload.intern_id = Number(data.intern_id);
    if (data.attendance_date !== undefined) payload.attendance_date = data.attendance_date;
    if (data.status !== undefined) payload.status = data.status;
    if (data.remarks !== undefined) {
      payload.remarks = data.remarks && data.remarks.trim() ? data.remarks.trim() : null;
    }

    return apiClient.put<Attendance>(`/attendance/${id}`, payload);
  },

  /**
   * Delete attendance record by ID.
   * Calls DELETE /api/v1/attendance/{id}
   */
  async deleteAttendance(id: number | string): Promise<void> {
    return apiClient.delete<void>(`/attendance/${id}`);
  },
};

export default attendanceService;
