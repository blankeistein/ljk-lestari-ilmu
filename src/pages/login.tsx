import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Chrome } from "lucide-react";
import { AuthService } from "@/lib/services/auth-service";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await AuthService.loginWithGoogle();
      toast.success("Berhasil masuk!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error("Gagal masuk: " + message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Lestari Ilmu LJK</CardTitle>
          <CardDescription>
            Masuk untuk melanjutkan ke aplikasi
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            className="w-full py-6 flex items-center gap-2"
            onClick={handleGoogleLogin}
          >
            <Chrome className="size-5" />
            Masuk dengan Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
