const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = {
  getFeaturedArticles: async () => {
    const res = await fetch(`${API_URL}/articles/featured`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch featured articles');
    return res.json();
  },
  
  getCategories: async () => {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  getArticleById: async (id: string) => {
    const res = await fetch(`${API_URL}/articles/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch article');
    return res.json();
  },
  
  getArticles: async (params?: Record<string, string>) => {
    const url = new URL(`${API_URL}/articles`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  }
};

