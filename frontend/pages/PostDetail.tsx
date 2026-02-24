import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
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
    title: post ? (post.meta_title || post.title) : 'Memuat Artikel...', 
    description: post ? (post.meta_description || post.excerpt) : 'Baca artikel berita dan event dari BEM FST UNISA',
    imageUrl: post ? (post.og_image || post.image_url) : undefined,
    imageAlt: post ? post.title : undefined,
    url: typeof window !== 'undefined' ? window.location.href : '',
    canonicalUrl: post?.canonical_url || undefined,
    type: 'article',
    author: post ? post.author : 'BEM FST UNISA',
    publishedDate: post ? new Date(post.created_at).toISOString() : undefined,
    keywords: post ? `${post.category}, berita mahasiswa, BEM FST` : undefined,
    section: post ? post.category : undefined,
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
        <div className="post-content">
          <style>{`
            .post-content { line-height: 1.8; font-size: 1.0625rem; color: inherit; }
            .post-content h1 { font-size: 1.875rem; font-weight: 800; margin: 1.75rem 0 0.75rem; line-height: 1.2; }
            .post-content h2 { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.75rem; line-height: 1.3; }
            .post-content h3 { font-size: 1.25rem; font-weight: 700; margin: 1.25rem 0 0.5rem; line-height: 1.4; }
            .post-content p { margin: 0.875rem 0; }
            .post-content ul { list-style-type: disc; padding-left: 1.75rem; margin: 0.875rem 0; }
            .post-content ol { list-style-type: decimal; padding-left: 1.75rem; margin: 0.875rem 0; }
            .post-content li { margin: 0.35rem 0; padding-left: 0.25rem; }
            .post-content li > ul { list-style-type: circle; margin: 0.25rem 0; }
            .post-content li > ol { margin: 0.25rem 0; }
            .post-content strong, .post-content b { font-weight: 700; }
            .post-content em, .post-content i { font-style: italic; }
            .post-content u { text-decoration: underline; }
            .post-content s { text-decoration: line-through; }
            .post-content a { color: #2563eb; text-decoration: underline; }
            .post-content a:hover { color: #1d4ed8; }
            .post-content blockquote { border-left: 4px solid #60a5fa; padding: 0.5rem 1rem; margin: 1rem 0; color: #6b7280; font-style: italic; background: rgba(96,165,250,0.07); border-radius: 0 0.5rem 0.5rem 0; }
            .post-content code { background: #f1f5f9; color: #0f172a; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; font-family: monospace; }
            .post-content pre { background: #0f172a; color: #e2e8f0; padding: 1rem 1.25rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; font-size: 0.9rem; }
            .post-content pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
            .post-content hr { border: none; border-top: 2px solid #e2e8f0; margin: 2rem 0; }
            .post-content img { border-radius: 0.75rem; box-shadow: 0 4px 16px rgba(0,0,0,0.12); max-width: 100%; height: auto; margin: 1rem auto; display: block; }
            .post-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.95rem; }
            .post-content th, .post-content td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
            .post-content th { background: #f8fafc; font-weight: 700; }
            @media (prefers-color-scheme: dark) {
              .post-content a { color: #60a5fa; }
              .post-content code { background: #1e293b; color: #e2e8f0; }
              .post-content blockquote { color: #94a3b8; background: rgba(96,165,250,0.05); }
              .post-content hr { border-color: #334155; }
              .post-content th { background: #1e293b; }
              .post-content th, .post-content td { border-color: #334155; }
            }
          `}</style>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, {
            ALLOWED_TAGS: ['p','br','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','s',
              'ul','ol','li','a','blockquote','code','pre','hr','img','table','thead','tbody','tr','th','td'],
            ALLOWED_ATTR: ['href','src','alt','title','class','target','rel','width','height'],
            FORBID_TAGS: ['script','iframe','object','embed','form','input','button','style'],
            FORBID_ATTR: ['onerror','onload','onclick','onmouseover','onfocus','onblur','onchange','onsubmit'],
          }) }} />
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