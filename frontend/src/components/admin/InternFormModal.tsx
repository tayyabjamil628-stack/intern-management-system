import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Alert } from '../feedback/Alert';
import { Intern, InternCreate, InternUpdate, InternStatus } from '../../types/intern';
import { Department } from '../../types/department';
import { ApiError } from '../../types/api';

export interface InternFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InternCreate | InternUpdate) => Promise<void>;
  initialData?: Intern | null;
  departments: Department[];
}

interface FormState {
  intern_id: string;
  full_name: string;
  email: string;
  phone: string;
  department_id: string;
  role: string;
  university: string;
  start_date: string;
  end_date: string;
  status: InternStatus;
}

interface FormErrors {
  intern_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  department_id?: string;
  role?: string;
  university?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export const InternFormModal: React.FC<InternFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  departments,
}) => {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState<FormState>({
    intern_id: '',
    full_name: '',
    email: '',
    phone: '',
    department_id: '',
    role: '',
    university: '',
    start_date: '',
    end_date: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form state when initialData changes or modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        intern_id: initialData.intern_id || '',
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department_id: initialData.department_id ? String(initialData.department_id) : '',
        role: initialData.role || '',
        university: initialData.university || '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        status: initialData.status || 'ACTIVE',
      });
    } else {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const defaultDeptId = departments.length > 0 ? String(departments[0].id) : '';
      const today = new Date().toISOString().split('T')[0];

      setFormData({
        intern_id: `INT-2026-${randomSuffix}`,
        full_name: '',
        email: '',
        phone: '',
        department_id: defaultDeptId,
        role: '',
        university: '',
        start_date: today,
        end_date: '',
        status: 'ACTIVE',
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen, departments]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (departments.length === 0) {
      setServerError('No departments available. Please add at least one department first.');
      return false;
    }

    const trimmedInternId = formData.intern_id.trim();
    if (!trimmedInternId) {
      newErrors.intern_id = 'Intern ID is required.';
    } else if (trimmedInternId.length > 50) {
      newErrors.intern_id = 'Intern ID cannot exceed 50 characters.';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full Name is required.';
    } else if (formData.full_name.trim().length > 150) {
      newErrors.full_name = 'Full Name cannot exceed 150 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Department selection is required.';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required.';
    } else if (formData.role.trim().length > 100) {
      newErrors.role = 'Role cannot exceed 100 characters.';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start Date is required.';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End Date is required.';
    } else if (
      formData.start_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      newErrors.end_date = 'End Date cannot be earlier than Start Date.';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError(null);

    // Clear field-specific error as user types
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
      const payload: InternCreate = {
        intern_id: formData.intern_id.trim(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        department_id: Number(formData.department_id),
        role: formData.role.trim(),
        university: formData.university.trim() || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
      };

      await onSave(payload);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          const msg = err.message.toLowerCase();
          if (msg.includes('intern_id') || msg.includes('intern id')) {
            setErrors((prev) => ({ ...prev, intern_id: err.message }));
          } else if (msg.includes('email')) {
            setErrors((prev) => ({ ...prev, email: err.message }));
          } else {
            setServerError(err.message);
          }
        } else if (err.status === 422) {
          setServerError(err.message || 'Validation failed. Please check form fields.');
        } else {
          setServerError(err.message);
        }
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOptions = departments.map((dept) => ({
    value: String(dept.id),
    label: dept.name,
  }));

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'TERMINATED', label: 'Terminated' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Intern' : 'Add Intern'}
      description={
        isEditMode
          ? 'Update the profile details, department, and internship status for this intern.'
          : 'Enter intern details to create a new profile in the directory.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && (
          <Alert
            type="error"
            title="Unable to save intern"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Responsive Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Intern ID"
            name="intern_id"
            value={formData.intern_id}
            onChange={handleChange}
            error={errors.intern_id}
            required
            placeholder="e.g. INT-2026-009"
            disabled={isSubmitting}
          />

          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            error={errors.full_name}
            required
            placeholder="e.g. Jane Doe"
            disabled={isSubmitting}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="jane.doe@example.com"
            disabled={isSubmitting}
          />

          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+1 (555) 000-0000"
            disabled={isSubmitting}
          />

          <Select
            label="Department"
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            options={departmentOptions}
            error={errors.department_id}
            required
            placeholder="Select Department"
            disabled={isSubmitting || departments.length === 0}
          />

          <Input
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
            required
            placeholder="e.g. Frontend Developer Intern"
            disabled={isSubmitting}
          />

          <Input
            label="University / Institution"
            name="university"
            value={formData.university}
            onChange={handleChange}
            error={errors.university}
            placeholder="e.g. Stanford University"
            disabled={isSubmitting}
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            error={errors.status}
            required
            disabled={isSubmitting}
          />

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
            label="End Date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            error={errors.end_date}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Modal Form Actions */}
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
            {isEditMode ? 'Save Changes' : 'Save Intern'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default InternFormModal;
