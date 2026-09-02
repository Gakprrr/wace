"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Package, Clock, CheckCircle, Truck, XCircle, Filter, RefreshCw } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminOrders();
  }, []);

  const fetchAdminOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/orders/admin`);
      if (!res.ok) throw new Error("Impossible de charger la liste des commandes");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut");

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === "ALL"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              Gestion des Commandes ({filteredOrders.length})
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Consultez et mettez à jour l'état de livraison des commandes client.
            </p>
          </div>

          <button
            onClick={fetchAdminOrders}
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>

        {/* Filtres de statut */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-1 text-xs font-bold text-gray-400 px-2 uppercase">
            <Filter className="w-3.5 h-3.5" /> Filtrer:
          </span>
          {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === status
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {status === "ALL" ? "Toutes" : status}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-sm border border-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            Chargement des commandes...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500">Aucune commande trouvée.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 border-b pb-4 dark:border-gray-700">
                  <div>
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                      Commande #{order.id}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      Client: {order.user?.name || order.user?.email || "Anonyme"} ({order.customerPhone || order.user?.phone || "Pas de tél"})
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Adresse: {order.shippingAddress}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>

                    {/* Select pour changer le statut */}
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="PENDING">PENDING (En attente)</option>
                      <option value="PROCESSING">PROCESSING (En préparation)</option>
                      <option value="SHIPPED">SHIPPED (En livraison)</option>
                      <option value="DELIVERED">DELIVERED (Livrée)</option>
                      <option value="CANCELLED">CANCELLED (Annulée)</option>
                    </select>
                  </div>
                </div>

                {/* Articles de la commande */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="py-2 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        {item.article?.images?.[0] && (
                          <img
                            src={item.article.images[0]}
                            alt={item.article.title}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-xs">{item.article?.title}</p>
                          <p className="text-xs text-gray-400">Quantité: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-xs text-gray-900 dark:text-white">
                        {(Number(item.price) * item.quantity).toLocaleString()} FCFA
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 flex justify-between items-center text-sm dark:border-gray-700">
                  <span className="text-xs text-gray-500">Paiement: <strong className="text-gray-700 dark:text-gray-300">{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 mr-2">Montant total:</span>
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {Number(order.totalAmount).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
