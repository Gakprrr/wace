import { Router } from "express";
import { createOrder, getUserOrders, getOrderById, getAllOrdersAdmin, updateOrderStatus, updatePaymentStatus } from "@/services/order.service";
import { AuthenticatedRequest, requireAuthMiddleware, requireAdminMiddleware } from "@/middleware/expressAuth";
import { errorResponse } from "@/utils/auth";

const router = Router();

// GET /api/orders (Client authenticated)
router.get("/", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const orders = await getUserOrders(req.user!.id);
    res.json(orders);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/orders/admin (Admin)
router.get("/admin", requireAdminMiddleware, async (req, res) => {
  try {
    const orders = await getAllOrdersAdmin();
    res.json(orders);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/orders/:id
router.get("/:id", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const order = await getOrderById(req.params.id, req.user!.id, req.user!.role);
    res.json(order);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/orders (Create new order)
router.post("/", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { items, shippingAddress, customerPhone, paymentMethod } = req.body;
    const order = await createOrder({
      userId: req.user!.id,
      items,
      shippingAddress,
      customerPhone,
      paymentMethod,
    });
    res.status(201).json(order);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// PUT /api/orders/:id/status (Admin)
router.put("/:id/status", requireAdminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// PUT /api/orders/:id/payment (Admin / Webhook)
router.put("/:id/payment", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await updatePaymentStatus(req.params.id, paymentStatus);
    res.json(order);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

export default router;
