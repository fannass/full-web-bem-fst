import { useEffect } from 'react';
import { APP_NAME } from '../constants';

interface SEOProps {
  title: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  type?: 'article' | 'website';
  author?: string;
  publishedDate?: string;
}

const createMetaTag = (name: string, content: string, isProperty = false) => {
  const attr = isProperty ? 'property' : 'name';
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  
  tag.setAttribute('content', content);
  return tag;
};

const createJsonLd = (data: any) => {
  let script = document.querySelector('script[type="application/ld+json"]');
  
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(data);
};

export const useSEO = ({ 
  title, 
  description = "Website resmi BEM FST UNISA - Badan Eksekutif Mahasiswa Fakultas Sains dan Teknologi Universitas Sanata Dharma",
  imageUrl,
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  author,
  publishedDate,
}: SEOProps) => {
  useEffect(() => {
    // Update page title
    document.title = `${title} | ${APP_NAME}`;
    
    // Standard meta tags
    createMetaTag('description', description);
    createMetaTag('keywords', 'BEM FST UNISA, mahasiswa, organisasi, berita, event');
    createMetaTag('robots', 'index, follow');
    createMetaTag('language', 'Indonesian');
    
    // Open Graph tags (Facebook, LinkedIn, etc)
    createMetaTag('og:title', `${title} | ${APP_NAME}`, true);
    createMetaTag('og:description', description, true);
    createMetaTag('og:type', type, true);
    createMetaTag('og:url', url, true);
    
    if (imageUrl) {
      createMetaTag('og:image', imageUrl, true);
      createMetaTag('og:image:width', '1200', true);
      createMetaTag('og:image:height', '630', true);
    } else {
      // Default image jika tidak ada
      createMetaTag('og:image', 'https://via.placeholder.com/1200x630?text=BEM+FST+UNISA', true);
    }
    
    // Twitter Card tags
    createMetaTag('twitter:card', 'summary_large_image');
    createMetaTag('twitter:title', `${title} | ${APP_NAME}`);
    createMetaTag('twitter:description', description);
    if (imageUrl) {
      createMetaTag('twitter:image', imageUrl);
    }
    
    // Additional tags
    createMetaTag('author', author || 'BEM FST UNISA');
    createMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    createMetaTag('theme-color', '#0284c7');
    
    // Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', url);
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonicalLink);
    }
    
    // JSON-LD Schema
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'Organization',
      name: title,
      description: description,
    };

    if (type === 'article' && imageUrl) {
      const articleSchema = {
        ...baseSchema,
        author: {
          '@type': 'Person',
          name: author || 'BEM FST UNISA',
        },
        image: imageUrl,
        datePublished: publishedDate || new Date().toISOString(),
      };
      createJsonLd(articleSchema);
    } else if (type === 'website') {
      const orgSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'BEM FST UNISA',
        url: 'http://localhost:3001',
        logo: 'https://via.placeholder.com/200x200?text=BEM+FST+UNISA',
        sameAs: [
          'https://www.facebook.com/bem-fst-unisa',
          'https://www.instagram.com/bemfstunisa',
        ],
      };
      createJsonLd(orgSchema);
    }

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [title, description, imageUrl, url, type, author, publishedDate]);
};