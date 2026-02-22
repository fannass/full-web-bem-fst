import React from 'react';
import { Link } from 'react-router-dom';
import { OrganizationProfile } from '../types';

interface FooterProps {
  organization: OrganizationProfile | null;
}

export const Footer: React.FC<FooterProps> = ({ organization }) => {
  return (
    <footer className="bg-white dark:bg-black border-t border-slate-200 dark:border-white/10 pt-20 pb-10">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          <div className="md:col-span-2">
            <Link to="/" className="inline-block font-bold text-2xl tracking-tighter text-slate-900 dark:text-white mb-6">
              BEM FST UNISA.
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-sm mb-8">
              Mewujudkan mahasiswa yang inovatif, progresif, dan berlandaskan nilai Islam berkemajuan.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Navigasi</h4>
            <ul className="space-y-4">
              {['Beranda', 'Tentang', 'Kabinet', 'Berita', 'Kontak'].map((item, idx) => (
                <li key={idx}>
                  <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-slate-900 dark:text-white mb-6">Connect</h4>
             <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors">Instagram</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors">Youtube</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-400 transition-colors">Twitter</a></li>
             </ul>
          </div>
          
        </div>

        <div className="border-t border-slate-100 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} BEM FST UNISA. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <span>Sleman, Yogyakarta</span>
          </div>
        </div>
      </div>
    </footer>
  );
};