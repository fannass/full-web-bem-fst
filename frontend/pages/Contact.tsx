import React, { useEffect, useState } from 'react';
import { useSEO } from '../utils/seo';
import { api } from '../services/api';
import { OrganizationProfile } from '../types';

// Social icons inline SVG
const IgIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const TwIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const YtIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
const FbIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const MailIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>;
const PhoneIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

export const Contact: React.FC = () => {
  useSEO({ title: "Kontak - BEM FST UNISA", description: "Hubungi BEM FST UNISA untuk kolaborasi, pertanyaan, atau saran." });

  const [org, setOrg] = useState<OrganizationProfile | null>(null);

  useEffect(() => {
    api.getOrganization().then(setOrg).catch(console.error);
  }, []);

  const socials = org?.socials || {};
  const socialLinks = [
    { key: 'instagram', label: 'Instagram', icon: <IgIcon />, href: socials.instagram ? `https://instagram.com/${socials.instagram.replace('@', '')}` : null, color: 'hover:text-pink-600' },
    { key: 'twitter',   label: 'Twitter / X', icon: <TwIcon />, href: socials.twitter ? `https://twitter.com/${socials.twitter.replace('@', '')}` : null, color: 'hover:text-sky-500' },
    { key: 'youtube',  label: 'YouTube', icon: <YtIcon />, href: socials.youtube || null, color: 'hover:text-red-600' },
    { key: 'facebook', label: 'Facebook', icon: <FbIcon />, href: socials.facebook ? `https://facebook.com/${socials.facebook.replace('@', '')}` : null, color: 'hover:text-blue-600' },
  ].filter(s => s.href);

  const contactItems = [
    org?.email    && { icon: <MailIcon />,  label: 'Email',   value: org.email,   href: `mailto:${org.email}` },
    org?.phone    && { icon: <PhoneIcon />, label: 'WhatsApp', value: org.phone,   href: `https://wa.me/${org.phone.replace(/\D/g, '')}` },
    org?.address  && { icon: <MapIcon />,   label: 'Alamat',   value: org.address, href: null },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href: string | null }[];

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-black min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Let's Connect</h1>
          <p className="text-slate-600 dark:text-slate-400 text-xl max-w-xl mx-auto">Kami selalu terbuka untuk kolaborasi, kritik, dan saran yang membangun.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">

          {/* Left: Contact Info + Socials */}
          <div className="md:col-span-2 space-y-8">

            {/* Contact Info */}
            {contactItems.length > 0 && (
              <div className="space-y-4">
                {contactItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="mt-0.5 text-primary-600 dark:text-primary-400 flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-slate-700 dark:text-slate-300 text-sm">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Media Sosial</p>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map(s => (
                    <a
                      key={s.key}
                      href={s.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 ${s.color} hover:border-current transition-colors text-sm`}
                    >
                      {s.icon} {s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="md:col-span-3">
            <div className="bg-slate-50 dark:bg-dark-surface p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                <div className="pt-2">
                  <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform">
                    Kirim Pesan
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};