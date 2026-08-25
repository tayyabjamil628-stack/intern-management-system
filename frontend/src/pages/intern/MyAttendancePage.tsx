import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  Calendar,
  FilterX,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/data/MetricCard';
import { Input } from '../../components/common/Input';
import { Select, SelectOption } from '../../components/common/Select';
import { DataTable, Column } from '../../components/data/DataTable';
import { DataCard } from '../../components/data/DataCard';
import { Badge, IMSStatusType } from '../../components/common/Badge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Button } from '../../components/common/Button';
import {
  mockAttendanceList,
  AttendanceRecord,
} from '../../data/mockAttendanceData';
import { useInterns } from '../../context/InternsContext';

export const MyAttendancePage: React.FC = () => {
  const { interns } = useInterns();

  // Current demo intern ID
  const currentInternId = 'INT-2026-001';

  // Demo intern lookup from context
  const currentIntern = useMemo(() => {
    return interns.find((i) => i.internId === currentInternId);
  }, [interns]);

  // 2. Filter attendance records strictly for the current demo intern
  const internRecords: AttendanceRecord[] = useMemo(() => {
    return mockAttendanceList.filter(
      (record) =>
        record.internId === currentInternId ||
        (currentIntern && record.internId === currentIntern.id)
    );
  }, [currentIntern]);

  // 5. Local filter states: Date filter & Status filter
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'LEAVE', label: 'Leave' },
  ];

  const hasActiveFilters = Boolean(selectedDate || (selectedStatus && selectedStatus !== 'ALL'));

  const handleClearFilters = () => {
    setSelectedDate('');
    setSelectedStatus('ALL');
  };

  // 3. Summary metrics calculation based on the intern's total attendance records
  const summaryMetrics = useMemo(() => {
    const total = internRecords.length;
    const present = internRecords.filter((r) => r.status === 'PRESENT').length;
    const absent = internRecords.filter((r) => r.status === 'ABSENT').length;
    const leave = internRecords.filter((r) => r.status === 'LEAVE').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, leave, percentage };
  }, [internRecords]);

  // 5. Apply filters to the intern's attendance records
  const filteredRecords = useMemo(() => {
    return internRecords.filter((record) => {
      const matchesDate = !selectedDate || record.date === selectedDate;
      const matchesStatus =
        !selectedStatus || selectedStatus === 'ALL' || record.status === selectedStatus;
      return matchesDate && matchesStatus;
    });
  }, [internRecords, selectedDate, selectedStatus]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
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

  // 4. Desktop DataTable Columns (Read-Only: Date, Status, Remarks)
  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{formatDate(row.date)}</span>
          <span className="font-mono text-[11px] text-slate-500">{row.date}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status as IMSStatusType} />,
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (row) => (
        <span className="text-xs text-slate-700 leading-relaxed">
          {row.remarks || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header (Read-Only: No create/edit/delete actions) */}
      <PageHeader
        title="My Attendance"
        description="View your attendance history and attendance summary."
        breadcrumbs={['Intern', 'My Attendance']}
      />

      {/* 9. Quick Navigation */}
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

      {/* 3. Summary Metric Cards (or EmptyState if intern has no records) */}
      {internRecords.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="w-10 h-10 text-slate-400" />}
          title="No attendance records"
          description="You currently have no attendance records logged."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Present"
            value={summaryMetrics.present}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            helperText={`${summaryMetrics.present} session(s) present`}
            trendType="positive"
          />
          <MetricCard
            label="Absent"
            value={summaryMetrics.absent}
            icon={<XCircle className="w-5 h-5 text-red-600" />}
            helperText={`${summaryMetrics.absent} unexcused absence(s)`}
            trendType={summaryMetrics.absent > 0 ? 'negative' : 'neutral'}
          />
          <MetricCard
            label="Leave"
            value={summaryMetrics.leave}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            helperText={`${summaryMetrics.leave} approved leave day(s)`}
            trendType="neutral"
          />
          <MetricCard
            label="Attendance Percentage"
            value={`${summaryMetrics.percentage}%`}
            icon={<Percent className="w-5 h-5 text-blue-600" />}
            helperText={`${summaryMetrics.present} of ${summaryMetrics.total} total sessions`}
            trendType={
              summaryMetrics.percentage >= 85
                ? 'positive'
                : summaryMetrics.percentage >= 75
                ? 'neutral'
                : 'negative'
            }
          />
        </div>
      )}

      {/* 5. Search & Filters Bar */}
      {internRecords.length > 0 && (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            {/* Date Filter */}
            <div className="w-full sm:w-60">
              <Input
                label="Filter by Date"
                type="date"
                aria-label="Filter attendance by date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full min-h-[44px]"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-60">
              <Select
                label="Filter by Status"
                aria-label="Filter attendance by status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={statusOptions}
                className="w-full min-h-[44px]"
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="sm:ml-auto">
                <Button
                  variant="secondary"
                  icon={<FilterX className="w-4 h-4" />}
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto min-h-[44px]"
                  aria-label="Clear attendance filters"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4, 6, 8. Table (Desktop) / Cards (Mobile) / Empty State */}
      {internRecords.length > 0 && (
        filteredRecords.length === 0 ? (
          /* 6. Empty State when no records match current filters */
          <EmptyState
            icon={<Calendar className="w-10 h-10 text-slate-400" />}
            title="No attendance records found"
            description="No attendance records match the current filters."
            action={
              <Button
                variant="secondary"
                icon={<FilterX className="w-4 h-4" />}
                onClick={handleClearFilters}
                className="min-h-[44px]"
              >
                Clear Filters
              </Button>
            }
          />
        ) : (
          <>
            {/* 8. Desktop View: DataTable */}
            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={filteredRecords}
                keyExtractor={(row) => row.id}
              />
            </div>

            {/* 8. Mobile View: DataCards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredRecords.map((record) => (
                <DataCard
                  key={record.id}
                  title={formatDate(record.date)}
                  subtitle={record.date}
                  status={<Badge status={record.status as IMSStatusType} />}
                  fields={[
                    {
                      label: 'Remarks',
                      value: record.remarks || '—',
                    },
                  ]}
                />
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
};
