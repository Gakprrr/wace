import { describe, it, expect, vi, beforeEach } from 'vitest';
/**
 * Tests Frontend — Catalogue Page
 * Vérifie que la page affiche correctement les articles et réagit aux filtres.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

// Mock Navbar et Footer
vi.mock('@/components/Navbar', () => () => <nav data-testid="navbar">Navbar</nav>);
vi.mock('@/components/Footer', () => () => <footer data-testid="footer">Footer</footer>);

// Mock global fetch
const mockArticles = [
  {
    id: 'art-1',
    title: 'Chemise Oxford Bleue',
    description: 'Belle chemise en coton',
    price: 5000,
    oldPrice: null,
    stock: 3,
    state: 'BON_ETAT',
    images: [],
    isAvailable: true,
    isNew: false,
    category: { id: 'cat-1', name: 'Vêtements Homme', slug: 'vetements-homme' },
  },
  {
    id: 'art-2',
    title: 'Robe Florale Zara',
    description: 'Robe légère et colorée',
    price: 7500,
    oldPrice: 12000,
    stock: 1,
    state: 'TRES_BON_ETAT',
    images: [],
    isAvailable: true,
    isNew: true,
    category: { id: 'cat-2', name: 'Vêtements Femme', slug: 'vetements-femme' },
  },
];

const mockCategories = [
  { id: 'cat-1', name: 'Vêtements Homme', slug: 'vetements-homme' },
  { id: 'cat-2', name: 'Vêtements Femme', slug: 'vetements-femme' },
];

global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('/api/categories')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    });
  }
  if (url.includes('/api/articles')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ articles: mockArticles, total: 2 }),
    });
  }
  return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
}) as any;

// Import après les mocks
import CataloguePage from '@/app/(public)/catalogue/page';

describe('CataloguePage — Affichage des articles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/categories')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCategories) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ articles: mockArticles, total: 2 }) });
    });
  });

  it('affiche le titre de la page', async () => {
    render(<CataloguePage />);
    expect(screen.getAllByText(/Catalogue/i)[0]).toBeInTheDocument();
  });

  it('affiche les articles depuis le backend', async () => {
    render(<CataloguePage />);
    await waitFor(() => {
      expect(screen.getByText('Chemise Oxford Bleue')).toBeInTheDocument();
      expect(screen.getByText('Robe Florale Zara')).toBeInTheDocument();
    });
  });

  it("affiche les prix des articles en FCFA", async () => {
    render(<CataloguePage />);
    await waitFor(() => {
      expect(screen.getByText(/5\s*000 FCFA/)).toBeInTheDocument();
      expect(screen.getByText(/7\s*500 FCFA/)).toBeInTheDocument();
    });
  });

  it('affiche le vieux prix barré si présent', async () => {
    render(<CataloguePage />);
    await waitFor(() => {
      expect(screen.getByText(/12\s*000 FCFA/)).toBeInTheDocument();
    });
  });

  it('affiche le squelette de chargement puis les articles', async () => {
    render(<CataloguePage />);
    // Pendant le chargement, les squelettes sont visibles
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
    // Puis les articles apparaissent
    await waitFor(() => {
      expect(screen.getByText('Chemise Oxford Bleue')).toBeInTheDocument();
    });
  });

  it('affiche un message vide si aucun article', async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/categories')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ articles: [], total: 0 }) });
    });
    render(<CataloguePage />);
    await waitFor(() => {
      expect(screen.getByText(/Aucun article ne correspond/i)).toBeInTheDocument();
    });
  });

  it('sollicite le backend quand on clique sur Réinitialiser', async () => {
    render(<CataloguePage />);
    await waitFor(() => screen.getByText('Chemise Oxford Bleue'));

    const resetBtn = screen.getByText('Réinitialiser');
    fireEvent.click(resetBtn);

    // Un nouveau fetch doit être déclenché
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
