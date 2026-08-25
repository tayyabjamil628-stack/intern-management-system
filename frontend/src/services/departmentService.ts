import { apiClient } from './apiClient';
import { Department, DepartmentCreate, DepartmentUpdate } from '../types/department';

export const departmentService = {
  /**
   * Fetch departments list from backend with optional search filter.
   * Calls GET /api/v1/departments?search=...
   */
  async getDepartments(search?: string): Promise<Department[]> {
    const params: Record<string, string> = {};
    if (search && search.trim()) {
      params.search = search.trim();
    }
    return apiClient.get<Department[]>('/departments', { params });
  },

  /**
   * Fetch single department by ID.
   * Calls GET /api/v1/departments/{id}
   */
  async getDepartment(id: number | string): Promise<Department> {
    return apiClient.get<Department>(`/departments/${id}`);
  },

  /**
   * Create a new department.
   * Calls POST /api/v1/departments
   * Note: Only sends 'name' and 'description' (trimmed).
   */
  async createDepartment(data: DepartmentCreate): Promise<Department> {
    const payload: DepartmentCreate = {
      name: data.name.trim(),
      description: data.description ? data.description.trim() : null,
    };
    return apiClient.post<Department>('/departments', payload);
  },

  /**
   * Update department details.
   * Calls PUT /api/v1/departments/{id}
   * Note: Only sends supported 'name' and 'description'.
   */
  async updateDepartment(id: number | string, data: DepartmentUpdate): Promise<Department> {
    const payload: DepartmentUpdate = {};
    if (data.name !== undefined) {
      payload.name = data.name.trim();
    }
    if (data.description !== undefined) {
      payload.description = data.description ? data.description.trim() : null;
    }
    return apiClient.put<Department>(`/departments/${id}`, payload);
  },

  /**
   * Delete department by ID.
   * Calls DELETE /api/v1/departments/{id}
   */
  async deleteDepartment(id: number | string): Promise<void> {
    return apiClient.delete<void>(`/departments/${id}`);
  },
};

export default departmentService;
