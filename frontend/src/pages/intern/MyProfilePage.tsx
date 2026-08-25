import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Briefcase,
  Calendar,
  FolderKanban,
  CalendarCheck,
  UserX,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useInterns } from '../../context/InternsContext';
import { InternRecord } from '../../data/mockInternsData';

export const MyProfilePage: React.FC = () => {
  const { interns } = useInterns();

  // Target demo intern identifier
  const demoInternId = 'INT-2026-001';

  // 2. Lookup demo intern from reactive context
  const currentIntern: InternRecord | undefined = useMemo(() => {
    return (
      interns.find((i) => i.internId === demoInternId) ||
      interns.find((i) => i.id === 'int-1')
    );
  }, [interns]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Helper for initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="My Profile"
        description="View your registered internship profile information."
        breadcrumbs={['Intern', 'My Profile']}
      />

      {/* 7. Quick Navigation Header Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/intern"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors min-h-[44px] py-2 px-1 focus-visible:outline-2 focus-visible:outline-blue-600 rounded-md"
          aria-label="Back to Intern Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* 8. Handle Invalid / Missing Intern State */}
      {!currentIntern ? (
        <EmptyState
          icon={<UserX className="w-10 h-10 text-slate-400" />}
          title="Profile not found"
          description="The requested intern profile could not be located in the directory."
          action={
            <Link to="/intern">
              <Button
                variant="secondary"
                icon={<ArrowLeft className="w-4 h-4" />}
                className="min-h-[44px]"
              >
                Back to Dashboard
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* 3. Prominent Profile Summary Banner */}
          <Card className="bg-white border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Initials Avatar */}
                <div
                  className="w-18 h-18 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center border-2 border-blue-200 shadow-xs shrink-0"
                  aria-hidden="true"
                >
                  {getInitials(currentIntern.fullName)}
                </div>

                {/* Identity Info */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {currentIntern.fullName}
                    </h2>
                    <Badge status={currentIntern.status} />
                  </div>

                  <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{currentIntern.role}</span>
                    <span className="text-slate-300">•</span>
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{currentIntern.department}</span>
                  </p>

                  <p className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Intern ID: {currentIntern.internId}</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 4 & 5. Information Sections (2-Column Desktop Grid, 1-Column Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 4. Personal Information Card */}
            <Card
              title="Personal Information"
              description="Official contact details and educational institution."
              className="h-full"
            >
              <dl className="divide-y divide-slate-100 text-sm">
                <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    Full Name
                  </dt>
                  <dd className="font-semibold text-slate-900 sm:text-right">
                    {currentIntern.fullName}
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    Email Address
                  </dt>
                  <dd className="font-medium text-slate-900 sm:text-right">
                    <a
                      href={`mailto:${currentIntern.email}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600 rounded-sm"
                    >
                      {currentIntern.email}
                    </a>
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    Phone Number
                  </dt>
                  <dd className="font-medium text-slate-900 sm:text-right">
                    {currentIntern.phone ? (
                      <a
                        href={`tel:${currentIntern.phone}`}
                        className="text-slate-800 hover:text-blue-600 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 rounded-sm"
                      >
                        {currentIntern.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                    University / College
                  </dt>
                  <dd className="font-semibold text-slate-900 sm:text-right">
                    {currentIntern.university || 'Not specified'}
                  </dd>
                </div>
              </dl>
            </Card>

            {/* 5. Internship Information Card */}
            <Card
              title="Internship Details"
              description="Placement parameters, department affiliation, and duration."
              className="h-full"
            >
              <dl className="divide-y divide-slate-100 text-sm">
                <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    Assigned Department
                  </dt>
                  <dd className="font-semibold text-slate-900 sm:text-right">
                    {currentIntern.department}
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    Internship Role
                  </dt>
                  <dd className="font-semibold text-slate-900 sm:text-right">
                    {currentIntern.role}
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    Start Date
                  </dt>
                  <dd className="font-medium text-slate-900 sm:text-right">
                    {formatDate(currentIntern.startDate)}
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    End Date
                  </dt>
                  <dd className="font-medium text-slate-900 sm:text-right">
                    {formatDate(currentIntern.endDate)}
                  </dd>
                </div>

                <div className="py-3 flex items-center justify-between gap-1">
                  <dt className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    Internship Status
                  </dt>
                  <dd>
                    <Badge status={currentIntern.status} />
                  </dd>
                </div>
              </dl>
            </Card>
          </div>

          {/* 7. Quick Navigation Links */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Related Intern Actions
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Quickly jump to your assigned projects, attendance record log, or home dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/intern" className="block">
                <Button
                  variant="secondary"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  className="w-full justify-start min-h-[44px]"
                >
                  Back to Dashboard
                </Button>
              </Link>

              <Link to="/intern/projects" className="block">
                <Button
                  variant="secondary"
                  icon={<FolderKanban className="w-4 h-4" />}
                  className="w-full justify-start min-h-[44px]"
                >
                  View My Projects
                </Button>
              </Link>

              <Link to="/intern/attendance" className="block">
                <Button
                  variant="secondary"
                  icon={<CalendarCheck className="w-4 h-4" />}
                  className="w-full justify-start min-h-[44px]"
                >
                  View My Attendance
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
