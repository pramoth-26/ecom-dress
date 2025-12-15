import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Trash2, Plus, Minus, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/signin");
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await fetch(`/api/cart?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }
        const data = await response.json();
        if (data.success) {
          setCartItems(data.items);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [userId, navigate]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!userId) return;

    try {
      const response = await fetch("/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, itemId, quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      if (newQuantity <= 0) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!userId) return;

    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, itemId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = cartItems.length > 0 ? 10 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading cart...</p>
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
              <ShoppingBag size={40} />
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  Shopping Cart
                </h1>
                <p className="text-primary-foreground/90 mt-2">
                  {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in
                  your cart
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="mb-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex gap-6"
                  >
                    {/* Image */}
                    <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-foreground mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Size: {item.size}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-primary">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ₹{item.price} each
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col justify-between items-end">
                      {/* Quantity Control */}
                      <div className="flex items-center gap-2 border border-border rounded-lg p-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:sticky lg:top-4 h-fit">
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Order Summary
                  </h2>

                  {/* Summary Items */}
                  <div className="space-y-3 pb-4 border-b border-border">
                    <div className="flex justify-between text-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-foreground">
                      <span>Tax (10%)</span>
                      <span className="font-semibold">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-foreground">
                      <span>Shipping</span>
                      <span className="font-semibold">
                        ₹{shipping.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground">
                      Total
                    </span>
                    <span className="text-3xl font-bold text-primary">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Proceed to Checkout
                  </button>

                  {/* Continue Shopping */}
                  <a
                    href="/"
                    className="block text-center text-primary font-semibold hover:text-primary/80 transition-colors py-2"
                  >
                    Continue Shopping
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag size={80} className="text-muted-foreground mb-6" />
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-8">
                Add some beautiful dresses to get started!
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
