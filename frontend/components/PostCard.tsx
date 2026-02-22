import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { formatDate } from '../utils/format';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Link to={`/posts/${post.slug}`} className="group h-full flex flex-col bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
      
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-white/5">
        <img 
          src={post.image_url} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 z-10">
           <span className="bg-white/90 dark:bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full text-slate-900 dark:text-white shadow-sm">
            {post.category}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-3">
          <time className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {formatDate(post.created_at)}
          </time>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {post.title}
          </h3>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-6">
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider group-hover:gap-2 transition-all gap-1">
          <span>Baca Selengkapnya</span>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      </div>
    </Link>
  );
};