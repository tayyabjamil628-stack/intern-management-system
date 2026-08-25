import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { InternLayout } from '../layouts/InternLayout';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { InternsListPage } from '../pages/admin/InternsListPage';
import { InternDetailPage } from '../pages/admin/InternDetailPage';
import { InstructorsListPage } from '../pages/admin/InstructorsListPage';
import { InstructorDetailPage } from '../pages/admin/InstructorDetailPage';
import { DepartmentsPage } from '../pages/admin/DepartmentsPage';
import { ProjectsListPage } from '../pages/admin/ProjectsListPage';
import { ProjectDetailPage } from '../pages/admin/ProjectDetailPage';
import { AttendancePage } from '../pages/admin/AttendancePage';
import { CommunicationsPage } from '../pages/admin/CommunicationsPage';

// Intern Pages
import { InternDashboardPage } from '../pages/intern/InternDashboardPage';
import { MyProjectsPage } from '../pages/intern/MyProjectsPage';
import { MyAttendancePage } from '../pages/intern/MyAttendancePage';
import { MyMessagesPage } from '../pages/intern/MyMessagesPage';
import { MyProfilePage } from '../pages/intern/MyProfilePage';

// Fallback Pages
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Path Redirect */}
      <Route path="/" element={<HomePage />} />

      {/* Admin Portal Layout Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="interns" element={<InternsListPage />} />
        <Route path="interns/:id" element={<InternDetailPage />} />
        <Route path="instructors" element={<InstructorsListPage />} />
        <Route path="instructors/:id" element={<InstructorDetailPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="projects" element={<ProjectsListPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="communications" element={<CommunicationsPage />} />
      </Route>

      {/* Intern Portal Layout Routes */}
      <Route path="/intern" element={<InternLayout />}>
        <Route index element={<InternDashboardPage />} />
        <Route path="projects" element={<MyProjectsPage />} />
        <Route path="attendance" element={<MyAttendancePage />} />
        <Route path="messages" element={<MyMessagesPage />} />
        <Route path="profile" element={<MyProfilePage />} />
      </Route>

      {/* 404 Fallback Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
