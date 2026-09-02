"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, CreditCard, Smartphone, Truck, CheckCircle, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "CARD" | "MOBILE_MONEY">("CASH_ON_DELIVERY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  if (items.length === 0 && !successOrder) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Vous devez ajouter des articles à votre panier avant de pouvoir passer une commande.
        </p>
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Parcourir le catalogue
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError("Veuillez renseigner votre adresse de livraison.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        articleId: item.id,
        quantity: item.quantity,
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: address,
          customerPhone: phone,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création de la commande");
      }

      setSuccessOrder(data);
      clearCart();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4 animate-bounce" />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Commande Confirmée !
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Merci pour votre achat ! Votre commande <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">#{successOrder.id.slice(-8)}</span> a été enregistrée avec succès.
          </p>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Montant total:</span>
              <span className="font-bold text-gray-900 dark:text-white">{Number(successOrder.totalAmount).toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Mode de paiement:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{successOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Adresse de livraison:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{successOrder.shippingAddress}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/orders"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Suivre mes commandes
            </Link>
            <Link
              href="/catalogue"
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
        Validation de votre Commande
      </h1>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl mb-6 border border-rose-200 dark:border-rose-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire de livraison & paiement */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Adresse de livraison
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse complète *
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Quartier, Rue, Numéro de maison ou indication..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numéro de téléphone de contact
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+228 90 00 00 00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Mode de Paiement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition ${
                  paymentMethod === "CASH_ON_DELIVERY"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Truck className="w-6 h-6" />
                <span className="text-xs">Paiement à la livraison</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("MOBILE_MONEY")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition ${
                  paymentMethod === "MOBILE_MONEY"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Smartphone className="w-6 h-6" />
                <span className="text-xs">Mobile Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition ${
                  paymentMethod === "CARD"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300"
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-xs">Carte Bancaire</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-indigo-600/20 text-lg"
          >
            {loading ? "Traitement de la commande..." : `Confirmer la commande (${totalPrice.toLocaleString()} FCFA)`}
          </button>
        </form>

        {/* Récapitulatif du panier */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-700">
            Résumé du panier ({items.length})
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
                  <p className="text-xs text-gray-500">Quantité: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {(Number(item.price) * item.quantity).toLocaleString()} FCFA
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Sous-total</span>
              <span>{totalPrice.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Frais de livraison</span>
              <span className="text-emerald-500 font-medium">Gratuit</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-700">
              <span>Total</span>
              <span className="text-indigo-600 dark:text-indigo-400">{totalPrice.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
