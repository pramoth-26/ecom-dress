import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Shield, ArrowRight, AlertCircle } from "lucide-react";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!email) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 max-w-md text-center">
            <p className="text-yellow-700 mb-4">
              Please start from the forgot password page.
            </p>
            <a
              href="/forgot-password"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Go to Forgot Password
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid OTP");
        setLoading(false);
        return;
      }

      if (data.success) {
        setTimeout(() => {
          navigate("/reset-password", { state: { email, token: data.token } });
        }, 1000);
      } else {
        setError(data.error || "OTP verification failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Verify OTP
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Enter the code sent to {email}
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex items-center justify-center min-h-[calc(100vh-300px)] px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  A 6-digit OTP has been sent to your email. Enter it below to verify.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-2xl font-bold tracking-widest"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-3 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <p className="text-center text-sm text-muted-foreground">
                Didn't receive the OTP?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  Request again
                </button>
              </p>

              {/* Back to Sign In */}
              <p className="text-center text-muted-foreground">
                <a
                  href="/signin"
                  className="text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  Back to Sign In
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
