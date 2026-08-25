import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  User,
  Building2,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
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
import { InternFormModal } from '../../components/admin/InternFormModal';
import { Intern, InternUpdate } from '../../types/intern';
import { Department } from '../../types/department';
import { internService } from '../../services/internService';
import { departmentService } from '../../services/departmentService';
import { ApiError } from '../../types/api';

export const InternDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [intern, setIntern] = useState<Intern | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state for modals & toasts
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
      const [internData, deptsData] = await Promise.all([
        internService.getIntern(id),
        departmentService.getDepartments(),
      ]);
      setIntern(internData);
      setDepartments(deptsData);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setIntern(null);
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch intern details from server.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Department name resolver
  const departmentName = React.useMemo(() => {
    if (!intern) return '';
    const dept = departments.find((d) => d.id === intern.department_id);
    return dept ? dept.name : `Department #${intern.department_id}`;
  }, [intern, departments]);

  const handleSaveEdit = async (updatedData: InternUpdate) => {
    if (!intern) return;
    const updated = await internService.updateIntern(intern.id, updatedData);
    setIntern(updated);
    showToast('Intern updated successfully.', 'success');
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!intern) return;
    setIsDeleting(true);
    try {
      await internService.deleteIntern(intern.id);
      setIsDeleteModalOpen(false);
      navigate('/admin/interns', {
        state: { deletedMessage: `Intern '${intern.full_name}' deleted successfully.` },
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : `Unable to delete intern '${intern.full_name}'.`;
      showToast(message, 'error');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Intern Profile"
          description="Loading intern details from backend..."
          breadcrumbs={['Admin', 'Interns', 'Profile']}
        />
        <LoadingState fullPage label="Loading intern profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Intern Profile"
          description="Detailed record view of intern profile and status."
          breadcrumbs={['Admin', 'Interns', 'Profile']}
        />
        <Alert
          type="error"
          title="Error Loading Profile"
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

  if (!intern) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Intern Profile"
          description="Detailed record view of intern profile and status."
          breadcrumbs={['Admin', 'Interns', 'Profile']}
        />
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 text-amber-500" />}
          title="Intern not found"
          description="The requested intern record does not exist or may have been deleted from the directory."
          action={
            <Link to="/admin/interns">
              <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Interns
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

      {/* 1. Page Header with Back Button and Quick Actions */}
      <PageHeader
        title={intern.full_name}
        description={`Intern ID: ${intern.intern_id} • ${departmentName}`}
        breadcrumbs={['Admin', 'Interns', intern.full_name]}
        action={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link to="/admin/interns">
              <Button
                variant="secondary"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Interns
              </Button>
            </Link>
            <Button
              variant="secondary"
              icon={<Edit2 className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Intern
            </Button>
            <Button
              variant="destructive"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Intern
            </Button>
          </div>
        }
      />

      {/* Profile Header Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0 border border-blue-200">
            {intern.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{intern.full_name}</h1>
              <Badge status={intern.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{intern.intern_id}</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 space-y-1 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 w-full sm:w-auto">
          <p className="font-semibold text-slate-700">{intern.role}</p>
          <p>{departmentName}</p>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information Card */}
        <Card title="Basic Information" description="Contact details and primary identification">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Full Name
              </dt>
              <dd className="font-bold text-slate-900">{intern.full_name}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Intern ID
              </dt>
              <dd className="font-mono text-slate-900 font-semibold">{intern.intern_id}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </dt>
              <dd className="font-mono text-slate-900 break-all">{intern.email}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number
              </dt>
              <dd className="text-slate-900">{intern.phone || 'Not provided'}</dd>
            </div>
          </dl>
        </Card>

        {/* Internship Information Card */}
        <Card title="Internship Information" description="Program placement, academic details, and status">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Department
              </dt>
              <dd className="font-semibold text-slate-900">{departmentName}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Role
              </dt>
              <dd className="font-semibold text-slate-900">{intern.role}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md sm:col-span-2">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                University / Institution
              </dt>
              <dd className="text-slate-900 font-medium">{intern.university || 'Not provided'}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Start Date
              </dt>
              <dd className="font-mono text-slate-900">{intern.start_date}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                End Date
              </dt>
              <dd className="font-mono text-slate-900">{intern.end_date || 'Ongoing'}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Edit Form Modal */}
      <InternFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={intern}
        departments={departments}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
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
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete intern <strong className="text-slate-900">'{intern.full_name}'</strong> ({intern.intern_id})? This action will permanently remove the record and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
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

export default InternDetailPage;
