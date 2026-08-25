import { IMSStatusType } from '../components/common/Badge';

export interface AttendanceRecord {
  id: string;
  internId: string;
  internName: string;
  department: string;
  date: string;
  status: IMSStatusType;
  remarks: string;
}

export const mockAttendanceList: AttendanceRecord[] = [
  // Today's Date (2026-08-13)
  {
    id: 'att-101',
    internId: 'INT-2026-001',
    internName: 'Sarah Jenkins',
    department: 'Software Engineering',
    date: '2026-08-13',
    status: 'PRESENT',
    remarks: 'On time. Working on Portal Authentication Redesign.',
  },
  {
    id: 'att-102',
    internId: 'INT-2026-002',
    internName: 'Marcus Vance',
    department: 'Product Design',
    date: '2026-08-13',
    status: 'PRESENT',
    remarks: 'Checked in at 09:05 AM. Design sprint standup.',
  },
  {
    id: 'att-103',
    internId: 'INT-2026-003',
    internName: 'Elena Rostova',
    department: 'Data Analytics',
    date: '2026-08-13',
    status: 'LEAVE',
    remarks: 'Approved medical leave.',
  },
  {
    id: 'att-104',
    internId: 'INT-2026-005',
    internName: 'Amara Patel',
    department: 'Quality Assurance',
    date: '2026-08-13',
    status: 'PRESENT',
    remarks: 'On time. Executing automated test suite.',
  },
  {
    id: 'att-105',
    internId: 'INT-2026-007',
    internName: 'Chloe Zhao',
    department: 'Product Design',
    date: '2026-08-13',
    status: 'ABSENT',
    remarks: 'Unexcused absence. Supervisor notified.',
  },

  // 2026-08-12
  {
    id: 'att-201',
    internId: 'INT-2026-001',
    internName: 'Sarah Jenkins',
    department: 'Software Engineering',
    date: '2026-08-12',
    status: 'PRESENT',
    remarks: 'On time.',
  },
  {
    id: 'att-202',
    internId: 'INT-2026-002',
    internName: 'Marcus Vance',
    department: 'Product Design',
    date: '2026-08-12',
    status: 'PRESENT',
    remarks: 'On time.',
  },
  {
    id: 'att-203',
    internId: 'INT-2026-003',
    internName: 'Elena Rostova',
    department: 'Data Analytics',
    date: '2026-08-12',
    status: 'PRESENT',
    remarks: 'On time.',
  },
  {
    id: 'att-204',
    internId: 'INT-2026-005',
    internName: 'Amara Patel',
    department: 'Quality Assurance',
    date: '2026-08-12',
    status: 'LEAVE',
    remarks: 'Casual leave requested.',
  },
  {
    id: 'att-205',
    internId: 'INT-2026-007',
    internName: 'Chloe Zhao',
    department: 'Product Design',
    date: '2026-08-12',
    status: 'PRESENT',
    remarks: 'On time.',
  },

  // 2026-08-11
  {
    id: 'att-301',
    internId: 'INT-2026-001',
    internName: 'Sarah Jenkins',
    department: 'Software Engineering',
    date: '2026-08-11',
    status: 'PRESENT',
    remarks: 'On time.',
  },
  {
    id: 'att-302',
    internId: 'INT-2026-002',
    internName: 'Marcus Vance',
    department: 'Product Design',
    date: '2026-08-11',
    status: 'ABSENT',
    remarks: 'Sick leave - notified supervisor.',
  },
  {
    id: 'att-303',
    internId: 'INT-2026-003',
    internName: 'Elena Rostova',
    department: 'Data Analytics',
    date: '2026-08-11',
    status: 'PRESENT',
    remarks: 'On time.',
  },
  {
    id: 'att-304',
    internId: 'INT-2026-005',
    internName: 'Amara Patel',
    department: 'Quality Assurance',
    date: '2026-08-11',
    status: 'PRESENT',
    remarks: 'On time.',
  },
];
