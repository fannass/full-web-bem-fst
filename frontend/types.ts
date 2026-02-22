export interface OrganizationProfile {
  name: string;
  description: string;
  vision: string;
  mission: string[];
  email: string;
  phone: string;
  address: string;
  logo_url: string;
  cabinet_name?: string; // Added for "Kabinet Loyalist Spectra"
  tagline?: string;      // Added for "Inklusif, pengembangan SDM..."
  period_years?: string; // Added for "2025-2026"
  socials: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML content
  category: string;
  image_url: string;
  author: string;
  created_at: string;
  views: number;
  status?: string;
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_image?: string;
}

export interface CabinetMember {
  id: number;
  name: string;
  position: string;
  department?: string;
  division_id?: number;
  photo_url: string;
  bio?: string;
  prodi?: string;
  instagram?: string;
  linkedin?: string;
  order?: number;
}

export interface Division {
  id: number;
  cabinet_id: number;
  name: string;
  description?: string;
  order?: number;
  cabinet_name?: string;
  member_count?: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}