import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading data...',
  size = 'md',
  fullPage = false,
  className = '',
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 text-slate-600 ${className}`}>
      <Loader2 className={`${sizeConfig[size]} text-blue-600 animate-spin shrink-0`} aria-hidden="true" />
      {label && <p className="text-xs font-medium text-slate-600">{label}</p>}
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[300px] w-full flex items-center justify-center bg-white/50 rounded-lg">
        {content}
      </div>
    );
  }

  return content;
};
