import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
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

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        navigate("/signin");
        return;
      }

      try {
        const response = await fetch(`/api/auth/user?userId=${userId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("User profile not found");
          } else {
            setError("Failed to load profile");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setError("Failed to load profile data");
        }
      } catch (err) {
        setError("Error fetching profile: " + (err instanceof Error ? err.message : "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/signin");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-6">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                Back to Home
              </Button>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Header Card */}
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-3xl">My Profile</CardTitle>
                </CardHeader>
              </Card>

              {/* User Information Card */}
              <Card className="border-primary/20">
                <CardHeader className="border-b border-primary/20">
                  <CardTitle className="text-xl">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="text-lg font-medium mt-2 text-foreground">{user.name}</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Phone Number
                      </label>
                      <p className="text-lg font-medium mt-2 text-foreground">{user.phone}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Email Address
                    </label>
                    <p className="text-lg font-medium mt-2 text-foreground break-all">{user.email}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information Card */}
              <Card className="border-primary/20">
                <CardHeader className="border-b border-primary/20">
                  <CardTitle className="text-xl">Address Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Address Lines */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Address Line 1
                      </label>
                      <p className="text-lg font-medium mt-2 text-foreground">{user.addressLine1}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Address Line 2
                      </label>
                      <p className="text-lg font-medium mt-2 text-foreground">{user.addressLine2}</p>
                    </div>
                  </div>

                  {/* City, State, Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        District
                      </label>
                      <p className="text-lg font-medium mt-2 text-foreground">{user.district}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        State
                      </label>
                      <p className="text-lg font-medium mt-2 text-foreground">{user.state}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Pincode
                      </label>
                      <p className="text-lg font-medium mt-2 text-foreground">{user.pincode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Home
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No profile data available</AlertDescription>
              </Alert>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
