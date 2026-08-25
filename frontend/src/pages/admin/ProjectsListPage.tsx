import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, FolderKanban, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/data/SearchBar';
import { FilterBar } from '../../components/data/FilterBar';
import { Select } from '../../components/common/Select';
import { DataTable, Column } from '../../components/data/DataTable';
import { DataCard } from '../../components/data/DataCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Toast } from '../../components/feedback/Toast';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Alert } from '../../components/feedback/Alert';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { ProjectFormModal } from '../../components/admin/ProjectFormModal';
import { Project, ProjectCreate, ProjectUpdate } from '../../types/project';
import { Intern } from '../../types/intern';
import { projectService } from '../../services/projectService';
import { internService } from '../../services/internService';
import { ApiError } from '../../types/api';

export const ProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInternId, setSelectedInternId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Form modal, Delete dialog, and Toast state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
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

  // Check if navigated from project detail page after deletion
  useEffect(() => {
    if (location.state && (location.state as { deletedMessage?: string }).deletedMessage) {
      showToast((location.state as { deletedMessage: string }).deletedMessage, 'success');
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Load interns list for assignment selector and filter
  const loadInterns = useCallback(async () => {
    try {
      const data = await internService.getInterns();
      setInterns(data);
    } catch {
      // Handled gracefully in modal/filters
    }
  }, []);

  useEffect(() => {
    loadInterns();
  }, [loadInterns]);

  // Create Intern lookup dictionary: id -> Intern
  const internMap = useMemo(() => {
    const map: Record<number, Intern> = {};
    interns.forEach((i) => {
      map[i.id] = i;
    });
    return map;
  }, [interns]);

  /**
   * Load projects from backend API with current filter parameters.
   * Uses sequence tracking to prevent out-of-order responses from overwriting newer results.
   */
  const loadProjects = useCallback(
    async (search?: string, internId?: string, status?: string) => {
      const currentSeq = ++requestSeq.current;
      setIsLoading(true);
      setError(null);
      try {
        const data = await projectService.getProjects({
          search: search !== undefined ? search : searchTerm,
          intern_id: internId !== undefined ? internId : selectedInternId,
          status: status !== undefined ? status : selectedStatus,
        });
        if (currentSeq === requestSeq.current) {
          setProjects(data);
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
    [searchTerm, selectedInternId, selectedStatus]
  );

  // Initial load
  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search and filter triggering
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      loadProjects(searchTerm, selectedInternId, selectedStatus);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedInternId, selectedStatus, loadProjects]);

  const hasActiveFilters = Boolean(searchTerm || selectedInternId || selectedStatus);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedInternId('');
    setSelectedStatus('');
  };

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleSaveProject = async (data: ProjectCreate | ProjectUpdate) => {
    if (editingProject) {
      const updated = await projectService.updateProject(editingProject.id, data as ProjectUpdate);
      setProjects((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      showToast('Project updated successfully.', 'success');
    } else {
      const created = await projectService.createProject(data as ProjectCreate);
      setProjects((prev) => [created, ...prev]);
      showToast('Project added successfully.', 'success');
    }
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;

    setIsDeleting(true);
    try {
      await projectService.deleteProject(deletingProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      showToast(`Project '${deletingProject.name}' deleted successfully.`, 'success');
      setDeletingProject(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : `Unable to delete project '${deletingProject.name}'.`;
      showToast(message, 'error');
      setDeletingProject(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Derive intern options for filter dropdown
  const internOptions = useMemo(() => {
    const options = interns.map((i) => ({
      value: String(i.id),
      label: `${i.full_name} (${i.intern_id})`,
    }));
    return [{ value: '', label: 'All Assigned Interns' }, ...options];
  }, [interns]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ON_HOLD', label: 'On Hold' },
  ];

  // Helper render function for Project Progress Bar
  const renderProgress = (progress: number) => (
    <div className="w-36 space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
        <div
          className={`h-full transition-all duration-300 ${
            progress === 100
              ? 'bg-emerald-600'
              : progress > 50
              ? 'bg-blue-600'
              : progress > 0
              ? 'bg-sky-500'
              : 'bg-slate-300'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );

  // Columns definition for Desktop DataTable
  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Project Name',
      render: (row) => (
        <div>
          <Link
            to={`/admin/projects/${row.id}`}
            className="font-bold text-slate-900 hover:text-blue-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xs outline-none block"
          >
            {row.name}
          </Link>
          {row.description && (
            <span className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
              {row.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'intern_id',
      header: 'Assigned Intern',
      render: (row) => {
        const intern = internMap[row.intern_id];
        return intern ? (
          <div>
            <Link
              to={`/admin/interns/${intern.id}`}
              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors block text-xs"
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
      key: 'start_date',
      header: 'Start Date',
      render: (row) => <span className="font-mono text-xs text-slate-700">{row.start_date}</span>,
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (row) => <span className="font-mono text-xs text-slate-700 font-medium">{row.deadline}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (row) => renderProgress(row.progress),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/admin/projects/${row.id}`}
            aria-label={`View details for project ${row.name}`}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            type="button"
            aria-label={`Edit project ${row.name}`}
            onClick={() => handleOpenEditModal(row)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={`Delete project ${row.name}`}
            onClick={() => setDeletingProject(row)}
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
        title="Project Management"
        description="Manage intern projects, assignments, deadlines, and progress."
        breadcrumbs={['Admin', 'Projects']}
        action={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            Add Project
          </Button>
        }
      />

      {/* Error Alert Banner */}
      {error && (
        <Alert
          type="error"
          title="Error Loading Projects"
          message={
            <div className="flex items-center justify-between gap-4 mt-1">
              <span>{error}</span>
              <Button
                variant="secondary"
                className="!py-1 !px-2.5 !text-xs shrink-0"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => loadProjects(searchTerm, selectedInternId, selectedStatus)}
              >
                Retry
              </Button>
            </div>
          }
          onClose={() => setError(null)}
        />
      )}

      {/* 2. Search & Filter Bar */}
      <div className="space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by project name or description..."
          label="Search projects"
          className="max-w-md w-full"
        />

        <FilterBar
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        >
          <div className="w-full sm:w-60">
            <Select
              aria-label="Filter by Assigned Intern"
              value={selectedInternId}
              onChange={(e) => setSelectedInternId(e.target.value)}
              options={internOptions}
            />
          </div>

          <div className="w-full sm:w-52">
            <Select
              aria-label="Filter by Project Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
            />
          </div>
        </FilterBar>
      </div>

      {/* 3. Data Display (Loading / Desktop Table / Mobile Cards / Empty State) */}
      {isLoading ? (
        <LoadingState fullPage label="Loading projects from server..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6" />}
          title={hasActiveFilters ? 'No projects found' : 'No projects yet'}
          description={
            hasActiveFilters
              ? 'No projects match your current search or filters.'
              : 'There are currently no projects in the directory.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
                Add Project
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
              data={projects}
              keyExtractor={(row) => String(row.id)}
            />
          </div>

          {/* Mobile Cards Layout */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {projects.map((project) => {
              const intern = internMap[project.intern_id];
              return (
                <DataCard
                  key={project.id}
                  title={project.name}
                  subtitle={intern ? `${intern.full_name} (${intern.intern_id})` : `Intern #${project.intern_id}`}
                  status={<Badge status={project.status} />}
                  fields={[
                    { label: 'Start Date', value: project.start_date },
                    { label: 'Deadline', value: project.deadline },
                    { label: 'Progress', value: `${project.progress}%` },
                    ...(project.description ? [{ label: 'Description', value: project.description }] : []),
                  ]}
                  action={
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/projects/${project.id}`}>
                        <Button
                          variant="secondary"
                          className="!min-h-[38px] !px-3 !py-1 !text-xs"
                        >
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="!min-h-[38px] !px-3 !py-1 !text-xs"
                        onClick={() => handleOpenEditModal(project)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="!min-h-[38px] !px-3 !py-1 !text-xs"
                        onClick={() => setDeletingProject(project)}
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

      {/* Add / Edit Project Form Modal */}
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProject}
        initialData={editingProject}
        internsList={interns}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={
          <>
            Are you sure you want to delete project{' '}
            <strong className="font-semibold text-slate-900">
              '{deletingProject?.name}'
            </strong>
            ? This action will permanently remove the project from the directory.
          </>
        }
        confirmText="Delete Project"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectsListPage;
