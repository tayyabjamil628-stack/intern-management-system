import { apiClient } from './apiClient';
import {
  Intern,
  InternCreate,
  InternUpdate,
  InternQueryParams,
} from '../types/intern';

export const internService = {
  /**
   * Fetch interns list from backend with optional filters (search, department_id, status).
   * Calls GET /api/v1/interns?search=...&department_id=...&status=...
   */
  async getInterns(params?: InternQueryParams): Promise<Intern[]> {
    const queryParams: Record<string, string | number> = {};

    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params?.department_id !== undefined && params.department_id !== '' && params.department_id !== null) {
      queryParams.department_id = Number(params.department_id);
    }
    if (params?.status && params.status.trim()) {
      queryParams.status = params.status.trim();
    }

    return apiClient.get<Intern[]>('/interns', { params: queryParams });
  },

  /**
   * Fetch single intern by ID.
   * Calls GET /api/v1/interns/{id}
   */
  async getIntern(id: number | string): Promise<Intern> {
    return apiClient.get<Intern>(`/interns/${id}`);
  },

  /**
   * Create a new intern.
   * Calls POST /api/v1/interns
   */
  async createIntern(data: InternCreate): Promise<Intern> {
    const payload: InternCreate = {
      intern_id: data.intern_id.trim(),
      full_name: data.full_name.trim(),
      email: data.email.trim(),
      phone: data.phone && data.phone.trim() ? data.phone.trim() : null,
      department_id: Number(data.department_id),
      role: data.role.trim(),
      university: data.university && data.university.trim() ? data.university.trim() : null,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status || 'ACTIVE',
    };
    return apiClient.post<Intern>('/interns', payload);
  },

  /**
   * Update existing intern.
   * Calls PUT /api/v1/interns/{id}
   */
  async updateIntern(id: number | string, data: InternUpdate): Promise<Intern> {
    const payload: InternUpdate = {};

    if (data.intern_id !== undefined) payload.intern_id = data.intern_id.trim();
    if (data.full_name !== undefined) payload.full_name = data.full_name.trim();
    if (data.email !== undefined) payload.email = data.email.trim();
    if (data.phone !== undefined) {
      payload.phone = data.phone && data.phone.trim() ? data.phone.trim() : null;
    }
    if (data.department_id !== undefined) payload.department_id = Number(data.department_id);
    if (data.role !== undefined) payload.role = data.role.trim();
    if (data.university !== undefined) {
      payload.university = data.university && data.university.trim() ? data.university.trim() : null;
    }
    if (data.start_date !== undefined) payload.start_date = data.start_date;
    if (data.end_date !== undefined) payload.end_date = data.end_date;
    if (data.status !== undefined) payload.status = data.status;

    return apiClient.put<Intern>(`/interns/${id}`, payload);
  },

  /**
   * Delete intern by ID.
   * Calls DELETE /api/v1/interns/{id}
   */
  async deleteIntern(id: number | string): Promise<void> {
    return apiClient.delete<void>(`/interns/${id}`);
  },
};

export default internService;
