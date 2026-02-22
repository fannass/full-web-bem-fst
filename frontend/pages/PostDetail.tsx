import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Post } from '../types';
import { Skeleton } from '../components/Skeleton';
import { formatDate } from '../utils/format';
import { useSEO } from '../utils/seo';

export const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useSEO({ 
    title: post ? (post.meta_title || post.title) : "Memuat...", 
    description: post ? (post.meta_description || post.excerpt) : "Baca artikel berita dan event dari BEM FST UNISA",
    imageUrl: post ? (post.og_image || post.image_url) : undefined,
    url: typeof window !== 'undefined' ? window.location.href : '',
    type: 'article',
    author: post ? post.author : 'BEM FST UNISA',
    publishedDate: post ? new Date(post.created_at).toISOString() : undefined,
  });

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await api.getPostBySlug(slug);
        setPost(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-3xl min-h-screen">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-slate-50 dark:bg-dark-bg">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Artikel tidak ditemukan</h1>
        <Link to="/posts" className="text-primary-600 dark:text-primary-400 hover:underline">Kembali ke Berita</Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-bg pt-32 pb-20 min-h-screen transition-colors duration-300">
      <article className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
            <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-xs border border-primary-100 dark:border-primary-800">
              {post.category}
            </span>
            <span>&bull;</span>
            <time>{formatDate(post.created_at)}</time>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-8">
            {post.title}
          </h1>
          <div className="relative h-64 md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
             <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover"
             />
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg prose-slate dark:prose-invert mx-auto max-w-none">
          {/* We inject the HTML but in a real app sanitization is needed */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-sm">Penulis</span>
            <p className="font-bold text-slate-900 dark:text-white">{post.author}</p>
          </div>
          <Link 
            to="/posts" 
            className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            &larr; Kembali
          </Link>
        </div>
      </article>
    </div>
  );
};