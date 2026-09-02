"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

interface Category {
  id: string;
  name: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [state, setState] = useState("BON_ETAT");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isNew, setIsNew] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
          if (data.length > 0) {
            setCategoryId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    const priceNum = Number(price);
    if (!Number.isInteger(priceNum) || priceNum < 0) {
      setError("Le prix doit être un nombre entier positif (sans virgule ni négatif).");
      setSubmitting(false);
      return;
    }

    let oldPriceNum = undefined;
    if (oldPrice) {
      oldPriceNum = Number(oldPrice);
      if (!Number.isInteger(oldPriceNum) || oldPriceNum < 0) {
        setError("L'ancien prix doit être un nombre entier positif (sans virgule ni négatif).");
        setSubmitting(false);
        return;
      }
    }

    const stockNum = Number(stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      setError("Le stock doit être un nombre entier positif (sans virgule ni négatif).");
      setSubmitting(false);
      return;
    }

    const payload = {
      title,
      description,
      price: priceNum,
      oldPrice: oldPriceNum,
      stock: stockNum,
      state,
      categoryId,
      images,
      isAvailable,
      isNew,
    };

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur de création de l'article.");
      }

      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="animate-pulse font-medium text-or">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 sm:p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-beige/45 dark:border-anthracite/60">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Ajouter un <span className="text-or italic font-light">Article</span>
            </h1>
            <p className="text-xs text-encre/65 dark:text-encre dark:text-ivoire/65 mt-1">
              Remplissez les détails pour créer une nouvelle pièce unique.
            </p>
          </div>
          <a
            href="/admin/articles"
            className="text-xs text-encre/60 dark:text-encre dark:text-ivoire/60 hover:text-or transition-colors"
          >
            Retour à la liste
          </a>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto w-full bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-8 rounded-3xl shadow-sm flex flex-col gap-5 text-left">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Titre de l'article
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Robe en Soie Vintage"
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              />
            </div>

            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Catégorie
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
              Description de l'article
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description détaillée du vêtement (matière, taille, coupe...)"
              className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
            ></textarea>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Prix (FCFA)
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4500"
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              />
            </div>

            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Ancien Prix (Optionnel)
              </label>
              <input
                type="number"
                min={0}
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="8000"
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              />
            </div>

            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Stock
              </label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="1"
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                État du vêtement
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              >
                <option value="NEUF">Neuf</option>
                <option value="TRES_BON_ETAT">Très Bon État</option>
                <option value="BON_ETAT">Bon État</option>
                <option value="USE_VINTAGE">Usé Vintage</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Images de l'article (Upload)
              </label>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      setUploading(true);
                      setError("");
                      try {
                        const newImages = [...images];
                        for (let i = 0; i < files.length; i++) {
                          const formData = new FormData();
                          formData.append("file", files[i]);
                          const res = await fetch("/api/admin/upload", {
                            method: "POST",
                            body: formData,
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || "Erreur lors de l'upload de l'image");
                          newImages.push(data.secureUrl);
                        }
                        setImages(newImages);
                      } catch (err: any) {
                        setError(err.message);
                      } finally {
                        setUploading(false);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-beige/30 hover:bg-beige/50 dark:bg-anthracite/80 dark:hover:bg-anthracite transition-colors border border-dashed border-or/40 rounded-2xl py-4 px-6 text-sm text-center flex-1 font-medium text-encre/80 dark:text-ivoire/80"
                  >
                    {uploading ? "Téléchargement en cours..." : "Cliquez pour uploader des images"}
                  </label>
                </div>

                {/* Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-beige/40">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-24 object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-8 mt-2 select-none">
            <label className="flex items-center space-x-3 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="accent-or h-4 w-4"
              />
              <span>Disponible à la vente</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="accent-or h-4 w-4"
              />
              <span>Marquer comme Nouveau</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold py-4 rounded-2xl transition-all shadow-md mt-6 text-sm disabled:opacity-40"
          >
            {submitting ? "Création..." : "Ajouter l'article"}
          </button>
        </form>
      </main>
    </div>
  );
}
