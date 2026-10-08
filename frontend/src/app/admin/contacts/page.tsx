"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ConfirmModal from "@/components/ConfirmModal";
import AlertModal from "@/components/AlertModal";

interface SocialContact {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon?: string;
  isActive: boolean;
  order: number;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<SocialContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [platform, setPlatform] = useState("whatsapp");
  const [customPlatform, setCustomPlatform] = useState("");
  const [label, setLabel] = useState("");
  const [urlVal, setUrlVal] = useState("");
  const [icon, setIcon] = useState("MessageCircle");
  const [iconType, setIconType] = useState<"lucide" | "image" | "none">("lucide");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<{id: string, label: string} | null>(null);

  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });
  const showAlert = (message: string) => setAlertState({ isOpen: true, message });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        // Sort by order asc
        const sorted = (data || []).sort((a: SocialContact, b: SocialContact) => a.order - b.order);
        setContacts(sorted);
      }
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    const finalPlatform = platform === "autre" ? customPlatform : platform;

    if (!finalPlatform || !label || !urlVal) {
      setError("Veuillez remplir les champs obligatoires (plateforme, label, lien).");
      setSubmitting(false);
      return;
    }

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

    const payload = {
      platform: finalPlatform,
      label,
      url: urlVal,
      icon: finalIcon,
    };

    try {
      const url = editingId ? `/api/admin/contacts/${editingId}` : "/api/admin/contacts";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur d'enregistrement du contact.");
      }

      setPlatform("whatsapp");
      setCustomPlatform("");
      setLabel("");
      setUrlVal("");
      setIconType("lucide");
      setIcon("MessageCircle");
      setIconFile(null);
      setEditingId(null);
      loadContacts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (c: SocialContact) => {
    setEditingId(c.id);
    const knownPlatforms = ["whatsapp", "instagram", "tiktok", "facebook", "gmail"];
    const p = c.platform.toLowerCase();
    if (knownPlatforms.includes(p)) {
      setPlatform(p);
      setCustomPlatform("");
    } else {
      setPlatform("autre");
      setCustomPlatform(c.platform);
    }

    setLabel(c.label);
    setUrlVal(c.url);

    if (c.icon && c.icon.startsWith("http")) {
      setIconType("image");
      setIcon(c.icon);
      setIconFile(null);
    } else if (c.icon) {
      setIconType("lucide");
      setIcon(c.icon);
    } else {
      setIconType("none");
      setIcon("");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
        );
      } else {
        showAlert("Erreur lors de la modification du statut.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur réseau lors de la modification du statut.");
    }
  };

  const handleDeleteClick = (id: string, labelVal: string) => {
    setContactToDelete({ id, label: labelVal });
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!contactToDelete) return;
    try {
      const res = await fetch(`/api/admin/contacts/${contactToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== contactToDelete.id));
      } else {
        const data = await res.json();
        showAlert(data.error || "Erreur de suppression.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur réseau.");
    } finally {
      setIsConfirmOpen(false);
      setContactToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setPlatform("whatsapp");
    setCustomPlatform("");
    setLabel("");
    setUrlVal("");
    setIconType("lucide");
    setIcon("MessageCircle");
    setIconFile(null);
    setError("");
  };

  const syncOrder = async (newContacts: SocialContact[]) => {
    try {
      // Met à jour visuellement d'abord
      setContacts(newContacts);
      const orderedIds = newContacts.map(c => c.id);
      const res = await fetch("/api/admin/contacts/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) {
        showAlert("Erreur lors de la sauvegarde de l'ordre.");
        loadContacts(); // Revert
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur réseau lors de la réorganisation.");
      loadContacts(); // Revert
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newContacts = [...contacts];
    const temp = newContacts[index - 1];
    newContacts[index - 1] = newContacts[index];
    newContacts[index] = temp;
    // Recalculer l'ordre
    newContacts.forEach((c, i) => (c.order = i));
    syncOrder(newContacts);
  };

  const handleMoveDown = (index: number) => {
    if (index === contacts.length - 1) return;
    const newContacts = [...contacts];
    const temp = newContacts[index + 1];
    newContacts[index + 1] = newContacts[index];
    newContacts[index] = temp;
    // Recalculer l'ordre
    newContacts.forEach((c, i) => (c.order = i));
    syncOrder(newContacts);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 sm:p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-beige/45 dark:border-anthracite/60">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Contacts & <span className="text-or italic font-light">Réseaux</span>
            </h1>
            <p className="text-xs text-encre/65 dark:text-encre dark:text-ivoire/65 mt-1">
              Configurez les canaux sociaux de contact de l'administrateur (WhatsApp, Instagram, etc.).
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Form Panel */}
          <div className="md:col-span-1 bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-6 rounded-3xl shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-or border-b border-beige/40 dark:border-anthracite/60 pb-3 mb-5 text-left">
              {editingId ? "Modifier le canal" : "Ajouter un canal"}
            </h2>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-3">
                <div className="w-full">
                  <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                    Plateforme
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire focus:border-or/60 focus:outline-none transition-all text-base font-medium"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="gmail">Gmail</option>
                    <option value="autre">Autre (Personnalisé)</option>
                  </select>
                </div>
                {platform === "autre" && (
                  <div className="w-full animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                      Nom de la plateforme
                    </label>
                    <input
                      type="text"
                      required
                      value={customPlatform}
                      onChange={(e) => setCustomPlatform(e.target.value)}
                      placeholder="Ex: Discord, Telegram..."
                      className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                  Libellé d'affichage (Label)
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex: +228 90 00 00 00"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
                />
              </div>

              <div>
                <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                  URL / Lien d'action
                </label>
                <input
                  type="text"
                  required
                  value={urlVal}
                  onChange={(e) => setUrlVal(e.target.value)}
                  placeholder="Ex: https://wa.me/..."
                  className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
                />
              </div>

              <div>
                <label className="block text-sm text-encre dark:text-ivoire mb-1.5 font-semibold">
                  Icône du canal
                </label>
                <div className="flex flex-col gap-3 mb-1">
                  <select
                    value={iconType}
                    onChange={(e) => setIconType(e.target.value as any)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire focus:border-or/60 focus:outline-none transition-all text-base font-medium"
                  >
                    <option value="lucide">Icône standard</option>
                    <option value="image">Image / Logo</option>
                    <option value="none">Aucune</option>
                  </select>

                  <div className="w-full">
                    {iconType === "lucide" && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <select
                          value={icon}
                          onChange={(e) => setIcon(e.target.value)}
                          className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire focus:border-or/60 focus:outline-none transition-all text-base font-medium"
                        >
                          <option value="">Sélectionnez une icône...</option>
                          <option value="MessageCircle">WhatsApp / Messages</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Twitter">Twitter / X</option>
                          <option value="Youtube">YouTube</option>
                          <option value="Mail">Email (Mail)</option>
                          <option value="Phone">Téléphone (Phone)</option>
                          <option value="MapPin">Adresse (MapPin)</option>
                          <option value="Globe">Site web (Globe)</option>
                          <option value="Link">Lien (Link)</option>
                        </select>
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
                  <p className="text-[10px] text-green-600 font-medium">✓ Une image est déjà enregistrée pour ce canal. Ajoutez-en une nouvelle pour la remplacer.</p>
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

          {/* List panel */}
          <div className="md:col-span-2">
            {loading ? (
              <div className="h-48 bg-beige/30 dark:bg-anthracite/40 animate-pulse border border-beige/40 rounded-3xl"></div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-anthracite/20 border border-beige/40 rounded-3xl">
                <p className="text-encre/60 dark:text-encre dark:text-ivoire/65 italic">Aucun canal de contact configuré.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 rounded-3xl shadow-sm">
                <table className="min-w-full divide-y divide-beige/40 dark:divide-anthracite/60 text-sm">
                  <thead className="bg-beige/10 dark:bg-anthracite/20 text-xs font-bold uppercase tracking-wider text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left">Plateforme</th>
                      <th scope="col" className="px-6 py-4 text-left">Libellé</th>
                      <th scope="col" className="px-6 py-4 text-left">Lien</th>
                      <th scope="col" className="px-6 py-4 text-left">Actif</th>
                      <th scope="col" className="px-6 py-4 text-left">Ordre</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige/30 dark:divide-anthracite/50 font-light">
                    {contacts.map((c) => (
                      <tr key={c.id} className="hover:bg-beige/5 dark:hover:bg-anthracite/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-bold uppercase text-xs tracking-wider text-or">
                          {c.platform}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-encre dark:text-ivoire">
                          {c.label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap truncate max-w-[150px] text-encre/65 dark:text-encre dark:text-ivoire/65">
                          {c.url}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={c.isActive}
                            onChange={() => handleToggleActive(c.id, c.isActive)}
                            className="accent-or h-4 w-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left space-x-1">
                          <button
                            onClick={() => handleMoveUp(contacts.findIndex(x => x.id === c.id))}
                            disabled={contacts.findIndex(x => x.id === c.id) === 0}
                            className="p-1 rounded bg-beige/20 text-encre dark:text-ivoire hover:bg-or hover:text-white disabled:opacity-30 transition-colors"
                            title="Monter"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleMoveDown(contacts.findIndex(x => x.id === c.id))}
                            disabled={contacts.findIndex(x => x.id === c.id) === contacts.length - 1}
                            className="p-1 rounded bg-beige/20 text-encre dark:text-ivoire hover:bg-or hover:text-white disabled:opacity-30 transition-colors"
                            title="Descendre"
                          >
                            ↓
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 text-xs">
                          <button
                            onClick={() => handleEditClick(c)}
                            className="bg-or/10 text-or hover:bg-or hover:text-encre font-bold py-2 px-3 rounded-full border border-or/20 transition-all"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteClick(c.id, c.label)}
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
        title="Supprimer le canal"
        message={`Voulez-vous vraiment supprimer le contact "${contactToDelete?.label}" ?`}
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
