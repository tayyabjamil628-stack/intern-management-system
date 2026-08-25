export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  intern_id: number;
  start_date: string;
  deadline: string;
  status: ProjectStatus;
  progress: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCreate {
  name: string;
  description?: string | null;
  intern_id: number;
  start_date: string;
  deadline: string;
  status?: ProjectStatus;
  progress?: number;
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  intern_id?: number;
  start_date?: string;
  deadline?: string;
  status?: ProjectStatus;
  progress?: number;
}

export interface ProjectQueryParams {
  search?: string;
  intern_id?: number | string;
  status?: string;
}
