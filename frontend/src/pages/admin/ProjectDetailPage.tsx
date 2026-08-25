import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  FolderKanban,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Toast } from '../../components/feedback/Toast';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Alert } from '../../components/feedback/Alert';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { ProjectFormModal } from '../../components/admin/ProjectFormModal';
import { Project, ProjectUpdate } from '../../types/project';
import { Intern } from '../../types/intern';
import { Department } from '../../types/department';
import { projectService } from '../../services/projectService';
import { internService } from '../../services/internService';
import { departmentService } from '../../services/departmentService';
import { ApiError } from '../../types/api';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state for modals & toasts
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [projectData, internsData, deptsData] = await Promise.all([
        projectService.getProject(id),
        internService.getInterns(),
        departmentService.getDepartments().catch(() => []),
      ]);
      setProject(projectData);
      setInterns(internsData);
      setDepartments(deptsData);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setProject(null);
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch project details from server.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Resolve assigned intern and department
  const assignedIntern = React.useMemo(() => {
    if (!project) return null;
    return interns.find((i) => i.id === project.intern_id) || null;
  }, [project, interns]);

  const departmentName = React.useMemo(() => {
    if (!assignedIntern) return 'General';
    const dept = departments.find((d) => d.id === assignedIntern.department_id);
    return dept ? dept.name : `Dept #${assignedIntern.department_id}`;
  }, [assignedIntern, departments]);

  const handleSaveEdit = async (updatedData: ProjectUpdate) => {
    if (!project) return;
    const updated = await projectService.updateProject(project.id, updatedData);
    setProject(updated);
    showToast('Project updated successfully.', 'success');
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await projectService.deleteProject(project.id);
      setIsDeleteOpen(false);
      navigate('/admin/projects', {
        state: { deletedMessage: `Project '${project.name}' deleted successfully.` },
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : `Unable to delete project '${project.name}'.`;
      showToast(message, 'error');
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Project Overview"
          description="Loading project details from server..."
          breadcrumbs={['Admin', 'Projects', 'Overview']}
        />
        <LoadingState fullPage label="Loading project overview..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Project Overview"
          description="Detailed view of intern project specification, milestones, and progress."
          breadcrumbs={['Admin', 'Projects', 'Overview']}
        />
        <Alert
          type="error"
          title="Error Loading Project"
          message={
            <div className="flex items-center justify-between gap-4 mt-1">
              <span>{error}</span>
              <Button
                variant="secondary"
                className="!py-1 !px-2.5 !text-xs shrink-0"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={loadData}
              >
                Retry
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Project Overview"
          description="Detailed view of intern project specification, milestones, and progress."
          breadcrumbs={['Admin', 'Projects', 'Overview']}
        />
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 text-amber-500" />}
          title="Project not found"
          description="The requested project record does not exist or may have been deleted from the directory."
          action={
            <Link to="/admin/projects">
              <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Projects
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

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

      {/* 1. Page Header with Actions */}
      <PageHeader
        title={project.name}
        description={`Assigned to ${assignedIntern ? assignedIntern.full_name : `Intern #${project.intern_id}`}`}
        breadcrumbs={['Admin', 'Projects', project.name]}
        action={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link to="/admin/projects">
              <Button
                variant="secondary"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Projects
              </Button>
            </Link>
            <Button
              variant="secondary"
              icon={<Edit2 className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Project
            </Button>
            <Button
              variant="destructive"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete Project
            </Button>
          </div>
        }
      />

      {/* Hero Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
              <Badge status={project.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Project #{project.id} • {departmentName}
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 space-y-1 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 w-full sm:w-auto">
          <p className="font-semibold text-slate-700">Assigned Intern</p>
          {assignedIntern ? (
            <>
              <Link
                to={`/admin/interns/${assignedIntern.id}`}
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline block"
              >
                {assignedIntern.full_name}
              </Link>
              <p className="font-mono text-slate-500">{assignedIntern.intern_id}</p>
            </>
          ) : (
            <p className="font-mono text-slate-500">Intern #{project.intern_id}</p>
          )}
        </div>
      </div>

      {/* 2. Content Grid (Desktop 2-Column, Mobile 1-Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Information Card */}
        <Card
          title="Project Information"
          description="Detailed overview of project requirements, dates, and intern assignment."
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md sm:col-span-2">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                Project Name
              </dt>
              <dd className="font-bold text-slate-900 text-base">{project.name}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md sm:col-span-2">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Description
              </dt>
              <dd className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                {project.description || 'No detailed description provided for this project.'}
              </dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Assigned Intern
              </dt>
              <dd className="font-semibold text-slate-900">
                {assignedIntern ? (
                  <Link
                    to={`/admin/interns/${assignedIntern.id}`}
                    className="text-blue-600 hover:text-blue-800 underline hover:no-underline"
                  >
                    {assignedIntern.full_name}
                  </Link>
                ) : (
                  `Intern #${project.intern_id}`
                )}
                {assignedIntern && (
                  <span className="block text-xs font-mono font-normal text-slate-500 mt-0.5">
                    {assignedIntern.intern_id}
                  </span>
                )}
              </dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Department
              </dt>
              <dd className="font-semibold text-slate-900">{departmentName}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Start Date
              </dt>
              <dd className="font-mono text-slate-900 font-medium">{project.start_date}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Deadline
              </dt>
              <dd className="font-mono text-slate-900 font-medium">{project.deadline}</dd>
            </div>
          </dl>
        </Card>

        {/* Project Status & Progress Card */}
        <Card
          title="Project Status & Progress"
          description="Current completion status and overall percentage timeline."
        >
          <div className="space-y-6">
            {/* Status & Badge Row */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Current Status
                </span>
                <Badge status={project.status} />
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  Progress Percentage
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {project.progress}%
                </span>
              </div>
            </div>

            {/* Visual Progress Bar Component */}
            <div className="p-4 bg-white border border-slate-200 rounded-md space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Completion Status</span>
                <span className="font-mono">{project.progress}%</span>
              </div>

              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    project.progress === 100
                      ? 'bg-emerald-600'
                      : project.progress > 50
                      ? 'bg-blue-600'
                      : project.progress > 0
                      ? 'bg-sky-500'
                      : 'bg-slate-300'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, project.progress))}%`,
                  }}
                  role="progressbar"
                  aria-valuenow={project.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Project completion progress: ${project.progress}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Milestones / Status Indicator Note */}
            <div className="p-3 rounded-md bg-blue-50/70 border border-blue-100 text-xs text-blue-800 flex items-start gap-2.5">
              {project.progress === 100 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-blue-900">
                  {project.progress === 100
                    ? 'Project Complete'
                    : project.status === 'ON_HOLD'
                    ? 'Project On Hold'
                    : project.status === 'NOT_STARTED'
                    ? 'Project Pending Kickoff'
                    : 'Active In Progress'}
                </p>
                <p className="mt-0.5 text-blue-700">
                  {project.progress === 100
                    ? 'All deliverable requirements have been completed and verified.'
                    : `Project is currently ${project.progress}% complete towards target deadline ${project.deadline}.`}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Form Modal */}
      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={project}
        internsList={interns}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={
          <>
            Are you sure you want to delete project{' '}
            <strong className="font-semibold text-slate-900">
              '{project.name}'
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

export default ProjectDetailPage;
