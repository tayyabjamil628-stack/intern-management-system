import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, Edit2, Trash2, Users, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/data/SearchBar';
import { FilterBar } from '../../components/data/FilterBar';
import { DataTable, Column } from '../../components/data/DataTable';
import { DataCard } from '../../components/data/DataCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Toast } from '../../components/feedback/Toast';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Alert } from '../../components/feedback/Alert';
import { InternFormModal } from '../../components/admin/InternFormModal';
import { Intern, InternCreate, InternUpdate } from '../../types/intern';
import { Department } from '../../types/department';
import { internService } from '../../services/internService';
import { departmentService } from '../../services/departmentService';
import { ApiError } from '../../types/api';

export const InternsListPage: React.FC = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal, Delete, and Toast state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIntern, setEditingIntern] = useState<Intern | null>(null);
  const [selectedInternForDelete, setSelectedInternForDelete] = useState<Intern | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isInitialMount = useRef(true);
  const requestSeq = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Check if navigated from detail page with deletion or update message
  useEffect(() => {
    if (location.state && (location.state as { deletedMessage?: string }).deletedMessage) {
      showToast((location.state as { deletedMessage: string }).deletedMessage, 'success');
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Load departments once
  const loadDepartments = useCallback(async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch {
      // Handled gracefully in modal/filters
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  // Create department ID to Name mapping dictionary
  const deptMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    departments.forEach((dept) => {
      map[dept.id] = dept.name;
    });
    return map;
  }, [departments]);

  /**
   * Load interns from backend API with current filter parameters.
   * Uses sequence tracking to prevent out-of-order responses from overwriting newer results.
   */
  const loadInterns = useCallback(
    async (search?: string, deptId?: string, status?: string) => {
      const currentSeq = ++requestSeq.current;
      setIsLoading(true);
      setError(null);
      try {
        const data = await internService.getInterns({
          search: search !== undefined ? search : searchTerm,
          department_id: deptId !== undefined ? deptId : selectedDepartmentId,
          status: status !== undefined ? status : selectedStatus,
        });
        if (currentSeq === requestSeq.current) {
          setInterns(data);
        }
      } catch (err) {
        if (currentSeq === requestSeq.current) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Failed to connect to backend server. Please try again.');
          }
        }
      } finally {
        if (currentSeq === requestSeq.current) {
          setIsLoading(false);
        }
      }
    },
    [searchTerm, selectedDepartmentId, selectedStatus]
  );

  // Initial load
  useEffect(() => {
    loadInterns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search and filter triggering
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      loadInterns(searchTerm, selectedDepartmentId, selectedStatus);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedDepartmentId, selectedStatus, loadInterns]);

  // Close delete modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedInternForDelete && !isDeleting) {
        setSelectedInternForDelete(null);
      }
    };
    if (selectedInternForDelete) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedInternForDelete, isDeleting]);

  const hasActiveFilters = Boolean(searchTerm || selectedDepartmentId || selectedStatus);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartmentId('');
    setSelectedStatus('');
  };

  const handleOpenAddModal = () => {
    setEditingIntern(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (intern: Intern) => {
    setEditingIntern(intern);
    setIsFormOpen(true);
  };

  const handleSaveIntern = async (data: InternCreate | InternUpdate) => {
    if (editingIntern) {
      const updated = await internService.updateIntern(editingIntern.id, data as InternUpdate);
      setInterns((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      showToast('Intern updated successfully.', 'success');
    } else {
      const created = await internService.createIntern(data as InternCreate);
      setInterns((prev) => [created, ...prev]);
      showToast('Intern added successfully.', 'success');
    }
    setIsFormOpen(false);
    setEditingIntern(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInternForDelete) return;

    setIsDeleting(true);
    try {
      await internService.deleteIntern(selectedInternForDelete.id);
      setInterns((prev) =>
        prev.filter((item) => item.id !== selectedInternForDelete.id)
      );
      showToast(
        `Intern '${selectedInternForDelete.full_name}' deleted successfully.`,
        'success'
      );
      setSelectedInternForDelete(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : `Unable to delete intern '${selectedInternForDelete.full_name}'.`;
      showToast(message, 'error');
      setSelectedInternForDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Columns definition for Desktop DataTable
  const columns: Column<Intern>[] = [
    {
      key: 'full_name',
      header: 'Full Name',
      render: (row) => (
        <div>
          <Link
            to={`/admin/interns/${row.id}`}
            className="font-bold text-slate-900 hover:text-blue-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xs outline-none"
          >
            {row.full_name}
          </Link>
          <span className="text-[11px] text-slate-500 block font-mono">{row.intern_id}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <span className="text-slate-600 font-mono text-xs">{row.email}</span>
      ),
    },
    {
      key: 'department_id',
      header: 'Department',
      render: (row) => (
        <span className="text-slate-700 font-medium">
          {deptMap[row.department_id] || `Dept #${row.department_id}`}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <span className="text-slate-600 font-medium">{row.role}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (row) => (
        <span className="text-slate-600 font-mono text-xs">{row.start_date}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/admin/interns/${row.id}`}
            aria-label={`View ${row.full_name}'s profile`}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            type="button"
            aria-label={`Edit ${row.full_name}`}
            onClick={() => handleOpenEditModal(row)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${row.full_name}`}
            onClick={() => setSelectedInternForDelete(row)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-red-600 outline-none cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'TERMINATED', label: 'Terminated' },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Floating Toast Notification */}
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
        title="Intern Management"
        description="Manage intern records, departments, roles, and internship status."
        breadcrumbs={['Admin', 'Interns']}
        action={
          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            Add Intern
          </Button>
        }
      />

      {/* Error Alert Banner */}
      {error && (
        <Alert
          type="error"
          title="Error Loading Interns"
          message={
            <div className="flex items-center justify-between gap-4 mt-1">
              <span>{error}</span>
              <Button
                variant="secondary"
                className="!py-1 !px-2.5 !text-xs shrink-0"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => loadInterns(searchTerm, selectedDepartmentId, selectedStatus)}
              >
                Retry
              </Button>
            </div>
          }
          onClose={() => setError(null)}
        />
      )}

      {/* 2 & 3. Search and Filters Toolbar */}
      <FilterBar
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      >
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, ID, or email..."
          label="Search interns"
          className="max-w-xs"
        />

        <div className="w-full sm:w-48">
          <Select
            options={departmentOptions}
            value={selectedDepartmentId}
            onChange={(e) => setSelectedDepartmentId(e.target.value)}
            aria-label="Filter by department"
          />
        </div>

        <div className="w-full sm:w-40">
          <Select
            options={statusOptions}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by status"
          />
        </div>
      </FilterBar>

      {/* 4. Data Display (Loading / Desktop Table / Mobile Cards / Empty State) */}
      {isLoading ? (
        <LoadingState fullPage label="Loading interns from server..." />
      ) : interns.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title={hasActiveFilters ? 'No interns found' : 'No interns yet'}
          description={
            hasActiveFilters
              ? 'No intern records matched your current search criteria or filter options.'
              : 'There are currently no intern records in the directory.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button variant="primary" icon={<UserPlus className="w-4 h-4" />} onClick={handleOpenAddModal}>
                Add Intern
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={interns}
              keyExtractor={(row) => String(row.id)}
            />
          </div>

          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {interns.map((intern) => (
              <DataCard
                key={intern.id}
                title={intern.full_name}
                subtitle={`${intern.intern_id} • ${intern.email}`}
                status={<Badge status={intern.status} />}
                fields={[
                  {
                    label: 'Department',
                    value: deptMap[intern.department_id] || `Dept #${intern.department_id}`,
                  },
                  { label: 'Role', value: intern.role },
                  { label: 'Start Date', value: intern.start_date },
                  { label: 'University', value: intern.university || '—' },
                ]}
                action={
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/interns/${intern.id}`}>
                      <Button variant="secondary" className="!min-h-[38px] !px-3 !py-1 !text-xs">
                        View Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="!min-h-[38px] !px-3 !py-1 !text-xs"
                      onClick={() => handleOpenEditModal(intern)}
                    >
                      Edit
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Form Modal */}
      <InternFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveIntern}
        initialData={editingIntern}
        departments={departments}
      />

      {/* Delete Confirmation Modal */}
      {selectedInternForDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
              Confirm Delete Intern
            </h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to remove <strong className="text-slate-900">{selectedInternForDelete.full_name}</strong> ({selectedInternForDelete.intern_id})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedInternForDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
              >
                Delete Intern
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternsListPage;
