import { IMSStatusType } from '../components/common/Badge';

export interface ProjectRecord {
  id: string;
  projectId: string;
  name: string;
  description: string;
  assignedInternId: string;
  assignedInternName: string;
  department: string;
  startDate: string;
  deadline: string;
  status: IMSStatusType;
  progress: number;
}

export const mockProjectsList: ProjectRecord[] = [
  {
    id: 'prj-1',
    projectId: 'PRJ-2026-001',
    name: 'Portal Authentication Redesign',
    description: 'Implement OAuth2 integration, multi-factor authentication, and responsive login layouts.',
    assignedInternId: 'INT-2026-001',
    assignedInternName: 'Sarah Jenkins',
    department: 'Software Engineering',
    startDate: '2026-02-01',
    deadline: '2026-04-15',
    status: 'IN_PROGRESS',
    progress: 65,
  },
  {
    id: 'prj-2',
    projectId: 'PRJ-2026-002',
    name: 'Design System Component Specs',
    description: 'Create standardized Figma component guidelines and Tailwind design tokens.',
    assignedInternId: 'INT-2026-002',
    assignedInternName: 'Marcus Vance',
    department: 'Product Design',
    startDate: '2026-02-15',
    deadline: '2026-05-01',
    status: 'IN_PROGRESS',
    progress: 40,
  },
  {
    id: 'prj-3',
    projectId: 'PRJ-2026-003',
    name: 'Customer Churn Prediction Model',
    description: 'Train regression and classification models to identify at-risk enterprise accounts.',
    assignedInternId: 'INT-2026-003',
    assignedInternName: 'Elena Rostova',
    department: 'Data Analytics',
    startDate: '2026-02-20',
    deadline: '2026-06-30',
    status: 'IN_PROGRESS',
    progress: 25,
  },
  {
    id: 'prj-4',
    projectId: 'PRJ-2026-004',
    name: 'Automated E2E Testing Suite',
    description: 'Set up Cypress/Playwright automated testing pipelines for critical checkout flows.',
    assignedInternId: 'INT-2026-005',
    assignedInternName: 'Amara Patel',
    department: 'Quality Assurance',
    startDate: '2026-03-01',
    deadline: '2026-05-15',
    status: 'NOT_STARTED',
    progress: 0,
  },
  {
    id: 'prj-5',
    projectId: 'PRJ-2026-005',
    name: 'Legacy API Microservices Migration',
    description: 'Refactor monolithic REST endpoints into lightweight Docker microservices.',
    assignedInternId: 'INT-2026-004',
    assignedInternName: 'David Kalu',
    department: 'Software Engineering',
    startDate: '2025-09-01',
    deadline: '2026-01-30',
    status: 'COMPLETED',
    progress: 100,
  },
  {
    id: 'prj-6',
    projectId: 'PRJ-2026-006',
    name: 'User Research & Onboarding Flow',
    description: 'Conduct user interviews and synthesize UX wireframes for mobile onboarding.',
    assignedInternId: 'INT-2026-007',
    assignedInternName: 'Chloe Zhao',
    department: 'Product Design',
    startDate: '2026-03-15',
    deadline: '2026-07-01',
    status: 'ON_HOLD',
    progress: 15,
  },
  {
    id: 'prj-7',
    projectId: 'PRJ-2026-007',
    name: 'Quarterly Growth Marketing Analytics',
    description: 'Analyze user acquisition channels and conversion funnel optimizations.',
    assignedInternId: 'INT-2026-006',
    assignedInternName: 'James O\'Connor',
    department: 'Marketing',
    startDate: '2025-11-15',
    deadline: '2026-01-15',
    status: 'COMPLETED',
    progress: 100,
  },
  {
    id: 'prj-8',
    projectId: 'PRJ-2026-008',
    name: 'Executive KPI BI Dashboard',
    description: 'Build real-time revenue and operational dashboards using Tableau and D3.js.',
    assignedInternId: 'INT-2026-008',
    assignedInternName: 'Lucas Bennett',
    department: 'Data Analytics',
    startDate: '2025-10-01',
    deadline: '2026-02-28',
    status: 'COMPLETED',
    progress: 100,
  },
];
