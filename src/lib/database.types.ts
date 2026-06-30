// Tipos do schema Supabase Ditames — fonte única de verdade
// Reflete exatamente as tabelas reais do banco (supabase/*.sql)
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
) as unknown as CmsPermissions;

// ─── ENUMS ───────────────────────────────────────────────────
export type MediaCategory = "cases" | "blog" | "noticias" | "servicos" | "homepage" | "geral";
export type ContentType = "text" | "html" | "image_id";
export type CmsRole = "director" | "dev" | "editor" | "moderator" | "analyst";
export type NewsStatus = "published" | "draft" | "archived";
export type NewsSource = "manual" | "instagram";

// ─── DATABASE (fonte única de verdade — espelha o SQL real) ───
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
          storage_path: string;
          public_url: string;
          alt_text: string | null;
          category: MediaCategory;
          width: number | null;
          height: number | null;
          size_bytes: number | null;
          mime_type: string | null;
          uploaded_by: string | null;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["media"]["Row"], "id" | "created_at" | "updated_at">> & Pick<Database["public"]["Tables"]["media"]["Row"], "filename" | "storage_path" | "public_url">;
        Update: Partial<Omit<Database["public"]["Tables"]["media"]["Row"], "id" | "created_at" | "updated_at">>;
        Relationships: [];
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
          logo_media_id: string | null;
          logo_url: string | null;
          published: boolean;
          order_index: number;
          slug: string | null;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["cases"]["Row"], "id" | "created_at" | "updated_at">> & Pick<Database["public"]["Tables"]["cases"]["Row"], "name" | "sector">;
        Update: Partial<Omit<Database["public"]["Tables"]["cases"]["Row"], "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };

      // ─── BLOG POSTS ──────────────────────────────────────────
      // Arquitetura definitiva do blog. published: boolean controla visibilidade.
      blog_posts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string;
          title: string;
          excerpt: string;
          body: string;
          category: string;
          tags: string[];
          read_time: string;
          cover_media_id: string | null;
          cover_url: string | null;
          gallery: string[];
          published: boolean;
          published_at: string | null;
          author: string | null;
          created_by: string | null;
          updated_by: string | null;
          seo_title: string | null;
          seo_description: string | null;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["blog_posts"]["Row"], "id" | "created_at" | "updated_at">> & Pick<Database["public"]["Tables"]["blog_posts"]["Row"], "slug" | "title" | "excerpt">;
        Update: Partial<Omit<Database["public"]["Tables"]["blog_posts"]["Row"], "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };

      // ─── NEWS (Notícias) ─────────────────────────────────────
      // Arquitetura definitiva. status: enum controla visibilidade (não boolean).
      // source distingue conteúdo manual de importações (Instagram, link externo).
      news: {
        Row: {
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
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["news"]["Row"], "id" | "created_at" | "updated_at">> & Pick<Database["public"]["Tables"]["news"]["Row"], "title" | "content">;
        Update: Partial<Omit<Database["public"]["Tables"]["news"]["Row"], "id" | "created_at" | "updated_at">>;
        Relationships: [];
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
        Insert: Partial<Omit<Database["public"]["Tables"]["faq"]["Row"], "id" | "created_at" | "updated_at">> & Pick<Database["public"]["Tables"]["faq"]["Row"], "question" | "answer">;
        Update: Partial<Omit<Database["public"]["Tables"]["faq"]["Row"], "id" | "created_at" | "updated_at">>;
        Relationships: [];
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
          when_needed: string[];
          steps: string[];
          keywords: string[];
          icon_name: string;
          cover_media_id: string | null;
          published: boolean;
          order_index: number;
          seo_title: string | null;
          seo_description: string | null;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["services"]["Row"], "id" | "created_at" | "updated_at">> & Pick<Database["public"]["Tables"]["services"]["Row"], "slug" | "title" | "short">;
        Update: Partial<Omit<Database["public"]["Tables"]["services"]["Row"], "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };

      // ─── HOMEPAGE CONTENT ────────────────────────────────────
      homepage_content: {
        Row: {
          id: string;
          updated_at: string;
          key: string;
          value: string;
          type: ContentType;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["homepage_content"]["Row"], "id" | "updated_at">> & Pick<Database["public"]["Tables"]["homepage_content"]["Row"], "key" | "value">;
        Update: Partial<Omit<Database["public"]["Tables"]["homepage_content"]["Row"], "id" | "updated_at">>;
        Relationships: [];
      };

      // ─── CMS USERS ───────────────────────────────────────────
      cms_users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          email: string;
          role: CmsRole;
          status: "active" | "inactive";
          permissions: CmsPermissions;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["cms_users"]["Row"], "created_at" | "updated_at">> & Pick<Database["public"]["Tables"]["cms_users"]["Row"], "id" | "name" | "email">;
        Update: Partial<Omit<Database["public"]["Tables"]["cms_users"]["Row"], "created_at" | "updated_at">>;
        Relationships: [];
      };

      // ─── AUDIT LOGS ──────────────────────────────────────────
      audit_logs: {
        Row: {
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
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">> & Pick<Database["public"]["Tables"]["audit_logs"]["Row"], "action" | "module">;
        Update: Partial<Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">>;
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;

    Enums: {
      media_category: MediaCategory;
      content_type: ContentType;
      cms_role: CmsRole;
      news_status: NewsStatus;
      news_source: NewsSource;
    };
  };
}

// ─── TIPOS DE CONVENIÊNCIA (derivados do Database — fonte única) ───
export type MediaRow = Database["public"]["Tables"]["media"]["Row"];
export type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
export type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
export type NewsRow = Database["public"]["Tables"]["news"]["Row"];
export type FaqRow = Database["public"]["Tables"]["faq"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type HomepageContentRow = Database["public"]["Tables"]["homepage_content"]["Row"];
export type CmsUserRow = Database["public"]["Tables"]["cms_users"]["Row"];
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

// ─── PERMISSÕES PADRÃO POR ROLE ──────────────────────────────
export const ROLE_DEFAULT_PERMISSIONS: Record<CmsRole, CmsPermissions> = {
  director: { ...DIRECTOR_PERMISSIONS },
  dev: { ...DIRECTOR_PERMISSIONS },
  editor: {
    ...DEFAULT_PERMISSIONS,
    edit_homepage: true,
    edit_homepage_images: true,
    edit_cases: true,
    create_edit_news: true,
    create_edit_blog: true,
    create_edit_services: true,
    edit_seo: true,
  },
  moderator: {
    ...DEFAULT_PERMISSIONS,
    publish_archive_content: true,
    view_audit_log: true,
  },
  analyst: {
    ...DEFAULT_PERMISSIONS,
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
