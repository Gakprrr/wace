import { describe, it, expect, vi, beforeEach } from 'vitest';
/**
 * Tests Frontend — Login Page
 * Vérifie le formulaire de connexion et les appels au backend.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mocks Next.js
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('next/link', () => ({ href, children }: any) => <a href={href}>{children}</a>);

// Mock AuthProvider
const mockLogin = vi.fn();
vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: mockLogin,
    logout: vi.fn(),
    refreshSession: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn() as any;

import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage — Formulaire de connexion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le formulaire de connexion avec les champs email et mot de passe", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it("affiche un lien vers la page de réinitialisation du mot de passe", () => {
    render(<LoginPage />);
    expect(screen.getByText(/mot de passe oublié/i)).toBeInTheDocument();
  });

  it("affiche un message d'erreur si les champs sont vides et qu'on soumet", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Email et mot de passe requis' }),
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@wace.com' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Email et mot de passe requis/i)).toBeInTheDocument();
    });
  });

  it("appelle fetch vers /api/auth/login avec les bons identifiants", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        message: 'Connexion réussie',
        user: { id: '1', email: 'client@wace.com', name: 'Client', role: 'CLIENT', avatar: null },
        token: 'jwt-token',
      }),
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'client@wace.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'client@wace.com', password: 'password123' }),
      }));
    });
  });

  it("appelle login() du contexte après authentification réussie", async () => {
    const fakeUser = { id: '1', email: 'client@wace.com', name: 'Client', role: 'CLIENT', avatar: null };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Connexion réussie', user: fakeUser, token: 'jwt-token' }),
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'client@wace.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(fakeUser);
    });
  });

  it("affiche l'état de chargement pendant la soumission", async () => {
    let resolve: (val: any) => void;
    (global.fetch as any).mockReturnValueOnce(new Promise((r) => { resolve = r; }));

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@wace.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /connexion/i })).toBeDisabled();
    });

    resolve!({ ok: true, json: () => Promise.resolve({ user: {}, token: 'tok' }) });
  });

  it("affiche le formulaire 2FA si le backend retourne requires2FA", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ requires2FA: true, tempToken: 'temp-tok', user: {} }),
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@wace.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'admin_pass' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/Vérification 2FA/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });
  });
});
