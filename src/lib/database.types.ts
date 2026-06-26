// Tipos gerados manualmente a partir do schema do Supabase Ditames
// Execute `npx supabase gen types typescript` para regenerar automaticamente após migrações

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
