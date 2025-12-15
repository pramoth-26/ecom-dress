import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Truck } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import AdminLayout from "@/components/AdminLayout";

export default function AdminHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isAdminLoggedIn) {
      navigate("/admin");
    }
  }, [navigate]);

  // 📊 Dummy chart data (replace with your fetched data)
  const salesData = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 5000 },
    { month: "Apr", sales: 4000 },
    { month: "May", sales: 6000 },
    { month: "Jun", sales: 5500 },
  ];

  const inventoryData = [
    { name: "In Stock", value: 65 },
    { name: "Out of Stock", value: 35 },
  ];

  const stockTrend = [
    { name: "Shirts", stock: 120 },
    { name: "Pants", stock: 80 },
    { name: "Dresses", stock: 50 },
    { name: "Shoes", stock: 100 },
    { name: "Accessories", stock: 70 },
  ];

  const COLORS = ["#4ade80", "#f87171"];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-primary-foreground/80">
              Manage your dress store operations and analytics
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            What would you like to do?
          </h2>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Stock Management */}
            <div
              onClick={() => navigate("/admin/dashboard")}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden group"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white">
                <BarChart3
                  size={60}
                  className="mb-4 group-hover:scale-110 transition-transform"
                />
                <h3 className="text-2xl font-bold mb-2">Stock Management</h3>
                <p className="text-blue-100">
                  Add, edit, or delete products. Manage inventory levels.
                </p>
              </div>
              <div className="p-6">
                <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  Manage Inventory
                </button>
              </div>
            </div>

            {/* Tracking Management */}
            <div
              onClick={() => navigate("/admin/tracking")}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden group"
            >
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-white">
                <Truck
                  size={60}
                  className="mb-4 group-hover:scale-110 transition-transform"
                />
                <h3 className="text-2xl font-bold mb-2">Tracking Management</h3>
                <p className="text-green-100">
                  Update order status and delivery dates.
                </p>
              </div>
              <div className="p-6">
                <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                  Manage Orders
                </button>
              </div>
            </div>
          </div>

          {/* 📊 Dashboard Charts Section */}
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
            Business Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Sales Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Monthly Sales</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Inventory Pie Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Inventory Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stock Trend Bar Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Stock by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stockTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-foreground mb-4">
              📝 Admin Features
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>✓ View all products and their stock levels</li>
              <li>✓ Add new products with pricing and stock</li>
              <li>✓ Edit or delete product details</li>
              <li>✓ Monitor sales and delivery analytics</li>
              <li>✓ Update order statuses and track shipments</li>
              <li>✓ Receive low-stock alerts</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
