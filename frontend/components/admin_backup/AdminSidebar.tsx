import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAdminAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen bg-white border-r border-slate-200 shadow w-64 fixed left-0 top-0 overflow-y-auto flex flex-col">
      {/* Logo & Branding - Laravel Style */}
      <div className="p-4 border-b border-slate-200">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">📊 BEM Admin</h2>
          <p className="text-xs text-slate-500 mt-1">FST UNISA</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {/* Dashboard */}
        <Link
          to="/admin"
          className={`flex items-center px-4 py-3 mx-2 rounded-md transition-colors ${
            isActive('/admin')
              ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="mr-3 text-lg">🏠</span>
          <span className="font-medium">Dashboard</span>
        </Link>

        {/* Konten */}
        <div className="mt-4">
          <div className="px-4 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">📑 Konten</div>
          <Link
            to="/admin/posts"
            className={`flex items-center px-8 py-2 mx-2 rounded-md transition-colors ${
              isActive('/admin/posts')
                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="mr-2">📝</span>
            <span className="text-sm">Posts</span>
          </Link>
        </div>

        {/* Organisasi */}
        <div className="mt-4">
          <div className="px-4 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">👥 Organisasi</div>
          <Link
            to="/admin/cabinet"
            className={`flex items-center px-8 py-2 mx-2 rounded-md transition-colors ${
              isActive('/admin/cabinet')
                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="mr-2">👥</span>
            <span className="text-sm">Kabinet</span>
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};
