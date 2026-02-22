import React from 'react';
import { DashboardLayout } from 'src/layouts/dashboard';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout - wraps DashboardLayout from Material Kit React template
 * Provides the full sidebar + header + main content layout
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};
