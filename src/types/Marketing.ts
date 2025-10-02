export interface GlossaryArticle {
  id: string;
  slug: string;
  title: string;
  html: string;
  feature_image?: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
  updated_at?: string;
  created_at?: string;
}
