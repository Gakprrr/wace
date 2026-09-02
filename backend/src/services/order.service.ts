import { db } from "@/db";
import { OrderStatus, PaymentStatus, PaymentMethod, Role } from "@prisma/client";
import { ValidationError, NotFoundError, ForbiddenError } from "@/utils/auth";

export interface CreateOrderItemInput {
  articleId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  items: CreateOrderItemInput[];
  shippingAddress: string;
  customerPhone?: string;
  paymentMethod?: PaymentMethod;
}

export async function createOrder(data: CreateOrderInput) {
  if (!data.items || data.items.length === 0) {
    throw new ValidationError("Le panier de la commande ne peut pas être vide.");
  }

  if (!data.shippingAddress) {
    throw new ValidationError("L'adresse de livraison est obligatoire.");
  }

  // 1. Fetch articles & check stock
  const articleIds = data.items.map((i) => i.articleId);
  const articles = await db.article.findMany({
    where: { id: { in: articleIds } },
  });

  const articleMap = new Map(articles.map((a) => [a.id, a]));

  let totalAmount = 0;
  const orderItemsData: { articleId: string; quantity: number; price: number }[] = [];

  for (const item of data.items) {
    const article = articleMap.get(item.articleId);
    if (!article) {
      throw new NotFoundError(`L'article (${item.articleId}) n'existe plus.`);
    }

    if (!article.isAvailable || article.stock < item.quantity) {
      throw new ValidationError(`Stock insuffisant pour l'article "${article.title}". Disponible: ${article.stock}`);
    }

    const price = Number(article.price);
    totalAmount += price * item.quantity;

    orderItemsData.push({
      articleId: article.id,
      quantity: item.quantity,
      price,
    });
  }

  // 2. Transaction: Create Order & Update Stock
  const order = await db.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId: data.userId,
        totalAmount,
        shippingAddress: data.shippingAddress,
        customerPhone: data.customerPhone,
        paymentMethod: data.paymentMethod ?? PaymentMethod.CASH_ON_DELIVERY,
        status: OrderStatus.PENDING,
        paymentStatus: data.paymentMethod === PaymentMethod.CASH_ON_DELIVERY ? PaymentStatus.PENDING : PaymentStatus.PENDING,
        items: {
          create: orderItemsData.map((item) => ({
            articleId: item.articleId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            article: true,
          },
        },
      },
    });

    // Update stock for each article
    for (const item of orderItemsData) {
      await tx.article.update({
        where: { id: item.articleId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    return newOrder;
  });

  return order;
}

export async function getUserOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          article: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string, userId: string, role: Role) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      items: {
        include: {
          article: true,
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError("Commande non trouvée.");
  }

  if (role !== Role.ADMIN && order.userId !== userId) {
    throw new ForbiddenError("Accès non autorisé à cette commande.");
  }

  return order;
}

export async function getAllOrdersAdmin() {
  return db.order.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      items: {
        include: {
          article: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await db.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: {
        select: { id: true, email: true },
      },
    },
  });

  // Create notification for user
  await db.notification.create({
    data: {
      userId: order.userId,
      title: "Mise à jour de votre commande",
      message: `Le statut de votre commande #${order.id.slice(-6)} est désormais: ${status}`,
      type: "ORDER_STATUS",
    },
  });

  return order;
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  return db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus,
      status: paymentStatus === PaymentStatus.PAID ? OrderStatus.PROCESSING : OrderStatus.PENDING,
    },
  });
}
