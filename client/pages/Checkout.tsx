// src/pages/Checkout.tsx  (or wherever your Checkout component is)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface CartItem {
  id: string;
  dressId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  addedAt: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newOrderId, setNewOrderId] = useState<string | null>(null);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Guest User";
  const userEmail = localStorage.getItem("userEmail") || "guest@example.com";

  useEffect(() => {
    if (!userId) {
      navigate("/signin");
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await fetch(`/api/cart?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch cart");
        const data = await response.json();
        if (data.success && data.items.length > 0) {
          setCartItems(data.items);
        } else {
          setError("Your cart is empty");
        }
      } catch (err) {
        setError("Error loading cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [userId, navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 10 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // FULLY FRONTEND RAZORPAY INTEGRATION
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || total <= 0) {
      setError("Invalid order");
      return;
    }

    setPlacing(true);
    setError(null);

    // Load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => openRazorpay();
    script.onerror = () => {
      setError("Failed to load payment gateway. Check internet.");
      setPlacing(false);
    };
    document.body.appendChild(script);

    const openRazorpay = () => {
      const options = {
        key: "rzp_test_RjwngDvAfqIkUU", // Replace with your real test key if needed
        amount: Math.round(total * 100), // ₹500.00 → 50000 paise
        currency: "INR",
        name: "Chic Boutique",
        description: "Thank you for shopping with us!",
        image: "https://your-logo-url.com/logo.png", // Optional
        handler: async (response: any) => {
          const paymentId = response.razorpay_payment_id;

          // Payment successful → Save order on your backend
          try {
            const res = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                customerName: userName,
                customerEmail: userEmail,
                items: cartItems,
                subtotal,
                tax,
                shipping,
                total,
                paymentId,
                paymentMethod: "Razorpay",
                paymentStatus: "paid",
              }),
            });

            const data = await res.json();

            if (data.success && data.orderId) {
              setNewOrderId(data.orderId);
              setSuccess(true);

              // Clear cart
              await fetch("/api/cart/clear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              });
            } else {
              setError("Order failed. Contact support.");
            }
          } catch (err) {
            setError("Failed to save order");
          } finally {
            setPlacing(false);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: "9999999999",
        },
        notes: {
          items: cartItems.map(i => `${i.name} x${i.quantity}`).join(", "),
        },
        theme: {
          color: "#8b5cf6",
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            setError("Payment cancelled");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
  };

  // Loading State
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background to-accent/5 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p>Loading checkout...</p>
          </div></div>
        </Layout>
      );
    }

  // Success Screen
  if (success && newOrderId) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background to-green-50 p-6 flex items-center justify-center">
          <Card className="max-w-lg w-full border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-3xl text-green-700">Order Placed Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="text-2xl font-bold">{newOrderId}</p>
              </div>
              <p className="text-lg">Total Paid: <strong>₹{total.toFixed(2)}</strong></p>
              <p className="text-sm text-muted-foreground">
                Confirmation sent to <strong>{userEmail}</strong>
              </p>
              <div className="flex gap-3 pt-4">
                <Button onClick={() => navigate("/tracking")} className="flex-1">
                  Track Order
                </Button>
                <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Main Checkout UI
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Checkout</h1>

          {error && (
            <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Order ({cartItems.length} items)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                        <p className="font-bold text-primary mt-1">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Payment & Total */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>₹{shipping.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 text-lg font-bold flex justify-between">
                      <span>Total</span>
                      <span className="text-2xl text-primary">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={placing || cartItems.length === 0}
                    className="w-full py-7 text-lg font-semibold"
                    size="lg"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>Pay ₹{total.toFixed(2)} → Place Order</>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/cart")}
                    className="w-full"
                    disabled={placing}
                  >
                    Back to Cart
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Test Card: 4111 1111 1111 1111 | Any future date | Any CVV
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}