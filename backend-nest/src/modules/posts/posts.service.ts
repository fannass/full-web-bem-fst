import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreatePostDto, PostStatus, PostCategory } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, file?: Express.Multer.File) {
    try {
      // Validate file if provided
      let featured_image: string | null = null;
      if (file) {
        featured_image = await this.handleFileUpload(file);
      }

      // Generate slug from title
      const slug = this.generateSlug(createPostDto.title);

      // Check if slug already exists
      const existingPost = await this.prisma.posts.findUnique({
        where: { slug },
      });

      if (existingPost) {
        throw new BadRequestException(`Post dengan judul "${createPostDto.title}" sudah ada`);
      }

      const post = await this.prisma.posts.create({
        data: {
          title: createPostDto.title.trim(),
          slug,
          excerpt: (createPostDto.excerpt || '').trim(),
          content: createPostDto.content.trim(),
          category: createPostDto.category || PostCategory.NEWS,
          featured_image,
          status: createPostDto.status || PostStatus.DRAFT,
          author: (createPostDto.author || 'Admin BEM').trim(),
          published_at: createPostDto.published_at ? new Date(createPostDto.published_at) : null,
          meta_title: (createPostDto.meta_title || createPostDto.title).trim(),
          meta_description: (createPostDto.meta_description || '').trim(),
          canonical_url: (createPostDto.canonical_url || '').trim(),
          og_image: (createPostDto.og_image || featured_image || '').trim(),
        },
      });

      console.log(`✓ Post berhasil dibuat: ${post.title} (ID: ${post.id})`);
      return post;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating post:', error);
      throw new InternalServerErrorException(`Gagal membuat post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(page: number = 1, limit: number = 6) {
    const skip = (page - 1) * limit;

    // Filter out soft-deleted posts
    const where = { deleted_at: null };

    const [posts, total] = await Promise.all([
      this.prisma.posts.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.posts.count({ where }),
    ]);

    return {
      data: posts,
      meta: {
        current_page: page,
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const post = await this.prisma.posts.findUnique({
      where: { id },
    });

    if (!post || post.deleted_at !== null) {
      throw new NotFoundException(`Post dengan ID ${id} tidak ditemukan`);
    }

    return post;
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.posts.findUnique({
      where: { slug },
    });

    if (!post || post.deleted_at !== null) {
      throw new NotFoundException(`Post dengan slug ${slug} tidak ditemukan`);
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, file?: Express.Multer.File) {
    try {
      const post = await this.prisma.posts.findUnique({
        where: { id },
      });

      if (!post || post.deleted_at !== null) {
        throw new NotFoundException(`Post dengan ID ${id} tidak ditemukan`);
      }

      // Handle file upload
      let featured_image = post.featured_image;
      if (file) {
        // Delete old file if exists
        if (post.featured_image) {
          this.deleteFile(post.featured_image);
        }
        featured_image = await this.handleFileUpload(file);
      }

      // Generate new slug if title changed
      let slug = post.slug;
      if (updatePostDto.title && updatePostDto.title !== post.title) {
        const newSlug = this.generateSlug(updatePostDto.title);
        
        // Check if new slug already exists (excluding current post)
        const existingPost = await this.prisma.posts.findUnique({
          where: { slug: newSlug },
        });

        if (existingPost && existingPost.id !== id) {
          throw new BadRequestException(`Post dengan judul "${updatePostDto.title}" sudah ada`);
        }
        
        slug = newSlug;
      }

      const updated = await this.prisma.posts.update({
        where: { id },
        data: {
          title: updatePostDto.title ? updatePostDto.title.trim() : post.title,
          slug,
          excerpt: updatePostDto.excerpt !== undefined ? updatePostDto.excerpt.trim() : post.excerpt,
          content: updatePostDto.content ? updatePostDto.content.trim() : post.content,
          category: updatePostDto.category || post.category,
          featured_image,
          status: updatePostDto.status || post.status,
          author: updatePostDto.author ? updatePostDto.author.trim() : post.author,
          published_at: updatePostDto.published_at ? new Date(updatePostDto.published_at) : post.published_at,
          meta_title: updatePostDto.meta_title ? updatePostDto.meta_title.trim() : post.meta_title,
          meta_description: updatePostDto.meta_description ? updatePostDto.meta_description.trim() : post.meta_description,
          canonical_url: updatePostDto.canonical_url ? updatePostDto.canonical_url.trim() : post.canonical_url,
          og_image: updatePostDto.og_image ? updatePostDto.og_image.trim() : (featured_image || post.og_image),
        },
      });

      console.log(`✓ Post berhasil diperbarui: ${updated.title} (ID: ${updated.id})`);
      return updated;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating post:', error);
      throw new InternalServerErrorException(`Gagal memperbarui post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async remove(id: number) {
    const post = await this.prisma.posts.findUnique({
      where: { id },
    });

    if (!post || post.deleted_at !== null) {
      throw new NotFoundException(`Post dengan ID ${id} tidak ditemukan`);
    }

    // Delete file if exists
    if (post.featured_image) {
      this.deleteFile(post.featured_image);
    }

    // Soft delete: set deleted_at timestamp
    const deleted = await this.prisma.posts.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    console.log(`✓ Post berhasil dihapus: ${deleted.title} (ID: ${deleted.id})`);
    return { message: 'Post berhasil dihapus' };
  }

  // File handling methods
  private async handleFileUpload(file: Express.Multer.File): Promise<string> {
    // Validate file
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
    if (file.size > maxSize) {
      throw new BadRequestException(`Ukuran file tidak boleh melebihi 5MB`);
    }

    const allowedMimeTypes = process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Tipe file tidak didukung. Gunakan: JPEG, PNG, GIF, WebP`);
    }

    // Create uploads directory if not exists
    const uploadDir = path.join(process.cwd(), 'uploads', 'posts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}_${random}${ext}`;

    const filepath = path.join(uploadDir, filename);

    // Write file
    fs.writeFileSync(filepath, file.buffer);

    // Return relative path
    return `posts/${filename}`;
  }

  private deleteFile(filePath: string): void {
    try {
      const fullPath = path.join(process.cwd(), 'uploads', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }

  async generateSitemap(baseUrl: string = 'http://localhost:3001') {
    try {
      // Get all published posts (not soft deleted)
      const posts = await this.prisma.posts.findMany({
        where: {
          deleted_at: null,
          status: 'published',
        },
        select: {
          slug: true,
          updated_at: true,
        },
        orderBy: { updated_at: 'desc' },
      });

      // Build XML sitemap
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Add main pages
      const mainPages = [
        { loc: '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '1.0' },
        { loc: '/#/posts', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
        { loc: '/#/cabinet', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.8' },
        { loc: '/#/about', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.7' },
        { loc: '/#/contact', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.7' },
      ];

      for (const page of mainPages) {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}${page.loc}</loc>\n`;
        sitemap += `    <lastmod>${page.lastmod}</lastmod>\n`;
        sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemap += `    <priority>${page.priority}</priority>\n`;
        sitemap += '  </url>\n';
      }

      // Add post detail pages
      for (const post of posts) {
        const lastmod = post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/#/posts/${post.slug}</loc>\n`;
        sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        sitemap += '  </url>\n';
      }

      sitemap += '</urlset>';

      return sitemap;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      throw new InternalServerErrorException(`Gagal membuat sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
}
