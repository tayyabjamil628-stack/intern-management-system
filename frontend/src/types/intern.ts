export type InternStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

export interface Intern {
  id: number;
  intern_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  department_id: number;
  role: string;
  university: string | null;
  start_date: string;
  end_date: string;
  status: InternStatus;
  created_at?: string;
  updated_at?: string;
}

export interface InternCreate {
  intern_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  department_id: number;
  role: string;
  university?: string | null;
  start_date: string;
  end_date: string;
  status?: InternStatus;
}

export interface InternUpdate {
  intern_id?: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
  department_id?: number;
  role?: string;
  university?: string | null;
  start_date?: string;
  end_date?: string;
  status?: InternStatus;
}

export interface InternQueryParams {
  search?: string;
  department_id?: number | string;
  status?: string;
}
