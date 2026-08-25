import { IMSStatusType } from '../components/common/Badge';

export interface RecentInternMock {
  id: string;
  internId: string;
  fullName: string;
  department: string;
  status: IMSStatusType;
  startDate: string;
}

export interface RecentProjectMock {
  id: string;
  name: string;
  assignedIntern: string;
  status: IMSStatusType;
  progress: number; // percentage 0 - 100
  deadline: string;
}

export interface AttendanceSummaryMock {
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  totalActive: number;
  date: string;
}

export interface DashboardMetricsMock {
  totalInterns: number;
  activeInterns: number;
  completedInterns: number;
  activeProjects: number;
}

export const mockDashboardMetrics: DashboardMetricsMock = {
  totalInterns: 24,
  activeInterns: 18,
  completedInterns: 5,
  activeProjects: 8,
};

export const mockRecentInterns: RecentInternMock[] = [
  {
    id: 'int-1',
    internId: 'INT-2026-001',
    fullName: 'Sarah Jenkins',
    department: 'Software Engineering',
    status: 'ACTIVE',
    startDate: '2026-01-15',
  },
  {
    id: 'int-2',
    internId: 'INT-2026-002',
    fullName: 'Marcus Vance',
    department: 'Product Design',
    status: 'ACTIVE',
    startDate: '2026-02-01',
  },
  {
    id: 'int-3',
    internId: 'INT-2026-003',
    fullName: 'Elena Rostova',
    department: 'Data Analytics',
    status: 'ACTIVE',
    startDate: '2026-02-10',
  },
  {
    id: 'int-4',
    internId: 'INT-2026-004',
    fullName: 'David Kalu',
    department: 'Software Engineering',
    status: 'COMPLETED',
    startDate: '2025-08-01',
  },
];

export const mockRecentProjects: RecentProjectMock[] = [
  {
    id: 'proj-1',
    name: 'Customer Portal Redesign',
    assignedIntern: 'Sarah Jenkins',
    status: 'IN_PROGRESS',
    progress: 75,
    deadline: '2026-03-30',
  },
  {
    id: 'proj-2',
    name: 'Mobile Onboarding Flow',
    assignedIntern: 'Marcus Vance',
    status: 'IN_PROGRESS',
    progress: 40,
    deadline: '2026-04-15',
  },
  {
    id: 'proj-3',
    name: 'Internal Metrics Dashboard',
    assignedIntern: 'Elena Rostova',
    status: 'NOT_STARTED',
    progress: 0,
    deadline: '2026-05-01',
  },
  {
    id: 'proj-4',
    name: 'API Migration & Documentation',
    assignedIntern: 'David Kalu',
    status: 'COMPLETED',
    progress: 100,
    deadline: '2026-02-15',
  },
];

export const mockTodayAttendance: AttendanceSummaryMock = {
  presentCount: 16,
  absentCount: 1,
  leaveCount: 1,
  totalActive: 18,
  date: 'Today, Aug 13, 2026',
};
