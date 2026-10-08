"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft } from "lucide-react";

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/orders`);
      if (!res.ok) throw new Error("Impossible de charger vos commandes");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold"><Clock className="w-3.5 h-3.5" /> En attente</span>;
      case "PROCESSING":
        return <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold"><Package className="w-3.5 h-3.5" /> En préparation</span>;
      case "SHIPPED":
        return <span className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold"><Truck className="w-3.5 h-3.5" /> En cours de livraison</span>;
      case "DELIVERED":
        return <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3.5 h-3.5" /> Livrée</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> Annulée</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement de vos commandes...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Mes Commandes ({orders.length})
        </h1>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-sm border border-rose-200">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <Package className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Aucune commande pour le moment</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Passez votre première commande depuis notre catalogue !</p>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4"
            >
              <div className="flex flex-wrap justify-between items-start gap-4 border-b pb-4 dark:border-gray-700">
                <div>
                  <span className="text-xs text-gray-400 font-mono">Commande #{order.id}</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      {item.article?.images?.[0] && (
                        <img
                          src={item.article.images[0]}
                          alt={item.article.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.article?.title || "Article"}</p>
                        <p className="text-xs text-gray-500">Quantité: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {(Number(item.price) * item.quantity).toLocaleString()} FCFA
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex flex-wrap justify-between items-center text-sm dark:border-gray-700">
                <div className="text-xs text-gray-500">
                  <span>Adresse: {order.shippingAddress}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 mr-2">Total:</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {Number(order.totalAmount).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
