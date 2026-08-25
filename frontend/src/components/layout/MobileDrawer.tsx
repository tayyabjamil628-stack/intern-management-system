import React from 'react';
import { X } from 'lucide-react';
import { NavItemType } from '../../types/navigation';
import { NavItem } from '../navigation/NavItem';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItemType[];
  portalTitle: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  navItems,
  portalTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 w-70 max-w-[80vw] bg-white shadow-xl flex flex-col z-50">
        {/* Drawer Header */}
        <div className="h-15 flex items-center justify-between px-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              IMS
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Intern Manager</h2>
              <p className="text-[11px] text-slate-500 font-medium">{portalTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Navigation Menu"
            className="w-11 h-11 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              label={item.label}
              path={item.path}
              iconName={item.iconName}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
          <p className="font-medium text-slate-700">Intern Management System</p>
          <p className="text-[11px] text-slate-400">Mobile Navigation Drawer</p>
        </div>
      </div>
    </div>
  );
};
