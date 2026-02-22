import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CabinetMember, OrganizationProfile } from '../types';
import { Skeleton } from '../components/Skeleton';
import { useSEO } from '../utils/seo';

// Preferred order for known departments (others appended after)
const DEPT_ORDER = ["Dagri", "Deplu", "Kastrad", "Porsa", "Kominfo", "Kasosma", "KWU"];

// Elegant Org Card
interface OrgCardProps {
  member: CabinetMember;
  variant?: 'large' | 'medium' | 'small';
}

const OrgCard: React.FC<OrgCardProps> = ({ member, variant = 'medium' }) => {
  const sizeClasses = {
    large: "w-64",
    medium: "w-48",
    small: "w-40" 
  };

  const imgClasses = {
    large: "h-64",
    medium: "h-48",
    small: "h-40"
  };

  return (
    <div className={`group flex flex-col items-center bg-white dark:bg-dark-surface rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-xl dark:shadow-none border border-slate-100 dark:border-white/10 overflow-hidden transition-all duration-300 hover:-translate-y-2 z-10 ${sizeClasses[variant]}`}>
      <div className={`w-full ${imgClasses[variant]} overflow-hidden bg-slate-50 dark:bg-white/5 relative`}>
        <img 
          src={member.photo_url} 
          alt={member.name} 
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="p-4 text-center w-full bg-white dark:bg-dark-surface flex-grow flex flex-col justify-center relative border-t border-slate-50 dark:border-white/5">
        <h3 className={`font-bold text-slate-900 dark:text-white leading-tight ${variant === 'large' ? 'text-lg' : 'text-xs'}`}>
            {member.name}
        </h3>
        <p className={`text-primary-600 dark:text-primary-400 font-bold mt-1 uppercase tracking-wider ${variant === 'large' ? 'text-xs' : 'text-[9px]'}`}>
            {member.position}
        </p>
        {member.prodi && (
           <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 truncate">{member.prodi}</p>
        )}
      </div>
    </div>
  );
};

// Connector Lines Components
const VerticalLine = ({ height = "h-8" }: { height?: string }) => (
  <div className={`w-px bg-slate-200 dark:bg-white/10 mx-auto ${height}`}></div>
);

export const Cabinet: React.FC = () => {
  useSEO({ 
    title: "Struktur Organisasi", 
    description: "Lihat struktur dan susunan pengurus BEM FST UNISA. Ketahui lebih dekat sosok-sosok yang memimpin organisasi mahasiswa kami.",
    type: 'website',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  const [members, setMembers] = useState<CabinetMember[]>([]);
  const [org, setOrg] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCabinet = async () => {
      try {
        const [cabinetData, orgData] = await Promise.all([
             api.getCabinet(true), // always skip cache – data harus fresh
             api.getOrganization()
        ]);
        setMembers(cabinetData);
        setOrg(orgData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCabinet();
  }, []);

  const governor = members.find(m => m.position.includes("Gubernur") && !m.position.includes("Wakil"));
  const viceGovernor = members.find(m => m.position.includes("Wakil Gubernur"));
  const bph = members.filter(m => m.department === "BPH").sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  const departments = members.reduce((acc, member) => {
    if (member.department !== "Pimpinan" && member.department !== "BPH") {
      if (!acc[member.department]) acc[member.department] = [];
      acc[member.department].push(member);
    }
    return acc;
  }, {} as Record<string, CabinetMember[]>);

  // All dept names: known order first, then any extra divisions not in DEPT_ORDER
  const allDeptNames = [
    ...DEPT_ORDER.filter(d => departments[d]),
    ...Object.keys(departments).filter(d => !DEPT_ORDER.includes(d)),
  ];

  const sortDepartmentMembers = (deptMembers: CabinetMember[]) => {
      const getPriority = (position: string) => {
          const p = position.toLowerCase();
          if (p.includes('kadep') || p.includes('kepala') || p.includes('ketua')) return 0;
          if (p.includes('sekdep') || p.includes('sekretaris')) return 1;
          return 2;
      };
      return [...deptMembers].sort((a, b) => {
          const priorityDiff = getPriority(a.position) - getPriority(b.position);
          if (priorityDiff !== 0) return priorityDiff;
          return (a.order ?? 0) - (b.order ?? 0);
      });
  };

  if (loading) return (
    <div className="pt-40 pb-20 container mx-auto px-6 text-center">
        <Skeleton className="w-64 h-80 mx-auto mb-8" />
        <Skeleton className="w-full h-96" />
    </div>
  );

  return (
    <div className="pt-32 pb-24 bg-slate-50 dark:bg-black min-h-screen">
      <div className="container mx-auto px-4 overflow-x-auto">
        
        <div className="text-center mb-20 sticky left-0 right-0">
           <span className="inline-block py-1 px-3 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
              Hierarki Organisasi
           </span>
           <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{org?.cabinet_name || 'Kabinet Loyalist Spectra'}</h1>
        </div>

        <div className="min-w-max mx-auto flex flex-col items-center px-8">
            
            {/* LEVEL 1: TOP LEADERS */}
            <div className="flex justify-center gap-12 relative z-20">
               {governor && <OrgCard member={governor} variant="large" />}
               {viceGovernor && <OrgCard member={viceGovernor} variant="large" />}
               
               {/* Visual Connector between Gov and Wagub */}
               <div className="absolute top-1/2 left-[calc(50%-2rem)] right-[calc(50%-2rem)] h-px bg-slate-200 dark:bg-white/10 -z-10"></div>
            </div>

            <VerticalLine height="h-16" />

            {/* LEVEL 2: BPH */}
            <div className="relative pt-10 px-12 border-t border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-slate-100 dark:border-white/5 z-10 shadow-sm">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-slate-50 dark:bg-black text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Badan Pengurus Harian
                 </div>
                 
                 <div className="flex gap-6 justify-center pb-8">
                    {bph.map(member => (
                        <OrgCard key={member.id} member={member} variant="medium" />
                    ))}
                 </div>
            </div>

            <VerticalLine height="h-20" />

            {/* LEVEL 3: DEPARTMENTS (Single Row) */}
            <div className="relative w-full flex justify-center">
                <div className="flex items-start gap-10 pt-10">
                    {allDeptNames.map((deptName, idx) => {
                        const deptMembers = departments[deptName] || [];
                        if (deptMembers.length === 0) return null;

                        const isFirst = idx === 0;
                        const isLast = idx === allDeptNames.length - 1;

                        return (
                            <div key={deptName} className="flex flex-col items-center relative">
                                
                                {/* CONNECTOR LINES LOGIC */}
                                <div className="absolute -top-10 w-full h-10">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-full bg-slate-200 dark:bg-white/10"></div>
                                    {!isLast && (
                                        <div className="absolute top-0 right-0 w-1/2 h-px bg-slate-200 dark:bg-white/10 translate-x-[20px]"></div> 
                                    )}
                                    {!isFirst && (
                                        <div className="absolute top-0 left-0 w-1/2 h-px bg-slate-200 dark:bg-white/10 -translate-x-[20px]"></div>
                                    )}
                                    <div className="absolute top-0 left-0 w-full h-px bg-slate-200 dark:bg-white/10"></div>
                                </div>

                                {/* Department Label */}
                                <div className="mb-8 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white px-5 py-1.5 rounded-full shadow-sm z-20">
                                    <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">{deptName}</span>
                                </div>

                                <div className="flex flex-col gap-4 w-full items-center">
                                    {sortDepartmentMembers(deptMembers).map((member, mIdx) => (
                                        <div key={member.id} className="relative flex flex-col items-center">
                                            <OrgCard member={member} variant="small" />
                                            {mIdx < deptMembers.length - 1 && (
                                                <div className="h-4 w-px bg-slate-200 dark:bg-white/10"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};