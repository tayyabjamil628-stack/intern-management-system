import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Alert } from '../feedback/Alert';
import { Project, ProjectCreate, ProjectUpdate, ProjectStatus } from '../../types/project';
import { Intern } from '../../types/intern';
import { ApiError } from '../../types/api';

export interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectCreate | ProjectUpdate) => Promise<void>;
  initialData?: Project | null;
  internsList: Intern[];
}

interface FormState {
  name: string;
  description: string;
  intern_id: string;
  start_date: string;
  deadline: string;
  status: ProjectStatus;
  progress: number | string;
}

interface FormErrors {
  name?: string;
  intern_id?: string;
  start_date?: string;
  deadline?: string;
  status?: string;
  progress?: string;
  description?: string;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  internsList,
}) => {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    intern_id: '',
    start_date: '',
    deadline: '',
    status: 'NOT_STARTED',
    progress: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        intern_id: initialData.intern_id ? String(initialData.intern_id) : '',
        start_date: initialData.start_date || '',
        deadline: initialData.deadline || '',
        status: initialData.status || 'NOT_STARTED',
        progress: initialData.progress ?? 0,
      });
    } else {
      const defaultInternId = internsList.length > 0 ? String(internsList[0].id) : '';
      const today = new Date().toISOString().split('T')[0];

      setFormData({
        name: '',
        description: '',
        intern_id: defaultInternId,
        start_date: today,
        deadline: '',
        status: 'NOT_STARTED',
        progress: 0,
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen, internsList]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (internsList.length === 0) {
      setServerError('No interns available. Please add at least one intern before creating a project.');
      return false;
    }

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Project Name is required.';
    } else if (trimmedName.length > 150) {
      newErrors.name = 'Project Name cannot exceed 150 characters.';
    }

    if (!formData.intern_id) {
      newErrors.intern_id = 'Assigned Intern selection is required.';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start Date is required.';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required.';
    } else if (
      formData.start_date &&
      new Date(formData.deadline) < new Date(formData.start_date)
    ) {
      newErrors.deadline = 'Deadline cannot be earlier than Start Date.';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required.';
    }

    const progNum = Number(formData.progress);
    if (
      formData.progress === '' ||
      isNaN(progNum) ||
      progNum < 0 ||
      progNum > 100
    ) {
      newErrors.progress = 'Progress must be between 0 and 100.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Status -> Progress synchronization: If status becomes COMPLETED, auto-set progress to 100
      if (name === 'status' && value === 'COMPLETED') {
        updated.progress = 100;
      }

      return updated;
    });

    setServerError(null);

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const calculatedProgress =
        formData.status === 'COMPLETED' ? 100 : Number(formData.progress);

      const payload: ProjectCreate = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        intern_id: Number(formData.intern_id),
        start_date: formData.start_date,
        deadline: formData.deadline,
        status: formData.status,
        progress: calculatedProgress,
      };

      await onSave(payload);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setServerError(err.message || 'Selected intern was not found in the database.');
        } else if (err.status === 422) {
          setServerError(err.message || 'Validation failed. Please verify project information.');
        } else {
          setServerError(err.message);
        }
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred while saving the project.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const internSelectOptions = [
    { value: '', label: 'Select Assigned Intern' },
    ...internsList.map((i) => ({
      value: String(i.id),
      label: `${i.full_name} (${i.intern_id})`,
    })),
  ];

  const statusSelectOptions = [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ON_HOLD', label: 'On Hold' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Project' : 'Add Project'}
      description={
        isEditMode
          ? 'Update details, intern assignment, and milestone status for this project.'
          : 'Enter project details and assign deliverables to an intern.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && (
          <Alert
            type="error"
            title="Unable to save project"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Project Name */}
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="e.g. Portal Authentication Redesign"
          disabled={isSubmitting}
        />

        {/* Assigned Intern & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Assigned Intern"
            name="intern_id"
            value={formData.intern_id}
            onChange={handleChange}
            options={internSelectOptions}
            error={errors.intern_id}
            required
            disabled={isSubmitting || internsList.length === 0}
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusSelectOptions}
            error={errors.status}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            error={errors.start_date}
            required
            disabled={isSubmitting}
          />

          <Input
            label="Deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            error={errors.deadline}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Progress % */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Progress (%)"
            name="progress"
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
            error={errors.progress}
            helperText="Enter progress percentage between 0 and 100 (auto-set to 100% on Completed)."
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Brief summary of project objectives, scope, and deliverables..."
          rows={3}
          disabled={isSubmitting}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Save Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectFormModal;
