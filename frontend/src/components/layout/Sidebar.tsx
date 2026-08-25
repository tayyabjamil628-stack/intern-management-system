import React from 'react';
import { NavItemType } from '../../types/navigation';
import { NavItem } from '../navigation/NavItem';

interface SidebarProps {
  navItems: NavItemType[];
  portalTitle: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, portalTitle }) => {
  return (
    <aside
      className="hidden md:flex flex-col w-60 border-r border-slate-200 bg-white shrink-0 min-h-screen"
      aria-label="Main Navigation"
    >
      {/* Brand Logo Header */}
      <div className="h-15 flex items-center px-6 border-b border-slate-200 gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
          IMS
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">Intern Manager</h1>
          <p className="text-[11px] text-slate-500 font-medium">{portalTitle}</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Navigation
        </div>
        {navItems.map((item) => (
          <NavItem key={item.path} label={item.label} path={item.path} iconName={item.iconName} />
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
        <p className="font-medium text-slate-700">Intern Management System</p>
        <p className="text-[11px] text-slate-400">v1.0.0 • Phase 3B</p>
      </div>
    </aside>
  );
};
