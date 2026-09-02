"use client";

import React, { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ConfirmModal from "@/components/ConfirmModal";
import AlertModal from "@/components/AlertModal";
import { useLang } from "@/lib/i18n/LangProvider";

interface Comment {
  id: string;
  content: string;
  rating?: number;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
  userId: string;
}

interface Article {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  state: string;
  images: string[];
  isAvailable: boolean;
  isNew: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  comments: Comment[];
}

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const { t } = useLang();

  const [article, setArticle] = useState<Article | null>(null);
  const [activeImage, setActiveImage] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Comment Form States
  const [commentContent, setCommentContent] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });
  const showAlert = (message: string) => setAlertState({ isOpen: true, message });

  // Fetch article details
  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
          if (data?.images?.length > 0) {
            setActiveImage(data.images[0]);
          }
        } else {
          router.push("/catalogue");
        }
      } catch (err) {
        console.error(err);
        router.push("/catalogue");
      } finally {
        setLoading(false);
      }
    }

    async function loadLikes() {
      try {
        const res = await fetch(`/api/articles/${id}/like`);
        if (res.ok) {
          const data = await res.json();
          setLikesCount(data.count);
          setUserLiked(data.liked);
        }
      } catch (err) {
        console.error("Failed to load likes:", err);
      }
    }

    async function loadComments() {
      try {
        const res = await fetch(`/api/comments/article/${id}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data || []);
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    }

    loadArticle();
    loadLikes();
    loadComments();
  }, [id]);

  const handleLikeToggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/articles/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUserLiked(data.liked);
        setLikesCount(data.count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentContent,
          rating: commentRating,
          articleId: id,
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        // Append newly created comment to comments list
        setComments((prev) => [
          {
            id: newComment.id,
            content: newComment.content,
            rating: newComment.rating,
            createdAt: newComment.createdAt,
            userId: user.id,
            user: {
              name: user.name,
              avatar: user.avatar,
            },
          },
          ...prev,
        ]);
        setCommentContent("");
        setCommentRating(5);
      }
    } catch (err) {
      console.error("Comment submit error:", err);
    } finally {
      setSubmittingComment(false);
    }
  };
  const handleDeleteCommentClick = (commentId: string) => {
    setCommentToDelete(commentId);
    setIsConfirmOpen(true);
  };

  const executeDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      const res = await fetch(`/api/comments/${commentToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentToDelete));
      } else {
        const data = await res.json();
        showAlert(data.error || "Erreur de suppression.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur réseau.");
    } finally {
      setIsConfirmOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleEditComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editCommentContent }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, content: editCommentContent } : c))
        );
        setEditingCommentId(null);
      } else {
        const data = await res.json();
        showAlert(data.error || "Erreur de modification.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Erreur réseau.");
    }
  };
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <p className="animate-pulse font-medium text-or">{t.catalogueItem.loading}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) return null;

  const stateColors: Record<string, string> = {
    NEUF: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40",
    TRES_BON_ETAT: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40",
    BON_ETAT: "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-or/10 dark:text-or dark:border-or/30",
    USE_VINTAGE: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
  };

  const stateLabels: Record<string, string> = {
    NEUF: t.catalogue.conditions.NEUF,
    TRES_BON_ETAT: t.catalogue.conditions.TRES_BON_ETAT,
    BON_ETAT: t.catalogue.conditions.BON_ETAT,
    USE_VINTAGE: t.catalogue.conditions.USE_VINTAGE,
  };

  // WhatsApp Pre-filled text URL
  const contactText = `Bonjour WACE, je suis intéressé par l'article "${article.title}" (ID: ${article.id}) affiché à ${article.price.toLocaleString("fr-FR")} FCFA. Est-il toujours disponible ?`;
  const whatsappUrl = `https://wa.me/22890000000?text=${encodeURIComponent(contactText)}`;

  return (
    <div className="flex flex-col min-h-screen bg-ivoire text-encre dark:bg-encre dark:text-encre dark:text-ivoire font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-encre/60 dark:text-encre dark:text-ivoire/60 mb-8 font-medium">
          <a href="/catalogue" className="hover:text-or transition-colors">{t.catalogueItem.store}</a>
          <span>/</span>
          <span className="text-or">{article.category.name}</span>
          <span>/</span>
          <span className="truncate max-w-[200px]">{article.title}</span>
        </div>

        {/* Product Grid Details */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Images Section */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[3/4] bg-white dark:bg-anthracite/40 border border-beige/60 dark:border-anthracite/60 rounded-3xl overflow-hidden relative shadow-sm">
              <img
                src={activeImage || "https://placehold.co/500x670/1a1a18/c8a96e?text=WACE"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full ${stateColors[article.state]}`}>
                  {stateLabels[article.state] || article.state}
                </span>
              </div>
              {article.stock === 0 && (
                <div className="absolute inset-0 bg-encre/70 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-red-950/80 text-red-400 border border-red-800/40 text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-full">
                    {t.catalogueItem.outOfStock}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail list */}
            {article.images && article.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {article.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 bg-white dark:bg-anthracite/60 flex-shrink-0 transition-all ${
                      activeImage === img ? "border-or scale-[0.98]" : "border-beige dark:border-anthracite/80 hover:border-or/60"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Details Section */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs uppercase tracking-widest text-or font-semibold">
                  {article.category.name}
                </span>

                {/* Like Button */}
                <button
                  onClick={handleLikeToggle}
                  className="flex items-center justify-center bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire p-3 rounded-full hover:border-or/60 transition-all shadow-sm group"
                  title={userLiked ? "Je n'aime plus" : "J'aime"}
                >
                  <Heart
                    className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                      userLiked ? "fill-red-500 stroke-red-500 text-red-500" : "stroke-current text-encre/65 dark:text-encre dark:text-ivoire/65"
                    }`}
                  />
                </button>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-4 leading-tight">
                {article.title}
              </h1>

              {/* Price Tags */}
              <div className="flex items-baseline gap-3 mt-6">
                <span className="text-2xl sm:text-3xl font-extrabold text-or">
                  {article.price.toLocaleString("fr-FR")} FCFA
                </span>
                {article.oldPrice && (
                  <span className="text-base text-encre/40 dark:text-encre dark:text-ivoire/40 line-through font-medium">
                    {article.oldPrice.toLocaleString("fr-FR")} FCFA
                  </span>
                )}
              </div>

              {/* Condition info */}
              <div className="mt-8 pt-6 border-t border-beige/45 dark:border-anthracite/60">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
                  {t.catalogueItem.details}
                </h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div className="flex items-center space-x-2 text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
                    <span className="w-1.5 h-1.5 bg-or rounded-full"></span>
                    <span>{t.catalogueItem.state}</span>
                    <strong className="text-encre dark:text-ivoire">{stateLabels[article.state]}</strong>
                  </div>
                  <div className="flex items-center space-x-2 text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
                    <span className="w-1.5 h-1.5 bg-or rounded-full"></span>
                    <span>{t.catalogueItem.availability}</span>
                    <strong className={article.stock > 0 ? "text-green-500" : "text-red-500"}>
                      {article.stock > 0 ? t.catalogueItem.inStock : t.catalogueItem.outOfStock}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8 pt-6 border-t border-beige/45 dark:border-anthracite/60">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-encre/70 dark:text-encre/70 dark:text-ivoire/70">
                  {t.catalogueItem.description}
                </h4>
                <p className="text-sm text-encre/80 dark:text-encre dark:text-ivoire/80 font-light leading-relaxed whitespace-pre-line">
                  {article.description}
                </p>
              </div>
            </div>

            {/* CTA Order button */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center w-full">
              <button
                onClick={() => {
                  if (article.stock > 0) {
                    addToCart({
                      id: article.id,
                      title: article.title,
                      price: article.price,
                      image: article.images[0] || "",
                      quantity: 1
                    });
                    setAdded(true);
                    setTimeout(() => setAdded(false), 2000);
                  }
                }}
                disabled={article.stock <= 0}
                className={`w-full sm:w-1/2 text-center font-sans font-bold py-4 px-8 rounded-full transition-all shadow-md flex items-center justify-center space-x-2.5 ${
                  article.stock > 0
                    ? added ? "bg-green-600 text-white" : "bg-[#d8b652] hover:bg-[#c3a242] text-white hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-anthracite/25 border border-anthracite/45 text-encre/40 dark:text-encre dark:text-ivoire/40 cursor-not-allowed"
                }`}
              >
                {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                <span>{added ? t.catalogueItem.added : t.catalogueItem.addToCart}</span>
              </button>

              <a
                href={article.stock > 0 ? whatsappUrl : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full sm:w-1/2 text-center font-sans font-bold py-4 px-8 rounded-full transition-all shadow-md flex items-center justify-center space-x-2.5 ${
                  article.stock > 0
                    ? "bg-[#25D366] hover:bg-[#20ba56] text-white hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-anthracite/25 border border-anthracite/45 text-encre/40 dark:text-encre dark:text-ivoire/40 cursor-not-allowed hidden"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                <span>{t.catalogueItem.quickBuy}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Comments / Review section */}
        <section className="mt-20 pt-12 border-t border-beige/65 dark:border-anthracite/60">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-8">
            {t.catalogueItem.commentsAndReviews.split('&')[0]} & <span className="text-or italic font-light">{t.catalogueItem.commentsAndReviews.split('&')[1]?.trim() || ''}</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Comment Form Column */}
            <div className="md:col-span-1">
              <h3 className="text-base font-bold mb-4">{t.catalogueItem.leaveReview}</h3>
              {user ? (
                <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm text-encre dark:text-ivoire mb-2 font-medium">
                      {t.catalogueItem.rating}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCommentRating(star)}
                          className="text-2xl transition-transform hover:scale-110"
                        >
                          {star <= commentRating ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-encre dark:text-ivoire mb-2 font-medium">
                      {t.catalogueItem.yourComment}
                    </label>
                    <textarea
                      rows={4}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder={t.catalogueItem.commentPlaceholder}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-encre dark:text-ivoire placeholder-encre/40 dark:placeholder-ivoire/50 focus:border-or/60 focus:outline-none transition-all text-base font-medium"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold py-3.5 px-6 rounded-full transition-colors flex items-center justify-center text-sm disabled:opacity-40"
                  >
                    {submittingComment ? t.catalogueItem.sending : t.catalogueItem.postReview}
                  </button>
                </form>
              ) : (
                <div className="bg-white dark:bg-anthracite/25 border border-beige/60 dark:border-anthracite/80 p-6 rounded-2xl text-center">
                  <p className="text-sm text-encre/65 dark:text-encre dark:text-ivoire/65 mb-4">
                    {t.catalogueItem.loginToComment}
                  </p>
                  <a
                    href="/login"
                    className="inline-block bg-[#705C3B] hover:bg-[#5a4a2f] text-white font-bold text-xs py-2.5 px-6 rounded-full transition-colors"
                  >
                    {t.nav.login}
                  </a>
                </div>
              )}
            </div>

            {/* Comments List Column */}
            <div className="md:col-span-2">
              <h3 className="text-base font-bold mb-6">
                {t.catalogueItem.buyersReviews} ({comments.length})
              </h3>

              {comments.length === 0 ? (
                <p className="text-sm text-encre/60 dark:text-encre dark:text-ivoire/60 italic">
                  {t.catalogueItem.noReviews}
                </p>
              ) : (
                <div className="flex flex-col gap-6">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white dark:bg-anthracite/20 border border-beige/30 dark:border-anthracite/60 p-6 rounded-3xl"
                    >
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center space-x-3">
                          {comment.user.avatar ? (
                            <img
                              src={comment.user.avatar}
                              alt=""
                              className="w-8 h-8 rounded-full border border-or/20 object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-anthracite border border-or/20 flex items-center justify-center text-or font-bold text-xs uppercase">
                              {comment.user.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h5 className="text-sm font-bold">{comment.user.name}</h5>
                            <span className="text-[10px] text-encre/55 dark:text-encre dark:text-ivoire/55">
                              {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>

                        {comment.rating && (
                          <div className="text-sm flex items-center space-x-3">
                            <span>{"⭐".repeat(comment.rating)}</span>
                            {user && (user.id === comment.userId || user.role === "ADMIN") && (
                              <div className="flex items-center space-x-2 text-xs">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditCommentContent(comment.content);
                                  }}
                                  className="text-or hover:underline"
                                >
                                  {t.catalogueItem.edit}
                                </button>
                                <button
                                  onClick={() => handleDeleteCommentClick(comment.id)}
                                  className="text-red-500 hover:underline"
                                >
                                  {t.catalogueItem.delete}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <div className="mt-2">
                          <textarea
                            rows={3}
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-anthracite border border-beige dark:border-anthracite/80 text-sm focus:outline-none focus:border-or mb-2"
                          ></textarea>
                          <div className="flex space-x-2 text-xs font-bold">
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              className="bg-or text-white px-4 py-1.5 rounded-full"
                            >
                              {t.catalogueItem.save}
                            </button>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="bg-anthracite/20 text-encre dark:text-ivoire px-4 py-1.5 rounded-full"
                            >
                              {t.catalogueItem.cancel}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-encre/85 dark:text-encre dark:text-ivoire/85 font-light leading-relaxed">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title={t.catalogueItem.deleteTitle}
        message={t.catalogueItem.deleteMsg}
        confirmText={t.catalogueItem.delete}
        cancelText={t.catalogueItem.cancel}
        onConfirm={executeDeleteComment}
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
