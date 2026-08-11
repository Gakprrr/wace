"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ConfirmModal from "@/components/ConfirmModal";
import AlertModal from "@/components/AlertModal";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: "ADMIN" | "CLIENT";
  isActive: boolean;
  createdAt: string;
  twoFactorEnabled: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, user: User | null}>({isOpen: false, user: null});
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, user: User | null}>({isOpen: false, user: null});
  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });
  
  const showAlert = (message: string) => setAlertState({ isOpen: true, message });

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    document.title = "WACE Admin | Gestion des Utilisateurs";
  }, []);

  const handleToggleStatus = (user: User) => {
    setConfirmModal({ isOpen: true, user });
  };

  const executeToggleStatus = async () => {
    const user = confirmModal.user;
    if (!user) return;
    
    setConfirmModal({ isOpen: false, user: null });

    try {
      const res = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.isActive }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: data.user.isActive } : u))
        );
      } else {
        const data = await res.json();
        showAlert(data.error || "Erreur lors de la modification du statut.");
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      showAlert("Erreur réseau.");
    }
  };

  const handleDeleteUser = (user: User) => {
    setDeleteModal({ isOpen: true, user });
  };

  const executeDeleteUser = async () => {
    const user = deleteModal.user;
    if (!user) return;
    
    setDeleteModal({ isOpen: false, user: null });

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } else {
        const data = await res.json();
        showAlert(data.error || "Erreur lors de la suppression de l'utilisateur.");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      showAlert("Erreur réseau.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    
    const matchesStatus =
      statusFilter === "ACTIVE"
        ? u.isActive
        : statusFilter === "SUSPENDED"
        ? !u.isActive
        : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 sm:p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-beige/45 dark:border-anthracite/60">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Gestion des <span className="text-or italic font-light">Utilisateurs</span>
            </h1>
            <p className="text-xs text-encre/65 dark:text-encre dark:text-ivoire/65 mt-1">
              Consultez la liste des comptes enregistrés et gérez les accès et statuts de suspension.
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              id="admin-search-users"
              type="text"
              placeholder="Rechercher par nom, email, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium shadow-inner"
            />
            <span className="absolute left-3.5 top-3 text-encre/40 dark:text-encre dark:text-ivoire/40 text-sm">🔍</span>
          </div>

          <div className="flex gap-4">
            <select
              id="admin-filter-role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
            >
              <option value="">Tous les rôles</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="CLIENT">Clients</option>
            </select>

            <select
              id="admin-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
            >
              <option value="">Tous les statuts</option>
              <option value="ACTIVE">Actif</option>
              <option value="SUSPENDED">Suspendu</option>
            </select>
          </div>
        </div>

        {/* Users List Table */}
        {loading ? (
          <div className="h-64 rounded-3xl bg-beige/30 dark:bg-anthracite/40 animate-pulse border border-beige/40 dark:border-anthracite/60"></div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-anthracite/20 border border-beige/40 rounded-3xl">
            <p className="text-encre/60 dark:text-encre dark:text-ivoire/65 italic">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 rounded-3xl shadow-sm">
            <table className="min-w-full divide-y divide-beige/40 dark:divide-anthracite/60 text-sm">
              <thead className="bg-beige/10 dark:bg-anthracite/20 text-xs font-bold uppercase tracking-wider text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left">Utilisateur</th>
                  <th scope="col" className="px-6 py-4 text-left">Téléphone</th>
                  <th scope="col" className="px-6 py-4 text-left">Rôle</th>
                  <th scope="col" className="px-6 py-4 text-left">2FA</th>
                  <th scope="col" className="px-6 py-4 text-left">Date d'inscription</th>
                  <th scope="col" className="px-6 py-4 text-left">Statut</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/30 dark:divide-anthracite/50 font-light">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-beige/5 dark:hover:bg-anthracite/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-encre dark:text-ivoire">
                          {user.name || "Sans nom"}
                        </span>
                        <span className="text-xs text-encre/65 dark:text-encre dark:text-ivoire/65">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-encre/75 dark:text-encre dark:text-ivoire/75">
                      {user.phone || "Non renseigné"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-or/25 text-or border border-or/40"
                            : "bg-encre/10 dark:bg-ivoire/10 text-encre/80 dark:text-encre dark:text-ivoire/80"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {user.twoFactorEnabled ? (
                        <span className="text-green-500 font-medium">Actif</span>
                      ) : (
                        <span className="text-encre/40 dark:text-encre dark:text-ivoire/40">Inactif</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-encre/65 dark:text-encre dark:text-ivoire/65">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40"
                            : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40"
                        }`}
                      >
                        {user.isActive ? "Actif" : "Suspendu"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      {user.role !== "ADMIN" && (
                        <div className="flex justify-end gap-2">
                          <button
                            id={"toggle-ban-" + user.id}
                            onClick={() => handleToggleStatus(user)}
                            className={`font-bold py-2 px-4 rounded-full border transition-all ${
                              user.isActive
                                ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-600 hover:text-white dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-500"
                                : "bg-green-100 text-green-700 border-green-200 hover:bg-green-600 hover:text-white dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30 dark:hover:bg-green-500"
                            }`}
                          >
                            {user.isActive ? "Suspendre" : "Réactiver"}
                          </button>
                          
                          {!user.isActive && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="font-bold py-2 px-4 rounded-full border bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-600 hover:text-white transition-all"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Confirmation d'action"
        message={confirmModal.user ? `Voulez-vous vraiment ${confirmModal.user.isActive ? "suspendre" : "réactiver"} le compte de ${confirmModal.user.name || confirmModal.user.email} ?` : ""}
        onConfirm={executeToggleStatus}
        onCancel={() => setConfirmModal({ isOpen: false, user: null })}
        confirmText="Oui, confirmer"
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Suppression définitive"
        message={deleteModal.user ? `Attention ! Voulez-vous vraiment supprimer DÉFINITIVEMENT le compte de ${deleteModal.user.name || deleteModal.user.email} ? Cette action est irréversible et effacera toutes ses données liées.` : ""}
        onConfirm={executeDeleteUser}
        onCancel={() => setDeleteModal({ isOpen: false, user: null })}
        confirmText="Oui, supprimer"
        cancelText="Annuler"
      />

      <AlertModal
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
      />
    </div>
  );
}
