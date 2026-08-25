import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { Alert } from '../feedback/Alert';
import { Attendance, AttendanceCreate, AttendanceUpdate, AttendanceStatus } from '../../types/attendance';
import { Intern } from '../../types/intern';
import { ApiError } from '../../types/api';

export interface AttendanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AttendanceCreate | AttendanceUpdate) => Promise<void>;
  initialData?: Attendance | null;
  defaultDate?: string;
  internsList: Intern[];
}

interface FormState {
  intern_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  remarks: string;
}

interface FormErrors {
  intern_id?: string;
  attendance_date?: string;
  status?: string;
  remarks?: string;
}

export const AttendanceFormModal: React.FC<AttendanceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDate,
  internsList,
}) => {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState<FormState>({
    intern_id: '',
    attendance_date: '',
    status: 'PRESENT',
    remarks: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        intern_id: initialData.intern_id ? String(initialData.intern_id) : '',
        attendance_date: initialData.attendance_date || '',
        status: initialData.status || 'PRESENT',
        remarks: initialData.remarks || '',
      });
    } else {
      const defaultInternId = internsList.length > 0 ? String(internsList[0].id) : '';
      const fallbackDate = defaultDate || new Date().toISOString().split('T')[0];

      setFormData({
        intern_id: defaultInternId,
        attendance_date: fallbackDate,
        status: 'PRESENT',
        remarks: '',
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialData, defaultDate, isOpen, internsList]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (internsList.length === 0) {
      setServerError('No interns available. Please add at least one intern before recording attendance.');
      return false;
    }

    if (!formData.intern_id) {
      newErrors.intern_id = 'Intern selection is required.';
    }

    if (!formData.attendance_date) {
      newErrors.attendance_date = 'Attendance Date is required.';
    }

    if (!formData.status) {
      newErrors.status = 'Attendance Status is required.';
    }

    if (formData.remarks && formData.remarks.length > 255) {
      newErrors.remarks = 'Remarks cannot exceed 255 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const payload: AttendanceCreate = {
        intern_id: Number(formData.intern_id),
        attendance_date: formData.attendance_date,
        status: formData.status,
        remarks: formData.remarks.trim() || null,
      };

      await onSave(payload);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setServerError(
            err.message || 'Attendance for this intern is already recorded for this date.'
          );
        } else if (err.status === 404) {
          setServerError(err.message || 'Selected intern was not found in the database.');
        } else if (err.status === 422) {
          setServerError(err.message || 'Validation failed. Please verify attendance details.');
        } else {
          setServerError(err.message);
        }
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred while saving attendance.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const internOptions = [
    { value: '', label: 'Select Intern' },
    ...internsList.map((i) => ({
      value: String(i.id),
      label: `${i.full_name} (${i.intern_id})`,
    })),
  ];

  const statusOptions = [
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'LEAVE', label: 'Leave' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Attendance' : 'Mark Attendance'}
      description={
        isEditMode
          ? 'Update attendance record status and supervisor remarks.'
          : 'Record daily attendance status for an intern.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && (
          <Alert
            type="error"
            title="Unable to save attendance"
            message={serverError}
            onClose={() => setServerError(null)}
          />
        )}

        {/* Intern Selection */}
        <Select
          label="Intern"
          name="intern_id"
          value={formData.intern_id}
          onChange={handleChange}
          options={internOptions}
          error={errors.intern_id}
          required
          disabled={isSubmitting || internsList.length === 0}
        />

        {/* Date & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            name="attendance_date"
            type="date"
            value={formData.attendance_date}
            onChange={handleChange}
            error={errors.attendance_date}
            required
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
        </div>

        {/* Remarks */}
        <Textarea
          label="Remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          error={errors.remarks}
          placeholder="Optional notes or reasons (e.g. On time, Medical leave approved...)"
          rows={3}
          disabled={isSubmitting}
        />

        {/* Form Action Buttons */}
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
            {isEditMode ? 'Update Attendance' : 'Save Attendance'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AttendanceFormModal;
