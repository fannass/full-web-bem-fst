import React from 'react';
import { api } from '../../services/api';
import { CabinetMember } from '../../types';
import { useState, useEffect } from 'react';

export const AdminCabinet: React.FC = () => {
  const [members, setMembers] = useState<CabinetMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const result = await api.getCabinet();
      setMembers(result);
    } catch (error) {
      console.error('Failed to load cabinet:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group members by department
  const departments = Array.from(new Set(members.map(m => m.department || 'Others')));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kelola Kabinet</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Total {members.length} anggota</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Department Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDept(null)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedDept === null
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
            }`}
          >
            Semua ({members.length})
          </button>
          {departments.map(dept => {
            const count = members.filter(m => (m.department || 'Others') === dept).length;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedDept === dept
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600'
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members
            .filter(m => selectedDept === null || (m.department || 'Others') === selectedDept)
            .map(member => (
              <div
                key={member.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600">
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold mb-2">
                    {member.position}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {member.department}
                  </p>
                  {member.bio && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {member.bio}
                    </p>
                  )}
                  <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {members.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">Tidak ada anggota kabinet</p>
          </div>
        )}
      </main>
    </div>
  );
};
