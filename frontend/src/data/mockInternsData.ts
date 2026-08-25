import { IMSStatusType } from '../components/common/Badge';

export interface InternRecord {
  id: string;
  internId: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  university?: string;
  startDate: string;
  endDate?: string;
  status: IMSStatusType;
  supervisor?: string;
}

export const mockInternsList: InternRecord[] = [
  {
    id: 'int-1',
    internId: 'INT-2026-001',
    fullName: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '+1 (555) 234-5678',
    department: 'Software Engineering',
    role: 'Frontend Developer Intern',
    university: 'Stanford University',
    startDate: '2026-01-15',
    endDate: '2026-07-15',
    status: 'ACTIVE',
    supervisor: 'Alex Rivera',
  },
  {
    id: 'int-2',
    internId: 'INT-2026-002',
    fullName: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 345-6789',
    department: 'Product Design',
    role: 'UI/UX Design Intern',
    university: 'Rhode Island School of Design',
    startDate: '2026-02-01',
    endDate: '2026-08-01',
    status: 'ACTIVE',
    supervisor: 'Diana Prince',
  },
  {
    id: 'int-3',
    internId: 'INT-2026-003',
    fullName: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 456-7890',
    department: 'Data Analytics',
    role: 'Data Analyst Intern',
    university: 'MIT',
    startDate: '2026-02-10',
    endDate: '2026-08-10',
    status: 'ACTIVE',
    supervisor: 'Robert Chen',
  },
  {
    id: 'int-4',
    internId: 'INT-2026-004',
    fullName: 'David Kalu',
    email: 'david.kalu@example.com',
    phone: '+1 (555) 567-8901',
    department: 'Software Engineering',
    role: 'Backend Developer Intern',
    university: 'UC Berkeley',
    startDate: '2025-08-01',
    endDate: '2026-02-01',
    status: 'COMPLETED',
    supervisor: 'Alex Rivera',
  },
  {
    id: 'int-5',
    internId: 'INT-2026-005',
    fullName: 'Amara Patel',
    email: 'amara.patel@example.com',
    phone: '+1 (555) 678-9012',
    department: 'Quality Assurance',
    role: 'QA Automation Intern',
    university: 'Georgia Tech',
    startDate: '2026-03-01',
    endDate: '2026-09-01',
    status: 'ACTIVE',
    supervisor: 'Michael Scott',
  },
  {
    id: 'int-6',
    internId: 'INT-2026-006',
    fullName: 'James O\'Connor',
    email: 'james.oconnor@example.com',
    phone: '+1 (555) 789-0123',
    department: 'Marketing',
    role: 'Growth Marketing Intern',
    university: 'NYU',
    startDate: '2025-11-01',
    endDate: '2026-01-15',
    status: 'TERMINATED',
    supervisor: 'Jessica Taylor',
  },
  {
    id: 'int-7',
    internId: 'INT-2026-007',
    fullName: 'Chloe Zhao',
    email: 'chloe.zhao@example.com',
    phone: '+1 (555) 890-1234',
    department: 'Product Design',
    role: 'Product Strategy Intern',
    university: 'Carnegie Mellon University',
    startDate: '2026-03-15',
    endDate: '2026-09-15',
    status: 'ACTIVE',
    supervisor: 'Diana Prince',
  },
  {
    id: 'int-8',
    internId: 'INT-2026-008',
    fullName: 'Lucas Bennett',
    email: 'lucas.bennett@example.com',
    phone: '+1 (555) 901-2345',
    department: 'Data Analytics',
    role: 'BI Intern',
    university: 'Harvard University',
    startDate: '2025-09-01',
    endDate: '2026-03-01',
    status: 'COMPLETED',
    supervisor: 'Robert Chen',
  },
];

export const mockDepartmentsList = [
  'Software Engineering',
  'Product Design',
  'Data Analytics',
  'Quality Assurance',
  'Marketing',
];
