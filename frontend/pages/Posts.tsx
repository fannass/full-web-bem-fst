import React, { useEffect, useState } from 'react';
import { PostCard } from '../components/PostCard';
import { PostCardSkeleton } from '../components/Skeleton';
import { api } from '../services/api';
import { Post, PaginationMeta } from '../types';
import { useSEO } from '../utils/seo';

export const Posts: React.FC = () => {
  useSEO({ 
    title: "Berita & Event", 
    description: "Arsip berita dan kegiatan mahasiswa FST UNISA. Temukan informasi terbaru tentang kegiatan dan event dari BEM FST UNISA.",
    type: 'website',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await api.getPosts(page, 6);
        setPosts(response.data);
        setMeta(response.meta);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page]);

  return (
    <div className="bg-slate-50 dark:bg-dark-bg min-h-screen pt-32 pb-20 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Berita & Kegiatan</h1>
          <p className="text-slate-600 dark:text-slate-400">Informasi terbaru seputar akademik, kemahasiswaan, dan event di lingkungan FST UNISA.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && meta && (
          <div className="mt-16 flex justify-center items-center space-x-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-6 py-2.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Sebelumnya
            </button>
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Halaman {meta.current_page} dari {meta.last_page}
            </span>
            <button
              disabled={page === meta.last_page}
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-2.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
};