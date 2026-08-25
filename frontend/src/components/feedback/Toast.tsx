import React from 'react';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type?: ToastType;
  message: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const toastConfig: Record<ToastType, { style: string; icon: React.ReactNode }> = {
  success: {
    style: 'bg-white border-emerald-300 text-slate-900 shadow-md',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
  },
  error: {
    style: 'bg-white border-red-300 text-slate-900 shadow-md',
    icon: <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />,
  },
  warning: {
    style: 'bg-white border-amber-300 text-slate-900 shadow-md',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
  },
  info: {
    style: 'bg-white border-sky-300 text-slate-900 shadow-md',
    icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  },
};

export const Toast: React.FC<ToastProps> = ({
  type = 'success',
  message,
  title,
  onClose,
  className = '',
}) => {
  const { style, icon } = toastConfig[type];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`flex items-center gap-3 px-4 py-3 border rounded-lg max-w-md w-full transition-all duration-200 ${style} ${className}`}
    >
      {icon}
      <div className="flex-1 min-w-0">
        {title && <p className="text-xs font-bold text-slate-900">{title}</p>}
        <p className="text-xs text-slate-700 font-medium leading-snug">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="w-9 h-9 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
