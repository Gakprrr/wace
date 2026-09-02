"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/AuthProvider";
import { X, Save, Lock, Mail, User as UserIcon } from "lucide-react";

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminProfileModal({ isOpen, onClose }: AdminProfileModalProps) {
  const { user } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setMounted(true);
    if (isOpen && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setCurrentPassword("");
      setNewPassword("");
      setError("");
      setSuccess("");
    }
  }, [isOpen, user]);

  if (!isOpen || !user || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name !== user.name ? name : undefined,
          email: email !== user.email ? email : undefined,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      setSuccess("Profil mis à jour avec succès ! Les changements seront visibles au prochain rechargement.");
      setTimeout(() => {
        onClose();
        if (email !== user.email || name !== user.name) {
          window.location.reload();
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-encre/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white dark:bg-anthracite w-full max-w-lg rounded-[2rem] shadow-2xl border border-beige/50 dark:border-anthracite/80 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-beige/30 dark:border-anthracite/60 flex justify-between items-center bg-[#705C3B] text-white">
          <h2 className="font-display text-xl font-bold tracking-wide">
            Mon <span className="italic font-light">Profil</span> Administrateur
          </h2>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-600 border border-green-100 text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-encre/80 dark:text-ivoire/80 mb-2 uppercase tracking-wider">
                <div className="flex items-center gap-2"><UserIcon size={16} /> Nom Complet</div>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-beige/60 dark:border-anthracite/60 bg-gray-50 dark:bg-anthracite focus:ring-2 focus:ring-or focus:border-or outline-none transition-all text-sm font-medium text-encre dark:text-white"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-encre/80 dark:text-ivoire/80 mb-2 uppercase tracking-wider">
                <div className="flex items-center gap-2"><Mail size={16} /> E-mail WACE</div>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-beige/60 dark:border-anthracite/60 bg-gray-50 dark:bg-anthracite focus:ring-2 focus:ring-or focus:border-or outline-none transition-all text-sm font-medium text-encre dark:text-white"
              />
            </div>

            <hr className="border-beige/30 dark:border-anthracite/60 my-2" />

            <div>
              <label className="block text-sm font-bold text-encre/80 dark:text-ivoire/80 mb-2 uppercase tracking-wider">
                <div className="flex items-center gap-2"><Lock size={16} /> Nouveau mot de passe (optionnel)</div>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Laisser vide pour ne pas changer"
                className="w-full px-4 py-3 rounded-xl border border-beige/60 dark:border-anthracite/60 bg-gray-50 dark:bg-anthracite focus:ring-2 focus:ring-or focus:border-or outline-none transition-all text-sm font-medium text-encre dark:text-white"
              />
            </div>

            {(email !== user.email || newPassword) && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <label className="block text-sm font-bold text-red-500 mb-2 uppercase tracking-wider">
                  <div className="flex items-center gap-2"><Lock size={16} /> Mot de passe actuel *</div>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Requis pour valider les changements sensibles"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-red-200 bg-red-50 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all text-sm font-medium text-encre"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-2 w-full bg-[#705C3B] hover:bg-[#5a4a2f] text-white py-3.5 rounded-xl font-bold tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
