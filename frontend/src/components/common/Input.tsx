import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  disabled,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-700 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-600 font-bold" aria-label="required">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        className={`min-h-[44px] px-3.5 py-2.5 text-sm bg-white border rounded-md text-slate-900 placeholder:text-slate-400 transition-colors duration-150 outline-none ${
          error
            ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20'
            : 'border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
        } ${
          disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed opacity-60' : ''
        } ${className}`}
        {...props}
      />

      {error && (
        <p id={errorId} className="text-xs text-red-600 font-medium">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
