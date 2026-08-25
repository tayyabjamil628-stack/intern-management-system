import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Edit2,
  Trash2,
  Calendar,
  FilterX,
  UserCheck,
  UserX,
  Clock,
  Users,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/data/SearchBar';
import { FilterBar } from '../../components/data/FilterBar';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { DataTable, Column } from '../../components/data/DataTable';
import { DataCard } from '../../components/data/DataCard';
import { Badge, IMSStatusType } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Toast } from '../../components/feedback/Toast';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Alert } from '../../components/feedback/Alert';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { MetricCard } from '../../components/data/MetricCard';
import { AttendanceFormModal } from '../../components/admin/AttendanceFormModal';
import { Attendance, AttendanceCreate, AttendanceUpdate } from '../../types/attendance';
import { Intern } from '../../types/intern';
import { Department } from '../../types/department';
import { attendanceService } from '../../services/attendanceService';
import { internService } from '../../services/internService';
import { departmentService } from '../../services/departmentService';
import { ApiError } from '../../types/api';

export const AttendancePage: React.FC = () => {
  // Stable default date (today)
  const defaultToday = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [records, setRecords] = useState<Attendance[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedDate, setSelectedDate] = useState<string>(defaultToday);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Modal, Delete Dialog & Toast state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<Attendance | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isInitialMount = useRef(true);
  const requestSeq = useRef(0);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load interns and departments lookup once on mount
  const loadLookups = useCallback(async () => {
    try {
      const [internsData, deptsData] = await Promise.all([
        internService.getInterns(),
        departmentService.getDepartments().catch(() => []),
      ]);
      setInterns(internsData);
      setDepartments(deptsData);
    } catch {
      // Handled gracefully in modal/filters
    }
  }, []);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  // Intern dictionary: id -> Intern
  const internMap = useMemo(() => {
    const map: Record<number, Intern> = {};
    interns.forEach((i) => {
      map[i.id] = i;
    });
    return map;
  }, [interns]);

  // Department dictionary: id -> Department name
  const departmentMap = useMemo(() => {
    const map: Record<number, string> = {};
    departments.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [departments]);

  /**
   * Load attendance records from backend API.
   * Uses sequence tracking to prevent out-of-order responses from overwriting newer results.
   */
  const loadAttendance = useCallback(
    async (dateFilter?: string, statusFilter?: string) => {
      const currentSeq = ++requestSeq.current;
      setIsLoading(true);
      setError(null);
      try {
        const queryDate = dateFilter !== undefined ? dateFilter : selectedDate;
        const queryStatus = statusFilter !== undefined ? statusFilter : selectedStatus;

        const data = await attendanceService.getAttendance({
          date: queryDate || undefined,
          status: queryStatus || undefined,
        });
        if (currentSeq === requestSeq.current) {
          setRecords(data);
        }
      } catch (err) {
        if (currentSeq === requestSeq.current) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Failed to fetch attendance records from backend.');
          }
        }
      } finally {
        if (currentSeq === requestSeq.current) {
          setIsLoading(false);
        }
      }
    },
    [selectedDate, selectedStatus]
  );

  // Initial load
  useEffect(() => {
    loadAttendance(defaultToday, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced / reactive re-fetch when date or status changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      loadAttendance(selectedDate, selectedStatus);
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedDate, selectedStatus, loadAttendance]);

  // Filter records by Search Term (matching intern name, intern ID code, or department name)
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;

    const term = searchTerm.toLowerCase().trim();

    return records.filter((record) => {
      const intern = internMap[record.intern_id];
      const internName = intern ? intern.full_name.toLowerCase() : '';
      const internCode = intern ? intern.intern_id.toLowerCase() : '';
      const deptName = intern ? (departmentMap[intern.department_id] || '').toLowerCase() : '';
      const remarks = (record.remarks || '').toLowerCase();

      return (
        internName.includes(term) ||
        internCode.includes(term) ||
        deptName.includes(term) ||
        remarks.includes(term) ||
        String(record.intern_id).includes(term)
      );
    });
  }, [records, searchTerm, internMap, departmentMap]);

  // Dynamic summary metrics based on currently loaded and displayed records
  const summaryCounts = useMemo(() => {
    const present = filteredRecords.filter((r) => r.status === 'PRESENT').length;
    const absent = filteredRecords.filter((r) => r.status === 'ABSENT').length;
    const leave = filteredRecords.filter((r) => r.status === 'LEAVE').length;
    const total = filteredRecords.length;

    return { present, absent, leave, total };
  }, [filteredRecords]);

  const hasActiveFilters = Boolean(
    searchTerm || selectedStatus || (selectedDate && selectedDate !== defaultToday)
  );

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedDate(defaultToday);
  };

  const handleMarkAttendance = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (record: Attendance) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleSaveAttendance = async (data: AttendanceCreate | AttendanceUpdate) => {
    if (editingRecord) {
      const updated = await attendanceService.updateAttendance(
        editingRecord.id,
        data as AttendanceUpdate
      );
      setRecords((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      showToast('Attendance updated successfully.', 'success');
    } else {
      const created = await attendanceService.createAttendance(data as AttendanceCreate);
      setRecords((prev) => [created, ...prev]);
      showToast('Attendance recorded successfully.', 'success');
    }
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;

    setIsDeleting(true);
    try {
      await attendanceService.deleteAttendance(deletingRecord.id);
      setRecords((prev) => prev.filter((r) => r.id !== deletingRecord.id));
      const intern = internMap[deletingRecord.intern_id];
      const internDisplayName = intern ? intern.full_name : `Intern #${deletingRecord.intern_id}`;
      showToast(
        `Attendance record for ${internDisplayName} on ${deletingRecord.attendance_date} deleted successfully.`,
        'success'
      );
      setDeletingRecord(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Unable to delete attendance record.';
      showToast(message, 'error');
      setDeletingRecord(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'LEAVE', label: 'Leave' },
  ];

  // DataTable Column Definitions
  const columns: Column<Attendance>[] = [
    {
      key: 'attendance_date',
      header: 'Date',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">{row.attendance_date}</span>
      ),
    },
    {
      key: 'intern_id',
      header: 'Intern',
      render: (row) => {
        const intern = internMap[row.intern_id];
        return intern ? (
          <div>
            <Link
              to={`/admin/interns/${intern.id}`}
              className="font-bold text-slate-900 hover:text-blue-600 transition-colors block text-xs"
            >
              {intern.full_name}
            </Link>
            <span className="text-[11px] text-slate-500 font-mono">{intern.intern_id}</span>
          </div>
        ) : (
          <span className="text-slate-500 text-xs font-mono">Intern #{row.intern_id}</span>
        );
      },
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => {
        const intern = internMap[row.intern_id];
        const dept = intern ? departmentMap[intern.department_id] || 'General' : '—';
        return <span className="text-xs text-slate-700">{dept}</span>;
      },
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
        <span className="text-xs text-slate-600 italic max-w-xs truncate block">
          {row.remarks || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => {
        const intern = internMap[row.intern_id];
        const labelName = intern ? intern.full_name : `Intern #${row.intern_id}`;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              aria-label={`Edit attendance for ${labelName}`}
              onClick={() => handleOpenEdit(row)}
              className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label={`Delete attendance for ${labelName}`}
              onClick={() => setDeletingRecord(row)}
              className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-red-600 outline-none cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-2">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* 1. Page Header */}
      <PageHeader
        title="Attendance Management"
        description="Record and review daily intern attendance."
        breadcrumbs={['Admin', 'Attendance']}
        action={
          <Button
            variant="primary"
            icon={<CalendarCheck className="w-4 h-4" />}
            onClick={handleMarkAttendance}
          >
            Mark Attendance
          </Button>
        }
      />

      {/* Error Alert Banner */}
      {error && (
        <Alert
          type="error"
          title="Error Loading Attendance"
          message={
            <div className="flex items-center justify-between gap-4 mt-1">
              <span>{error}</span>
              <Button
                variant="secondary"
                className="!py-1 !px-2.5 !text-xs shrink-0"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => loadAttendance(selectedDate, selectedStatus)}
              >
                Retry
              </Button>
            </div>
          }
          onClose={() => setError(null)}
        />
      )}

      {/* 2. Compact Attendance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Present"
          value={summaryCounts.present}
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          label="Absent"
          value={summaryCounts.absent}
          icon={<UserX className="w-5 h-5 text-red-600" />}
        />
        <MetricCard
          label="Leave"
          value={summaryCounts.leave}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          label="Total Records"
          value={summaryCounts.total}
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Date Picker Input */}
          <div className="w-full">
            <Input
              label="Select Date"
              type="date"
              aria-label="Filter by Attendance Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* SearchBar */}
          <div className="w-full md:col-span-2">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by intern name, ID, or department..."
              label="Search attendance records"
              className="w-full"
            />
          </div>
        </div>

        <FilterBar
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        >
          <div className="w-full sm:w-52">
            <Select
              aria-label="Filter by Attendance Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        </FilterBar>
      </div>

      {/* 4. Table / Card List / Empty State / Loading */}
      {isLoading ? (
        <LoadingState fullPage label="Loading attendance records from server..." />
      ) : filteredRecords.length === 0 ? (
        records.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="No attendance records found"
            description={`There are no intern attendance records logged for ${
              selectedDate || 'the selected date'
            }.`}
            action={
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  icon={<CalendarCheck className="w-4 h-4" />}
                  onClick={handleMarkAttendance}
                >
                  Mark Attendance
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="secondary"
                    icon={<FilterX className="w-4 h-4" />}
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            }
          />
        ) : (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="No attendance records match your current filters."
            description="Try adjusting your search criteria or status filter."
            action={
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            }
          />
        )
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={filteredRecords}
              keyExtractor={(row) => String(row.id)}
            />
          </div>

          {/* Mobile Card Grid Layout */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredRecords.map((record) => {
              const intern = internMap[record.intern_id];
              const internName = intern ? intern.full_name : `Intern #${record.intern_id}`;
              const internCode = intern ? intern.intern_id : `ID #${record.intern_id}`;
              const dept = intern ? departmentMap[intern.department_id] || 'General' : '—';

              return (
                <DataCard
                  key={record.id}
                  title={internName}
                  subtitle={`${internCode} • ${dept}`}
                  status={<Badge status={record.status as IMSStatusType} />}
                  fields={[
                    { label: 'Date', value: record.attendance_date },
                    { label: 'Remarks', value: record.remarks || '—' },
                  ]}
                  action={
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        className="!min-h-[38px] !px-3 !py-1 !text-xs"
                        onClick={() => handleOpenEdit(record)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="!min-h-[38px] !px-3 !py-1 !text-xs"
                        onClick={() => setDeletingRecord(record)}
                      >
                        Delete
                      </Button>
                    </div>
                  }
                />
              );
            })}
          </div>
        </>
      )}

      {/* Mark / Edit Attendance Form Modal */}
      <AttendanceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveAttendance}
        initialData={editingRecord}
        defaultDate={selectedDate}
        internsList={interns}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Attendance Record"
        message={
          <>
            Are you sure you want to delete the attendance record for{' '}
            <strong className="font-semibold text-slate-900">
              {deletingRecord && internMap[deletingRecord.intern_id]
                ? internMap[deletingRecord.intern_id].full_name
                : `Intern #${deletingRecord?.intern_id}`}
            </strong>{' '}
            on{' '}
            <strong className="font-mono font-semibold text-slate-900">
              {deletingRecord?.attendance_date}
            </strong>
            ?
          </>
        }
        confirmText="Delete Record"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AttendancePage;
