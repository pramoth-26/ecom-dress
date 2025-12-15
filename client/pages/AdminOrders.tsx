import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Loader2, ChevronDown, ChevronUp, FileText, X, Printer } from "lucide-react";
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
  userId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  items: OrderItem[] | number;
  itemCount?: number;
  total: number;
  estimatedDelivery: string;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  district: string;
  state: string;
  pincode: string;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [billOrder, setBillOrder] = useState<Order | null>(null);
  const [billUserDetails, setBillUserDetails] = useState<UserDetails | null>(null);
  const [billLoading, setBillLoading] = useState(false);

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
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getOrderItems = (order: Order): OrderItem[] => {
    if (Array.isArray(order.items)) {
      return order.items as OrderItem[];
    }
    return [];
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

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: "bg-gray-100 text-gray-800",
      processing: "bg-yellow-100 text-yellow-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const handleViewBill = async (order: Order) => {
    setBillLoading(true);
    try {
      const response = await fetch(`/api/auth/user?userId=${order.userId}`);
      const data = await response.json();
      if (data.success && data.user) {
        setBillOrder(order);
        setBillUserDetails(data.user);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setBillLoading(false);
    }
  };

  const closeBill = () => {
    setBillOrder(null);
    setBillUserDetails(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Package size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">All Orders</h1>
                <p className="text-primary-foreground/80">
                  View and manage all customer orders
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {orders.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-6 gap-4 bg-gray-50 px-6 py-4 border-b border-border font-semibold text-foreground text-sm">
                <div>Order ID</div>
                <div>Customer</div>
                <div>Date</div>
                <div>Status</div>
                <div>Items</div>
                <div>Total</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <div key={order.id}>
                    {/* Desktop Row */}
                    <div className="hidden sm:grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-foreground">{order.id}</div>
                      <div>
                        <p className="font-medium text-foreground">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerEmail}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-foreground">
                        {getItemCount(order)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold">
                          ₹{order.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleViewBill(order)}
                          disabled={billLoading}
                          className="ml-2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                          title="View Bill"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Card */}
                    <div className="sm:hidden px-4 py-4">
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-foreground">
                              {order.id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.customerName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                            <button
                              onClick={() => handleViewBill(order)}
                              disabled={billLoading}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                              title="View Bill"
                            >
                              <FileText size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="text-sm text-muted-foreground">
                            {getItemCount(order)} items
                          </span>
                          <span className="text-primary font-bold">
                            ₹{order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <div className="px-4 sm:px-6 py-2 bg-gray-50 flex items-center">
                      <button
                        onClick={() =>
                          setExpandedOrderId(
                            expandedOrderId === order.id ? null : order.id
                          )
                        }
                        className="flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors text-sm"
                      >
                        {expandedOrderId === order.id ? (
                          <>
                            <ChevronUp size={16} />
                            Hide Items
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} />
                            View Items
                          </>
                        )}
                      </button>
                    </div>

                    {/* Expanded Items Section */}
                    {expandedOrderId === order.id && (
                      <div className="px-4 sm:px-6 py-4 bg-muted/20">
                        <h4 className="font-semibold text-foreground mb-4">
                          Order Items
                        </h4>
                        <div className="space-y-3">
                          {getOrderItems(order).length > 0 ? (
                            getOrderItems(order).map((item) => (
                              <div
                                key={item.id}
                                className="flex gap-4 bg-white p-3 rounded-lg border border-border"
                              >
                                <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-foreground text-sm">
                                    {item.name}
                                  </h5>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Size: {item.size} | Qty: {item.quantity}
                                  </p>
                                  <p className="text-primary font-bold mt-2 text-sm">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              No items in this order
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package size={80} className="text-muted-foreground mb-6" />
              <h2 className="text-3xl font-bold text-foreground mb-2">
                No orders found
              </h2>
              <p className="text-muted-foreground">
                Orders will appear here as customers place them.
              </p>
            </div>
          )}
        </div>

        {/* Bill Modal */}
        {billOrder && billUserDetails && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Bill Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 flex justify-between items-start sticky top-0">
                <div>
                  <h2 className="text-2xl font-bold">Invoice</h2>
                  <p className="text-primary-foreground/90">Order #{billOrder.id}</p>
                </div>
                <button
                  onClick={closeBill}
                  className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Bill Content */}
              <div className="p-8 space-y-8">
                {/* Invoice Info */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">INVOICE DATE</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Date(billOrder.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">ESTIMATED DELIVERY</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Date(billOrder.estimatedDelivery).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="border-t border-border pt-8">
                  <h3 className="text-lg font-bold text-foreground mb-4">Delivery Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">NAME</p>
                      <p className="text-foreground font-semibold">{billUserDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">MOBILE NUMBER</p>
                      <p className="text-foreground font-semibold">{billUserDetails.phone}</p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground font-semibold">FULL ADDRESS</p>
                      <p className="text-foreground">
                        {billUserDetails.addressLine1}
                        {billUserDetails.addressLine2 && `, ${billUserDetails.addressLine2}`}
                      </p>
                      <p className="text-foreground">
                        {billUserDetails.district}, {billUserDetails.state} - {billUserDetails.pincode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">EMAIL</p>
                      <p className="text-foreground">{billUserDetails.email}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-border pt-8">
                  <h3 className="text-lg font-bold text-foreground mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {getOrderItems(billOrder).length > 0 ? (
                      <>
                        {getOrderItems(billOrder).map((item) => (
                          <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{item.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Size: {item.size} | Qty: {item.quantity}
                              </p>
                              <div className="flex justify-between mt-2">
                                <span className="text-sm text-muted-foreground">
                                  ₹{item.price} × {item.quantity}
                                </span>
                                <span className="font-bold text-primary">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p className="text-muted-foreground">No items in this order</p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-border pt-8">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-foreground">Subtotal</span>
                      <span className="font-semibold text-foreground">
                        ₹{(billOrder.total - 10 - (billOrder.total - 10) * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground">Tax (10%)</span>
                      <span className="font-semibold text-foreground">
                        ₹{((billOrder.total - 10 - (billOrder.total - 10) * 0.1) * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground">Shipping</span>
                      <span className="font-semibold text-foreground">₹10.00</span>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between items-center bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
                    <span className="text-lg font-bold text-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{billOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="border-t border-border pt-8">
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">ORDER STATUS</p>
                      <p className="text-foreground font-semibold mt-1">
                        {billOrder.status.charAt(0).toUpperCase() + billOrder.status.slice(1)}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(
                        billOrder.status
                      )}`}
                    >
                      {billOrder.status.charAt(0).toUpperCase() + billOrder.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Print Button */}
                <div className="border-t border-border pt-8 flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    <Printer size={20} />
                    Print Invoice
                  </button>
                  <button
                    onClick={closeBill}
                    className="flex-1 bg-muted text-foreground py-3 rounded-lg font-semibold hover:bg-muted/80 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
