import React from 'react';
import { useSEO } from '../utils/seo';

export const Contact: React.FC = () => {
  useSEO({ 
    title: "Kontak", 
    description: "Hubungi BEM FST UNISA untuk kolaborasi, pertanyaan, atau saran. Kami selalu terbuka untuk mendengarkan masukan dari Anda.",
    type: 'website',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-black min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Let's Connect</h1>
            <p className="text-slate-600 dark:text-slate-400 text-xl max-w-xl mx-auto">Kami selalu terbuka untuk kolaborasi, kritik, dan saran yang membangun.</p>
        </div>

        <div className="bg-slate-50 dark:bg-dark-surface p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
           <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nama Lengkap</label>
                    <input type="text" className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-slate-900 dark:text-white focus:border-primary-600 focus:outline-none transition-colors" placeholder="John Doe" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
                    <input type="email" className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-slate-900 dark:text-white focus:border-primary-600 focus:outline-none transition-colors" placeholder="hello@example.com" />
                 </div>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Pesan</label>
                  <textarea rows={4} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-3 text-slate-900 dark:text-white focus:border-primary-600 focus:outline-none transition-colors resize-none" placeholder="Tulis pesan anda..."></textarea>
              </div>
              <div className="pt-4">
                 <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform">
                    Kirim Pesan
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};