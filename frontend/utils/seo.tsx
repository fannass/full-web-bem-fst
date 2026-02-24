import { useEffect } from 'react';
import { APP_NAME } from '../constants';

interface SEOProps {
  title: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  url?: string;
  type?: 'article' | 'website';
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  keywords?: string;
  section?: string;
  canonicalUrl?: string;
}

const DEFAULT_OG_IMAGE = '/assets/images/logo/logo_BEM.png';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://bemfstunisa.ac.id';
const IG_HANDLE = '@bemfstunisa';

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
  description = 'Website resmi BEM FST UNISA - Badan Eksekutif Mahasiswa Fakultas Sains dan Teknologi Universitas Sanata Dharma',
  imageUrl,
  imageAlt,
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  author,
  publishedDate,
  modifiedDate,
  keywords,
  section,
  canonicalUrl,
}: SEOProps) => {
  useEffect(() => {
    const canonical = canonicalUrl || url;
    const ogImage = imageUrl
      ? (imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`)
      : `${SITE_URL}${DEFAULT_OG_IMAGE}`;
    const finalKeywords = keywords
      ? `BEM FST UNISA, ${keywords}`
      : 'BEM FST UNISA, mahasiswa, organisasi, berita, event, FST UNISA, kemahasiswaan';

    // --- Page title ---
    document.title = `${title} | ${APP_NAME}`;

    // --- Standard meta ---
    createMetaTag('description', description);
    createMetaTag('keywords', finalKeywords);
    createMetaTag('robots', 'index, follow');
    createMetaTag('language', 'id');
    createMetaTag('author', author || 'BEM FST UNISA');
    createMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    createMetaTag('theme-color', '#0284c7');

    // --- Open Graph base ---
    createMetaTag('og:title', `${title} | ${APP_NAME}`, true);
    createMetaTag('og:description', description, true);
    createMetaTag('og:type', type, true);
    createMetaTag('og:url', url, true);
    createMetaTag('og:locale', 'id_ID', true);
    createMetaTag('og:site_name', APP_NAME, true);
    createMetaTag('og:image', ogImage, true);
    createMetaTag('og:image:width', '1200', true);
    createMetaTag('og:image:height', '630', true);
    createMetaTag('og:image:alt', imageAlt || `${title} - ${APP_NAME}`, true);

    // --- OG Article extra tags ---
    if (type === 'article') {
      if (publishedDate) createMetaTag('article:published_time', publishedDate, true);
      if (modifiedDate) createMetaTag('article:modified_time', modifiedDate, true);
      createMetaTag('article:author', author || 'BEM FST UNISA', true);
      if (section) createMetaTag('article:section', section, true);
    }

    // --- Twitter Card ---
    createMetaTag('twitter:card', 'summary_large_image');
    createMetaTag('twitter:site', IG_HANDLE);
    createMetaTag('twitter:title', `${title} | ${APP_NAME}`);
    createMetaTag('twitter:description', description);
    createMetaTag('twitter:image', ogImage);
    createMetaTag('twitter:image:alt', imageAlt || `${title} - ${APP_NAME}`);

    // --- Canonical URL ---
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link') as HTMLLinkElement;
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // --- JSON-LD Schema ---
    if (type === 'article') {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        headline: title,
        description: description,
        image: ogImage,
        author: {
          '@type': 'Person',
          name: author || 'BEM FST UNISA',
        },
        publisher: {
          '@type': 'Organization',
          name: 'BEM FST UNISA',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
          },
        },
        datePublished: publishedDate || new Date().toISOString(),
        dateModified: modifiedDate || publishedDate || new Date().toISOString(),
        url: url,
        ...(section ? { articleSection: section } : {}),
      };
      createJsonLd(articleSchema);
    } else {
      const orgSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'BEM FST UNISA',
        alternateName: 'Badan Eksekutif Mahasiswa FST Universitas Sanata Dharma',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
        },
        sameAs: [
          'https://www.instagram.com/bemfstunisa',
        ],
      };
      createJsonLd(orgSchema);
    }

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [title, description, imageUrl, imageAlt, url, type, author, publishedDate, modifiedDate, keywords, section, canonicalUrl]);
};