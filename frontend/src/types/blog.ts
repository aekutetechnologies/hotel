export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  blog_count?: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  blog_count?: number;
}

export interface BlogImage {
  id: number;
  image?: string;
  image_url?: string;
  alt_text: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface BlogAuthor {
  id: number;
  name: string;
  mobile: string;
  email?: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  author: BlogAuthor;
  featured_image?: BlogImage;
  images?: BlogImage[];
  content: string; // JSON string from Lexical
  category?: BlogCategory;
  tags: BlogTag[];
  is_highlighted: boolean;
  is_published: boolean;
  published_at?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  read_time: number; // in minutes
}

export interface BlogListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Blog[];
}

export interface BlogFormData {
  title: string;
  slug?: string;
  content: string;
  category_id?: number | null;
  featured_image_id?: number | null;
  image_ids?: number[];
  tag_ids: number[];
  is_highlighted: boolean;
  is_published: boolean;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  highlighted?: boolean;
}

