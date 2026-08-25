import React from 'react';

export interface DataCardField {
  label: string;
  value: React.ReactNode;
}

export interface DataCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
  fields?: DataCardField[];
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  status,
  fields,
  action,
  onClick,
  className = '',
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={() => isClickable && onClick!()}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick!();
        }
      }}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      className={`p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col gap-3 transition-colors duration-150 ${
        isClickable
          ? 'hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600'
          : ''
      } ${className}`}
    >
      {/* Header Area */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {status && <div className="shrink-0">{status}</div>}
      </div>

      {/* Key-Value Fields Grid */}
      {fields && fields.length > 0 && (
        <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-slate-100 text-xs">
          {fields.map((field, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {field.label}
              </span>
              <span className="font-semibold text-slate-800 truncate mt-0.5">{field.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      {action && <div className="flex items-center justify-end gap-2 pt-1">{action}</div>}
    </div>
  );
};
