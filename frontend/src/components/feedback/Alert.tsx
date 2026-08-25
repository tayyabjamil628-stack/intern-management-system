import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  message: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const alertStyles: Record<AlertType, { container: string; icon: React.ReactNode }> = {
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
  },
  info: {
    container: 'bg-sky-50 border-sky-200 text-sky-900',
    icon: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
  },
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const { container, icon } = alertStyles[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 border rounded-md text-sm leading-relaxed ${container} ${className}`}
    >
      {icon}
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-bold text-sm mb-0.5 tracking-tight">{title}</h3>}
        <div className="text-xs sm:text-sm">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss alert"
          className="w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
