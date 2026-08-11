"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ConfirmModal from "@/components/ConfirmModal";
import AlertModal from "@/components/AlertModal";

interface Article {
  id: string;
  title: string;
  price: number;
  stock: number;
  state: string;
  isAvailable: boolean;
  images: string[];
  category: {
    name: string;
  };
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingField, setEditingField] = useState<{ id: string, field: 'price' | 'stock' } | null>(null);
  const [editValue, setEditValue] = useState<number | string>("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [artToDelete, setArtToDelete] = useState<{id: string, title: string} | null>(null);

  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });
  const showAlert = (message: string) => setAlertState({ isOpen: true, message });

  const loadArticles = async () => {
    try {
      const res = await fetch("/api/articles?limit=100");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error("Failed to load articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDeleteClick = (id: string, title: string) => {
    setArtToDelete({ id, title });
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!artToDelete) return;
    try {
      const res = await fetch(`/api/articles/${artToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((art) => art.id !== artToDelete.id));
      } else {
        showAlert("Erreur lors de la suppression de l'article.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur réseau.");
    } finally {
      setIsConfirmOpen(false);
      setArtToDelete(null);
    }
  };

  const startEdit = (id: string, field: 'price' | 'stock', value: number) => {
    setEditingField({ id, field });
    setEditValue(value);
  };

  const saveEdit = async () => {
    if (!editingField) return;
    const { id, field } = editingField;
    const newValue = Number(editValue);
    if (isNaN(newValue) || newValue < 0) {
      showAlert("Valeur invalide");
      setEditingField(null);
      return;
    }

    const original = articles.find((a) => a.id === id);
    if (original && original[field] === newValue) {
      setEditingField(null);
      return; // Pas de changement
    }

    try {
      const endpoint = field === 'price' ? `/api/articles/${id}/price` : `/api/articles/${id}/stock`;
      const body = field === 'price' ? { price: newValue } : { stock: newValue };
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, [field]: newValue } : a))
        );
      } else {
        const data = await res.json();
        showAlert(data.error || "Erreur de modification.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur réseau.");
    } finally {
      setEditingField(null);
    }
  };

  const filteredArticles = articles.filter((art) =>
    art.title.toLowerCase().includes(search.toLowerCase()) ||
    art.category.name.toLowerCase().includes(search.toLowerCase())
  );

  const stateLabels: Record<string, string> = {
    NEUF: "Neuf",
    TRES_BON_ETAT: "Très Bon État",
    BON_ETAT: "Bon État",
    USE_VINTAGE: "Usé Vintage",
  };

  const stateColors: Record<string, string> = {
    NEUF: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40",
    TRES_BON_ETAT: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40",
    BON_ETAT: "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-or/10 dark:text-or dark:border-or/30",
    USE_VINTAGE: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 sm:p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-beige/45 dark:border-anthracite/60">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Gestion des <span className="text-or italic font-light">Articles</span>
            </h1>
            <p className="text-xs text-encre/65 dark:text-encre dark:text-ivoire/65 mt-1">
              Consultez, ajoutez, modifiez ou supprimez des vêtements de votre catalogue.
            </p>
          </div>
          <a
            href="/admin/articles/new"
            className="flex items-center space-x-2 bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold py-3.5 px-6 rounded-full text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>➕</span>
            <span>Ajouter un Article</span>
          </a>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md">
          <input
            type="text"
            placeholder="Rechercher par titre, catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 px-5 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium shadow-sm"
          />
        </div>

        {/* Table layout */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 bg-beige/30 dark:bg-anthracite/40 animate-pulse rounded-2xl border border-beige/40"></div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-anthracite/20 border border-beige/40 rounded-3xl">
            <p className="text-encre/60 dark:text-encre dark:text-ivoire/65 italic">Aucun article trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 rounded-3xl shadow-sm">
            <table className="min-w-full divide-y divide-beige/40 dark:divide-anthracite/60 text-sm">
              <thead className="bg-beige/10 dark:bg-anthracite/20 text-xs font-bold uppercase tracking-wider text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left">Article</th>
                  <th scope="col" className="px-6 py-4 text-left">Catégorie</th>
                  <th scope="col" className="px-6 py-4 text-left">Prix</th>
                  <th scope="col" className="px-6 py-4 text-left">Stock</th>
                  <th scope="col" className="px-6 py-4 text-left">État</th>
                  <th scope="col" className="px-6 py-4 scope text-left">Dispo</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/30 dark:divide-anthracite/50 font-light">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-beige/5 dark:hover:bg-anthracite/20 transition-colors">
                    {/* Item Details */}
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <img
                        src={art.images[0] || "https://placehold.co/80x100/1a1a18/c8a96e?text=WACE"}
                        alt=""
                        className="w-10 h-12 object-cover rounded-lg bg-beige/10 border border-beige/40 flex-shrink-0"
                      />
                      <span className="font-semibold text-encre dark:text-ivoire truncate max-w-[180px]">
                        {art.title}
                      </span>
                    </td>
                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap text-encre/80 dark:text-encre dark:text-ivoire/85">
                      {art.category.name}
                    </td>
                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingField?.id === art.id && editingField.field === 'price' ? (
                        <input
                          type="number"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-24 bg-white dark:bg-anthracite border border-or/60 rounded px-2 py-1 text-encre dark:text-ivoire font-semibold focus:outline-none"
                        />
                      ) : (
                        <span 
                          onClick={() => startEdit(art.id, 'price', art.price)}
                          className="font-semibold text-or cursor-pointer hover:underline decoration-or/50 decoration-dashed underline-offset-4"
                          title="Cliquez pour modifier"
                        >
                          {art.price.toLocaleString("fr-FR")} FCFA
                        </span>
                      )}
                    </td>
                    {/* Stock */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingField?.id === art.id && editingField.field === 'stock' ? (
                        <input
                          type="number"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-16 bg-white dark:bg-anthracite border border-or/60 rounded px-2 py-1 text-encre dark:text-ivoire font-semibold focus:outline-none"
                        />
                      ) : (
                        <span 
                          onClick={() => startEdit(art.id, 'stock', art.stock)}
                          className={`font-semibold cursor-pointer hover:underline decoration-encre/30 dark:decoration-ivoire/30 decoration-dashed underline-offset-4 ${art.stock === 0 ? "text-red-400" : ""}`}
                          title="Cliquez pour modifier"
                        >
                          {art.stock}
                        </span>
                      )}
                    </td>
                    {/* State */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${stateColors[art.state]}`}>
                        {stateLabels[art.state]}
                      </span>
                    </td>
                    {/* Availability */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${art.isAvailable && art.stock > 0 ? "bg-green-500" : "bg-red-500"}`}></span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 text-xs">
                      <a
                        href={`/admin/articles/${art.id}/edit`}
                        className="inline-block bg-or/10 text-or hover:bg-or hover:text-encre font-bold py-2 px-3 rounded-full border border-or/20 transition-all"
                      >
                        Modifier
                      </a>
                      <button
                        onClick={() => handleDeleteClick(art.id, art.title)}
                        className="bg-red-950/20 text-red-400 hover:bg-red-400 hover:text-white font-bold py-2 px-3 rounded-full border border-red-900/30 transition-all"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Supprimer l'article"
        message={`Voulez-vous vraiment supprimer l'article "${artToDelete?.title}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={executeDelete}
        onCancel={() => setIsConfirmOpen(false)}
        variant="danger"
      />

      <AlertModal
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
        variant="danger"
      />
    </div>
  );
}
