import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../services/api';
import { Post } from '../../types';
import { AdminLayout } from '../../components/AdminLayout';

export const AdminPosts: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'news' as 'news' | 'event',
    status: 'draft' as 'draft' | 'published',
    featured_image: null as File | null,
  });

  // Load posts
  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async (skipCache = false) => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const result = await api.getPosts(page, 10, skipCache);
      setPosts(result.data);
      setTotal(result.meta.total);
    } catch (error) {
      setError('Gagal memuat posts');
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus post ini?')) return;

    try {
      await api.deletePost(id);
      setPosts(posts.filter(p => p.id !== id));
      setError('');
      setSuccess('✓ Post berhasil dihapus');
      // Force fresh fetch to sync with backend
      setTimeout(() => loadPosts(true), 300);
    } catch (error) {
      setError('Gagal menghapus post');
      console.error('Failed to delete post:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Judul post wajib diisi');
      }
      if (formData.title.trim().length < 5) {
        throw new Error('Judul minimal 5 karakter');
      }
      if (!formData.content.trim()) {
        throw new Error('Konten post wajib diisi');
      }
      if (formData.content.trim().length < 10) {
        throw new Error('Konten minimal 10 karakter');
      }

      const payload = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        status: formData.status,
      };

      if (editingId) {
        // Update post
        await api.updatePost(
          editingId,
          payload,
          formData.featured_image || undefined
        );
        setSuccess('✓ Post berhasil diperbarui!');
      } else {
        // Create post
        await api.createPost(
          payload,
          formData.featured_image || undefined
        );
        setSuccess('✓ Post berhasil dibuat!');
      }

      // Close form and clear inputs
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: 'news',
        status: 'draft',
        featured_image: null,
      });

      // Force fresh fetch of posts list (bypass cache)
      await loadPosts(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan post';
      setError(message);
      console.error('Failed to save post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !posts.length) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kelola Posts</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Total {total} posts</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setError('');
              setSuccess('');
              setFormData({
                title: '',
                excerpt: '',
                content: '',
                category: 'news',
                status: 'draft',
                featured_image: null,
              });
            }}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
          >
            {showForm ? '✕ Tutup Form' : '+ Tambah Post Baru'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              {editingId ? 'Edit Post' : 'Post Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Judul * <span className="text-xs text-slate-500">(min 5 karakter)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Judul post"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={submitting}
                  >
                    <option value="news">📰 Berita</option>
                    <option value="event">🎉 Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={submitting}
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="published">✓ Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Featured Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.files ? e.target.files[0] : null })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={submitting}
                  />
                  {formData.featured_image && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.featured_image.name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Excerpt (Ringkasan)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Ringkasan singkat post"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Konten * <span className="text-xs text-slate-500">(min 10 karakter)</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  rows={10}
                  placeholder="Konten post (HTML diizinkan)"
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {submitting ? '⏳ Menyimpan...' : editingId ? '💾 Update Post' : '✓ Buat Post'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setError('');
                    setSuccess('');
                  }}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">Tidak ada posts</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-primary-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{post.title}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          post.category === 'Berita'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        }`}
                      >
                        {post.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">{post.excerpt}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      📅 {new Date(post.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingId(post.id);
                        setFormData({
                          title: post.title,
                          excerpt: post.excerpt,
                          content: post.content,
                          category: post.category === 'Berita' ? 'news' : 'event',
                          status: post.category === 'Berita' ? 'draft' : 'published', // Load from actual post state
                          featured_image: null,
                        });
                        setShowForm(true);
                        setError('');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      disabled={submitting}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      disabled={submitting}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {total > 10 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50"
            >
              ← Sebelumnya
            </button>
            <span className="px-4 py-2 text-slate-600 dark:text-slate-400">
              Halaman {page} dari {Math.ceil(total / 10)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 10)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50"
            >
              Selanjutnya →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
