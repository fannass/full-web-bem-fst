import { OrganizationProfile, Post, CabinetMember, Division, PaginatedResponse, ApiResponse } from '../types';
import { API_BASE_URL, STORAGE_BASE_URL } from '../constants';

// --- API CONFIGURATION ---
// Use proxy path `/api` which Vite will forward to http://localhost:3000
const API_URL = '/api/v1';

// Get storage base URL for accessing uploaded files
const getStorageBaseUrl = (): string => {
  return STORAGE_BASE_URL || 'http://localhost:3000';
};

// Helper: Generate Avatar
const getAvatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=512`;

// Helper: Convert storage path to full public URL
const getImageUrl = (storagePath: string | null): string => {
  // Default placeholder if no path
  if (!storagePath) {
    return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
  }
  
  const path = String(storagePath).trim();
  
  // If empty string after trim
  if (!path) {
    return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
  }
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If relative path, prepend storage URL
  const storageUrl = getStorageBaseUrl();
  const imageUrl = `${storageUrl}/uploads/${path}`;
  console.log('[Images] Loading image from:', imageUrl);
  return imageUrl;
};

// Helper: Parse Mission String to Array
const parseMission = (missionText: string): string[] => {
  if (!missionText) return [];
  return missionText.split(/\d+\.\s+/).filter(item => item.trim().length > 0).map(i => i.trim());
};

// Helper: Map cabinet divisions to flat array
const mapCabinetMembers = (cabinet: any): CabinetMember[] => {
  const members: CabinetMember[] = [];
  
  if (cabinet.divisions && Array.isArray(cabinet.divisions)) {
    cabinet.divisions.forEach((div: any) => {
      if (div.members && Array.isArray(div.members)) {
        div.members.forEach((m: any) => {
          let dept = div.name;
          
          // Separate "Inti" into "Pimpinan" and "BPH"
          if (div.name === "Inti") {
            if (m.position && m.position.includes("Gubernur")) {
              dept = "Pimpinan";
            } else {
              dept = "BPH";
            }
          }

          members.push({
            id: m.id,
            name: m.name,
            position: m.position || '',
            department: dept,
            photo_url: m.photo_url || m.photo || getAvatar(m.name),
            bio: m.bio || '',
            prodi: m.prodi || '',
            order: m.order ?? 0
          });
        });
      }
    });
  }
  
  return members;
};

// Helper: Map organization from API response
const mapOrganization = (data: any, cabinet?: any): OrganizationProfile => {
  return {
    name: data.name,
    description: data.description,
    vision: cabinet?.vision || data.vision || '',
    mission: cabinet?.mission ? parseMission(cabinet.mission) : [],
    email: data.email,
    phone: data.phone,
    address: data.address,
    logo_url: data.logo_url || getAvatar("BEM FST"),
    cabinet_name: cabinet?.name || 'BEM FST UNISA',
    tagline: cabinet?.tagline || data.description,
    period_years: cabinet?.period ? `${cabinet.period.year_start}/${cabinet.period.year_end}` : '2025/2026',
    socials: data.social_media || {}
  };
};

// Helper: Map posts from API response
const mapPost = (p: any): Post => {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category === 'news' ? 'Berita' : p.category === 'event' ? 'Event' : p.category,
    image_url: getImageUrl(p.featured_image || p.image_url),
    author: p.author || "Admin BEM",
    created_at: p.created_at || p.published_at || new Date().toISOString(),
    views: p.views || 0,
    status: p.status || 'draft',
    // Add SEO fields from API
    meta_title: p.meta_title,
    meta_description: p.meta_description,
    canonical_url: p.canonical_url,
    og_image: p.og_image,
  };
};

// Local storage keys
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

class ApiService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private authToken: string | null = null;

  constructor() {
    // Load token from localStorage on init
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    }
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_TTL;
  }

  private async fetchFromAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...((options?.headers as any) || {}),
    };

    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Clear auth on 401
        this.clearAuth();
      }
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    
    return response.json();
  }

  // ===== AUTHENTICATION =====
  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    try {
      const response = await this.fetchFromAPI<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (response.success && response.data?.access_token) {
        this.authToken = response.data.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.TOKEN, this.authToken);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user || { username }));
        }
        return { token: this.authToken, user: response.data.user };
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('[API] Login failed:', error);
      throw error;
    }
  }

  logout(): void {
    this.clearAuth();
  }

  private clearAuth(): void {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // ===== ORGANIZATION =====
  async getOrganization(): Promise<OrganizationProfile> {
    const cacheKey = '/organization';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const [orgRes, cabinetRes] = await Promise.all([
        this.fetchFromAPI<ApiResponse<any>>('/organization'),
        this.fetchFromAPI<ApiResponse<any>>('/cabinet').catch(() => ({ success: false, data: null }))
      ]);

      const result = mapOrganization(orgRes.data, cabinetRes.data?.[0]);
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('[API] Failed to fetch organization:', error);
      throw error;
    }
  }

  // ===== POSTS (PUBLIC) =====
  async getPosts(page = 1, perPage = 6, skipCache = false): Promise<PaginatedResponse<Post>> {
    const cacheKey = `/posts?page=${page}&per_page=${perPage}`;
    
    if (!skipCache && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await this.fetchFromAPI<ApiResponse<any>>(`/posts?page=${page}&limit=${perPage}`);
      
      const posts = (response.data?.data || response.data || []).map(mapPost);
      
      const result: PaginatedResponse<Post> = {
        data: posts,
        meta: {
          current_page: response.data?.meta?.current_page || page,
          last_page: response.data?.meta?.last_page || 1,
          per_page: response.data?.meta?.per_page || perPage,
          total: response.data?.meta?.total || posts.length
        }
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('[API] Failed to fetch posts:', error);
      throw error;
    }
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    const cacheKey = `/posts/slug/${slug}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await this.fetchFromAPI<ApiResponse<any>>(`/posts/slug/${slug}`);
      const result = mapPost(response.data);
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('[API] Failed to fetch post:', error);
      return null;
    }
  }

  // ===== POSTS (ADMIN) =====
  async createPost(data: any, file?: File): Promise<Post> {
    try {
      // Validate auth before attempting upload
      if (!this.authToken) {
        throw new Error('Anda harus login terlebih dahulu untuk membuat post');
      }

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('excerpt', data.excerpt || '');
      formData.append('content', data.content);
      formData.append('category', data.category);
      formData.append('status', data.status || 'draft');
      if (data.published_at) formData.append('published_at', data.published_at);
      if (data.meta_title) formData.append('meta_title', data.meta_title);
      if (data.meta_description) formData.append('meta_description', data.meta_description);
      if (data.canonical_url) formData.append('canonical_url', data.canonical_url);
      if (data.og_image) formData.append('og_image', data.og_image);
      if (file) formData.append('featured_image', file);

      const url = `${API_URL}/posts`;
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.authToken}`,
      };

      console.log('[API] Creating post with auth token:', this.authToken.substring(0, 20) + '...');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `Gagal membuat post (${response.status})`;
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'Token autentikasi tidak valid atau sudah kadaluarsa. Silakan login ulang.';
        }
        try {
          const errorData = await response.json();
          
          // Handle validation errors from NestJS validation pipe
          if (errorData.message) {
            if (Array.isArray(errorData.message)) {
              errorMessage = errorData.message.map((m: string) => m).join(', ');
            } else {
              errorMessage = errorData.message;
            }
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal membuat post');
      }
      
      // Clear all posts cache after creating a new post
      this.clearPostsCache();
      
      return mapPost(result.data);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal membuat post';
      console.error('[API] Failed to create post:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  async updatePost(id: number, data: any, file?: File): Promise<Post> {
    try {
      // Validate auth before attempting upload
      if (!this.authToken) {
        throw new Error('Anda harus login terlebih dahulu untuk mengupdate post');
      }

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('excerpt', data.excerpt || '');
      formData.append('content', data.content);
      formData.append('category', data.category);
      formData.append('status', data.status || 'draft');
      if (data.published_at) formData.append('published_at', data.published_at);
      if (data.meta_title) formData.append('meta_title', data.meta_title);
      if (data.meta_description) formData.append('meta_description', data.meta_description);
      if (data.canonical_url) formData.append('canonical_url', data.canonical_url);
      if (data.og_image) formData.append('og_image', data.og_image);
      if (file) formData.append('featured_image', file);

      const url = `${API_URL}/posts/${id}`;
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.authToken}`,
      };

      console.log('[API] Updating post', id, 'with auth token:', this.authToken.substring(0, 20) + '...');

      const response = await fetch(url, {
        method: 'PATCH',
        body: formData,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `Gagal memperbarui post (${response.status})`;
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'Token autentikasi tidak valid atau sudah kadaluarsa. Silakan login ulang.';
        }
        try {
          const errorData = await response.json();
          
          // Handle validation errors from NestJS validation pipe
          if (errorData.message) {
            if (Array.isArray(errorData.message)) {
              errorMessage = errorData.message.map((m: string) => m).join(', ');
            } else {
              errorMessage = errorData.message;
            }
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal memperbarui post');
      }
      
      // Clear all posts cache after updating
      this.clearPostsCache();
      
      return mapPost(result.data);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal memperbarui post';
      console.error('[API] Failed to update post:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  async deletePost(id: number): Promise<void> {
    try {
      await this.fetchFromAPI(`/posts/${id}`, {
        method: 'DELETE',
      });
      
      // Clear all posts cache after deleting
      this.clearPostsCache();
    } catch (error) {
      console.error('[API] Failed to delete post:', error);
      throw error;
    }
  }

  // ===== CABINET =====

  // Get ALL members from ALL cabinets (flat list) — for admin use
  async getAllMembersAdmin(): Promise<CabinetMember[]> {
    const response = await this.fetchFromAPI<ApiResponse<any[]>>('/cabinet/members/list');
    return (response.data || []).map((m: any) => {
      const divName = m.divisions?.name || 'Umum';
      let dept = divName;
      if (divName === 'Inti') {
        dept = m.position && m.position.includes('Gubernur') ? 'Pimpinan' : 'BPH';
      }
      return {
        id: Number(m.id),
        name: m.name,
        position: m.position || '',
        department: dept,
        division_id: m.division_id ? Number(m.division_id) : undefined,
        photo_url: m.photo_url || m.photo || getAvatar(m.name),
        bio: m.bio || '',
        prodi: m.prodi || '',
        instagram: m.instagram || '',
        linkedin: m.linkedin || '',
        order: m.order ?? 0,
      } as CabinetMember;
    });
  }

  async getCabinet(skipCache = false): Promise<CabinetMember[]> {
    const cacheKey = '/cabinet';
    
    if (!skipCache && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await this.fetchFromAPI<ApiResponse<any>>('/cabinet');
      const cabinet = response.data?.[0];
      const result = cabinet ? mapCabinetMembers(cabinet) : [];
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('[API] Failed to fetch cabinet:', error);
      return [];
    }
  }

  // Clear cache manually if needed
  clearCache(endpoint?: string): void {
    if (endpoint) {
      this.cache.delete(endpoint);
    } else {
      this.cache.clear();
    }
  }

  // Clear all posts-related cache (for any page/limit)
  clearPostsCache(): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith('/posts?')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // ===== DIVISION CRUD =====

  async getCabinets(): Promise<{ id: number; name: string; period_id?: number; tagline?: string }[]> {
    const response = await this.fetchFromAPI<ApiResponse<any[]>>('/cabinet');
    return (response.data || []).map((c: any) => ({
      id: Number(c.id),
      name: c.name,
      period_id: c.period_id ? Number(c.period_id) : undefined,
      tagline: c.tagline || '',
    }));
  }

  async getDivisions(): Promise<Division[]> {
    const response = await this.fetchFromAPI<ApiResponse<any[]>>('/cabinet/divisions');
    return (response.data || []).map((d: any) => ({
      id: Number(d.id),
      cabinet_id: Number(d.cabinet_id),
      name: d.name,
      description: d.description || '',
      order: d.order ?? 0,
      cabinet_name: d.cabinets?.name || '',
      member_count: d.members?.length ?? 0,
    }));
  }

  async createDivision(data: { cabinet_id: number; name: string; description?: string; order?: number }): Promise<Division> {
    const response = await this.fetchFromAPI<ApiResponse<any>>('/cabinet/divisions', { method: 'POST', body: JSON.stringify(data) });
    return { id: Number(response.data.id), cabinet_id: Number(response.data.cabinet_id), name: response.data.name, description: response.data.description, order: response.data.order };
  }

  async updateDivision(id: number, data: { name?: string; description?: string; order?: number }): Promise<Division> {
    const response = await this.fetchFromAPI<ApiResponse<any>>(`/cabinet/divisions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return { id: Number(response.data.id), cabinet_id: Number(response.data.cabinet_id), name: response.data.name, description: response.data.description, order: response.data.order };
  }

  async deleteDivision(id: number): Promise<void> {
    await this.fetchFromAPI(`/cabinet/divisions/${id}`, { method: 'DELETE' });
  }

  // ===== MEMBER CRUD =====

  async createMember(data: { division_id: number; name: string; position: string; prodi?: string; photo?: string; bio?: string; instagram?: string; linkedin?: string; order?: number }): Promise<CabinetMember> {
    const response = await this.fetchFromAPI<ApiResponse<any>>('/cabinet/members', { method: 'POST', body: JSON.stringify(data) });
    const m = response.data;
    return { id: Number(m.id), division_id: Number(m.division_id), name: m.name, position: m.position, photo_url: m.photo || '', bio: m.bio, prodi: m.prodi, department: m.divisions?.name };
  }

  async updateMember(id: number, data: { division_id?: number; name?: string; position?: string; prodi?: string; photo?: string; bio?: string; instagram?: string; linkedin?: string; order?: number }): Promise<CabinetMember> {
    const response = await this.fetchFromAPI<ApiResponse<any>>(`/cabinet/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    const m = response.data;
    return { id: Number(m.id), division_id: Number(m.division_id), name: m.name, position: m.position, photo_url: m.photo || '', bio: m.bio, prodi: m.prodi, department: m.divisions?.name };
  }

  async deleteMember(id: number): Promise<void> {
    await this.fetchFromAPI(`/cabinet/members/${id}`, { method: 'DELETE' });
  }

  // ===== ORGANIZATION CRUD =====

  async getOrganizationRaw(): Promise<any> {
    const response = await this.fetchFromAPI<ApiResponse<any>>('/organization');
    return response.data;
  }

  async updateOrganization(id: number, data: { name?: string; description?: string; address?: string; email?: string; phone?: string; social_media?: Record<string, string> }): Promise<any> {
    const response = await this.fetchFromAPI<ApiResponse<any>>(`/organization/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    this.cache.delete('/organization');
    return response.data;
  }

  // ===== PERIODS CRUD =====

  async getPeriods(): Promise<any[]> {
    const response = await this.fetchFromAPI<ApiResponse<any[]>>('/periods');
    return response.data || [];
  }

  async createPeriod(data: { name: string; year_start: number; year_end: number; is_active?: boolean; description?: string }): Promise<any> {
    const response = await this.fetchFromAPI<ApiResponse<any>>('/periods', { method: 'POST', body: JSON.stringify(data) });
    return response.data;
  }

  async updatePeriod(id: number, data: Partial<{ name: string; year_start: number; year_end: number; is_active: boolean; description: string }>): Promise<any> {
    const response = await this.fetchFromAPI<ApiResponse<any>>(`/periods/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return response.data;
  }

  async deletePeriod(id: number): Promise<void> {
    await this.fetchFromAPI(`/periods/${id}`, { method: 'DELETE' });
  }

  // ===== CABINET CRUD (the cabinet entity itself) =====

  async createCabinet(data: { period_id: number; name: string; tagline?: string; vision?: string; mission?: string; description?: string }): Promise<any> {
    const response = await this.fetchFromAPI<ApiResponse<any>>('/cabinet', { method: 'POST', body: JSON.stringify(data) });
    return response.data;
  }

  async updateCabinet(id: number, data: { period_id?: number; name?: string; tagline?: string; vision?: string; mission?: string; description?: string }): Promise<any> {
    const response = await this.fetchFromAPI<ApiResponse<any>>(`/cabinet/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return response.data;
  }

  async deleteCabinet(id: number): Promise<void> {
    await this.fetchFromAPI(`/cabinet/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();