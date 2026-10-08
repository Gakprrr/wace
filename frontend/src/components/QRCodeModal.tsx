"use client";

import React, { useEffect, useState } from "react";
import { QrCode, Download, X, Copy, Check } from "lucide-react";

interface QRCodeModalProps {
  articleId: string;
  articleTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ articleId, articleTitle, isOpen, onClose }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && articleId) {
      fetchQRCode();
    }
  }, [isOpen, articleId]);

  const fetchQRCode = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/articles/${articleId}/qr`);
      const data = await res.json();
      if (res.ok) {
        setQrDataUrl(data.qrCode);
        setProductUrl(data.url);
      }
    } catch (error) {
      console.error("Erreur lors de la génération du QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (productUrl) {
      navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `qrcode-${articleTitle.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
          <QrCode className="w-6 h-6" />
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Code QR Produit</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 truncate font-medium">
          {articleTitle}
        </p>

        {/* QR Code Container */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 mb-6 flex items-center justify-center min-h-[240px]">
          {loading ? (
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code ${articleTitle}`}
              className="w-56 h-56 object-contain rounded-xl shadow-md"
            />
          ) : (
            <p className="text-xs text-rose-500">Erreur de génération</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 text-sm"
          >
            <Download className="w-4 h-4" /> Télécharger l'image QR
          </button>

          <button
            onClick={handleCopyUrl}
            disabled={!productUrl}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Lien copié !" : "Copier le lien produit"}
          </button>
        </div>
      </div>
    </div>
  );
}
