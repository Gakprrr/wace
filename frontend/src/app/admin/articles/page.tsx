"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ConfirmModal from "@/components/ConfirmModal";
import AlertModal from "@/components/AlertModal";
import QRCodeModal from "@/components/QRCodeModal";
import { QrCode } from "lucide-react";

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

  const [editingField, setEditingField] = useState<{ id: string; field: 'price' | 'stock' } | null>(null);
  const [editValue, setEditValue] = useState<number | string>("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [artToDelete, setArtToDelete] = useState<{ id: string; title: string } | null>(null);

  const [qrModalArticle, setQrModalArticle] = useState<{ id: string; title: string } | null>(null);

  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });
  const showAlert = (message: string) => setAlertState({ isOpen: true, message });

  const loadArticles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/articles?limit=100`);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/articles/${artToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== artToDelete.id));
      } else {
        const data = await res.json();
        showAlert(data.error || "Erreur lors de la suppression.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur réseau lors de la suppression.");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const startEdit = (id: string, field: 'price' | 'stock', currentValue: number) => {
    setEditingField({ id, field });
    setEditValue(currentValue);
  };

  const saveEdit = async () => {
    if (!editingField) return;
    const { id, field } = editingField;
    const numValue = Number(editValue);

    if (isNaN(numValue) || numValue < 0) {
      setEditingField(null);
      return;
    }

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/articles/${id}`;
      const payload = field === 'price' ? { price: numValue } : { stock: numValue };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setArticles(articles.map(a => a.id === id ? { ...a, [field]: numValue } : a));
      } else {
        const data = await res.json();
        showAlert(data.error || "Échec de la mise à jour");
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur réseau lors de la modification.");
    } finally {
      setEditingField(null);
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  const stateColors: Record<string, string> = {
    NEUF: "bg-green-500/20 text-green-400 border border-green-500/30",
    TRES_BON_ETAT: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    BON_ETAT: "bg-or/20 text-or border border-or/30",
    USE_VINTAGE: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  };

  const stateLabels: Record<string, string> = {
    NEUF: "Neuf avec étiquette",
    TRES_BON_ETAT: "Très bon état",
    BON_ETAT: "Bon état",
    USE_VINTAGE: "Usé / Vintage",
  };

  return (
    <div className="flex min-h-screen bg-ivoire dark:bg-encre font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-encre dark:text-ivoire">
              Gestion du Catalogue ({filteredArticles.length})
            </h1>
            <p className="text-sm text-encre/60 dark:text-ivoire/60 font-light">
              Gérez vos vêtements, éditez les prix, le stock et générez les codes QR.
            </p>
          </div>
          <a
            href="/admin/articles/new"
            className="bg-or text-encre hover:bg-white font-bold py-3 px-6 rounded-full transition-all shadow-md flex items-center gap-2 text-sm"
          >
            <span>+ Ajouter un Article</span>
          </a>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher par nom ou catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 px-5 py-3 rounded-full bg-white dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 text-encre dark:text-ivoire text-sm focus:outline-none focus:border-or transition"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-or font-medium animate-pulse">
            Chargement du catalogue...
          </div>
        ) : (
          <div className="bg-white dark:bg-anthracite rounded-[2rem] shadow-xl border border-beige/40 dark:border-anthracite/60 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-beige/30 dark:border-anthracite/50 text-[11px] font-bold uppercase tracking-wider text-encre/50 dark:text-ivoire/50">
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Prix</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">État</th>
                  <th className="px-6 py-4">Dispo</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/30 dark:divide-anthracite/50 font-light text-sm">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-beige/5 dark:hover:bg-anthracite/20 transition-colors">
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
                    <td className="px-6 py-4 whitespace-nowrap text-encre/80 dark:text-ivoire/85">
                      {art.category?.name || "Sans catégorie"}
                    </td>
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
                          className="font-semibold text-or cursor-pointer hover:underline underline-offset-4"
                          title="Cliquez pour modifier"
                        >
                          {Number(art.price).toLocaleString("fr-FR")} FCFA
                        </span>
                      )}
                    </td>
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
                          className={`font-semibold cursor-pointer hover:underline underline-offset-4 ${art.stock === 0 ? "text-red-400" : ""}`}
                          title="Cliquez pour modifier"
                        >
                          {art.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${stateColors[art.state] || "bg-gray-100 text-gray-800"}`}>
                        {stateLabels[art.state] || art.state}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${art.isAvailable && art.stock > 0 ? "bg-green-500" : "bg-red-500"}`}></span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 text-xs">
                      <button
                        onClick={() => setQrModalArticle({ id: art.id, title: art.title })}
                        className="inline-flex items-center gap-1 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold py-2 px-3 rounded-full border border-indigo-600/20 transition-all"
                        title="Générer / Imprimer le Code QR"
                      >
                        <QrCode className="w-3.5 h-3.5" /> QR
                      </button>
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

      <QRCodeModal
        isOpen={!!qrModalArticle}
        articleId={qrModalArticle?.id || ""}
        articleTitle={qrModalArticle?.title || ""}
        onClose={() => setQrModalArticle(null)}
      />

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
