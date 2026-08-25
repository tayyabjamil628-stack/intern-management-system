import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CalendarCheck,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Percent,
  ArrowRight,
  Building2,
  GraduationCap,
  Briefcase,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { MetricCard } from '../../components/data/MetricCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useInterns } from '../../context/InternsContext';
import { useProjects } from '../../context/ProjectsContext';
import { mockAttendanceList } from '../../data/mockAttendanceData';
import { mockInternsList, InternRecord } from '../../data/mockInternsData';

export const InternDashboardPage: React.FC = () => {
  const { interns } = useInterns();
  const { projects } = useProjects();

  // Selected demo intern (Sarah Jenkins - INT-2026-001) from reactive context or fallback list
  const currentIntern: InternRecord = useMemo(() => {
    return (
      interns.find((i) => i.internId === 'INT-2026-001') ||
      interns[0] ||
      mockInternsList[0]
    );
  }, [interns]);

  // Projects assigned to the current demo intern
  const internProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.assignedInternId === currentIntern.internId ||
        p.assignedInternId === currentIntern.id
    );
  }, [projects, currentIntern]);

  // Attendance records for the current demo intern
  const internAttendance = useMemo(() => {
    return mockAttendanceList.filter(
      (a) =>
        a.internId === currentIntern.internId ||
        a.internName.toLowerCase() === currentIntern.fullName.toLowerCase()
    );
  }, [currentIntern]);

  // Attendance metrics calculation
  const totalAttendanceRecords = internAttendance.length;
  const presentCount = internAttendance.filter((a) => a.status === 'PRESENT').length;
  const absentCount = internAttendance.filter((a) => a.status === 'ABSENT').length;
  const leaveCount = internAttendance.filter((a) => a.status === 'LEAVE').length;
  const attendancePercentage =
    totalAttendanceRecords > 0
      ? Math.round((presentCount / totalAttendanceRecords) * 100)
      : null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Intern Dashboard"
        description="Overview of your internship, projects, and attendance."
        breadcrumbs={['Intern', 'Dashboard']}
        action={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link to="/intern/projects" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                icon={<FolderKanban className="w-4 h-4" />}
                className="w-full sm:w-auto min-h-[44px]"
              >
                View My Projects
              </Button>
            </Link>
            <Link to="/intern/attendance" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                icon={<CalendarCheck className="w-4 h-4" />}
                className="w-full sm:w-auto min-h-[44px]"
              >
                View My Attendance
              </Button>
            </Link>
            <Link to="/intern/profile" className="w-full sm:w-auto">
              <Button
                variant="primary"
                icon={<User className="w-4 h-4" />}
                className="w-full sm:w-auto min-h-[44px]"
              >
                View My Profile
              </Button>
            </Link>
          </div>
        }
      />

      {/* 2 & 5. Intern Identity & Internship Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card
          title="Intern Profile"
          description="Personal credentials and academic affiliation"
          className="lg:col-span-2"
          action={<Badge status={currentIntern.status} />}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5 mb-5 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl shrink-0 border border-blue-200">
              {currentIntern.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{currentIntern.fullName}</h2>
              <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                {currentIntern.role}
              </p>
              <p className="text-xs font-mono text-slate-500 mt-1">ID: {currentIntern.internId}</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Department
              </dt>
              <dd className="font-semibold text-slate-900">{currentIntern.department}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                University
              </dt>
              <dd className="font-semibold text-slate-900">
                {currentIntern.university || 'Not specified'}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Internship Summary Card */}
        <Card
          title="Internship Summary"
          description="Current placement duration and terms"
          className="flex flex-col justify-between"
        >
          <dl className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <dt className="text-xs font-semibold text-slate-500">Internship Status</dt>
              <dd>
                <Badge status={currentIntern.status} />
              </dd>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Start Date
              </dt>
              <dd className="font-semibold text-slate-900">{formatDate(currentIntern.startDate)}</dd>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                End Date
              </dt>
              <dd className="font-semibold text-slate-900">{formatDate(currentIntern.endDate)}</dd>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <dt className="text-xs font-semibold text-slate-500">Department</dt>
              <dd className="font-medium text-slate-900 text-right">{currentIntern.department}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-xs font-semibold text-slate-500">Role</dt>
              <dd className="font-medium text-slate-900 text-right">{currentIntern.role}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* 4. Attendance Summary Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Attendance Summary
            </h2>
            <p className="text-xs text-slate-500">
              Overview of logged work sessions and presence metrics
            </p>
          </div>
          <Link
            to="/intern/attendance"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 p-2 rounded-md hover:bg-blue-50 transition-colors"
          >
            <span>View Attendance Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {totalAttendanceRecords > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Present"
              value={presentCount}
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              helperText={`${presentCount} logged present day(s)`}
              trendType="positive"
            />
            <MetricCard
              label="Absent"
              value={absentCount}
              icon={<XCircle className="w-5 h-5 text-red-600" />}
              helperText={`${absentCount} unexcused absence(s)`}
              trendType={absentCount > 0 ? 'negative' : 'neutral'}
            />
            <MetricCard
              label="Leave"
              value={leaveCount}
              icon={<Calendar className="w-5 h-5 text-amber-600" />}
              helperText={`${leaveCount} approved leave day(s)`}
              trendType="neutral"
            />
            <MetricCard
              label="Attendance Percentage"
              value={`${attendancePercentage}%`}
              icon={<Percent className="w-5 h-5 text-blue-600" />}
              helperText={`${presentCount} of ${totalAttendanceRecords} total sessions`}
              trendType={
                attendancePercentage !== null && attendancePercentage >= 85
                  ? 'positive'
                  : attendancePercentage !== null && attendancePercentage >= 75
                  ? 'neutral'
                  : 'negative'
              }
            />
          </div>
        ) : (
          <EmptyState
            icon={<CalendarCheck className="w-8 h-8 text-slate-400" />}
            title="No attendance records yet."
            description="Your daily attendance check-ins will appear here once logged by your supervisor."
          />
        )}
      </div>

      {/* 3. Project Summary Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Assigned Projects
            </h2>
            <p className="text-xs text-slate-500">
              Active projects and milestones assigned to you
            </p>
          </div>
          <Link
            to="/intern/projects"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 p-2 rounded-md hover:bg-blue-50 transition-colors"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {internProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {internProjects.map((project) => (
              <Card
                key={project.id}
                title={project.name}
                action={<Badge status={project.status} />}
                className="flex flex-col justify-between"
              >
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {project.description}
                </p>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        Progress
                      </span>
                      <span className="font-bold text-slate-900">{project.progress}%</span>
                    </div>
                    <div
                      className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={project.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${project.name} completion progress: ${project.progress}%`}
                    >
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          project.progress === 100
                            ? 'bg-emerald-600'
                            : project.progress >= 50
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Deadline & Department */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: <strong className="text-slate-700">{formatDate(project.deadline)}</strong>
                    </span>
                    <span className="font-medium text-slate-600">{project.department}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FolderKanban className="w-8 h-8 text-slate-400" />}
            title="No assigned projects"
            description="You do not currently have any active projects assigned. Check back later or contact your supervisor."
          />
        )}
      </div>

      {/* 6. Quick Links Section */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Quick Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/intern/projects" className="block">
            <div className="p-3.5 bg-white border border-slate-200 rounded-md hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between min-h-[44px]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">View My Projects</p>
                  <p className="text-[11px] text-slate-500">Track tasks & progress</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>

          <Link to="/intern/attendance" className="block">
            <div className="p-3.5 bg-white border border-slate-200 rounded-md hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between min-h-[44px]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">View My Attendance</p>
                  <p className="text-[11px] text-slate-500">Check logs & presence</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>

          <Link to="/intern/profile" className="block">
            <div className="p-3.5 bg-white border border-slate-200 rounded-md hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between min-h-[44px]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">View My Profile</p>
                  <p className="text-[11px] text-slate-500">Details & credentials</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
