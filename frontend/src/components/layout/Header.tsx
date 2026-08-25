import React from 'react';
import { Menu, ArrowRightLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  portalTitle: string;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ portalTitle, onOpenMobileMenu }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="h-15 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between shrink-0">
      {/* Mobile Hamburger & Portal Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open Navigation Menu"
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {portalTitle}
          </span>
          <span className="sm:hidden text-sm font-bold text-slate-900">{portalTitle}</span>
        </div>
      </div>

      {/* Right Controls: Notification Bell & Portal Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <NotificationBell />

        <Link
          to={isAdmin ? '/intern' : '/admin'}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Switch to {isAdmin ? 'Intern Portal' : 'Admin Portal'}</span>
          <span className="sm:hidden">{isAdmin ? 'Intern' : 'Admin'}</span>
        </Link>
      </div>
    </header>
  );
};
