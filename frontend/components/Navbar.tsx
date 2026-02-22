import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { ThemeToggle } from './ThemeToggle';

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    {/* Floating Navbar Container */}
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-6 px-4">
      <nav 
        className={`w-full max-w-5xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled 
            ? 'bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-slate-200/50 dark:border-white/10 rounded-full py-3 px-6' 
            : 'bg-transparent py-4 px-0'
        }`}
      >
        <div className="flex justify-between items-center">
          
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${scrolled ? 'bg-primary-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-black'}`}>
              B
            </div>
            <span className={`font-bold tracking-tight text-sm ${scrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
              BEM FST
            </span>
          </Link>

          {/* Desktop Links */}
          <div className={`hidden md:flex items-center gap-1 p-1 ${!scrolled && 'bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-full px-2 border border-white/20 dark:border-white/5'}`}>
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 relative ${
                    isActive 
                      ? 'text-slate-900 dark:text-white bg-white dark:bg-white/10 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link 
              to="/contact" 
              className={`hidden sm:flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold transition-all ${
                scrolled
                 ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                 : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black hover:scale-105'
              }`}
            >
              Contact
            </Link>
            
            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>
    </div>

    {/* Mobile Menu Overlay */}
    <div 
      className={`fixed inset-0 z-40 bg-white dark:bg-dark-bg transition-all duration-500 md:hidden ${
        isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
      }`}
    >
      <div className="flex flex-col h-full pt-32 px-8 pb-10">
        <div className="flex flex-col gap-6">
          {NAV_LINKS.map((link, idx) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-3xl font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              onClick={() => setIsOpen(false)}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="mt-auto pt-8 border-t border-slate-100 dark:border-white/10">
           <Link 
              to="/contact" 
              onClick={() => setIsOpen(false)}
              className="block w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black text-center font-bold rounded-xl"
           >
             Mulai Kolaborasi
           </Link>
        </div>
      </div>
    </div>
    </>
  );
};