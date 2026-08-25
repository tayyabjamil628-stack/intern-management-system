import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  helperText?: string;
  trendText?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

const trendStyles = {
  positive: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  negative: 'text-red-700 bg-red-50 border-red-200',
  neutral: 'text-slate-700 bg-slate-100 border-slate-200',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  helperText,
  trendText,
  trendType = 'neutral',
  className = '',
}) => {
  return (
    <div
      className={`p-5 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {trendText && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${trendStyles[trendType]}`}
          >
            {trendText}
          </span>
        )}
      </div>

      {helperText && <p className="text-xs text-slate-500 mt-2 leading-tight">{helperText}</p>}
    </div>
  );
};
