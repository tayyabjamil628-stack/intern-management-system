import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, User, Building2, Mail, Phone, Award, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Toast } from '../../components/feedback/Toast';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { InstructorFormModal } from '../../components/admin/InstructorFormModal';
import { useInstructors } from '../../context/InstructorsContext';
import { InstructorRecord } from '../../data/mockInstructorsData';

export const InstructorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { instructors, getInstructorById, updateInstructor, deleteInstructor } = useInstructors();

  const instructor = id ? getInstructorById(id) : undefined;

  // Local state for modals & toasts
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  if (!instructor) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Instructor Profile"
          description="Detailed record view of instructor credentials and assignment."
          breadcrumbs={['Admin', 'Instructors', 'Profile']}
        />
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 text-amber-500" />}
          title="Instructor not found"
          description="The requested instructor record does not exist or may have been deleted from the directory."
          action={
            <Link to="/admin/instructors">
              <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Instructors
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleSaveEdit = (updatedData: InstructorRecord) => {
    updateInstructor(updatedData);
    showToast('Instructor updated successfully.', 'success');
  };

  const handleDeleteConfirm = () => {
    deleteInstructor(instructor.id);
    setIsDeleteModalOpen(false);
    navigate('/admin/instructors', {
      state: { deletedMessage: `Instructor '${instructor.fullName}' deleted successfully.` },
    });
  };

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
        title={instructor.fullName}
        description={`Instructor ID: ${instructor.instructorId} • ${instructor.department}`}
        breadcrumbs={['Admin', 'Instructors', instructor.fullName]}
        action={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link to="/admin/instructors">
              <Button
                variant="secondary"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Instructors
              </Button>
            </Link>
            <Button
              variant="secondary"
              icon={<Edit2 className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Instructor
            </Button>
            <Button
              variant="destructive"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Instructor
            </Button>
          </div>
        }
      />

      {/* Profile Header Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0 border border-blue-200">
            {instructor.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{instructor.fullName}</h1>
              <Badge status={instructor.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{instructor.instructorId}</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 space-y-1 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 w-full sm:w-auto">
          <p className="font-semibold text-slate-700">{instructor.department}</p>
          <p>{instructor.specialization}</p>
        </div>
      </div>

      {/* 2. Main Content Grid (Responsive 2-Column Desktop, 1-Column Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information Card */}
        <Card title="Basic Information" description="Contact details and primary identification">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Full Name
              </dt>
              <dd className="font-bold text-slate-900">{instructor.fullName}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                Instructor ID
              </dt>
              <dd className="font-mono text-slate-900 font-semibold">{instructor.instructorId}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </dt>
              <dd className="font-mono text-slate-900 break-all">{instructor.email}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number
              </dt>
              <dd className="text-slate-900">{instructor.phone || 'Not provided'}</dd>
            </div>
          </dl>
        </Card>

        {/* Professional Information Card */}
        <Card title="Professional Information" description="Departmental assignment and domain specialization">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Department
              </dt>
              <dd className="font-semibold text-slate-900">{instructor.department}</dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                Status
              </dt>
              <dd className="pt-0.5">
                <Badge status={instructor.status} />
              </dd>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-md sm:col-span-2">
              <dt className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                Specialization
              </dt>
              <dd className="text-slate-900 font-medium">{instructor.specialization}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Edit Form Modal (Reused Component) */}
      <InstructorFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={instructor}
        existingInstructors={instructors}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Instructor"
        message={
          <>
            Are you sure you want to delete instructor{' '}
            <strong className="font-semibold text-slate-900">
              '{instructor.fullName}'
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
