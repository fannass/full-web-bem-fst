import { IsString, IsOptional, MinLength, MaxLength, IsEnum, IsDateString } from 'class-validator';

// Define enums for validation
export enum PostCategory {
  NEWS = 'news',
  EVENT = 'event',
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export class CreatePostDto {
  @IsString({ message: 'Judul harus berupa text' })
  @MinLength(5, { message: 'Judul minimal 5 karakter' })
  @MaxLength(255, { message: 'Judul maksimal 255 karakter' })
  title: string;

  @IsString({ message: 'Konten harus berupa text' })
  @MinLength(10, { message: 'Konten minimal 10 karakter' })
  content: string;

  @IsString({ message: 'Excerpt harus berupa text' })
  @IsOptional()
  excerpt?: string;

  @IsEnum(PostCategory, { message: 'Kategori harus news atau event' })
  category: PostCategory;

  @IsEnum(PostStatus, { message: 'Status harus draft atau published' })
  @IsOptional()
  status?: PostStatus;

  @IsString({ message: 'Penulis harus berupa text' })
  @IsOptional()
  @MaxLength(255, { message: 'Nama penulis maksimal 255 karakter' })
  author?: string;

  @IsDateString({}, { message: 'Format tanggal tidak valid' })
  @IsOptional()
  published_at?: string;

  @IsString({ message: 'Meta title harus berupa text' })
  @IsOptional()
  meta_title?: string;

  @IsString({ message: 'Meta description harus berupa text' })
  @IsOptional()
  meta_description?: string;

  @IsString({ message: 'Canonical URL harus berupa text' })
  @IsOptional()
  canonical_url?: string;

  @IsString({ message: 'OG image harus berupa text' })
  @IsOptional()
  og_image?: string;
}
