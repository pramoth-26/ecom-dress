import { RequestHandler } from "express";
import * as fs from "fs";
import * as path from "path";

const ordersFilePath = path.join(__dirname, "../data/orders.json");

interface OrderItem {
  id: string;
  dressId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  items: OrderItem[];
  itemCount: number;
  total: number;
  estimatedDelivery: string;
}

const readOrdersFile = (): Order[] => {
  try {
    const data = fs.readFileSync(ordersFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeOrdersFile = (orders: Order[]) => {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
};

export const handleGetUserOrders: RequestHandler = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const orders = readOrdersFile();
  const userOrders = orders.filter((o) => o.userId === userId);

  res.json({
    success: true,
    orders: userOrders,
  });
};

export const handleGetAllOrders: RequestHandler = (req, res) => {
  const orders = readOrdersFile();

  res.json({
    success: true,
    orders: orders,
  });
};

export const handleUpdateOrderStatus: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { status, estimatedDelivery } = req.body;

  const orders = readOrdersFile();
  const orderIndex = orders.findIndex((o) => o.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (status) {
    orders[orderIndex].status = status;
  }

  if (estimatedDelivery) {
    orders[orderIndex].estimatedDelivery = estimatedDelivery;
  }

  writeOrdersFile(orders);

  res.json({
    success: true,
    order: orders[orderIndex],
  });
};

export const handleCreateOrder: RequestHandler = (req, res) => {
  const {
    userId,
    customerName,
    customerEmail,
    items,
    total,
    estimatedDelivery,
  } = req.body;

  const orders = readOrdersFile();

  const newOrder: Order = {
    id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
    userId,
    customerName,
    customerEmail,
    date: new Date().toISOString().split("T")[0],
    status: "pending",
    items,
    total,
    estimatedDelivery,
  };

  orders.push(newOrder);
  writeOrdersFile(orders);

  res.json({
    success: true,
    order: newOrder,
  });
};

export const handleCheckout: RequestHandler = (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      items,
      total,
    } = req.body;

    if (!userId || !customerName || !customerEmail || !items || !total) {
      return res.status(400).json({
        error: "Missing required fields: userId, customerName, customerEmail, items, total",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const orders = readOrdersFile();
    const orderId = `ORD-${String(orders.length + 1).padStart(3, "0")}`;

    // Calculate estimated delivery date (5-7 business days from now)
    const today = new Date();
    const estimatedDelivery = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Transform cart items into order items
    const orderItems: OrderItem[] = items.map((item: any) => ({
      id: item.id,
      dressId: item.dressId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      image: item.image,
    }));

    const newOrder: Order = {
      id: orderId,
      userId,
      customerName,
      customerEmail,
      date: today.toISOString().split("T")[0],
      status: "pending",
      items: orderItems,
      itemCount: items.length,
      total,
      estimatedDelivery,
    };

    orders.push(newOrder);
    writeOrdersFile(orders);

    res.json({
      success: true,
      orderId,
      order: newOrder,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({
      error: "Server error during checkout",
    });
  }
};
