import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Home, Box, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/admin/home", label: "Dashboard", icon: "📊" },
    { path: "/admin/dashboard", label: "Stock Management", icon: "📦" },
    { path: "/admin/orders", label: "Orders", icon: "📋" },
    { path: "/admin/tracking", label: "Tracking", icon: "🚚" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUsername");
    navigate("/admin");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static w-64 h-full bg-gradient-to-b from-primary to-primary/90 text-primary-foreground transition-transform duration-300 ease-in-out z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Brand */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <span>Admin</span>
            </h1>
            <p className="text-sm text-primary-foreground/70 mt-1">
              Dress Store Manager
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive(item.path)
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground font-semibold transition-all duration-200 mb-4"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

          {/* Footer */}
          <div className="pt-4 border-t border-primary-foreground/20">
            <p className="text-xs text-primary-foreground/60">
              © 2024 Dress Admin. All rights reserved.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-primary/90 text-primary-foreground p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
