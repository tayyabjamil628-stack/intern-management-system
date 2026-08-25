export interface DepartmentRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  internCount: number;
}

export const mockDepartmentsList: DepartmentRecord[] = [
  {
    id: 'dept-1',
    code: 'ENG',
    name: 'Software Engineering',
    description: 'Responsible for web, mobile, and backend platform development and infrastructure.',
    internCount: 6,
  },
  {
    id: 'dept-2',
    code: 'DES',
    name: 'Product Design',
    description: 'Drives user research, UI/UX design systems, and product prototyping.',
    internCount: 4,
  },
  {
    id: 'dept-3',
    code: 'DATA',
    name: 'Data Analytics',
    description: 'Focuses on business intelligence, machine learning models, and data pipelines.',
    internCount: 5,
  },
  {
    id: 'dept-4',
    code: 'QA',
    name: 'Quality Assurance',
    description: 'Ensures software reliability, automated testing suites, and performance audit.',
    internCount: 3,
  },
  {
    id: 'dept-5',
    code: 'MKT',
    name: 'Marketing',
    description: 'Manages growth campaigns, content creation, brand strategy, and developer relations.',
    internCount: 2,
  },
  {
    id: 'dept-6',
    code: 'HR',
    name: 'Human Resources',
    description: 'Handles talent acquisition, onboarding, intern welfare, and organizational culture.',
    internCount: 0,
  },
];
