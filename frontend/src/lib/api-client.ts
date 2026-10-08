const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function safeJsonParse<T>(res: Response, fallback: T): Promise<T> {
  if (!res.ok) return fallback;
  try {
    const text = await res.text();
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export const apiClient = {
  getFeaturedArticles: async () => {
    try {
      const res = await fetch(`${API_URL}/articles/featured`, { cache: 'no-store' });
      return await safeJsonParse(res, []);
    } catch (err) {
      console.warn("apiClient: Échec de récupération des articles en vedette (fallback [])", err);
      return [];
    }
  },
  
  getCategories: async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
      return await safeJsonParse(res, []);
    } catch (err) {
      console.warn("apiClient: Échec de récupération des catégories (fallback [])", err);
      return [];
    }
  },

  getArticleById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/articles/${id}`, { cache: 'no-store' });
      return await safeJsonParse(res, null);
    } catch (err) {
      console.warn("apiClient: Échec de récupération de l'article (fallback null)", err);
      return null;
    }
  },
  
  getArticles: async (params?: Record<string, string>) => {
    try {
      const url = new URL(`${API_URL}/articles`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }
      const res = await fetch(url.toString(), { cache: 'no-store' });
      return await safeJsonParse(res, { articles: [], total: 0 });
    } catch (err) {
      console.warn("apiClient: Échec de récupération de la liste des articles", err);
      return { articles: [], total: 0 };
    }
  }
};
