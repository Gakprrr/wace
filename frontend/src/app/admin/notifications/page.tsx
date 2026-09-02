"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"broadcast" | "push" | "email" | "sms">("broadcast");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState({ text: "", isError: false });

  // Input states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [targetUser, setTargetUser] = useState(""); // empty for all, or phone/email/id for specific
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setResult({ text: "", isError: false });

    let endpoint = "";
    let payload = {};

    switch (activeTab) {
      case "broadcast":
        endpoint = "/api/admin/notifications/broadcast";
        payload = { title, message };
        break;
      case "push":
        endpoint = "/api/admin/notifications/push";
        payload = {
          title,
          body: message,
          url: url || "/",
          userId: targetUser || undefined,
        };
        break;
      case "email":
        endpoint = "/api/admin/notifications/email";
        payload = {
          to: targetUser || undefined,
          subject,
          html: htmlContent,
        };
        break;
      case "sms":
        endpoint = "/api/admin/notifications/sms";
        payload = {
          to: targetUser || undefined,
          body: message,
        };
        break;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");

      setResult({
        text: data.message || "Notification envoyée avec succès !",
        isError: false,
      });

      // Reset specific fields
      setMessage("");
      if (activeTab === "broadcast" || activeTab === "push") {
        setTitle("");
      }
      if (activeTab === "push") {
        setUrl("");
      }
      if (activeTab === "email") {
        setSubject("");
        setHtmlContent("");
      }
    } catch (err: any) {
      setResult({ text: err.message, isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 sm:p-10 overflow-y-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-beige/45 dark:border-anthracite/60">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Envoi de <span className="text-or italic font-light">Notifications</span>
            </h1>
            <p className="text-xs text-encre/65 dark:text-encre dark:text-ivoire/65 mt-1">
              Envoyez des messages en direct à vos utilisateurs sur les différents canaux.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-white dark:bg-anthracite/60 border border-beige/40 dark:border-anthracite/60 rounded-2xl p-1 mb-8 shadow-sm">
          <button
            onClick={() => {
              setActiveTab("broadcast");
              setResult({ text: "", isError: false });
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "broadcast" ? "bg-or text-encre" : "text-encre/70 dark:text-encre/70 dark:text-ivoire/70 hover:text-or"
            }`}
          >
            In-App
          </button>
          <button
            onClick={() => {
              setActiveTab("push");
              setResult({ text: "", isError: false });
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "push" ? "bg-or text-encre" : "text-encre/70 dark:text-encre/70 dark:text-ivoire/70 hover:text-or"
            }`}
          >
            Web Push
          </button>
          <button
            onClick={() => {
              setActiveTab("email");
              setResult({ text: "", isError: false });
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "email" ? "bg-or text-encre" : "text-encre/70 dark:text-encre/70 dark:text-ivoire/70 hover:text-or"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => {
              setActiveTab("sms");
              setResult({ text: "", isError: false });
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "sms" ? "bg-or text-encre" : "text-encre/70 dark:text-encre/70 dark:text-ivoire/70 hover:text-or"
            }`}
          >
            SMS
          </button>
        </div>

        {/* Explications du canal sélectionné */}
        <div className="mb-6 p-4 rounded-2xl bg-or/10 dark:bg-or/5 border border-or/20 text-sm text-encre/85 dark:text-ivoire/85 leading-relaxed">
          {activeTab === "broadcast" && (
            <p><strong className="text-or font-bold">IN-APP :</strong> Envoie un message qui s'affichera directement à l'intérieur de la plateforme WACE (dans la cloche de notifications) pour les utilisateurs. Idéal pour les annonces internes.</p>
          )}
          {activeTab === "push" && (
            <p><strong className="text-or font-bold">WEB PUSH :</strong> Envoie une alerte sur l'écran du téléphone ou de l'ordinateur de l'utilisateur, même s'il n'a pas le site ouvert. Il doit avoir accepté les notifications au préalable.</p>
          )}
          {activeTab === "email" && (
            <p><strong className="text-or font-bold">EMAIL :</strong> Envoie un courrier électronique dans la boîte mail. Idéal pour des messages longs, des newsletters ou des communications officielles.</p>
          )}
          {activeTab === "sms" && (
            <p><strong className="text-or font-bold">SMS :</strong> Envoie un message texte court directement sur le numéro de téléphone mobile. Idéal pour les alertes urgentes et très importantes.</p>
          )}
        </div>

        {result.text && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs font-semibold border text-left ${
              result.isError
                ? "bg-red-100 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                : "bg-green-100 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400"
            }`}
          >
            {result.text}
          </div>
        )}

        {/* Dynamic Dispatcher Form */}
        <form
          onSubmit={handleSend}
          className="bg-gray-50 dark:bg-anthracite border border-beige/40 dark:border-anthracite/60 p-8 rounded-3xl shadow-sm flex flex-col gap-5 text-left"
        >
          {/* Specific user field for Email, SMS, Web Push */}
          {activeTab !== "broadcast" && (
            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Destinataire (Laisser vide pour envoyer à tous les abonnés)
              </label>
              <input
                type="text"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                placeholder={
                  activeTab === "email"
                    ? "nom@exemple.com"
                    : activeTab === "sms"
                    ? "+228 90 00 00 00"
                    : "ID Utilisateur"
                }
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              />
            </div>
          )}

          {/* Title for Broadcast & Push */}
          {(activeTab === "broadcast" || activeTab === "push") && (
            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Titre de la notification
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Nouvel arrivage !"
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              />
            </div>
          )}

          {/* Subject for Email */}
          {activeTab === "email" && (
            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Sujet du mail
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Nouveautés exclusives sur WACE !"
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              />
            </div>
          )}

          {/* Body/Message for Broadcast, Push, SMS */}
          {activeTab !== "email" && (
            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez le message de votre notification..."
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              ></textarea>
            </div>
          )}

          {/* HTML Editor for Email */}
          {activeTab === "email" && (
            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Contenu du mail (HTML)
              </label>
              <textarea
                required
                rows={8}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<p>Bonjour,</p><p>Découvrez notre nouvelle collection...</p>"
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium font-mono"
              ></textarea>
            </div>
          )}

          {/* Action Link for Web Push */}
          {activeTab === "push" && (
            <div>
              <label className="block text-sm text-encre dark:text-ivoire mb-2 font-semibold">
                Lien d'action (URL au clic)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex: /catalogue"
                className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold py-4 rounded-2xl transition-all shadow-md mt-4 text-sm disabled:opacity-40"
          >
            {submitting ? "Envoi en cours..." : "Diffuser la notification"}
          </button>
        </form>
      </main>
    </div>
  );
}
