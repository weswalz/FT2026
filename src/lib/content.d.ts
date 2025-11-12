export type PageContent = {
  id: number;
  slug: string;
  title: string;
  sections: any;
  seo_meta?: Record<string, unknown>;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type SeoMetaDefaults = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
};

export function getPageContent(slug: string): PageContent | null;
export function pickSection<T = any>(page: PageContent | null, key: string, fallback?: T): T;
export function listSections<T = any>(page: PageContent | null, key: string): T[];
export function getSeoMeta<T extends Record<string, unknown> = SeoMetaDefaults>(
  page: PageContent | null,
  fallback?: T
): SeoMetaDefaults & T;
