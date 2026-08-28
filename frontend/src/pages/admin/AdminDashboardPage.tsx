import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Award,
  FolderKanban,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Send,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/data/MetricCard';
import { DataTable, Column } from '../../components/data/DataTable';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  mockDashboardMetrics,
  mockRecentInterns,
  mockRecentProjects,
  mockTodayAttendance,
  RecentInternMock,
  RecentProjectMock,
} from '../../data/mockDashboardData';

export const AdminDashboardPage: React.FC = () => {
  // Columns definition for Recent Interns table
  const internColumns: Column<RecentInternMock>[] = [
    {
      key: 'fullName',
      header: 'Full Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.fullName}</span>
          <span className="text-[11px] text-slate-500">{row.internId}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => <span className="text-slate-700 font-medium">{row.department}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (row) => <span className="text-slate-600 font-mono text-xs">{row.startDate}</span>,
    },
  ];

  // Columns definition for Recent Projects table
  const projectColumns: Column<RecentProjectMock>[] = [
    {
      key: 'name',
      header: 'Project Name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-500">Assigned: {row.assignedIntern}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (row) => (
        <div className="w-28">
          <div className="flex items-center justify-between text-xs mb-1 font-medium text-slate-700">
            <span>{row.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                row.progress === 100
                  ? 'bg-emerald-600'
                  : row.progress > 0
                  ? 'bg-blue-600'
                  : 'bg-slate-300'
              }`}
              style={{ width: `${row.progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (row) => <span className="text-slate-600 font-mono text-xs">{row.deadline}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Admin Dashboard"
        description="Overview of intern operations, projects, and attendance."
        breadcrumbs={['Admin', 'Dashboard']}
        action={
          <div className="flex items-center gap-2">
            <Link to="/admin/communications">
              <Button
                variant="primary"
                icon={<Send className="w-4 h-4" />}
              >
                Send SMS & Notifications
              </Button>
            </Link>
          </div>
        }
      />

      {/* 2. Top Metric Cards (Responsive Grid: 4 Desktop, 2 Tablet, 1 Mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Interns"
          value={mockDashboardMetrics.totalInterns}
          icon={<Users className="w-5 h-5" />}
          helperText="All registered intern records"
        />
        <MetricCard
          label="Active Interns"
          value={mockDashboardMetrics.activeInterns}
          icon={<UserCheck className="w-5 h-5" />}
          helperText="Currently active in program"
        />
        <MetricCard
          label="Completed Interns"
          value={mockDashboardMetrics.completedInterns}
          icon={<Award className="w-5 h-5" />}
          helperText="Graduated successfully"
        />
        <MetricCard
          label="Active Projects"
          value={mockDashboardMetrics.activeProjects}
          icon={<FolderKanban className="w-5 h-5" />}
          helperText="Ongoing intern projects"
        />
      </div>

      {/* 3 & 4. Recent Interns & Recent Projects (2-Column Desktop, Stacked Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Interns Section */}
        <Card
          title="Recent Interns"
          description="Latest intern enrollments and current statuses"
          action={
            <Link to="/admin/interns">
              <Button
                variant="ghost"
                className="!min-h-[38px] !px-3 !py-1 !text-xs text-blue-600 hover:text-blue-700"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Interns
              </Button>
            </Link>
          }
          bodyClassName="!p-0"
        >
          <DataTable
            columns={internColumns}
            data={mockRecentInterns}
            keyExtractor={(row) => row.id}
            className="!border-0 !rounded-none !shadow-none"
          />
        </Card>

        {/* Recent Projects Section */}
        <Card
          title="Recent Projects"
          description="Current project assignments and milestone progress"
          action={
            <Link to="/admin/projects">
              <Button
                variant="ghost"
                className="!min-h-[38px] !px-3 !py-1 !text-xs text-blue-600 hover:text-blue-700"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Projects
              </Button>
            </Link>
          }
          bodyClassName="!p-0"
        >
          <DataTable
            columns={projectColumns}
            data={mockRecentProjects}
            keyExtractor={(row) => row.id}
            className="!border-0 !rounded-none !shadow-none"
          />
        </Card>
      </div>

      {/* 5. Today's Attendance Section (Full Width) */}
      <Card
        title="Today's Attendance"
        description={`Attendance log summary for ${mockTodayAttendance.date}`}
        action={
          <Link to="/admin/attendance">
            <Button
              variant="secondary"
              className="!min-h-[38px] !px-3.5 !py-1.5 !text-xs"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View Attendance
            </Button>
          </Link>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Present */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                  Present
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  {Math.round(
                    (mockTodayAttendance.presentCount / mockTodayAttendance.totalActive) * 100
                  )}
                  % of active interns
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-900">
                {mockTodayAttendance.presentCount}
              </span>
              <Badge status="PRESENT" />
            </div>
          </div>

          {/* Absent */}
          <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-900 uppercase tracking-wider">
                  Absent
                </p>
                <p className="text-xs text-red-700 font-medium">Unexcused absence</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-900">
                {mockTodayAttendance.absentCount}
              </span>
              <Badge status="ABSENT" />
            </div>
          </div>

          {/* Leave */}
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                  On Leave
                </p>
                <p className="text-xs text-amber-700 font-medium">Approved leave</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-900">
                {mockTodayAttendance.leaveCount}
              </span>
              <Badge status="LEAVE" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};