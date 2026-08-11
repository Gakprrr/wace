const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const apiClient = {
  getFeaturedArticles: async () => {
    const res = await fetch(`${BASE_URL}/api/articles?limit=8`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch featured articles');
    return res.json();
  },
  
  getCategories: async () => {
    const res = await fetch(`${BASE_URL}/api/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  getArticleById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/api/articles/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch article');
    return res.json();
  },
  
  getArticles: async (params?: Record<string, string>) => {
    const url = new URL(`${BASE_URL}/api/articles`);
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
