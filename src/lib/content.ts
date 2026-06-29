export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  category: string;
  readTime: string;
  body: string[]; // paragraphs
};

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const fmt = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} de ${MESES[m - 1]} de ${y}`;
};

export const formatDate = fmt;

// Posts reais serão criados pelo painel CMS em /admin
// Os arrays abaixo são o fallback — ficam vazios até o primeiro post verdadeiro

export const blogPosts: Post[] = [];

export const newsPosts: Post[] = [];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

export function getNewsPost(slug: string) {
  return newsPosts.find((p) => p.slug === slug);
}
