import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  CalendarCheck,
  User,
  GraduationCap,
  MessageSquare,
  Send,
  Radio,
  Megaphone,
  LucideIcon,
} from 'lucide-react';

interface NavItemProps {
  label: string;
  path: string;
  iconName: string;
  onClick?: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  FolderKanban,
  CalendarCheck,
  User,
  MessageSquare,
  Send,
  Radio,
  Megaphone,
};

export const NavItem: React.FC<NavItemProps> = ({ label, path, iconName, onClick }) => {
  const IconComponent = iconMap[iconName] || LayoutDashboard;

  return (
    <NavLink
      to={path}
      end={path === '/admin' || path === '/intern'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-md text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
          isActive
            ? 'bg-blue-50 text-blue-600 font-semibold border-l-3 border-blue-600'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
        }`
      }
    >
      <IconComponent className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
};
