import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/data/SearchBar';
import { DataTable, Column } from '../../components/data/DataTable';
import { DataCard } from '../../components/data/DataCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Toast } from '../../components/feedback/Toast';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Alert } from '../../components/feedback/Alert';
import { DepartmentFormModal } from '../../components/admin/DepartmentFormModal';
import { Department } from '../../types/department';
import { departmentService } from '../../services/departmentService';
import { ApiError } from '../../types/api';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal, Toast, and Delete state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [selectedDepartmentForDelete, setSelectedDepartmentForDelete] = useState<Department | null>(null);
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

  /**
   * Load departments from backend API with optional search query.
   * Uses sequence tracking to prevent out-of-order responses from overwriting newer results.
   */
  const loadDepartments = useCallback(async (searchQuery?: string) => {
    const currentSeq = ++requestSeq.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await departmentService.getDepartments(searchQuery);
      if (currentSeq === requestSeq.current) {
        setDepartments(data);
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
  }, []);

  // Initial load
  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  // Debounced search query execution against backend
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      loadDepartments(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, loadDepartments]);

  // Close delete modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedDepartmentForDelete && !isDeleting) {
        setSelectedDepartmentForDelete(null);
      }
    };
    if (selectedDepartmentForDelete) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDepartmentForDelete, isDeleting]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleOpenAddModal = () => {
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    setIsFormOpen(true);
  };

  const handleSaveDepartment = async (formData: { name: string; description: string }) => {
    if (editingDepartment) {
      const updated = await departmentService.updateDepartment(editingDepartment.id, formData);
      setDepartments((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      showToast('Department updated successfully.', 'success');
    } else {
      const created = await departmentService.createDepartment(formData);
      setDepartments((prev) => [created, ...prev]);
      showToast('Department added successfully.', 'success');
    }
    setIsFormOpen(false);
    setEditingDepartment(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDepartmentForDelete) return;

    setIsDeleting(true);
    try {
      await departmentService.deleteDepartment(selectedDepartmentForDelete.id);
      setDepartments((prev) =>
        prev.filter((item) => item.id !== selectedDepartmentForDelete.id)
      );
      showToast(
        `Department '${selectedDepartmentForDelete.name}' deleted successfully.`,
        'success'
      );
      setSelectedDepartmentForDelete(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : `Unable to delete department '${selectedDepartmentForDelete.name}'.`;
      showToast(message, 'error');
      setSelectedDepartmentForDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Columns definition for Desktop DataTable
  const columns: Column<Department>[] = [
    {
      key: 'name',
      header: 'Department Name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-400 font-mono">ID: #{row.id}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <p className="text-slate-600 text-xs line-clamp-2 max-w-md">{row.description || '—'}</p>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label={`Edit ${row.name}`}
            onClick={() => handleOpenEditModal(row)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${row.name}`}
            onClick={() => setSelectedDepartmentForDelete(row)}
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
        title="Department Management"
        description="Manage departments used to organize interns."
        breadcrumbs={['Admin', 'Departments']}
        action={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            Add Department
          </Button>
        }
      />

      {/* 2. Error Alert Banner */}
      {error && (
        <Alert
          type="error"
          title="Error Loading Departments"
          message={
            <div className="flex items-center justify-between gap-4 mt-1">
              <span>{error}</span>
              <Button
                variant="secondary"
                className="!py-1 !px-2.5 !text-xs shrink-0"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => loadDepartments(searchTerm)}
              >
                Retry
              </Button>
            </div>
          }
          onClose={() => setError(null)}
        />
      )}

      {/* 3. Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by department name or description..."
          label="Search departments"
          className="max-w-md w-full"
        />
      </div>

      {/* 4. Data Display (Loading State / Desktop Table / Mobile Cards / Empty State) */}
      {isLoading ? (
        <LoadingState fullPage label="Loading departments from server..." />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-6 h-6" />}
          title={searchTerm.trim() ? 'No departments found' : 'No departments yet'}
          description={
            searchTerm.trim()
              ? 'No department records matched your search query.'
              : 'Get started by adding your first department.'
          }
          action={
            searchTerm.trim() ? (
              <Button variant="secondary" onClick={handleClearSearch}>
                Clear Search
              </Button>
            ) : (
              <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
                Add Department
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
              data={departments}
              keyExtractor={(row) => String(row.id)}
            />
          </div>

          {/* Mobile Cards Layout */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {departments.map((dept) => (
              <DataCard
                key={dept.id}
                title={dept.name}
                subtitle={`ID: #${dept.id}`}
                fields={[
                  { label: 'Description', value: dept.description || '—' },
                ]}
                action={
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="!min-h-[38px] !px-3 !py-1 !text-xs"
                      onClick={() => handleOpenEditModal(dept)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="!min-h-[38px] !px-3 !py-1 !text-xs !text-red-600 hover:!bg-red-50"
                      onClick={() => setSelectedDepartmentForDelete(dept)}
                    >
                      Delete
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Department Form Modal */}
      <DepartmentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveDepartment}
        initialData={editingDepartment}
      />

      {/* Delete Confirmation Modal */}
      {selectedDepartmentForDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
              Confirm Delete Department
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete department{' '}
              <strong className="text-slate-900">'{selectedDepartmentForDelete.name}'</strong>?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedDepartmentForDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
