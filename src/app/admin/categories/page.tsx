"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ConfirmModal from "@/components/ConfirmModal";
import AlertModal from "@/components/AlertModal";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

const COMMON_EMOJIS = [
  "👗", "👕", "👖", "👔", "🧥", "🧦", "👜", "🎒", 
  "🧢", "👒", "🕶️", "🧣", "👟", "👞", "🥾", "👠", 
  "👡", "💎", "⌚", "🛍️"
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [iconType, setIconType] = useState<"emoji" | "image" | "none">("emoji");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<{id: string, name: string} | null>(null);

  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });
  const showAlert = (message: string) => setAlertState({ isOpen: true, message });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const generateSlug = (nameVal: string) => {
    return nameVal
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    let finalIcon = icon;
    if (iconType === "image" && iconFile) {
      try {
        const formData = new FormData();
        formData.append("file", iconFile);
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Erreur lors de l'upload de l'image.");
        finalIcon = uploadData.secureUrl;
      } catch (err: any) {
        setError(err.message);
        setSubmitting(false);
        return;
      }
    } else if (iconType === "none") {
      finalIcon = "";
    }

    const payload = { name, slug, icon: finalIcon };

    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur d'enregistrement de la catégorie.");
      }

      setName("");
      setSlug("");
      setIcon("");
      setIconType("emoji");
      setIconFile(null);
      setEditingId(null);
      loadCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    if (cat.icon && cat.icon.startsWith("http")) {
      setIconType("image");
      setIcon(cat.icon);
      setIconFile(null);
    } else if (cat.icon) {
      setIconType("emoji");
      setIcon(cat.icon);
    } else {
      setIconType("none");
      setIcon("");
    }
  };

  const handleDeleteClick = (id: string, nameVal: string) => {
    setCatToDelete({ id, name: nameVal });
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!catToDelete) return;
    try {
      const res = await fetch(`/api/categories/${catToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((cat) => cat.id !== catToDelete.id));
      } else {
        const data = await res.json();
        showAlert(data.error || "Erreur de suppression.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur réseau.");
    } finally {
      setIsConfirmOpen(false);
      setCatToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setIcon("");
    setIconType("emoji");
    setIconFile(null);
    setError("");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 sm:p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-beige/45 dark:border-anthracite/60">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Gestion des <span className="text-or italic font-light">Catégories</span>
            </h1>
            <p className="text-xs text-encre/65 dark:text-encre dark:text-ivoire/65 mt-1">
              Gérez les familles de vêtements de votre boutique (Robes, Vestes, Pantalons...).
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Add / Edit Form Panel */}
          <div className="md:col-span-1 bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-6 rounded-3xl shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-or border-b border-beige/40 dark:border-anthracite/60 pb-3 mb-5 text-left">
              {editingId ? "Modifier la catégorie" : "Ajouter une catégorie"}
            </h2>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              <div>
                <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Ex: Robes"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
                />
              </div>

              <div>
                <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                  Slug (généré automatiquement)
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ex-robes"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
                />
              </div>

              <div>
                <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                  Icône de la catégorie
                </label>
                <div className="flex flex-col gap-3 mb-1">
                  <select
                    value={iconType}
                    onChange={(e) => setIconType(e.target.value as any)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire focus:border-or/60 focus:outline-none transition-all text-base font-medium"
                  >
                    <option value="emoji">Emoji standard</option>
                    <option value="image">Image personnalisée</option>
                    <option value="none">Aucune</option>
                  </select>

                  <div className="w-full">
                    {iconType === "emoji" && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-anthracite/40 border border-beige/60 dark:border-anthracite/60 rounded-xl shadow-inner max-h-48 overflow-y-auto">
                          {COMMON_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setIcon(emoji)}
                              className={`text-lg w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                icon === emoji 
                                  ? 'border-or bg-or/20 scale-110 shadow-sm' 
                                  : 'border-beige/40 dark:border-anthracite/60 hover:bg-beige/20 dark:hover:bg-anthracite/40 hover:border-or/50 hover:scale-105'
                              }`}
                              title="Choisir cet emoji"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {iconType === "image" && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setIconFile(e.target.files[0]);
                            }
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-or/10 file:text-or hover:file:bg-or/20"
                        />
                      </div>
                    )}
                    {iconType === "none" && (
                      <div className="w-full py-2.5 px-3.5 text-sm text-encre/50 italic">
                        Pas d'icône affichée
                      </div>
                    )}
                  </div>
                </div>
                {iconType === "image" && icon && !iconFile && (
                  <p className="text-[10px] text-green-600 font-medium mt-2">✓ Une image est déjà enregistrée pour cette catégorie. Ajoutez-en une nouvelle pour la remplacer.</p>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold py-3 rounded-xl transition-all shadow-md text-xs disabled:opacity-40"
                >
                  {submitting ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-anthracite hover:bg-anthracite/85 border border-beige/40 text-encre dark:text-ivoire font-bold py-3 rounded-xl transition-all text-xs"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Categories List Table */}
          <div className="md:col-span-2">
            {loading ? (
              <div className="h-48 rounded-3xl bg-beige/30 dark:bg-anthracite/40 animate-pulse border border-beige/40 dark:border-anthracite/60"></div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-anthracite/20 border border-beige/40 rounded-3xl">
                <p className="text-encre/60 dark:text-encre dark:text-ivoire/65 italic">Aucune catégorie enregistrée.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 rounded-3xl shadow-sm">
                <table className="min-w-full divide-y divide-beige/40 dark:divide-anthracite/60 text-sm">
                  <thead className="bg-beige/10 dark:bg-anthracite/20 text-xs font-bold uppercase tracking-wider text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left">Icône</th>
                      <th scope="col" className="px-6 py-4 text-left">Nom</th>
                      <th scope="col" className="px-6 py-4 text-left">Slug</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige/30 dark:divide-anthracite/50 font-light">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-beige/5 dark:hover:bg-anthracite/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-lg">
                          {cat.icon ? (
                            cat.icon.startsWith("http") ? (
                              <img src={cat.icon} alt={cat.name} className="w-8 h-8 rounded-lg object-cover border border-beige/40 dark:border-anthracite/60" />
                            ) : (
                              cat.icon
                            )
                          ) : "📁"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-encre dark:text-ivoire">
                          {cat.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-encre/65 dark:text-encre dark:text-ivoire/65">
                          {cat.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 text-xs">
                          <button
                            onClick={() => handleEditClick(cat)}
                            className="bg-or/10 text-or hover:bg-or hover:text-encre font-bold py-2 px-3 rounded-full border border-or/20 transition-all"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteClick(cat.id, cat.name)}
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
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Supprimer la catégorie"
        message={`Voulez-vous vraiment supprimer la catégorie "${catToDelete?.name}" ?`}
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
