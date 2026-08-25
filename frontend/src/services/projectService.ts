import { apiClient } from './apiClient';
import {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectQueryParams,
} from '../types/project';

export const projectService = {
  /**
   * Fetch projects list from backend with optional filters (search, intern_id, status).
   * Calls GET /api/v1/projects?search=...&intern_id=...&status=...
   */
  async getProjects(params?: ProjectQueryParams): Promise<Project[]> {
    const queryParams: Record<string, string | number> = {};

    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params?.intern_id !== undefined && params.intern_id !== '' && params.intern_id !== null) {
      queryParams.intern_id = Number(params.intern_id);
    }
    if (params?.status && params.status.trim()) {
      queryParams.status = params.status.trim();
    }

    return apiClient.get<Project[]>('/projects', { params: queryParams });
  },

  /**
   * Fetch single project by ID.
   * Calls GET /api/v1/projects/{id}
   */
  async getProject(id: number | string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  /**
   * Create a new project.
   * Calls POST /api/v1/projects
   */
  async createProject(data: ProjectCreate): Promise<Project> {
    const progress = data.status === 'COMPLETED' ? 100 : Number(data.progress ?? 0);
    const payload: ProjectCreate = {
      name: data.name.trim(),
      description: data.description && data.description.trim() ? data.description.trim() : null,
      intern_id: Number(data.intern_id),
      start_date: data.start_date,
      deadline: data.deadline,
      status: data.status || 'NOT_STARTED',
      progress,
    };
    return apiClient.post<Project>('/projects', payload);
  },

  /**
   * Update existing project.
   * Calls PUT /api/v1/projects/{id}
   */
  async updateProject(id: number | string, data: ProjectUpdate): Promise<Project> {
    const payload: ProjectUpdate = {};

    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.description !== undefined) {
      payload.description = data.description && data.description.trim() ? data.description.trim() : null;
    }
    if (data.intern_id !== undefined) payload.intern_id = Number(data.intern_id);
    if (data.start_date !== undefined) payload.start_date = data.start_date;
    if (data.deadline !== undefined) payload.deadline = data.deadline;
    if (data.status !== undefined) {
      payload.status = data.status;
      if (data.status === 'COMPLETED') {
        payload.progress = 100;
      }
    }
    if (data.progress !== undefined && payload.progress === undefined) {
      payload.progress = Number(data.progress);
    }

    return apiClient.put<Project>(`/projects/${id}`, payload);
  },

  /**
   * Delete project by ID.
   * Calls DELETE /api/v1/projects/{id}
   */
  async deleteProject(id: number | string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`);
  },
};

export default projectService;
