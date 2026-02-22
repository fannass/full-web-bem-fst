export const APP_NAME = "BEM FST UNISA";
export const API_BASE_URL = "http://localhost:3000/api/v1";
export const STORAGE_BASE_URL = "http://localhost:3000";

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
