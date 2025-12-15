import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  CheckCircle,
  Clock,
  Package,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

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
  customerName: string;
  customerEmail: string;
}

export default function AdminTracking() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isAdminLoggedIn) {
      navigate("/admin");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders");
        const data = await response.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.order) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status");
    }
  };

  const handleEditDeliveryDate = (orderId: string) => {
    setEditingId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setDeliveryDate(order.estimatedDelivery);
    }
  };

  const handleSaveDeliveryDate = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estimatedDelivery: deliveryDate }),
      });

      const data = await response.json();
      if (data.order) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, estimatedDelivery: deliveryDate }
              : order
          )
        );
      }
      setEditingId(null);
      setDeliveryDate("");
    } catch (error) {
      console.error("Error updating delivery date:", error);
      alert("Error updating delivery date");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-500" size={20} />;
      case "shipped":
        return <Truck className="text-blue-500" size={20} />;
      case "processing":
        return <Package className="text-yellow-500" size={20} />;
      case "pending":
        return <Clock className="text-gray-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
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

  const statusOptions: Array<Order["status"]> = [
    "pending",
    "processing",
    "shipped",
    "delivered",
  ];

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Truck size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Tracking Management</h1>
                <p className="text-primary-foreground/80">
                  Manage order status and delivery dates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-4">
              <p className="text-xs text-muted-foreground font-semibold mb-1">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4">
              <p className="text-xs text-muted-foreground font-semibold mb-1">
                Pending
              </p>
              <p className="text-3xl font-bold text-gray-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4">
              <p className="text-xs text-muted-foreground font-semibold mb-1">
                Processing
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.processing}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4">
              <p className="text-xs text-muted-foreground font-semibold mb-1">
                Shipped
              </p>
              <p className="text-3xl font-bold text-blue-600">{stats.shipped}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4">
              <p className="text-xs text-muted-foreground font-semibold mb-1">
                Delivered
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.delivered}
              </p>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`rounded-2xl shadow-md p-6 border-l-4 ${getStatusColor(
                  order.status
                )}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
                  {/* Order Info */}
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      {order.id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerEmail}
                    </p>
                  </div>

                  {/* Status Control */}
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-2">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as Order["status"]
                          )
                        }
                        className="px-3 py-1 border border-border rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-2">
                      Est. Delivery
                    </p>
                    {editingId === order.id ? (
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="px-2 py-1 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                          onClick={() => handleSaveDeliveryDate(order.id)}
                          className="px-2 py-1 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditDeliveryDate(order.id)}
                        className="text-primary hover:text-primary/80 font-semibold text-sm"
                      >
                        {new Date(order.estimatedDelivery).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </button>
                    )}
                  </div>

                  {/* Order Details */}
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-1">
                      Items
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {getItemCount(order)}
                    </p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-1">
                      Total
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="mt-4 flex">
                  <button
                    onClick={() =>
                      setSelectedOrderId(
                        selectedOrderId === order.id ? null : order.id
                      )
                    }
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    {selectedOrderId === order.id ? "Hide Details" : "View Details"}
                  </button>
                </div>

                {/* Expanded Order Items */}
                {selectedOrderId === order.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-bold text-lg text-foreground mb-4">
                      Order Items
                    </h4>
                    <div className="space-y-3">
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
                              <h5 className="font-semibold text-foreground">
                                {item.name}
                              </h5>
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
        </div>
      </div>
    </AdminLayout>
  );
}
