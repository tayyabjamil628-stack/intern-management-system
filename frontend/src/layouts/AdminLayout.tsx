import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MobileDrawer } from '../components/layout/MobileDrawer';
import { NavItemType } from '../types/navigation';

const adminNavItems: NavItemType[] = [
  { label: 'Dashboard', path: '/admin', iconName: 'LayoutDashboard' },
  { label: 'Interns', path: '/admin/interns', iconName: 'Users' },
  { label: 'Instructors', path: '/admin/instructors', iconName: 'GraduationCap' },
  { label: 'Departments', path: '/admin/departments', iconName: 'Building2' },
  { label: 'Projects', path: '/admin/projects', iconName: 'FolderKanban' },
  { label: 'Attendance', path: '/admin/attendance', iconName: 'CalendarCheck' },
  { label: 'Communications & SMS', path: '/admin/communications', iconName: 'MessageSquare' },
];

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Desktop Sidebar */}
      <Sidebar navItems={adminNavItems} portalTitle="Admin Portal" />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={adminNavItems}
        portalTitle="Admin Portal"
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header portalTitle="Admin Portal" onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Content Outlet Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
