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
            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <img
                src="/assets/images/logo/logo_BEM.png"
                alt="Logo BEM FST"
                className="w-12 h-12 object-contain"
              />
              <span className="font-bold text-2xl tracking-tighter text-slate-900 dark:text-white">
                BEM FST UNISA.
              </span>
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
                {organization?.socials?.instagram && (
                  <li><a href={`https://instagram.com/${organization.socials.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-pink-600 transition-colors">Instagram</a></li>
                )}
                {organization?.socials?.youtube && (
                  <li><a href={organization.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors">YouTube</a></li>
                )}
                {organization?.socials?.twitter && (
                  <li><a href={`https://twitter.com/${organization.socials.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-colors">Twitter / X</a></li>
                )}
                {organization?.socials?.facebook && (
                  <li><a href={`https://facebook.com/${organization.socials.facebook.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">Facebook</a></li>
                )}
                {!organization?.socials?.instagram && !organization?.socials?.youtube && !organization?.socials?.twitter && !organization?.socials?.facebook && (
                  <li><span className="text-slate-400 text-sm italic">Belum dikonfigurasi</span></li>
                )}
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