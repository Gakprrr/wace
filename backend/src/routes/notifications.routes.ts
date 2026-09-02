import { Router } from "express";
import { getUserNotifications, savePushSubscription, broadcastPushNotification } from "@/services/notification.service";
import { AuthenticatedRequest, requireAuthMiddleware, requireAdminMiddleware } from "@/middleware/expressAuth";
import { errorResponse } from "@/utils/auth";

const router = Router();

// GET /api/notifications
router.get("/", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const notifications = await getUserNotifications(req.user!.id);
    res.json(notifications);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/notifications/subscribe
router.post("/subscribe", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { subscription } = req.body;
    await savePushSubscription(req.user!.id, subscription);
    res.status(201).json({ success: true, message: "Abonnement push enregistré" });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/notifications/push (Admin)
router.post("/push", requireAdminMiddleware, async (req, res) => {
  try {
    const { title, message } = req.body;
    await broadcastPushNotification(title, message);
    res.json({ success: true, message: "Notification diffusée" });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

export default router;
