import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  action,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}) => {
  const hasHeader = Boolean(title || description || action);

  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden ${className}`}
    >
      {hasHeader && (
        <div
          className={`p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${headerClassName}`}
        >
          <div>
            {title && (
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`p-4 sm:p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
