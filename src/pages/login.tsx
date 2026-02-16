import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Chrome, Mail, Lock } from "lucide-react";
import { AuthService } from "@/lib/services/auth-service";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup, FieldSeparator } from "@/components/ui/field";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await AuthService.loginWithGoogle();
      toast.success("Berhasil masuk!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error("Gagal masuk: " + message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password harus diisi");
      return;
    }

    try {
      setIsLoggingIn(true);
      await AuthService.loginWithEmail(email, password);
      toast.success("Berhasil masuk!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      const message = error instanceof Error ? error.message : "Email atau password salah";
      toast.error("Gagal masuk: " + message);
    } finally {
      setIsLoggingIn(false);
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
          <CardTitle className="text-2xl font-bold tracking-tight">Lestari Ilmu LJK</CardTitle>
          <CardDescription>
            Pilih metode masuk untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form onSubmit={handleEmailLogin} className="grid gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@sekolah.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoggingIn}
                    required
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoggingIn}
                    required
                  />
                </div>
              </Field>
            </FieldGroup>
            <Button type="submit" className="w-full h-11" disabled={isLoggingIn}>
              {isLoggingIn ? "Memproses..." : "Masuk dengan Email"}
            </Button>
          </form>

          <FieldSeparator>Atau</FieldSeparator>

          <Button
            variant="outline"
            className="w-full h-11 flex items-center gap-2 border-2"
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
          >
            <Chrome className="size-5" />
            Masuk dengan Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
