import { IMSStatusType } from '../components/common/Badge';

export interface InstructorRecord {
  id: string;
  instructorId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  status: IMSStatusType;
}

export const mockInstructorsList: InstructorRecord[] = [
  {
    id: 'inst-1',
    instructorId: 'INS-2026-001',
    fullName: 'Dr. Robert Vance',
    email: 'robert.vance@company.com',
    phone: '+1 (555) 234-5678',
    department: 'Software Engineering',
    specialization: 'Distributed Systems & Cloud Architecture',
    status: 'ACTIVE',
  },
  {
    id: 'inst-2',
    instructorId: 'INS-2026-002',
    fullName: 'Dr. Maya Lin',
    email: 'maya.lin@company.com',
    phone: '+1 (555) 345-6789',
    department: 'Product Design',
    specialization: 'UX Research & Design Systems',
    status: 'ACTIVE',
  },
  {
    id: 'inst-3',
    instructorId: 'INS-2026-003',
    fullName: 'Prof. David Chen',
    email: 'david.chen@company.com',
    phone: '+1 (555) 456-7890',
    department: 'Data Analytics',
    specialization: 'Machine Learning & Predictive Modeling',
    status: 'ACTIVE',
  },
  {
    id: 'inst-4',
    instructorId: 'INS-2026-004',
    fullName: 'Dr. Sarah Al-Mansoor',
    email: 'sarah.almansoor@company.com',
    phone: '+1 (555) 567-8901',
    department: 'Quality Assurance',
    specialization: 'Automated Testing & Security Audit',
    status: 'ACTIVE',
  },
  {
    id: 'inst-5',
    instructorId: 'INS-2026-005',
    fullName: 'James O\'Connor',
    email: 'james.oconnor@company.com',
    phone: '+1 (555) 678-9012',
    department: 'Marketing',
    specialization: 'Developer Relations & Content Strategy',
    status: 'INACTIVE',
  },
  {
    id: 'inst-6',
    instructorId: 'INS-2026-006',
    fullName: 'Elena Rostova',
    email: 'elena.rostova.mentor@company.com',
    phone: '+1 (555) 789-0123',
    department: 'Human Resources',
    specialization: 'Talent Development & Leadership Coaching',
    status: 'ACTIVE',
  },
];
