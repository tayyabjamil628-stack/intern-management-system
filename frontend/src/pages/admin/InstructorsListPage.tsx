import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  FilterX,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  UserCheck,
  UserX,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/data/SearchBar';
import { FilterBar } from '../../components/data/FilterBar';
import { DataTable, Column } from '../../components/data/DataTable';
import { DataCard } from '../../components/data/DataCard';
import { MetricCard } from '../../components/data/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Toast } from '../../components/feedback/Toast';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { InstructorFormModal } from '../../components/admin/InstructorFormModal';
import { useInstructors } from '../../context/InstructorsContext';
import { InstructorRecord } from '../../data/mockInstructorsData';
import { mockDepartmentsList } from '../../data/mockDepartmentsData';

export const InstructorsListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { instructors, addInstructor, updateInstructor, deleteInstructor } = useInstructors();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Export menu dropdown state
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Modal, Delete Dialog & Toast state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorRecord | null>(null);
  const [deletingInstructor, setDeletingInstructor] = useState<InstructorRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check for deletion message passed via router state from Detail Page
  useEffect(() => {
    if (location.state && (location.state as { deletedMessage?: string }).deletedMessage) {
      const msg = (location.state as { deletedMessage?: string }).deletedMessage!;
      showToast(msg, 'success');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const hasActiveFilters = Boolean(searchTerm || selectedDepartment || selectedStatus);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedStatus('');
  };

  const handleAddInstructor = () => {
    setEditingInstructor(null);
    setIsFormOpen(true);
  };

  const handleViewInstructor = (instructor: InstructorRecord) => {
    navigate(`/admin/instructors/${instructor.id}`);
  };

  const handleEditInstructor = (instructor: InstructorRecord) => {
    setEditingInstructor(instructor);
    setIsFormOpen(true);
  };

  const handleDeleteInstructor = (instructor: InstructorRecord) => {
    setDeletingInstructor(instructor);
  };

  const handleConfirmDelete = () => {
    if (!deletingInstructor) return;
    deleteInstructor(deletingInstructor.id);
    showToast(`Instructor '${deletingInstructor.fullName}' deleted successfully.`, 'success');
    setDeletingInstructor(null);
  };

  const handleSaveInstructor = (savedInstructor: InstructorRecord) => {
    if (editingInstructor) {
      updateInstructor(savedInstructor);
      showToast('Instructor updated successfully.', 'success');
    } else {
      addInstructor(savedInstructor);
      showToast('Instructor added successfully.', 'success');
    }
  };

  // Filter logic
  const filteredInstructors = useMemo(() => {
    return instructors.filter((instructor) => {
      // Search term filter (Full Name, Instructor ID, Email, Specialization)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = instructor.fullName.toLowerCase().includes(query);
        const matchesId = instructor.instructorId.toLowerCase().includes(query);
        const matchesEmail = instructor.email.toLowerCase().includes(query);
        const matchesSpec = instructor.specialization.toLowerCase().includes(query);

        if (!matchesName && !matchesId && !matchesEmail && !matchesSpec) {
          return false;
        }
      }

      // Department filter
      if (selectedDepartment && instructor.department !== selectedDepartment) {
        return false;
      }

      // Status filter
      if (selectedStatus && instructor.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [instructors, searchTerm, selectedDepartment, selectedStatus]);

  // Metric counts based on filtered results
  const activeCount = useMemo(
    () => filteredInstructors.filter((i) => i.status === 'ACTIVE').length,
    [filteredInstructors]
  );

  const inactiveCount = useMemo(
    () => filteredInstructors.filter((i) => i.status === 'INACTIVE').length,
    [filteredInstructors]
  );

  // Export handler (CSV or Excel)
  const handleExport = (format: 'csv' | 'excel') => {
    if (filteredInstructors.length === 0) {
      showToast('No instructors available to export.', 'error');
      setIsExportMenuOpen(false);
      return;
    }

    const headers = ['Instructor ID', 'Full Name', 'Email', 'Phone', 'Department', 'Specialization', 'Status'];
    const rows = filteredInstructors.map((instructor) => [
      instructor.instructorId,
      instructor.fullName,
      instructor.email,
      instructor.phone,
      instructor.department,
      instructor.specialization,
      instructor.status,
    ]);

    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const escapeCsvValue = (val: string) => {
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      };

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => escapeCsvValue(cell || '')).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `instructors_export_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Exported ${filteredInstructors.length} instructor record(s) to CSV.`, 'success');
    } else if (format === 'excel') {
      const excelXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Data">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Instructors">
  <Table>
   <Row>
    ${headers.map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>`).join('\n    ')}
   </Row>
   ${rows
     .map(
       (row) => `<Row>
    ${row.map((cell) => `<Cell ss:StyleID="Data"><Data ss:Type="String">${(cell || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`).join('\n    ')}
   </Row>`
     )
     .join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`;

      const blob = new Blob([excelXml], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `instructors_export_${dateStr}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Exported ${filteredInstructors.length} instructor record(s) to Excel.`, 'success');
    }

    setIsExportMenuOpen(false);
  };

  // Options for Department Filter
  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...mockDepartmentsList.map((dept) => ({
      value: dept.name,
      label: dept.name,
    })),
  ];

  // Options for Status Filter
  const statusOptions = [
    { value: '', label: 'ALL' },
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'INACTIVE', label: 'INACTIVE' },
  ];

  // DataTable Columns Setup
  const columns: Column<InstructorRecord>[] = [
    {
      key: 'fullName',
      header: 'Full Name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.fullName}</div>
          <div className="text-xs text-slate-500 font-medium">{row.phone}</div>
        </div>
      ),
    },
    {
      key: 'instructorId',
      header: 'Instructor ID',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
          {row.instructorId}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="text-slate-700 text-sm">{row.email}</span>,
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => <span className="text-slate-700 text-sm">{row.department}</span>,
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (row) => <span className="text-slate-700 text-sm">{row.specialization}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`View instructor ${row.fullName}`}
            onClick={() => handleViewInstructor(row)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={`Edit instructor ${row.fullName}`}
            onClick={() => handleEditInstructor(row)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={`Delete instructor ${row.fullName}`}
            onClick={() => handleDeleteInstructor(row)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-red-600 outline-none cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
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
        title="Instructor Management"
        description="Manage instructors responsible for supervising and supporting interns."
        action={
          <div className="flex items-center gap-3 flex-wrap">
            {/* Export as Dropdown Menu */}
            <div className="relative inline-block text-left" ref={exportMenuRef}>
              <Button
                variant="secondary"
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
                disabled={filteredInstructors.length === 0}
                aria-expanded={isExportMenuOpen}
                aria-haspopup="true"
              >
                <Download className="w-4 h-4" />
                Export as
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-500" />
              </Button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-md bg-white shadow-lg border border-slate-200 ring-1 ring-black/5 z-30 focus:outline-none animate-in fade-in slide-in-from-top-1">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      type="button"
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                      role="menuitem"
                    >
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Export as CSV (.csv)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('excel')}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-100"
                      role="menuitem"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Export as Excel (.xls)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button variant="primary" onClick={handleAddInstructor}>
              <Plus className="w-4 h-4" />
              Add Instructor
            </Button>
          </div>
        }
      />

      {/* 2. Summary Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Instructors"
          value={filteredInstructors.length}
          icon={<GraduationCap className="w-5 h-5 text-blue-600" />}
          helperText={hasActiveFilters ? 'Filtered instructors count' : 'All directory instructors'}
        />
        <MetricCard
          label="Active Instructors"
          value={activeCount}
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
          helperText="Active supervisors"
          trendType="positive"
        />
        <MetricCard
          label="Inactive Instructors"
          value={inactiveCount}
          icon={<UserX className="w-5 h-5 text-slate-400" />}
          helperText="Inactive status"
          trendType="neutral"
        />
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Search Bar */}
          <div className="md:col-span-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search name, ID, email, or specialization..."
              ariaLabel="Search instructors"
            />
          </div>

          {/* Department Filter */}
          <div>
            <Select
              label="Department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              options={departmentOptions}
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              label="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>

        {/* Filter Summary & Clear Action */}
        <FilterBar
          activeFilterCount={
            (searchTerm ? 1 : 0) + (selectedDepartment ? 1 : 0) + (selectedStatus ? 1 : 0)
          }
          onClearFilters={handleClearFilters}
          resultCount={filteredInstructors.length}
        />
      </div>

      {/* 3. Instructors Directory List */}
      {filteredInstructors.length === 0 ? (
        <EmptyState
          title="No instructors found"
          description="No instructors match the current search or filters."
          actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
          onAction={hasActiveFilters ? handleClearFilters : undefined}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable data={filteredInstructors} columns={columns} keyExtractor={(row) => row.id} />
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredInstructors.map((instructor) => (
              <DataCard
                key={instructor.id}
                title={instructor.fullName}
                subtitle={`${instructor.instructorId} • ${instructor.department}`}
                badge={<Badge status={instructor.status} />}
                fields={[
                  { label: 'Email', value: instructor.email },
                  { label: 'Specialization', value: instructor.specialization },
                  { label: 'Phone', value: instructor.phone },
                ]}
                actions={
                  <div className="flex items-center gap-2 w-full pt-2 border-t border-slate-100">
                    <Button
                      variant="secondary"
                      className="flex-1 !min-h-[38px] !px-3 !py-1 !text-xs"
                      onClick={() => handleViewInstructor(instructor)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 !min-h-[38px] !px-3 !py-1 !text-xs"
                      onClick={() => handleEditInstructor(instructor)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="!min-h-[38px] !px-3 !py-1 !text-xs"
                      onClick={() => handleDeleteInstructor(instructor)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Instructor Form Modal */}
      <InstructorFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveInstructor}
        initialData={editingInstructor}
        existingInstructors={instructors}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingInstructor)}
        onClose={() => setDeletingInstructor(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Instructor"
        message={
          <>
            Are you sure you want to delete instructor{' '}
            <strong className="font-semibold text-slate-900">
              '{deletingInstructor?.fullName}'
            </strong>
            ? This action will permanently remove the record from local state.
          </>
        }
        confirmText="Delete Instructor"
        variant="destructive"
      />
    </div>
  );
};
