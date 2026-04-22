export const APP_NAME = "BEM FST UNISA";
// Gunakan environment variable — fallback ke localhost hanya untuk development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
export const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL || "http://localhost:3000";

export const getPublicStorageBaseUrl = (): string => {
  const configured = STORAGE_BASE_URL?.trim();
  if (configured && configured !== 'http://localhost:3000') {
    return configured.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return origin.replace(/\/$/, '');
  }

  return '';
};

export const NAV_LINKS = [
  { name: 'Beranda', path: '/' },
  { name: 'Tentang Kami', path: '/about' },
  { name: 'Kabinet', path: '/cabinet' },
  { name: 'Berita', path: '/posts' },
  { name: 'Kontak', path: '/contact' },
];

// Admin routes
export const ADMIN_ROUTES = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Posts', path: '/admin/posts' },
  { name: 'Cabinet', path: '/admin/cabinet' },
  { name: 'Settings', path: '/admin/settings' },
];
