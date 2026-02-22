import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { OrganizationProfile } from '../types';
import { Skeleton } from '../components/Skeleton';
import { useSEO } from '../utils/seo';

// Clean Icons
const VisionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const MissionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;

export const About: React.FC = () => {
  useSEO({ 
    title: "Tentang Kami", 
    description: "Pelajari visi dan misi BEM FST UNISA - Badan Eksekutif Mahasiswa yang berdedikasi melayani mahasiswa Fakultas Sains dan Teknologi Universitas Sanata Dharma.",
    type: 'website',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });
  const [org, setOrg] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
        try {
            const data = await api.getOrganization();
            setOrg(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchOrg();
  }, []);

  if (loading) return (
      <div className="pt-32 container mx-auto px-6 min-h-screen">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-48 w-full rounded" />
      </div>
  );

  return (
    <div className="bg-white dark:bg-dark-bg transition-colors duration-300">
        {/* Minimalist Header */}
        <div className="pt-40 pb-20 border-b border-slate-100 dark:border-dark-border">
            <div className="container mx-auto px-6">
                <span className="text-slate-500 dark:text-slate-400 font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Profil Organisasi</span>
                <h1 className="text-4xl md:text-6xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight">Tentang BEM FST</h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed font-light">
                    {org?.description}
                </p>
            </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-6 py-24">
            <div className="grid md:grid-cols-2 gap-20">
                
                {/* Vision */}
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-primary-600 dark:text-primary-400"><VisionIcon /></span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Visi</h2>
                    </div>
                    <div className="pl-2 border-l-2 border-slate-200 dark:border-dark-border">
                       <p className="pl-6 text-lg text-slate-700 dark:text-slate-300 leading-relaxed italic">
                           "{org?.vision}"
                       </p>
                    </div>
                </div>

                {/* Mission */}
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-primary-600 dark:text-primary-400"><MissionIcon /></span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Misi</h2>
                    </div>
                    <ul className="space-y-6">
                        {org?.mission.map((m, idx) => (
                            <li key={idx} className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white mt-1">
                                    {idx + 1}
                                </span>
                                <span className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">{m}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};