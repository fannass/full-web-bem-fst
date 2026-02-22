import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';

export const AdminDashboard: React.FC = () => {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState({ posts: 0, cabinet: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadStats();
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Welcome, {user?.username}! 👋</h1>
          <p className="text-slate-600 dark:text-slate-400">Kelola website BEM FST UNISA</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border-l-4 border-primary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase">Total Posts</p>
                <p className="text-5xl font-bold text-slate-900 dark:text-white mt-2">{loading ? '...' : stats.posts}</p>
              </div>
              <div className="text-6xl opacity-20">📝</div>
            </div>
            <Link
              to="/admin/posts"
              className="mt-6 inline-block text-primary-600 hover:text-primary-700 font-semibold"
            >
              Kelola Posts →
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase">Anggota Kabinet</p>
                <p className="text-5xl font-bold text-slate-900 dark:text-white mt-2">{loading ? '...' : stats.cabinet}</p>
              </div>
              <div className="text-6xl opacity-20">👥</div>
            </div>
            <Link
              to="/admin/cabinet"
              className="mt-6 inline-block text-blue-600 hover:text-blue-700 font-semibold"
            >
              Kelola Kabinet →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/admin/posts"
            className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="text-5xl mb-4">📰</div>
            <h3 className="text-2xl font-bold mb-2">Kelola Posts</h3>
            <p className="text-primary-100">Buat, edit, dan hapus posts</p>
          </Link>

          <Link
            to="/admin/cabinet"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold mb-2">Kelola Kabinet</h3>
            <p className="text-blue-100">Atur anggota dan departemen</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};
