import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { OrganizationProfile } from '../types';
import { Skeleton } from '../components/Skeleton';
import { useSEO } from '../utils/seo';

// Reusable Section Component
const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <section className={`py-20 px-6 md:px-12 lg:px-24 ${className}`}>
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </section>
);

// Core Value Card Component
const ValueCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow duration-300 group">
    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
      {description}
    </p>
  </div>
);

// Stat Item Component
const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center md:text-left">
    <div className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2 font-mono tracking-tight">
      {value}
    </div>
    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {label}
    </div>
  </div>
);

export const About: React.FC = () => {
  useSEO({ title: "Tentang Kami - BEM FST UNISA", description: "Profil, Visi, Misi, dan Nilai Inti BEM Fakultas Sains dan Teknologi UNISA." });

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
      <Skeleton className="h-12 w-64 mb-6" />
      <Skeleton className="h-4 w-full max-w-2xl mb-12" />
      <div className="grid md:grid-cols-3 gap-8">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-dark-bg min-h-screen transition-colors duration-300">

      {/* 1. Hero Section */}
      <div className="pt-32 pb-20 px-6 md:px-12 lg:px-24 border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-semibold tracking-wider uppercase mb-6">
            Tentang Kami
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-8 leading-tight tracking-tight">
            Menggerakkan Perubahan, <br className="hidden md:block" />
            <span className="text-slate-400 dark:text-slate-500">Membangun Masa Depan.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto md:mx-0">
            {org?.description || 'Badan Eksekutif Mahasiswa Fakultas Sains dan Teknologi Universitas \'Aisyiyah Yogyakarta. Wadah aspirasi dan pengembangan diri bagi mahasiswa Teknologi Informasi, Arsitektur, dan Bioteknologi.'}
          </p>
        </div>
      </div>

      {/* 2. Vision & Mission */}
      <Section className="bg-white dark:bg-dark-bg">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Vision */}
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
              Visi Organisasi
            </h2>
            <blockquote className="text-2xl md:text-3xl font-medium text-slate-800 dark:text-slate-200 leading-snug italic font-serif">
              "{org?.vision}"
            </blockquote>
          </div>

          {/* Mission */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
              Misi Kami
            </h2>
            <div className="grid gap-6">
              {org?.mission.map((m, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-mono text-sm font-bold group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {m}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 3. Core Values */}
      <Section className="bg-slate-50 dark:bg-dark-surface/50 border-y border-slate-200 dark:border-dark-border">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Nilai Utama</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Prinsip yang menjadi landasan setiap langkah dan keputusan kami.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <ValueCard
            icon={<Users size={24} />}
            title="Inklusif"
            description="Membangun lingkungan yang terbuka, ramah, dan merangkul keberagaman aspirasi seluruh mahasiswa FST."
          />
          <ValueCard
            icon={<TrendingUp size={24} />}
            title="Pengembangan SDM"
            description="Fokus berkelanjutan pada peningkatan kompetensi hard skill dan soft skill mahasiswa agar siap bersaing."
          />
          <ValueCard
            icon={<Award size={24} />}
            title="Kaderisasi"
            description="Mencetak pemimpin masa depan yang berintegritas, adaptif, dan siap berkontribusi bagi masyarakat."
          />
        </div>
      </Section>

      {/* 4. Statistics */}
      <Section className="bg-white dark:bg-dark-bg">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 border-t border-slate-100 dark:border-dark-border pt-12">
          <StatItem value="39" label="Pengurus Aktif" />
          <StatItem value="07" label="Departemen" />
          <StatItem value="03" label="Program Studi" />
          <StatItem value="10+" label="Program Kerja" />
        </div>
      </Section>

      {/* 5. CTA Section */}
      <Section className="bg-slate-900 dark:bg-black text-white rounded-3xl mx-6 md:mx-12 lg:mx-24 mb-24 overflow-hidden relative">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 py-12 px-4 md:px-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Siap Berkolaborasi?</h2>
            <p className="text-slate-400 max-w-md">
              Mari wujudkan ide-ide hebat bersama BEM FST UNISA. Pintu kami selalu terbuka untuk diskusi.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link
              to="/cabinet"
              className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-center"
            >
              Lihat Kabinet
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 bg-transparent border border-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              Hubungi Kami <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </Section>

    </div>
  );
};