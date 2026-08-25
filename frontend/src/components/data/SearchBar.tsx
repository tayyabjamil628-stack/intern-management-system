import React, { useId } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  label?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search records...',
  onClear,
  label = 'Search',
  className = '',
}) => {
  const generatedId = useId();

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <div className={`relative flex items-center w-full max-w-sm ${className}`}>
      <label htmlFor={generatedId} className="sr-only">
        {label}
      </label>
      <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
        <Search className="w-4 h-4" />
      </div>
      <input
        id={generatedId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[44px] pl-10 pr-10 text-sm bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 rounded-md text-slate-900 placeholder:text-slate-400 transition-colors duration-150 outline-none focus:ring-2 focus:ring-blue-600/20"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search text"
          className="absolute right-1 w-9 h-9 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
