import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CabinetMember } from '../types';
import { Skeleton } from '../components/Skeleton';
import { useSEO } from '../utils/seo';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// --- COMPONENTS ---

// Minimalist Member Card
const MemberCard: React.FC<{ member: CabinetMember; variant?: 'default' | 'compact' }> = ({ member, variant = 'default' }) => {
  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isCompact = variant === 'compact';

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200 group">
      {/* Avatar */}
      <div className={`flex-shrink-0 rounded-full flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 ${isCompact ? 'w-10 h-10 text-xs' : 'w-12 h-12 text-sm'}`}>
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <h4 className={`font-medium text-slate-900 dark:text-white truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
          {member.name}
        </h4>
        <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
          {member.position}
        </p>
        {member.bio && (
          <p className="text-slate-400 dark:text-slate-600 text-[10px] uppercase tracking-wider mt-0.5 truncate">
            {member.bio}
          </p>
        )}
      </div>
    </div>
  );
};

// Cabinet Logo Component
const CabinetLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  const { theme } = useTheme();
  const src = theme === 'dark'
    ? '/assets/images/logo/logo_kabinet_light.png'
    : '/assets/images/logo/logo_kabinet_dark.png';
  return (
    <img
      src={src}
      alt="Logo Kabinet Loyalist Spectra"
      className={`object-contain ${className}`}
    />
  );
};

export const Cabinet: React.FC = () => {
  useSEO({ title: "Kabinet Loyalist Spectra", description: "Struktur kepengurusan BEM FST UNISA Periode 2025/2026." });

  const [members, setMembers] = useState<CabinetMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCabinet = async () => {
      try {
        const data = await api.getCabinet();
        setMembers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCabinet();
  }, []);

  // Filter Data
  const topManagement = members.filter(m =>
    m.department === "Pimpinan" || m.department === "BPH"
  );

  const leaders = topManagement.filter(m => m.department === "Pimpinan").sort((a, b) => {
    if (a.position.includes("Gubernur") && !a.position.includes("Wakil")) return -1;
    return 1;
  });

  const bph = topManagement.filter(m => m.department === "BPH").sort((a, b) => {
    const rank = (p: string) => {
      if (p.includes("Sekretaris Umum")) return 1;
      if (p.includes("Sekretaris")) return 2;
      if (p.includes("Bendahara Umum")) return 3;
      if (p.includes("Bendahara")) return 4;
      return 5;
    };
    return rank(a.position) - rank(b.position);
  });

  const departments = [
    "Dagri", "Deplu", "Kastrad", "Porsa", "Kominfo", "Kasosma", "KWU"
  ];

  const getDeptMembers = (deptName: string) => members.filter(m => m.department === deptName);

  if (loading) return (
    <div className="pt-32 container mx-auto px-6 max-w-5xl">
      <Skeleton className="w-48 h-8 mb-4" />
      <Skeleton className="w-full max-w-lg h-4 mb-12" />
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-dark-bg min-h-screen transition-colors duration-300">

      {/* 1. HERO SECTION (Minimal) */}
      <section className="pt-32 pb-16 px-6 border-b border-slate-100 dark:border-white/5 relative overflow-hidden">
        {/* Watermark Background */}
        <div className="absolute -right-20 top-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none blur-sm">
          <CabinetLogo className="w-96 h-96" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <span className="text-primary-600 dark:text-primary-400 font-mono text-xs uppercase tracking-widest mb-3 block">
            Periode 2025/2026
          </span>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <CabinetLogo className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Kabinet Loyalist Spectra
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Kabinet Loyalist Spectra hadir sebagai ruang kolaborasi mahasiswa untuk bertumbuh, berkontribusi, dan membangun arah gerak organisasi yang berkelanjutan.
          </p>
        </div>
      </section>

      {/* 2. KEPALA KABINET */}
      <section className="pt-16 pb-8 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">
            Kepala Kabinet
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {leaders.map(member => (
              <div key={member.id} className="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BADAN PENGURUS HARIAN */}
      <section className="pt-8 pb-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">
            Badan Pengurus Harian
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {bph.map(member => (
              <div key={member.id} className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-white/5">
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DEPARTEMEN LIST */}
      <section className="pb-24 px-6 space-y-16">
        <div className="container mx-auto max-w-5xl">
          {departments.map((dept) => {
            const deptMembers = getDeptMembers(dept);
            if (deptMembers.length === 0) return null;

            const sortedMembers = [...deptMembers].sort((a, b) => {
              const rank = (p: string) => {
                if (p.toLowerCase().includes('kepala')) return 1;
                if (p.toLowerCase().includes('sekretaris')) return 2;
                return 3;
              };
              return rank(a.position) - rank(b.position);
            });

            return (
              <div key={dept}>
                {/* Minimal Header */}
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Departemen {dept}
                  </h3>
                  <div className="h-px flex-grow bg-slate-100 dark:bg-white/10"></div>
                  <span className="text-xs font-mono text-slate-400">
                    {deptMembers.length} Pengurus
                  </span>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                  {sortedMembers.map(member => (
                    <MemberCard key={member.id} member={member} variant="compact" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CTA (Minimal) */}
      <section className="py-16 px-6 border-t border-slate-100 dark:border-white/5">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Tentang BEM FST
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Pelajari lebih lanjut tentang visi dan misi kami.
            </p>
          </div>
          <Link
            to="/about"
            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Lihat Profil <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  );
};