import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { IMSStatusType } from '../common/Badge';
import { InstructorRecord } from '../../data/mockInstructorsData';
import { mockDepartmentsList } from '../../data/mockDepartmentsData';

export interface InstructorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (instructor: InstructorRecord) => void;
  initialData?: InstructorRecord | null;
  existingInstructors: InstructorRecord[];
}

interface FormState {
  instructorId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  status: IMSStatusType;
}

interface FormErrors {
  instructorId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  department?: string;
  specialization?: string;
  status?: string;
}

export const InstructorFormModal: React.FC<InstructorFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingInstructors,
}) => {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState<FormState>({
    instructorId: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        instructorId: initialData.instructorId || '',
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || '',
        specialization: initialData.specialization || '',
        status: initialData.status || 'ACTIVE',
      });
    } else {
      setFormData({
        instructorId: `INS-2026-${String(existingInstructors.length + 1).padStart(3, '0')}`,
        fullName: '',
        email: '',
        phone: '',
        department: mockDepartmentsList[0]?.name || '',
        specialization: '',
        status: 'ACTIVE',
      });
    }
    setErrors({});
  }, [initialData, isOpen, existingInstructors]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Instructor ID
    if (!formData.instructorId.trim()) {
      newErrors.instructorId = 'Instructor ID is required.';
    } else {
      const isDuplicate = existingInstructors.some((inst) => {
        if (isEditMode && initialData && inst.id === initialData.id) {
          return false;
        }
        return inst.instructorId.toLowerCase().trim() === formData.instructorId.toLowerCase().trim();
      });

      if (isDuplicate) {
        newErrors.instructorId = 'Instructor ID must be unique.';
      }
    }

    // Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    // Department
    if (!formData.department.trim()) {
      newErrors.department = 'Department selection is required.';
    }

    // Specialization
    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required.';
    }

    // Status
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

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const record: InstructorRecord = {
        id: initialData?.id || `inst-${Date.now()}`,
        instructorId: formData.instructorId.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || '+1 (555) 000-0000',
        department: formData.department.trim(),
        specialization: formData.specialization.trim(),
        status: formData.status,
      };

      onSave(record);
      setIsSubmitting(false);
      onClose();
    }, 150);
  };

  const departmentOptions = [
    { value: '', label: 'Select Department' },
    ...mockDepartmentsList.map((dept) => ({
      value: dept.name,
      label: dept.name,
    })),
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'INACTIVE', label: 'INACTIVE' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Instructor' : 'Add Instructor'}
      description={
        isEditMode
          ? 'Update instructor details, assigned department, or active status.'
          : 'Enter instructor credentials, contact details, and assigned department.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Row 1: ID & Full Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Instructor ID"
            name="instructorId"
            value={formData.instructorId}
            onChange={handleChange}
            error={errors.instructorId}
            placeholder="e.g. INS-2026-007"
            required
          />

          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="e.g. Dr. Alex Mercer"
            required
          />
        </div>

        {/* Row 2: Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="e.g. alex.mercer@company.com"
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="e.g. +1 (555) 123-4567"
          />
        </div>

        {/* Row 3: Department & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            options={departmentOptions}
            error={errors.department}
            required
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            error={errors.status}
            required
          />
        </div>

        {/* Row 4: Specialization */}
        <Input
          label="Specialization"
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          error={errors.specialization}
          placeholder="e.g. Cloud Infrastructure & DevOps"
          required
        />

        {/* Action Buttons */}
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
            Save Instructor
          </Button>
        </div>
      </form>
    </Modal>
  );
};
