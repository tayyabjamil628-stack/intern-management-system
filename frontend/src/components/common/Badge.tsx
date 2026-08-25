import React from 'react';
import {
  CheckCircle2,
  Award,
  AlertOctagon,
  PlayCircle,
  Circle,
  PauseCircle,
  Check,
  X,
  Calendar,
} from 'lucide-react';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info';

export type IMSStatusType =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'PRESENT'
  | 'ABSENT'
  | 'LEAVE';

export interface BadgeProps {
  variant?: BadgeVariant;
  status?: IMSStatusType;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-sky-100 text-sky-800 border-sky-200',
};

interface StatusConfig {
  label: string;
  style: string;
  icon: React.ReactNode;
}

const statusConfigs: Record<IMSStatusType, StatusConfig> = {
  // Intern & Instructor Statuses
  ACTIVE: {
    label: 'Active',
    style: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />,
  },
  INACTIVE: {
    label: 'Inactive',
    style: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <PauseCircle className="w-3.5 h-3.5 shrink-0" />,
  },
  COMPLETED: {
    label: 'Completed',
    style: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: <Award className="w-3.5 h-3.5 shrink-0" />,
  },
  TERMINATED: {
    label: 'Terminated',
    style: 'bg-red-100 text-red-800 border-red-200',
    icon: <AlertOctagon className="w-3.5 h-3.5 shrink-0" />,
  },

  // Project Statuses
  NOT_STARTED: {
    label: 'Not Started',
    style: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <Circle className="w-3.5 h-3.5 shrink-0" />,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    style: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: <PlayCircle className="w-3.5 h-3.5 shrink-0" />,
  },
  ON_HOLD: {
    label: 'On Hold',
    style: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <PauseCircle className="w-3.5 h-3.5 shrink-0" />,
  },

  // Attendance Statuses
  PRESENT: {
    label: 'Present',
    style: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: <Check className="w-3.5 h-3.5 shrink-0" />,
  },
  ABSENT: {
    label: 'Absent',
    style: 'bg-red-100 text-red-800 border-red-200',
    icon: <X className="w-3.5 h-3.5 shrink-0" />,
  },
  LEAVE: {
    label: 'Leave',
    style: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <Calendar className="w-3.5 h-3.5 shrink-0" />,
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  status,
  children,
  className = '',
}) => {
  if (status && statusConfigs[status]) {
    const config = statusConfigs[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.style} ${className}`}
      >
        {config.icon}
        <span>{children || config.label}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        variantStyles[variant]
      } ${className}`}
    >
      {children}
    </span>
  );
};
