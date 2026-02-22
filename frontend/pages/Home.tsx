import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import { PostCardSkeleton } from '../components/Skeleton';
import { api } from '../services/api';
import { OrganizationProfile, Post } from '../types';
import { useSEO } from '../utils/seo';

// Aesthetic Icons
const ArrowUpRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>;

export const Home: React.FC = () => {
  useSEO({ 
    title: "Home", 
    description: "Website resmi BEM FST UNISA - Badan Eksekutif Mahasiswa Fakultas Sains dan Teknologi Universitas Sanata Dharma. Temukan informasi organisasi, kegiatan, dan berita mahasiswa.",
    type: 'website',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  const [org, setOrg] = useState<OrganizationProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgData, postsData] = await Promise.all([
          api.getOrganization(),
          api.getPosts(1, 3) 
        ]);
        setOrg(orgData);
        setPosts(postsData.data);
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Split cabinet name for styling (e.g. "Kabinet Loyalist Spectra" -> "Loyalist" + "Spectra")
  const getCabinetNameParts = () => {
    if (!org?.cabinet_name) return { main: "Inovasi", sub: "Progresif" };
    const parts = org.cabinet_name.replace("Kabinet ", "").split(" ");
    if (parts.length >= 2) {
      return { main: parts[0], sub: parts.slice(1).join(" ") };
    }
    return { main: parts[0] || "Inovasi", sub: "" };
  };

  const { main, sub } = getCabinetNameParts();

  const marqueeWords = ["LOYALIST", "SPECTRA", "INKLUSIF", "KADERISASI", "INOVASI", "INTEGRITAS"];

  return (
    <div className="min-h-screen">
      
      {/* BENTO GRID HERO SECTION */}
      <section className="pt-32 pb-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
            
            {/* Box 1: Main Title (Span 2 cols, 2 rows) */}
            <div className="md:col-span-2 md:row-span-2 bg-slate-100 dark:bg-dark-surface rounded-3xl p-8 sm:p-12 relative overflow-hidden group border border-slate-200 dark:border-white/5 flex flex-col justify-between">
              <div className="relative z-10 animate-fade-up">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                  Periode {org?.period_years || '2025/2026'}
                </span>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 dark:text-white leading-[0.95] tracking-tighter mb-6">
                  {main} <br/>
                  <span className="text-slate-400 dark:text-slate-600">{sub}.</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed capitalize">
                  {org?.tagline || org?.description}
                </p>
              </div>

              <div className="relative z-10 mt-8 flex gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                 <Link to="/about" className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
                    Tentang Kami <ArrowUpRight />
                 </Link>
                 <Link to="/cabinet" className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-full font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                    Lihat Kabinet
                 </Link>
              </div>

              {/* Decorative Abstract blobs */}
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-tr from-primary-200 to-indigo-200 dark:from-primary-900/40 dark:to-indigo-900/40 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
            </div>

            {/* Box 2: Visual/Image (Top Right) */}
            <div className="md:col-span-1 bg-slate-900 dark:bg-black rounded-3xl relative overflow-hidden group border border-slate-200 dark:border-white/5 min-h-[250px]">
               <img 
                 src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop" 
                 alt="Students" 
                 className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                 <h3 className="text-white font-bold text-xl leading-tight">Membangun Sinergi</h3>
               </div>
            </div>

            {/* Box 3: Stats/Data (Bottom Right) */}
            <div className="md:col-span-1 bg-white dark:bg-dark-surface rounded-3xl p-6 border border-slate-200 dark:border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tighter">7+</div>
                   <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Departemen</div>
                </div>
                <div className="absolute inset-0 bg-slate-50 dark:bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            </div>

          </div>
        </div>
      </section>

      {/* MARQUEE RUNNING TEXT */}
      <div className="py-12 overflow-hidden bg-white dark:bg-black border-y border-slate-100 dark:border-white/5">
         {/* Container for the infinite scroll */}
         <div className="flex w-max animate-marquee">
            {/* We repeat the content twice to create the infinite loop effect */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-16 px-8 items-center">
                 {marqueeWords.map((word) => (
                    <span key={word} className="text-6xl md:text-8xl font-black text-slate-200 dark:text-[#1a1a1a] uppercase tracking-tighter whitespace-nowrap select-none">
                      {word}
                    </span>
                 ))}
              </div>
            ))}
         </div>
      </div>

      {/* LATEST POSTS - MASONRY STYLE */}
      <section className="py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
             <div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Berita Terkini</h2>
                <div className="h-1 w-20 bg-primary-600"></div>
             </div>
             <Link to="/posts" className="text-sm font-bold uppercase tracking-widest border-b border-slate-300 dark:border-slate-700 pb-1 hover:border-black dark:hover:border-white transition-colors">
                Lihat Semua Arsip
             </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                <>
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </>
              ) : (
                posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
           </div>
        </div>
      </section>

    </div>
  );
};