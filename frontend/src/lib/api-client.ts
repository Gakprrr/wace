const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = {
  getFeaturedArticles: async () => {
    try {
      const res = await fetch(`${API_URL}/articles/featured`, { cache: 'no-store' });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn("apiClient: Échec de récupération des articles en vedette (fallback [])", err);
      return [];
    }
  },
  
  getCategories: async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn("apiClient: Échec de récupération des catégories (fallback [])", err);
      return [];
    }
  },

  getArticleById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/articles/${id}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
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
      if (!res.ok) return { articles: [], total: 0 };
      return await res.json();
    } catch (err) {
      console.warn("apiClient: Échec de récupération de la liste des articles", err);
      return { articles: [], total: 0 };
    }
  }
};
