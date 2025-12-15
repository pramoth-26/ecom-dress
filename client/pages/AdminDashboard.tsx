import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Edit2,
  Trash2,
  Plus,
  BarChart3,
  Box,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface Product {
  id: string;
  category: "men" | "women" | "children";
  name: string;
  price: number;
  image: string;
  description: string;
  color: string;
  size: string[];
  stock: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "women" as const,
    color: "",
    description: "",
    stock: "10",
    sizes: "",
    image: "https://images.unsplash.com/photo-1595777707802-52066d39fbb0?w=500&h=600&fit=crop",
  });

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isAdminLoggedIn) {
      navigate("/admin");
      return;
    }

    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.sizes || !newProduct.description || !newProduct.image) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Price, Description, Sizes, Image URL)",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const sizeArray = newProduct.sizes
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (sizeArray.length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one size",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          color: newProduct.color || "Unspecified",
          description: newProduct.description,
          stock: parseInt(newProduct.stock),
          size: sizeArray,
          image: newProduct.image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Failed to add product",
        }));
        throw new Error(errorData.error || "Failed to add product");
      }

      const data = await response.json();
      if (data.success) {
        setProducts([...products, data.product]);
        setNewProduct({
          name: "",
          price: "",
          category: "women",
          color: "",
          description: "",
          stock: "10",
          sizes: "",
          image: "https://images.unsplash.com/photo-1595777707802-52066d39fbb0?w=500&h=600&fit=crop",
        });
        setShowAddForm(false);
        toast({
          title: "Success",
          description: "Product added successfully!",
        });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStart = (product: Product) => {
    setEditingId(product.id);
    setEditData(product);
  };

  const handleEditSave = async () => {
    if (!editingId) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      const data = await response.json();
      if (data.success) {
        setProducts(
          products.map((p) => (p.id === editingId ? data.product : p))
        );
        setEditingId(null);
        setEditData({});
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((p) => p.id !== id));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  // Chart data functions
  const getStockByCategory = () => {
    const categories = ["men", "women", "children"];
    return categories.map((cat) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      stock: products
        .filter((p) => p.category === cat)
        .reduce((sum, p) => sum + p.stock, 0),
    }));
  };

  const getProductsByCategory = () => {
    const categories = ["men", "women", "children"];
    return categories.map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: products.filter((p) => p.category === cat).length,
    }));
  };

  const getPriceDistribution = () => {
    const ranges = [
      { range: "₹0-500", min: 0, max: 500 },
      { range: "₹500-1000", min: 500, max: 1000 },
      { range: "₹1000-2000", min: 1000, max: 2000 },
      { range: "₹2000+", min: 2000, max: Infinity },
    ];
    return ranges.map((r) => ({
      range: r.range,
      count: products.filter((p) => p.price >= r.min && p.price < r.max).length,
    }));
  };

  const getStockStatus = () => {
    const lowStock = products.filter((p) => p.stock < 10).length;
    const mediumStock = products.filter((p) => p.stock >= 10 && p.stock < 50).length;
    const highStock = products.filter((p) => p.stock >= 50).length;
    return [
      { name: "Low Stock", count: lowStock },
      { name: "Medium Stock", count: mediumStock },
      { name: "High Stock", count: highStock },
    ];
  };

  const getCategoryColor = (index: number) => {
    const colors = ["#3b82f6", "#ef4444", "#10b981"];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading products...</p>
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
                <BarChart3 size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Stock Management</h1>
                <p className="text-primary-foreground/80">
                  Manage inventory and product details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-semibold">
                    Total Products
                  </p>
                  <p className="text-4xl font-bold text-foreground mt-2">
                    {products.length}
                  </p>
                </div>
                <Box className="text-primary" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-semibold">
                    Total Stock
                  </p>
                  <p className="text-4xl font-bold text-primary mt-2">
                    {totalStock}
                  </p>
                </div>
                <Package className="text-green-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-semibold">
                    Low Stock Items
                  </p>
                  <p className="text-4xl font-bold text-red-500 mt-2">
                    {lowStockCount}
                  </p>
                </div>
                <div className="text-red-500 text-5xl">⚠️</div>
              </div>
            </div>
          </div>


          {/* Charts Section */}
         

          
          {/* Add New Product Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add New Product
            </button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Add New Product
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name *"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="number"
                  placeholder="Price *"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      category: e.target.value as typeof newProduct.category,
                    })
                  }
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="children">Children</option>
                </select>
                <input
                  type="text"
                  placeholder="Color"
                  value={newProduct.color}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, color: e.target.value })
                  }
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  placeholder="Description *"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  className="sm:col-span-2 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="text"
                  placeholder="Sizes (comma-separated, e.g., S, M, L, XL) *"
                  value={newProduct.sizes}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, sizes: e.target.value })
                  }
                  className="sm:col-span-2 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="url"
                  placeholder="Image URL *"
                  value={newProduct.image}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image: e.target.value })
                  }
                  className="sm:col-span-2 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="sm:col-span-2 flex gap-2">
                  <button
                    onClick={handleAddProduct}
                    disabled={submitting}
                    className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Product"
                    )}
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    disabled={submitting}
                    className="flex-1 bg-muted text-foreground py-2 rounded-lg font-semibold hover:bg-muted/80 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                      Color
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      {editingId === product.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editData.name || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border border-border rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={editData.category || "women"}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  category: e.target.value as any,
                                })
                              }
                              className="px-2 py-1 border border-border rounded"
                            >
                              <option value="men">Men</option>
                              <option value="women">Women</option>
                              <option value="children">Children</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editData.price || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  price: parseFloat(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 border border-border rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editData.stock || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  stock: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 border border-border rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editData.color || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  color: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border border-border rounded"
                            />
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            <button
                              onClick={handleEditSave}
                              disabled={submitting}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={submitting}
                              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-semibold text-foreground">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground capitalize">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 text-primary font-bold">
                            ₹{product.price}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                product.stock < 10
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {product.color}
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            <button
                              onClick={() => handleEditStart(product)}
                              className="text-blue-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
