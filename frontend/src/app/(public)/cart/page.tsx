"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/lib/i18n/LangProvider";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pt-8 pb-24">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold tracking-tight text-encre">
            {t.cart.title} <span className="text-[#d8b652] italic font-light">{t.cart.titleHighlight}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {t.cart.itemsCount.replace('{count}', totalItems.toString())}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-[#d8b652]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.cart.empty}</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              {t.cart.emptyDesc}
            </p>
            <Link
              href="/catalogue"
              className="bg-[#d8b652] hover:bg-[#c3a242] text-white font-bold py-3 px-8 rounded-full transition-all shadow-md inline-flex items-center gap-2"
            >
              {t.cart.discoverCatalogue}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Cart Items */}
            <div className="flex-1">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <li key={item.id} className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start group">
                      <div className="relative w-32 h-40 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between h-full w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight mb-2">
                              {item.title}
                            </h3>
                            <p className="text-[#d8b652] font-semibold text-lg">{item.price} {t.common.currency}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title={t.cart.delete}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-6">
                          <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm text-gray-600 transition-all"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm text-gray-600 transition-all"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-32">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.cart.summary}</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-600">
                    <span>{t.cart.subtotal.replace('{count}', totalItems.toString())}</span>
                    <span>{totalPrice} {t.common.currency}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t.cart.shipping}</span>
                    <span className="text-green-500 font-medium">{t.cart.free}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-end">
                    <span className="text-lg font-bold text-gray-800">{t.cart.total}</span>
                    <span className="text-3xl font-bold text-[#d8b652]">{totalPrice} {t.common.currency}</span>
                  </div>
                </div>

                <button
                  className="w-full bg-[#1f1e1a] hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 group"
                >
                  {t.cart.checkout}
                  <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  {t.cart.securePayment}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
