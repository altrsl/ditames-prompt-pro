// Tipos gerados manualmente a partir do schema do Supabase Ditames
// Execute `npx supabase gen types typescript` para regenerar automaticamente após migrações

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── PERMISSÕES CMS ──────────────────────────────────────────
export interface CmsPermissions {
  edit_homepage: boolean;
  edit_homepage_images: boolean;
  edit_cases: boolean;
  create_edit_news: boolean;
  create_edit_blog: boolean;
  create_edit_services: boolean;
  edit_seo: boolean;
  create_users: boolean;
  edit_users: boolean;
  remove_users: boolean;
  manage_permissions: boolean;
  view_audit_log: boolean;
  publish_archive_content: boolean;
}

export const DEFAULT_PERMISSIONS: CmsPermissions = {
  edit_homepage: false,
  edit_homepage_images: false,
  edit_cases: false,
  create_edit_news: false,
  create_edit_blog: false,
  create_edit_services: false,
  edit_seo: false,
  create_users: false,
  edit_users: false,
  remove_users: false,
  manage_permissions: false,
  view_audit_log: false,
  publish_archive_content: false,
};

export const DIRECTOR_PERMISSIONS: CmsPermissions = Object.fromEntries(
  Object.keys(DEFAULT_PERMISSIONS).map((k) => [k, true])
) as CmsPermissions;

export interface Database {
  public: {
    Tables: {
      // ─── MEDIA ───────────────────────────────────────────────
      media: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          filename: string;
          storage_path: string;         // caminho no bucket: "cases/logo-madefrahm.webp"
          public_url: string;           // URL pública completa
          alt_text: string | null;
          category: MediaCategory;      // "cases" | "blog" | "noticias" | "servicos" | "homepage" | "geral"
          width: number | null;
          height: number | null;
          size_bytes: number | null;
          mime_type: string | null;
          uploaded_by: string | null;   // auth.users.id
        };
        Insert: Omit<Database["public"]["Tables"]["media"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["media"]["Insert"]>;
      };

      // ─── CASES ───────────────────────────────────────────────
      cases: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          sector: string;
          description: string | null;
          logo_media_id: string | null; // FK → media.id
          logo_url: string | null;      // URL direta (temporário enquanto não há logo oficial)
          published: boolean;
          order_index: number;
          slug: string | null;          // para futura página individual
        };
        Insert: Omit<Database["public"]["Tables"]["cases"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["cases"]["Insert"]>;
      };

      // ─── BLOG POSTS ──────────────────────────────────────────
      blog_posts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string;
          title: string;
          excerpt: string;
          body: string;                 // HTML ou Markdown
          category: string;
          read_time: string;
          cover_media_id: string | null; // FK → media.id
          cover_url: string | null;
          published: boolean;
          published_at: string | null;
          author: string | null;
          seo_title: string | null;
          seo_description: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["blog_posts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
      };

      // ─── NOTÍCIAS ────────────────────────────────────────────
      news_posts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string;
          title: string;
          excerpt: string;
          body: string;
          category: string;
          read_time: string;
          cover_media_id: string | null;
          cover_url: string | null;
          published: boolean;
          published_at: string | null;
          seo_title: string | null;
          seo_description: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["news_posts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["news_posts"]["Insert"]>;
      };

      // ─── FAQ ─────────────────────────────────────────────────
      faq: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          question: string;
          answer: string;
          order_index: number;
          published: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["faq"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["faq"]["Insert"]>;
      };

      // ─── SERVIÇOS ────────────────────────────────────────────
      services: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string;
          title: string;
          short: string;
          what_is: string;
          when_needed: string[];        // array de strings
          steps: string[];
          keywords: string[];
          icon_name: string;            // nome do ícone Lucide
          cover_media_id: string | null;
          published: boolean;
          order_index: number;
          seo_title: string | null;
          seo_description: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };

      // ─── HOMEPAGE CONTENT ────────────────────────────────────
      homepage_content: {
        Row: {
          id: string;
          updated_at: string;
          key: string;                  // ex: "hero_title", "hero_subtitle"
          value: string;
          type: ContentType;            // "text" | "html" | "image_id"
        };
        Insert: Omit<Database["public"]["Tables"]["homepage_content"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["homepage_content"]["Insert"]>;
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;

    Enums: {
      media_category: MediaCategory;
      content_type: ContentType;
    };
  };
}

export type MediaCategory =
  | "cases"
  | "blog"
  | "noticias"
  | "servicos"
  | "homepage"
  | "geral";

export type ContentType = "text" | "html" | "image_id";

// Tipos de conveniência
export type MediaRow = Database["public"]["Tables"]["media"]["Row"];
export type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
export type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
export type NewsPostRow = Database["public"]["Tables"]["news_posts"]["Row"];
export type FaqRow = Database["public"]["Tables"]["faq"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type HomepageContentRow = Database["public"]["Tables"]["homepage_content"]["Row"];

// ─── TIPOS CMS ───────────────────────────────────────────────
export type CmsRole = 'director' | 'dev' | 'editor' | 'moderator' | 'analyst';
export type NewsStatus = 'published' | 'draft' | 'archived';
export type NewsSource = 'manual' | 'instagram';

export interface CmsUserRow {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  role: CmsRole;
  status: 'active' | 'inactive';
  permissions: CmsPermissions;
}

export interface AuditLogRow {
  id: string;
  created_at: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  module: string;
  record_id: string | null;
  field: string | null;
  previous_value: string | null;
  new_value: string | null;
  metadata: Record<string, unknown>;
}

export interface NewsRow {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string | null;
  category: string;
  cover_image: string | null;
  images: string[];
  source: NewsSource;
  instagram_post_id: string | null;
  instagram_url: string | null;
  status: NewsStatus;
  published_at: string | null;
  read_time: string;
  created_by: string | null;
  updated_by: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

// ─── PERMISSÕES PADRÃO POR ROLE ──────────────────────────────
export const ROLE_DEFAULT_PERMISSIONS: Record<CmsRole, Partial<CmsPermissions>> = {
  director: Object.fromEntries(Object.keys(DEFAULT_PERMISSIONS).map((k) => [k, true])) as CmsPermissions,
  dev: Object.fromEntries(Object.keys(DEFAULT_PERMISSIONS).map((k) => [k, true])) as CmsPermissions,
  editor: {
    edit_homepage: true,
    edit_homepage_images: true,
    edit_cases: true,
    create_edit_news: true,
    create_edit_blog: true,
    create_edit_services: true,
    edit_seo: true,
    publish_archive_content: false,
    create_users: false,
    edit_users: false,
    remove_users: false,
    manage_permissions: false,
    view_audit_log: false,
  },
  moderator: {
    edit_homepage: false,
    edit_homepage_images: false,
    edit_cases: false,
    create_edit_news: false,
    create_edit_blog: false,
    create_edit_services: false,
    edit_seo: false,
    publish_archive_content: true,
    create_users: false,
    edit_users: false,
    remove_users: false,
    manage_permissions: false,
    view_audit_log: true,
  },
  analyst: {
    edit_homepage: false,
    edit_homepage_images: false,
    edit_cases: false,
    create_edit_news: false,
    create_edit_blog: false,
    create_edit_services: false,
    edit_seo: false,
    publish_archive_content: false,
    create_users: false,
    edit_users: false,
    remove_users: false,
    manage_permissions: false,
    view_audit_log: true,
  },
};

export const ROLE_LABELS: Record<CmsRole, string> = {
  director: "Diretor",
  dev: "Desenvolvedor",
  editor: "Editor",
  moderator: "Moderador",
  analyst: "Analista",
};

export const ROLE_DESCRIPTIONS: Record<CmsRole, string> = {
  director: "Acesso total ao sistema",
  dev: "Acesso total ao sistema",
  editor: "Cria e edita conteúdo, sem publicar ou gerenciar usuários",
  moderator: "Revisa e publica conteúdos criados por editores",
  analyst: "Somente leitura — métricas e audit log",
};
