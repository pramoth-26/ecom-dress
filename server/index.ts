import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleSignUp,
  handleLogin,
  handleGetUserInfo,
  handleForgotPassword,
  handleVerifyOTP,
  handleResetPassword,
} from "./routes/auth";
import {
  handleGetUserOrders,
  handleGetAllOrders,
  handleUpdateOrderStatus,
  handleCreateOrder,
  handleCheckout,
} from "./routes/orders";
import {
  handleAddToCart,
  handleGetUserCart,
  handleRemoveFromCart,
  handleUpdateCartItemQuantity,
  handleClearCart,
} from "./routes/cart";
import {
  handleGetAllProducts,
  handleGetProduct,
  handleAddProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleUpdateProductStock,
} from "./routes/products";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());

  // Body parser middleware - parse before routing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/signup", handleSignUp);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/user", handleGetUserInfo);
  app.post("/api/auth/forgot-password", handleForgotPassword);
  app.post("/api/auth/verify-otp", handleVerifyOTP);
  app.post("/api/auth/reset-password", handleResetPassword);

  // Orders routes
  app.get("/api/orders", handleGetUserOrders);
  app.get("/api/admin/orders", handleGetAllOrders);
  app.put("/api/admin/orders/:id", handleUpdateOrderStatus);
  app.post("/api/orders", handleCreateOrder);
  app.post("/api/checkout", handleCheckout);

  // Cart routes
  app.post("/api/cart/add", handleAddToCart);
  app.get("/api/cart", handleGetUserCart);
  app.post("/api/cart/remove", handleRemoveFromCart);
  app.put("/api/cart/update", handleUpdateCartItemQuantity);
  app.post("/api/cart/clear", handleClearCart);

  // Products routes
  app.get("/api/products", handleGetAllProducts);
  app.get("/api/products/:id", handleGetProduct);
  app.post("/api/products", handleAddProduct);
  app.put("/api/products/:id", handleUpdateProduct);
  app.delete("/api/products/:id", handleDeleteProduct);
  app.put("/api/products/:id/stock", handleUpdateProductStock);

  return app;
}
