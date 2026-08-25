import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MobileDrawer } from '../components/layout/MobileDrawer';
import { NavItemType } from '../types/navigation';

const internNavItems: NavItemType[] = [
  { label: 'Dashboard', path: '/intern', iconName: 'LayoutDashboard' },
  { label: 'My Projects', path: '/intern/projects', iconName: 'FolderKanban' },
  { label: 'My Attendance', path: '/intern/attendance', iconName: 'CalendarCheck' },
  { label: 'Messages & Chat', path: '/intern/messages', iconName: 'MessageSquare' },
  { label: 'My Profile', path: '/intern/profile', iconName: 'User' },
];

export const InternLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Desktop Sidebar */}
      <Sidebar navItems={internNavItems} portalTitle="Intern Portal" />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={internNavItems}
        portalTitle="Intern Portal"
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header portalTitle="Intern Portal" onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Content Outlet Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
