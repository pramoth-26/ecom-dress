import { useState } from "react";
import Layout from "@/components/Layout";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        alert(errorData.error || "Login failed");
        return;
      }

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      if (!data.user || !data.user.id) {
        alert("Invalid response from server");
        return;
      }

      console.log("User logged in:", data.user);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("loggedIn", "true");

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          email: "",
          password: "",
        });
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error during login:", error);
      alert(
        "Network error: " +
          (error instanceof Error ? error.message : "Please try again.")
      );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Success Message */}
        {submitted && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            ✓ Logged in successfully!
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Welcome Back
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Sign in to your account to continue shopping
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)] px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-primary" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-3 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                Sign In
              </button>

              {/* Divider */}
              <div className="relative flex items-center my-6">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-3 text-muted-foreground text-sm">OR</span>
                <div className="flex-1 border-t border-border"></div>
              </div>

              {/* Social Sign In */}
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 border-2 border-border hover:border-primary/50 py-3 rounded-lg font-semibold transition-colors"
                >
                  <span>📧</span>
                  Sign in with Google
                </button>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-muted-foreground">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  Sign Up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
