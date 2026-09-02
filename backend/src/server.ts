import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateToken } from "@/middleware/expressAuth";

// Import routes
import authRoutes from "@/routes/auth.routes";
import articlesRoutes from "@/routes/articles.routes";
import categoriesRoutes from "@/routes/categories.routes";
import commentsRoutes from "@/routes/comments.routes";
import contactsRoutes from "@/routes/contacts.routes";
import notificationsRoutes from "@/routes/notifications.routes";
import usersRoutes from "@/routes/users.routes";
import adminRoutes from "@/routes/admin.routes";
import ordersRoutes from "@/routes/orders.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Auth Token Extraction Middleware
app.use(authenticateToken);

// Healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", ordersRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Backend Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Erreur interne du serveur",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur Backend Wace démarré sur http://localhost:${PORT}`);
});

export default app;
