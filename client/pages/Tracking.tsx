import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Package, Truck, CheckCircle, Clock, MapPin, X, Loader2 } from "lucide-react";

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
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  items: OrderItem[] | number;
  itemCount?: number;
  total: number;
  estimatedDelivery: string;
  customerName?: string;
  customerEmail?: string;
}

export default function Tracking() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/signin");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders?userId=${userId}`);
        const data = await response.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={24} />;
      case "shipped":
        return <Truck className="text-blue-500" size={24} />;
      case "processing":
        return <Package className="text-yellow-500" size={24} />;
      case "pending":
        return <Clock className="text-gray-500" size={24} />;
      default:
        return <Package className="text-gray-500" size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 border-green-200";
      case "shipped":
        return "bg-blue-50 border-blue-200";
      case "processing":
        return "bg-yellow-50 border-yellow-200";
      case "pending":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "shipped":
        return "Shipped";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const getItemCount = (order: Order): number => {
    if (typeof order.items === "number") {
      return order.items;
    }
    if (order.itemCount) {
      return order.itemCount;
    }
    if (Array.isArray(order.items)) {
      return order.items.length;
    }
    return 0;
  };

  const getOrderItems = (order: Order): OrderItem[] => {
    if (Array.isArray(order.items)) {
      return order.items as OrderItem[];
    }
    return [];
  };

  const selectedOrder = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId)
    : null;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center gap-3">
              <Package size={40} />
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  Track Orders
                </h1>
                <p className="text-primary-foreground/90 mt-2">
                  Monitor your orders and delivery status
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`rounded-2xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-border">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-1">
                        Order #{order.id}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Ordered on{" "}
                        {new Date(order.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="font-bold text-lg text-foreground">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Items */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Items
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {getItemCount(order)}
                      </p>
                    </div>

                    {/* Total */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Order Total
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{order.total.toFixed(2)}
                      </p>
                    </div>

                    {/* Estimated Delivery */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin size={14} /> Est. Delivery
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {new Date(order.estimatedDelivery).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Step 1: Pending */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                            ["pending", "processing", "shipped", "delivered"].indexOf(
                              order.status
                            ) >= 0
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          ✓
                        </div>
                        <span className="text-xs text-center text-muted-foreground">
                          Order Placed
                        </span>
                      </div>

                      {/* Step 2: Processing */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                            ["processing", "shipped", "delivered"].indexOf(
                              order.status
                            ) >= 0
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          ✓
                        </div>
                        <span className="text-xs text-center text-muted-foreground">
                          Processing
                        </span>
                      </div>

                      {/* Step 3: Shipped */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                            ["shipped", "delivered"].indexOf(order.status) >=
                            0
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          ✓
                        </div>
                        <span className="text-xs text-center text-muted-foreground">
                          Shipped
                        </span>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                            order.status === "delivered"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          ✓
                        </div>
                        <span className="text-xs text-center text-muted-foreground">
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() =>
                        setSelectedOrderId(
                          selectedOrderId === order.id ? null : order.id
                        )
                      }
                      className="flex-1 border-2 border-primary text-primary py-2 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                    >
                      {selectedOrderId === order.id ? "Hide Details" : "View Details"}
                    </button>
                    {order.status === "delivered" && (
                      <button className="flex-1 border-2 border-primary text-primary py-2 rounded-lg font-semibold hover:bg-primary/5 transition-colors">
                        Reorder
                      </button>
                    )}
                  </div>

                  {/* Expanded Order Items */}
                  {selectedOrderId === order.id && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="font-bold text-lg text-foreground mb-4">
                        Order Items
                      </h3>
                      <div className="space-y-4">
                        {getOrderItems(order).length > 0 ? (
                          getOrderItems(order).map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 bg-muted/30 p-4 rounded-lg"
                            >
                              <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Size: {item.size} | Qty: {item.quantity}
                                </p>
                                <p className="text-primary font-bold mt-2">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No items in this order</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package size={80} className="text-muted-foreground mb-6" />
              <h2 className="text-3xl font-bold text-foreground mb-2">
                No orders yet
              </h2>
              <p className="text-muted-foreground mb-8">
                Start shopping to see your orders here!
              </p>
              <a
                href="/"
                className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Start Shopping
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
