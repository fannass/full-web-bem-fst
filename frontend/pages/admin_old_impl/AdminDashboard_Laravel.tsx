import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const [stats, setStats] = useState({ posts: 0, cabinet: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadStats();
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      const posts = await api.getPosts(1, 1);
      const cabinet = await api.getCabinet();
      setStats({
        posts: posts.meta.total,
        cabinet: cabinet.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Welcome!</h2>
      </div>

      {/* Stats Cards - Laravel Bootstrap Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Posts Card */}
        <div className="bg-white rounded-lg shadow border-l-4 border-l-blue-500">
          <div className="p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Posts</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">{stats.posts}</p>
              </div>
              <div className="text-5xl opacity-20">📝</div>
            </div>
          </div>
        </div>

        {/* Cabinet Card */}
        <div className="bg-white rounded-lg shadow border-l-4 border-l-green-500">
          <div className="p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Anggota Kabinet</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">{stats.cabinet}</p>
              </div>
              <div className="text-5xl opacity-20">👥</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Akses Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Posts Link */}
          <Link to="/admin/posts">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-t-4 border-t-blue-500 cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <span className="text-3xl mr-4">📝</span>
                  <div>
                    <p className="font-semibold text-slate-900">Kelola Posts</p>
                    <p className="text-sm text-slate-600">Berita dan Kegiatan</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Cabinet Link */}
          <Link to="/admin/cabinet">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-t-4 border-t-green-500 cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <span className="text-3xl mr-4">👥</span>
                  <div>
                    <p className="font-semibold text-slate-900">Kelola Kabinet</p>
                    <p className="text-sm text-slate-600">Anggota Organisasi</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};
